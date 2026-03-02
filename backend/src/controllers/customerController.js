import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse, sendNoContent } from '../utils/response.js';
import * as customerService from '../services/customerService.js';

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private
 */
export const createCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.createCustomer(req.body, req.user._id);
    sendCreated(res, { customer }, 'Customer created successfully');
});

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
export const getAllCustomers = asyncHandler(async (req, res) => {
    const { customers, total, page, limit } = await customerService.getAllCustomers(req.query);
    sendPaginatedResponse(res, customers, page, limit, total, 'Customers retrieved successfully');
});

/**
 * @desc    Get customer by ID
 * @route   GET /api/customers/:id
 * @access  Private
 */
export const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);
    sendSuccess(res, { customer }, 'Customer retrieved successfully');
});

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
export const updateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    sendSuccess(res, { customer }, 'Customer updated successfully');
});

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private (Admin only)
 */
export const deleteCustomer = asyncHandler(async (req, res) => {
    await customerService.deleteCustomer(req.params.id);
    sendNoContent(res, 'Customer deleted successfully');
});

/**
 * @desc    Get customer ledger
 * @route   GET /api/customers/:id/ledger
 * @access  Private
 */
export const getCustomerLedger = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await customerService.getCustomerLedger(req.params.id, startDate, endDate);
    sendSuccess(res, data, 'Customer ledger retrieved successfully');
});

/**
 * @desc    Get customer statistics
 * @route   GET /api/customers/:id/stats
 * @access  Private
 */
export const getCustomerStats = asyncHandler(async (req, res) => {
    const stats = await customerService.getCustomerStats(req.params.id);
    sendSuccess(res, stats, 'Customer statistics retrieved successfully');
});
