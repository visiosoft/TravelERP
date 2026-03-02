import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse, sendNoContent } from '../utils/response.js';
import * as expenseService from '../services/expenseService.js';

/**
 * @desc    Create a new expense
 * @route   POST /api/expenses
 * @access  Private
 */
export const createExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.createExpense(req.body, req.user._id);
    sendCreated(res, { expense }, 'Expense created successfully');
});

/**
 * @desc    Get all expenses
 * @route   GET /api/expenses
 * @access  Private
 */
export const getAllExpenses = asyncHandler(async (req, res) => {
    const { expenses, total, page, limit } = await expenseService.getAllExpenses(req.query);
    sendPaginatedResponse(res, expenses, page, limit, total, 'Expenses retrieved successfully');
});

/**
 * @desc    Get expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
export const getExpenseById = asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpenseById(req.params.id);
    sendSuccess(res, { expense }, 'Expense retrieved successfully');
});

/**
 * @desc    Update expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
export const updateExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    sendSuccess(res, { expense }, 'Expense updated successfully');
});

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  Private (Admin/Accountant only)
 */
export const deleteExpense = asyncHandler(async (req, res) => {
    await expenseService.deleteExpense(req.params.id);
    sendNoContent(res, 'Expense deleted successfully');
});

/**
 * @desc    Get expense summary
 * @route   GET /api/expenses/summary/stats
 * @access  Private
 */
export const getExpenseSummary = asyncHandler(async (req, res) => {
    const { category, startDate, endDate } = req.query;
    const summary = await expenseService.getExpenseSummary(category, startDate, endDate);
    sendSuccess(res, summary, 'Expense summary retrieved successfully');
});

/**
 * @desc    Get expenses by category
 * @route   GET /api/expenses/summary/by-category
 * @access  Private
 */
export const getExpenseByCategory = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const expenses = await expenseService.getExpenseByCategory(startDate, endDate);
    sendSuccess(res, { expenses }, 'Expense by category retrieved successfully');
});
