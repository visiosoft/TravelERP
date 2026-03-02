import mongoose from 'mongoose';
import { CustomerPayment, VendorPayment } from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Vendor from '../models/Vendor.js';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import ExchangeRate from '../models/ExchangeRate.js';
import { getPagination, buildSearchQuery, generateReference } from '../utils/helpers.js';
import { createCustomerPaymentLedger, createVendorPaymentLedger } from './ledgerService.js';
import { withOptionalTransaction } from '../utils/transaction.js';

/**
 * Payment Service Layer
 */

// ==================== CUSTOMER PAYMENTS ====================

export const createCustomerPayment = async (paymentData, userId) => {
    return await withOptionalTransaction(async (session) => {
        // Fetch customer
        const customerQuery = Customer.findById(paymentData.customerId);
        const customer = session ? await customerQuery.session(session) : await customerQuery;
        if (!customer) throw new Error('Customer not found');

        // Fetch sale if provided
        let sale = null;
        if (paymentData.saleId) {
            const saleQuery = Sale.findById(paymentData.saleId);
            sale = session ? await saleQuery.session(session) : await saleQuery;
            if (!sale) throw new Error('Sale not found');

            // Check if sale belongs to the customer
            if (sale.customer.toString() !== customer._id.toString()) {
                throw new Error('Sale does not belong to this customer');
            }
        }

        // Validate amount
        if (customer.totalReceivable < paymentData.amount) {
            throw new Error('Payment amount exceeds customer receivable balance');
        }

        // Generate payment number
        const paymentNumber = generateReference('CPY');

        // Create customer payment
        const paymentDoc = {
            paymentNumber,
            customer: customer._id,
            sale: paymentData.saleId || null,
            customerSnapshot: {
                name: customer.name,
                phone: customer.phone,
            },
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            referenceNumber: paymentData.referenceNumber,
            paymentDate: paymentData.paymentDate || new Date(),
            notes: paymentData.notes,
            createdBy: userId,
        };

        const payment = session
            ? await CustomerPayment.create([paymentDoc], { session })
            : await CustomerPayment.create(paymentDoc);

        const newPayment = Array.isArray(payment) ? payment[0] : payment;

        // Update customer totals
        customer.totalReceivable -= paymentData.amount;
        customer.totalReceived += paymentData.amount;
        customer.balance -= paymentData.amount;
        await (session ? customer.save({ session }) : customer.save());

        // Update sale if linked
        if (sale) {
            sale.receivedAmount += paymentData.amount;
            sale.receivableAmount -= paymentData.amount;
            sale.updatePaymentStatus();
            await (session ? sale.save({ session }) : sale.save());
        }

        // Create ledger entries
        await createCustomerPaymentLedger(newPayment, customer, session);

        return await CustomerPayment.findById(newPayment._id)
            .populate('customer', 'name phone')
            .populate('sale', 'saleNumber totalAmount');
    });
};

export const getAllCustomerPayments = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, customerId, saleId, paymentMethod, startDate, endDate } = query;

    const filter = {};
    if (customerId) filter.customer = customerId;
    if (saleId) filter.sale = saleId;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (startDate || endDate) {
        filter.paymentDate = {};
        if (startDate) filter.paymentDate.$gte = new Date(startDate);
        if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    if (search) {
        const searchQuery = buildSearchQuery(['paymentNumber', 'referenceNumber'], search);
        Object.assign(filter, searchQuery);
    }

    const [payments, total] = await Promise.all([
        CustomerPayment.find(filter)
            .populate('customer', 'name phone')
            .populate('sale', 'saleNumber')
            .sort({ paymentDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        CustomerPayment.countDocuments(filter),
    ]);

    return { payments, total, page, limit };
};

export const getCustomerPaymentById = async (paymentId) => {
    const payment = await CustomerPayment.findById(paymentId)
        .populate('customer', 'name phone email')
        .populate('sale', 'saleNumber totalAmount');

    if (!payment) {
        throw new Error('Payment not found');
    }

    return payment;
};

// ==================== VENDOR PAYMENTS ====================

export const createVendorPayment = async (paymentData, userId) => {
    // Get exchange rate BEFORE starting transaction (doesn't need session)
    let exchangeRate = paymentData.exchangeRate;
    if (!exchangeRate) {
        exchangeRate = await ExchangeRate.getLatestRate(paymentData.currency);
    }

    return await withOptionalTransaction(async (session) => {
        // Fetch vendor
        const vendorQuery = Vendor.findById(paymentData.vendorId);
        const vendor = session ? await vendorQuery.session(session) : await vendorQuery;
        if (!vendor) throw new Error('Vendor not found');

        // Fetch purchase if provided
        let purchase = null;
        if (paymentData.purchaseId) {
            const purchaseQuery = Purchase.findById(paymentData.purchaseId);
            purchase = session ? await purchaseQuery.session(session) : await purchaseQuery;
            if (!purchase) throw new Error('Purchase not found');

            if (purchase.vendor.toString() !== vendor._id.toString()) {
                throw new Error('Purchase does not belong to this vendor');
            }
        }

        // Calculate PKR amount
        const amountPKR = paymentData.amountForeign * exchangeRate;

        // Validate amount
        if (vendor.totalPayable < amountPKR) {
            throw new Error('Payment amount exceeds vendor payable balance');
        }

        // Generate payment number
        const paymentNumber = generateReference('VPY');

        // Create vendor payment
        const paymentDoc = {
            paymentNumber,
            vendor: vendor._id,
            purchase: paymentData.purchaseId || null,
            vendorSnapshot: {
                name: vendor.name,
                country: vendor.country,
            },
            currency: paymentData.currency,
            amountForeign: paymentData.amountForeign,
            exchangeRateUsed: exchangeRate,
            paymentMethod: paymentData.paymentMethod,
            referenceNumber: paymentData.referenceNumber,
            paymentDate: paymentData.paymentDate || new Date(),
            notes: paymentData.notes,
            createdBy: userId,
        };

        const payment = session
            ? await VendorPayment.create([paymentDoc], { session })
            : await VendorPayment.create(paymentDoc);

        const newPayment = Array.isArray(payment) ? payment[0] : payment;

        // Calculate exchange gain/loss if linked to purchase
        if (purchase) {
            const originalRate = purchase.exchangeRateSnapshot;
            const paymentRate = exchangeRate;
            const foreignAmount = paymentData.amountForeign;

            // Gain if we pay less PKR than originally booked
            const gainLoss = (foreignAmount * originalRate) - (foreignAmount * paymentRate);
            newPayment.exchangeGainLoss = gainLoss;
            await (session ? newPayment.save({ session }) : newPayment.save());
        }

        // Update vendor totals
        vendor.totalPayable -= newPayment.amountPKR;
        vendor.totalPaid += newPayment.amountPKR;
        await (session ? vendor.save({ session }) : vendor.save());

        // Update purchase if linked
        if (purchase) {
            purchase.paidAmount += newPayment.amountPKR;
            purchase.payableAmount -= newPayment.amountPKR;
            purchase.updatePaymentStatus();
            await (session ? purchase.save({ session }) : purchase.save());
        }

        // Create ledger entries
        await createVendorPaymentLedger(newPayment, vendor, session);

        return await VendorPayment.findById(newPayment._id)
            .populate('vendor', 'name country')
            .populate('purchase', 'purchaseNumber totalCostPKR');
    });
};

export const getAllVendorPayments = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, vendorId, purchaseId, paymentMethod, startDate, endDate } = query;

    const filter = {};
    if (vendorId) filter.vendor = vendorId;
    if (purchaseId) filter.purchase = purchaseId;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (startDate || endDate) {
        filter.paymentDate = {};
        if (startDate) filter.paymentDate.$gte = new Date(startDate);
        if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    if (search) {
        const searchQuery = buildSearchQuery(['paymentNumber', 'referenceNumber'], search);
        Object.assign(filter, searchQuery);
    }

    const [payments, total] = await Promise.all([
        VendorPayment.find(filter)
            .populate('vendor', 'name country')
            .populate('purchase', 'purchaseNumber')
            .sort({ paymentDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        VendorPayment.countDocuments(filter),
    ]);

    return { payments, total, page, limit };
};

export const getVendorPaymentById = async (paymentId) => {
    const payment = await VendorPayment.findById(paymentId)
        .populate('vendor', 'name country')
        .populate('purchase', 'purchaseNumber totalCostPKR');

    if (!payment) {
        throw new Error('Payment not found');
    }

    return payment;
};
