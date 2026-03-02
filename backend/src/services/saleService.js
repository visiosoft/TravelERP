import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import Service from '../models/Service.js';
import Purchase from '../models/Purchase.js';
import { getPagination, buildSearchQuery, generateReference } from '../utils/helpers.js';
import { createSaleLedger } from './ledgerService.js';
import { withOptionalTransaction } from '../utils/transaction.js';

/**
 * Sale Service Layer
 */

export const createSale = async (saleData, userId) => {
    return await withOptionalTransaction(async (session) => {
        // Fetch customer and service
        const customerQuery = Customer.findById(saleData.customerId);
        const serviceQuery = Service.findById(saleData.serviceId);

        const [customer, service] = await Promise.all([
            session ? customerQuery.session(session) : customerQuery,
            session ? serviceQuery.session(session) : serviceQuery,
        ]);

        if (!customer) throw new Error('Customer not found');
        if (!service) throw new Error('Service not found');

        // Get linked purchase cost if provided
        let costPKR = 0;
        if (saleData.linkedPurchaseId) {
            const purchaseQuery = Purchase.findById(saleData.linkedPurchaseId);
            const purchase = session ? await purchaseQuery.session(session) : await purchaseQuery;
            if (purchase) {
                costPKR = purchase.totalCostPKR;
            }
        }

        // Generate sale number
        const saleNumber = generateReference('SAL');

        // Create sale
        const saleDoc = {
            saleNumber,
            customer: customer._id,
            service: service._id,
            linkedPurchase: saleData.linkedPurchaseId || null,
            serviceSnapshot: {
                name: service.name,
                code: service.code,
            },
            customerSnapshot: {
                name: customer.name,
                phone: customer.phone,
            },
            quantity: saleData.quantity || 1,
            sellingPricePKR: saleData.sellingPricePKR,
            costPKR,
            invoiceNumber: saleData.invoiceNumber,
            saleDate: saleData.saleDate || new Date(),
            notes: saleData.notes,
            createdBy: userId,
        };

        const sale = session
            ? await Sale.create([saleDoc], { session })
            : await Sale.create(saleDoc);

        const newSale = Array.isArray(sale) ? sale[0] : sale;

        // Update customer totals
        customer.totalReceivable += newSale.totalAmount;
        customer.totalSales += newSale.totalAmount;
        customer.balance += newSale.totalAmount;
        await (session ? customer.save({ session }) : customer.save());

        // Update service statistics
        service.totalSalesCount += 1;
        await (session ? service.save({ session }) : service.save());

        // Create ledger entries (double-entry bookkeeping)
        await createSaleLedger(newSale, customer, session);

        return await Sale.findById(newSale._id)
            .populate('customer', 'name phone email')
            .populate('service', 'name type')
            .populate('linkedPurchase', 'purchaseNumber totalCostPKR');
    });
};

export const getAllSales = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, customerId, serviceId, paymentStatus, startDate, endDate } = query;

    // Build filter
    const filter = {};
    if (customerId) filter.customer = customerId;
    if (serviceId) filter.service = serviceId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
        filter.saleDate = {};
        if (startDate) filter.saleDate.$gte = new Date(startDate);
        if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    // Search
    if (search) {
        const searchQuery = buildSearchQuery(['saleNumber', 'invoiceNumber'], search);
        Object.assign(filter, searchQuery);
    }

    const [sales, total] = await Promise.all([
        Sale.find(filter)
            .populate('customer', 'name phone')
            .populate('service', 'name')
            .sort({ saleDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Sale.countDocuments(filter),
    ]);

    return { sales, total, page, limit };
};

export const getSaleById = async (saleId) => {
    const sale = await Sale.findById(saleId)
        .populate('customer', 'name phone email')
        .populate('service', 'name type')
        .populate('linkedPurchase', 'purchaseNumber totalCostPKR');

    if (!sale) {
        throw new Error('Sale not found');
    }

    return sale;
};

export const updateSale = async (saleId, updateData) => {
    // Note: Updating financial transactions should be restricted
    // Only allow updating non-financial fields
    const allowedUpdates = ['notes', 'invoiceNumber'];
    const updates = {};

    allowedUpdates.forEach((field) => {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    });

    const sale = await Sale.findByIdAndUpdate(
        saleId,
        { $set: updates },
        { new: true, runValidators: true }
    )
        .populate('customer', 'name phone')
        .populate('service', 'name');

    if (!sale) {
        throw new Error('Sale not found');
    }

    return sale;
};

export const deleteSale = async (saleId) => {
    return await withOptionalTransaction(async (session) => {
        const saleQuery = Sale.findById(saleId);
        const sale = session ? await saleQuery.session(session) : await saleQuery;

        if (!sale) {
            throw new Error('Sale not found');
        }

        // Check if any payment has been received
        if (sale.receivedAmount > 0) {
            throw new Error('Cannot delete sale with payments received');
        }

        // Update customer totals
        const customerQuery = Customer.findById(sale.customer);
        const customer = session ? await customerQuery.session(session) : await customerQuery;

        if (customer) {
            customer.totalReceivable -= sale.receivableAmount;
            customer.totalSales -= sale.totalAmount;
            customer.balance -= sale.totalAmount;
            await (session ? customer.save({ session }) : customer.save());
        }

        // Soft delete sale
        sale.isDeleted = true;
        await (session ? sale.save({ session }) : sale.save());

        return sale;
    });
};

export const getSaleSummary = async (customerId, startDate, endDate) => {
    const filter = {};
    if (customerId) filter.customer = customerId;

    if (startDate || endDate) {
        filter.saleDate = {};
        if (startDate) filter.saleDate.$gte = new Date(startDate);
        if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    const summary = await Sale.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' },
                totalReceived: { $sum: '$receivedAmount' },
                totalReceivable: { $sum: '$receivableAmount' },
                totalProfit: { $sum: '$profitAmount' },
            },
        },
    ]);

    return summary[0] || {
        totalSales: 0,
        totalAmount: 0,
        totalReceived: 0,
        totalReceivable: 0,
        totalProfit: 0,
    };
};
