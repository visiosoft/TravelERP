import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import { getPagination, buildSearchQuery, generateReference } from '../utils/helpers.js';
import { createExpenseLedger } from './ledgerService.js';
import { withOptionalTransaction } from '../utils/transaction.js';

/**
 * Expense Service Layer
 */

export const createExpense = async (expenseData, userId) => {
    return await withOptionalTransaction(async (session) => {
        // Generate expense number
        const expenseNumber = generateReference('EXP');

        // Create expense
        const expenseDoc = {
            expenseNumber,
            category: expenseData.category,
            description: expenseData.description,
            amount: expenseData.amount,
            paymentMethod: expenseData.paymentMethod,
            referenceNumber: expenseData.referenceNumber,
            expenseDate: expenseData.expenseDate || new Date(),
            vendor: expenseData.vendorId || null,
            notes: expenseData.notes,
            createdBy: userId,
        };

        const expense = session
            ? await Expense.create([expenseDoc], { session })
            : await Expense.create(expenseDoc);

        const newExpense = Array.isArray(expense) ? expense[0] : expense;

        // Create ledger entries
        await createExpenseLedger(newExpense, session);

        return await Expense.findById(newExpense._id).populate('vendor', 'name');
    });
};

export const getAllExpenses = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, category, paymentMethod, startDate, endDate } = query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Date range filter
    if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    // Search
    if (search) {
        const searchQuery = buildSearchQuery(
            ['expenseNumber', 'description', 'category', 'referenceNumber'],
            search
        );
        Object.assign(filter, searchQuery);
    }

    const [expenses, total] = await Promise.all([
        Expense.find(filter)
            .populate('vendor', 'name')
            .sort({ expenseDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Expense.countDocuments(filter),
    ]);

    return { expenses, total, page, limit };
};

export const getExpenseById = async (expenseId) => {
    const expense = await Expense.findById(expenseId).populate('vendor', 'name country');

    if (!expense) {
        throw new Error('Expense not found');
    }

    return expense;
};

export const updateExpense = async (expenseId, updateData) => {
    // Only allow updating non-financial fields
    const allowedUpdates = ['description', 'notes', 'referenceNumber'];
    const updates = {};

    allowedUpdates.forEach((field) => {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    });

    const expense = await Expense.findByIdAndUpdate(
        expenseId,
        { $set: updates },
        { new: true, runValidators: true }
    ).populate('vendor', 'name');

    if (!expense) {
        throw new Error('Expense not found');
    }

    return expense;
};

export const deleteExpense = async (expenseId) => {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
        throw new Error('Expense not found');
    }

    // Soft delete
    expense.isDeleted = true;
    await expense.save();

    return expense;
};

export const getExpenseSummary = async (category, startDate, endDate) => {
    const filter = {};
    if (category) filter.category = category;

    if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const summary = await Expense.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalExpenses: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
            },
        },
    ]);

    return summary[0] || {
        totalExpenses: 0,
        totalAmount: 0,
    };
};

export const getExpenseByCategory = async (startDate, endDate) => {
    const filter = {};

    if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const expenses = await Expense.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
            },
        },
        { $sort: { totalAmount: -1 } },
    ]);

    return expenses.map((exp) => ({
        category: exp._id,
        count: exp.count,
        totalAmount: exp.totalAmount,
    }));
};
