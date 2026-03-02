import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Expense from '../models/Expense.js';
import { CustomerPayment, VendorPayment } from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Vendor from '../models/Vendor.js';
import Ledger from '../models/Ledger.js';
import { ACCOUNT_TYPES } from '../config/constants.js';

/**
 * Reports Service Layer
 */

/**
 * Dashboard KPIs
 */
export const getDashboardKPIs = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todaySales = await Sale.aggregate([
        {
            $match: {
                saleDate: { $gte: today, $lt: tomorrow },
            },
        },
        {
            $group: {
                _id: null,
                totalSales: { $sum: '$totalAmount' },
                count: { $sum: 1 },
            },
        },
    ]);

    // Cash balance
    const cashBalance = await Ledger.aggregate([
        {
            $match: {
                accountType: ACCOUNT_TYPES.CASH,
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: null,
                debit: { $sum: '$debit' },
                credit: { $sum: '$credit' },
            },
        },
    ]);

    // Bank balance
    const bankBalance = await Ledger.aggregate([
        {
            $match: {
                accountType: ACCOUNT_TYPES.BANK,
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: null,
                debit: { $sum: '$debit' },
                credit: { $sum: '$credit' },
            },
        },
    ]);

    // Total receivables
    const totalReceivables = await Customer.aggregate([
        {
            $group: {
                _id: null,
                totalReceivable: { $sum: '$totalReceivable' },
            },
        },
    ]);

    // Total payables
    const totalPayables = await Vendor.aggregate([
        {
            $group: {
                _id: null,
                totalPayable: { $sum: '$totalPayable' },
            },
        },
    ]);

    // Monthly profit (current month)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const profitData = await Sale.aggregate([
        {
            $match: {
                saleDate: { $gte: firstDayOfMonth },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                totalProfit: { $sum: '$profitAmount' },
            },
        },
    ]);

    const monthlyExpenses = await Expense.aggregate([
        {
            $match: {
                expenseDate: { $gte: firstDayOfMonth },
            },
        },
        {
            $group: {
                _id: null,
                totalExpenses: { $sum: '$amount' },
            },
        },
    ]);

    return {
        todaySales: {
            amount: todaySales[0]?.totalSales || 0,
            count: todaySales[0]?.count || 0,
        },
        cashBalance: (cashBalance[0]?.debit || 0) - (cashBalance[0]?.credit || 0),
        bankBalance: (bankBalance[0]?.debit || 0) - (bankBalance[0]?.credit || 0),
        totalReceivables: totalReceivables[0]?.totalReceivable || 0,
        totalPayables: totalPayables[0]?.totalPayable || 0,
        monthlyProfit:
            (profitData[0]?.totalProfit || 0) - (monthlyExpenses[0]?.totalExpenses || 0),
        monthlyRevenue: profitData[0]?.totalRevenue || 0,
        monthlyExpenses: monthlyExpenses[0]?.totalExpenses || 0,
    };
};

/**
 * Daily financial summary
 */
export const getDailyFinancialSummary = async (date) => {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [sales, purchases, customerPayments, vendorPayments, expenses] = await Promise.all([
        Sale.aggregate([
            { $match: { saleDate: { $gte: targetDate, $lt: nextDate } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    totalProfit: { $sum: '$profitAmount' },
                },
            },
        ]),
        Purchase.aggregate([
            { $match: { purchaseDate: { $gte: targetDate, $lt: nextDate } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalCostPKR' },
                },
            },
        ]),
        CustomerPayment.aggregate([
            { $match: { paymentDate: { $gte: targetDate, $lt: nextDate } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]),
        VendorPayment.aggregate([
            { $match: { paymentDate: { $gte: targetDate, $lt: nextDate } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amountPKR' },
                },
            },
        ]),
        Expense.aggregate([
            { $match: { expenseDate: { $gte: targetDate, $lt: nextDate } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]),
    ]);

    return {
        date: targetDate,
        sales: sales[0] || { count: 0, totalAmount: 0, totalProfit: 0 },
        purchases: purchases[0] || { count: 0, totalAmount: 0 },
        customerPayments: customerPayments[0] || { count: 0, totalAmount: 0 },
        vendorPayments: vendorPayments[0] || { count: 0, totalAmount: 0 },
        expenses: expenses[0] || { count: 0, totalAmount: 0 },
    };
};

/**
 * Monthly profit report
 */
export const getMonthlyProfitReport = async (month, year) => {
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    const [salesData, expenseData] = await Promise.all([
        Sale.aggregate([
            { $match: { saleDate: { $gte: startDate, $lt: endDate } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalCost: { $sum: '$costPKR' },
                    totalProfit: { $sum: '$profitAmount' },
                    salesCount: { $sum: 1 },
                },
            },
        ]),
        Expense.aggregate([
            { $match: { expenseDate: { $gte: startDate, $lt: endDate } } },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: '$amount' },
                    expenseCount: { $sum: 1 },
                },
            },
        ]),
    ]);

    const revenue = salesData[0]?.totalRevenue || 0;
    const cost = salesData[0]?.totalCost || 0;
    const grossProfit = salesData[0]?.totalProfit || 0;
    const expenses = expenseData[0]?.totalExpenses || 0;
    const netProfit = grossProfit - expenses;

    return {
        month: targetMonth,
        year: targetYear,
        revenue,
        cost,
        grossProfit,
        expenses,
        netProfit,
        salesCount: salesData[0]?.salesCount || 0,
        expenseCount: expenseData[0]?.expenseCount || 0,
        profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0,
    };
};

/**
 * Customer outstanding report
 */
export const getCustomerOutstandingReport = async () => {
    const customers = await Customer.find({ totalReceivable: { $gt: 0 } })
        .select('name phone email totalReceivable totalSales totalReceived')
        .sort({ totalReceivable: -1 })
        .lean();

    const totalOutstanding = customers.reduce((sum, c) => sum + c.totalReceivable, 0);

    return {
        customers,
        totalOutstanding,
        customerCount: customers.length,
    };
};

/**
 * Vendor payable report
 */
export const getVendorPayableReport = async () => {
    const vendors = await Vendor.find({ totalPayable: { $gt: 0 } })
        .select('name country defaultCurrency totalPayable totalPurchases totalPaid')
        .sort({ totalPayable: -1 })
        .lean();

    const totalPayable = vendors.reduce((sum, v) => sum + v.totalPayable, 0);

    return {
        vendors,
        totalPayable,
        vendorCount: vendors.length,
    };
};

/**
 * Service profitability report
 */
export const getServiceProfitabilityReport = async (startDate, endDate) => {
    const filter = {};
    if (startDate || endDate) {
        filter.saleDate = {};
        if (startDate) filter.saleDate.$gte = new Date(startDate);
        if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    const serviceProfitability = await Sale.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$service',
                salesCount: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                totalCost: { $sum: '$costPKR' },
                totalProfit: { $sum: '$profitAmount' },
            },
        },
        {
            $lookup: {
                from: 'services',
                localField: '_id',
                foreignField: '_id',
                as: 'serviceDetails',
            },
        },
        { $unwind: '$serviceDetails' },
        {
            $project: {
                serviceName: '$serviceDetails.name',
                serviceCode: '$serviceDetails.code',
                salesCount: 1,
                totalRevenue: 1,
                totalCost: 1,
                totalProfit: 1,
                profitMargin: {
                    $cond: [
                        { $gt: ['$totalRevenue', 0] },
                        { $multiply: [{ $divide: ['$totalProfit', '$totalRevenue'] }, 100] },
                        0,
                    ],
                },
            },
        },
        { $sort: { totalProfit: -1 } },
    ]);

    return serviceProfitability;
};

/**
 * Cash flow report
 */
export const getCashFlowReport = async (startDate, endDate) => {
    const filter = {};
    if (startDate || endDate) {
        filter.transactionDate = {};
        if (startDate) filter.transactionDate.$gte = new Date(startDate);
        if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const cashFlows = await Ledger.aggregate([
        {
            $match: {
                ...filter,
                accountType: { $in: [ACCOUNT_TYPES.CASH, ACCOUNT_TYPES.BANK] },
            },
        },
        {
            $group: {
                _id: '$accountType',
                totalDebit: { $sum: '$debit' },
                totalCredit: { $sum: '$credit' },
            },
        },
    ]);

    return cashFlows.map((flow) => ({
        accountType: flow._id,
        inflow: flow.totalDebit,
        outflow: flow.totalCredit,
        netFlow: flow.totalDebit - flow.totalCredit,
    }));
};
