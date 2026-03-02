import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse } from '../utils/response.js';
import * as paymentService from '../services/paymentService.js';

// ==================== CUSTOMER PAYMENTS ====================

/**
 * @desc    Create customer payment
 * @route   POST /api/payments/customer
 * @access  Private
 */
export const createCustomerPayment = asyncHandler(async (req, res) => {
    const payment = await paymentService.createCustomerPayment(req.body, req.user._id);
    sendCreated(res, { payment }, 'Customer payment recorded successfully');
});

/**
 * @desc    Get all customer payments
 * @route   GET /api/payments/customer
 * @access  Private
 */
export const getAllCustomerPayments = asyncHandler(async (req, res) => {
    const { payments, total, page, limit } = await paymentService.getAllCustomerPayments(req.query);
    sendPaginatedResponse(res, payments, page, limit, total, 'Customer payments retrieved successfully');
});

/**
 * @desc    Get customer payment by ID
 * @route   GET /api/payments/customer/:id
 * @access  Private
 */
export const getCustomerPaymentById = asyncHandler(async (req, res) => {
    const payment = await paymentService.getCustomerPaymentById(req.params.id);
    sendSuccess(res, { payment }, 'Customer payment retrieved successfully');
});

// ==================== VENDOR PAYMENTS ====================

/**
 * @desc    Create vendor payment
 * @route   POST /api/payments/vendor
 * @access  Private
 */
export const createVendorPayment = asyncHandler(async (req, res) => {
    const payment = await paymentService.createVendorPayment(req.body, req.user._id);
    sendCreated(res, { payment }, 'Vendor payment recorded successfully');
});

/**
 * @desc    Get all vendor payments
 * @route   GET /api/payments/vendor
 * @access  Private
 */
export const getAllVendorPayments = asyncHandler(async (req, res) => {
    const { payments, total, page, limit } = await paymentService.getAllVendorPayments(req.query);
    sendPaginatedResponse(res, payments, page, limit, total, 'Vendor payments retrieved successfully');
});

/**
 * @desc    Get vendor payment by ID
 * @route   GET /api/payments/vendor/:id
 * @access  Private
 */
export const getVendorPaymentById = asyncHandler(async (req, res) => {
    const payment = await paymentService.getVendorPaymentById(req.params.id);
    sendSuccess(res, { payment }, 'Vendor payment retrieved successfully');
});
