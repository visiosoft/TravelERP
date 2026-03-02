import Ledger from '../models/Ledger.js';
import { ACCOUNT_TYPES, REFERENCE_TYPES } from '../config/constants.js';

/**
 * Ledger Service Layer - Double Entry Bookkeeping Engine
 */

/**
 * Create ledger entry
 */
export const createLedgerEntry = async (entryData, session = null) => {
    const entry = await Ledger.create([entryData], { session, ordered: true });
    return entry[0];
};

/**
 * Create purchase ledger entries
 * Debit: Purchases/Inventory (Expense)
 * Credit: Vendor Account (Payable)
 */
export const createPurchaseLedger = async (purchase, vendor, session = null) => {
    const entries = [
        {
            accountType: ACCOUNT_TYPES.EXPENSE,
            accountId: purchase.service,
            accountName: purchase.serviceSnapshot.name,
            referenceType: REFERENCE_TYPES.PURCHASE,
            referenceId: purchase._id,
            referenceNumber: purchase.purchaseNumber,
            debit: purchase.totalCostPKR,
            credit: 0,
            currency: purchase.currency,
            foreignAmount: purchase.totalCostForeign,
            exchangeRate: purchase.exchangeRateSnapshot,
            description: `Purchase from ${vendor.name} - ${purchase.serviceSnapshot.name}`,
            transactionDate: purchase.purchaseDate,
            createdBy: purchase.createdBy,
        },
        {
            accountType: ACCOUNT_TYPES.VENDOR,
            accountId: vendor._id,
            accountName: vendor.name,
            referenceType: REFERENCE_TYPES.PURCHASE,
            referenceId: purchase._id,
            referenceNumber: purchase.purchaseNumber,
            debit: 0,
            credit: purchase.totalCostPKR,
            currency: purchase.currency,
            foreignAmount: purchase.totalCostForeign,
            exchangeRate: purchase.exchangeRateSnapshot,
            description: `Purchase payable to ${vendor.name} - ${purchase.serviceSnapshot.name}`,
            transactionDate: purchase.purchaseDate,
            createdBy: purchase.createdBy,
        },
    ];

    await Ledger.create(entries, { session, ordered: true });
};

/**
 * Create sale ledger entries
 * Debit: Customer Account (Receivable)
 * Credit: Revenue/Sales
 */
export const createSaleLedger = async (sale, customer, session = null) => {
    const entries = [
        {
            accountType: ACCOUNT_TYPES.CUSTOMER,
            accountId: customer._id,
            accountName: customer.name,
            referenceType: REFERENCE_TYPES.SALE,
            referenceId: sale._id,
            referenceNumber: sale.saleNumber,
            debit: sale.totalAmount,
            credit: 0,
            currency: 'PKR',
            description: `Sale to ${customer.name} - ${sale.serviceSnapshot.name}`,
            transactionDate: sale.saleDate,
            createdBy: sale.createdBy,
        },
        {
            accountType: ACCOUNT_TYPES.REVENUE,
            accountId: sale.service,
            accountName: sale.serviceSnapshot.name,
            referenceType: REFERENCE_TYPES.SALE,
            referenceId: sale._id,
            referenceNumber: sale.saleNumber,
            debit: 0,
            credit: sale.totalAmount,
            currency: 'PKR',
            description: `Sale revenue - ${sale.serviceSnapshot.name} to ${customer.name}`,
            transactionDate: sale.saleDate,
            createdBy: sale.createdBy,
        },
    ];

    await Ledger.create(entries, { session, ordered: true });
};

/**
 * Create customer payment ledger entries
 * Debit: Cash/Bank
 * Credit: Customer Account (Receivable reduced)
 */
export const createCustomerPaymentLedger = async (payment, customer, session = null) => {
    const cashOrBankType =
        payment.paymentMethod === 'cash' ? ACCOUNT_TYPES.CASH : ACCOUNT_TYPES.BANK;

    const entries = [
        {
            accountType: cashOrBankType,
            accountId: payment._id,
            accountName: `${payment.paymentMethod.toUpperCase()} Account`,
            referenceType: REFERENCE_TYPES.CUSTOMER_PAYMENT,
            referenceId: payment._id,
            referenceNumber: payment.paymentNumber,
            debit: payment.amount,
            credit: 0,
            currency: 'PKR',
            description: `Payment received from ${customer.name} via ${payment.paymentMethod}`,
            transactionDate: payment.paymentDate,
            createdBy: payment.createdBy,
        },
        {
            accountType: ACCOUNT_TYPES.CUSTOMER,
            accountId: customer._id,
            accountName: customer.name,
            referenceType: REFERENCE_TYPES.CUSTOMER_PAYMENT,
            referenceId: payment._id,
            referenceNumber: payment.paymentNumber,
            debit: 0,
            credit: payment.amount,
            currency: 'PKR',
            description: `Payment received from ${customer.name}`,
            transactionDate: payment.paymentDate,
            createdBy: payment.createdBy,
        },
    ];

    await Ledger.create(entries, { session, ordered: true });
};

/**
 * Create vendor payment ledger entries
 * Debit: Vendor Account (Payable reduced)
 * Credit: Cash/Bank
 */
export const createVendorPaymentLedger = async (payment, vendor, session = null) => {
    const cashOrBankType =
        payment.paymentMethod === 'cash' ? ACCOUNT_TYPES.CASH : ACCOUNT_TYPES.BANK;

    const entries = [
        {
            accountType: ACCOUNT_TYPES.VENDOR,
            accountId: vendor._id,
            accountName: vendor.name,
            referenceType: REFERENCE_TYPES.VENDOR_PAYMENT,
            referenceId: payment._id,
            referenceNumber: payment.paymentNumber,
            debit: payment.amountPKR,
            credit: 0,
            currency: payment.currency,
            foreignAmount: payment.amountForeign,
            exchangeRate: payment.exchangeRateUsed,
            description: `Payment to ${vendor.name}`,
            transactionDate: payment.paymentDate,
            createdBy: payment.createdBy,
        },
        {
            accountType: cashOrBankType,
            accountId: payment._id,
            accountName: `${payment.paymentMethod.toUpperCase()} Account`,
            referenceType: REFERENCE_TYPES.VENDOR_PAYMENT,
            referenceId: payment._id,
            referenceNumber: payment.paymentNumber,
            debit: 0,
            credit: payment.amountPKR,
            currency: payment.currency,
            foreignAmount: payment.amountForeign,
            exchangeRate: payment.exchangeRateUsed,
            description: `Payment to ${vendor.name} via ${payment.paymentMethod}`,
            transactionDate: payment.paymentDate,
            createdBy: payment.createdBy,
        },
    ];

    await Ledger.create(entries, { session, ordered: true });
};

/**
 * Create expense ledger entries
 * Debit: Expense Account
 * Credit: Cash/Bank
 */
export const createExpenseLedger = async (expense, session = null) => {
    const cashOrBankType =
        expense.paymentMethod === 'cash' ? ACCOUNT_TYPES.CASH : ACCOUNT_TYPES.BANK;

    const entries = [
        {
            accountType: ACCOUNT_TYPES.EXPENSE,
            accountId: expense._id,
            accountName: expense.category,
            referenceType: REFERENCE_TYPES.EXPENSE,
            referenceId: expense._id,
            referenceNumber: expense.expenseNumber,
            debit: expense.amount,
            credit: 0,
            currency: 'PKR',
            description: `Expense: ${expense.description}`,
            transactionDate: expense.expenseDate,
            createdBy: expense.createdBy,
        },
        {
            accountType: cashOrBankType,
            accountId: expense._id,
            accountName: `${expense.paymentMethod.toUpperCase()} Account`,
            referenceType: REFERENCE_TYPES.EXPENSE,
            referenceId: expense._id,
            referenceNumber: expense.expenseNumber,
            debit: 0,
            credit: expense.amount,
            currency: 'PKR',
            description: `Expense payment: ${expense.description} via ${expense.paymentMethod}`,
            transactionDate: expense.expenseDate,
            createdBy: expense.createdBy,
        },
    ];

    await Ledger.create(entries, { session, ordered: true });
};

/**
 * Get account balance
 */
export const getAccountBalance = async (accountType, accountId) => {
    return await Ledger.getAccountBalance(accountType, accountId);
};

/**
 * Get account ledger
 */
export const getAccountLedger = async (accountType, accountId, startDate, endDate) => {
    return await Ledger.getAccountLedger(accountType, accountId, startDate, endDate);
};
