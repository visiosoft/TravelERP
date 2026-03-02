import mongoose from 'mongoose';
import Purchase from '../models/Purchase.js';
import Vendor from '../models/Vendor.js';
import Service from '../models/Service.js';
import ExchangeRate from '../models/ExchangeRate.js';
import { getPagination, buildSearchQuery, generateReference } from '../utils/helpers.js';
import { createPurchaseLedger } from './ledgerService.js';
import { withOptionalTransaction, withSession } from '../utils/transaction.js';

/**
 * Purchase Service Layer
 */

export const createPurchase = async (purchaseData, userId) => {
    // Get exchange rate BEFORE starting transaction (doesn't need session)
    let exchangeRate = purchaseData.exchangeRate;
    if (!exchangeRate) {
        exchangeRate = await ExchangeRate.getLatestRate(purchaseData.currency);
    }

    return await withOptionalTransaction(async (session) => {
        // Fetch vendor and service
        const vendorQuery = Vendor.findById(purchaseData.vendorId);
        const serviceQuery = Service.findById(purchaseData.serviceId);

        const [vendor, service] = await Promise.all([
            session ? vendorQuery.session(session) : vendorQuery,
            session ? serviceQuery.session(session) : serviceQuery,
        ]);

        if (!vendor) throw new Error('Vendor not found');
        if (!service) throw new Error('Service not found');

        // Generate purchase number
        const purchaseNumber = generateReference('PUR');

        // Create purchase
        const purchaseDoc = {
            purchaseNumber,
            vendor: vendor._id,
            service: service._id,
            serviceSnapshot: {
                name: service.name,
                code: service.code,
            },
            vendorSnapshot: {
                name: vendor.name,
                country: vendor.country,
            },
            quantity: purchaseData.quantity || 1,
            currency: purchaseData.currency,
            unitCostForeign: purchaseData.unitCostForeign,
            exchangeRateSnapshot: exchangeRate,
            invoiceNumber: purchaseData.invoiceNumber,
            purchaseDate: purchaseData.purchaseDate || new Date(),
            notes: purchaseData.notes,
            createdBy: userId,
        };

        const purchase = session
            ? await Purchase.create([purchaseDoc], { session })
            : await Purchase.create(purchaseDoc);

        const newPurchase = Array.isArray(purchase) ? purchase[0] : purchase;

        // Update vendor totals
        vendor.totalPayable += newPurchase.totalCostPKR;
        vendor.totalPurchases += newPurchase.totalCostPKR;
        await (session ? vendor.save({ session }) : vendor.save());

        // Update service statistics
        service.totalPurchasesCount += 1;
        await (session ? service.save({ session }) : service.save());

        // Create ledger entries (double-entry bookkeeping)
        await createPurchaseLedger(newPurchase, vendor, session);

        return await Purchase.findById(newPurchase._id)
            .populate('vendor', 'name country defaultCurrency')
            .populate('service', 'name type');
    });
};

export const getAllPurchases = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, vendorId, serviceId, paymentStatus, startDate, endDate } = query;

    // Build filter
    const filter = {};
    if (vendorId) filter.vendor = vendorId;
    if (serviceId) filter.service = serviceId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Date range filter
    if (startDate || endDate) {
        filter.purchaseDate = {};
        if (startDate) filter.purchaseDate.$gte = new Date(startDate);
        if (endDate) filter.purchaseDate.$lte = new Date(endDate);
    }

    // Search
    if (search) {
        const searchQuery = buildSearchQuery(['purchaseNumber', 'invoiceNumber'], search);
        Object.assign(filter, searchQuery);
    }

    const [purchases, total] = await Promise.all([
        Purchase.find(filter)
            .populate('vendor', 'name country')
            .populate('service', 'name')
            .sort({ purchaseDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Purchase.countDocuments(filter),
    ]);

    return { purchases, total, page, limit };
};

export const getPurchaseById = async (purchaseId) => {
    const purchase = await Purchase.findById(purchaseId)
        .populate('vendor', 'name country defaultCurrency')
        .populate('service', 'name type');

    if (!purchase) {
        throw new Error('Purchase not found');
    }

    return purchase;
};

export const updatePurchase = async (purchaseId, updateData) => {
    // Note: Updating financial transactions should be restricted
    // Only allow updating non-financial fields like notes
    const allowedUpdates = ['notes', 'invoiceNumber'];
    const updates = {};

    allowedUpdates.forEach((field) => {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    });

    const purchase = await Purchase.findByIdAndUpdate(
        purchaseId,
        { $set: updates },
        { new: true, runValidators: true }
    )
        .populate('vendor', 'name country')
        .populate('service', 'name');

    if (!purchase) {
        throw new Error('Purchase not found');
    }

    return purchase;
};

export const deletePurchase = async (purchaseId) => {
    return await withOptionalTransaction(async (session) => {
        const purchaseQuery = Purchase.findById(purchaseId);
        const purchase = session ? await purchaseQuery.session(session) : await purchaseQuery;

        if (!purchase) {
            throw new Error('Purchase not found');
        }

        // Check if any payment has been made
        if (purchase.paidAmount > 0) {
            throw new Error('Cannot delete purchase with payments made');
        }

        // Update vendor totals
        const vendorQuery = Vendor.findById(purchase.vendor);
        const vendor = session ? await vendorQuery.session(session) : await vendorQuery;

        if (vendor) {
            vendor.totalPayable -= purchase.payableAmount;
            vendor.totalPurchases -= purchase.totalCostPKR;
            await (session ? vendor.save({ session }) : vendor.save());
        }

        // Soft delete purchase
        purchase.isDeleted = true;
        await (session ? purchase.save({ session }) : purchase.save());

        // Note: Ledger entries are kept for audit trail (soft delete in ledger too if needed)

        return purchase;
    });
};

export const getPurchaseSummary = async (vendorId, startDate, endDate) => {
    const filter = {};
    if (vendorId) filter.vendor = vendorId;

    if (startDate || endDate) {
        filter.purchaseDate = {};
        if (startDate) filter.purchaseDate.$gte = new Date(startDate);
        if (endDate) filter.purchaseDate.$lte = new Date(endDate);
    }

    const summary = await Purchase.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalPurchases: { $sum: 1 },
                totalAmount: { $sum: '$totalCostPKR' },
                totalPaid: { $sum: '$paidAmount' },
                totalPayable: { $sum: '$payableAmount' },
            },
        },
    ]);

    return summary[0] || {
        totalPurchases: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPayable: 0,
    };
};
