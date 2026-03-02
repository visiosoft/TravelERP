import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse, sendNoContent } from '../utils/response.js';
import * as purchaseService from '../services/purchaseService.js';

/**
 * @desc    Create a new purchase
 * @route   POST /api/purchases
 * @access  Private
 */
export const createPurchase = asyncHandler(async (req, res) => {
    const purchase = await purchaseService.createPurchase(req.body, req.user._id);
    sendCreated(res, { purchase }, 'Purchase created successfully');
});

/**
 * @desc    Get all purchases
 * @route   GET /api/purchases
 * @access  Private
 */
export const getAllPurchases = asyncHandler(async (req, res) => {
    const { purchases, total, page, limit } = await purchaseService.getAllPurchases(req.query);
    sendPaginatedResponse(res, purchases, page, limit, total, 'Purchases retrieved successfully');
});

/**
 * @desc    Get purchase by ID
 * @route   GET /api/purchases/:id
 * @access  Private
 */
export const getPurchaseById = asyncHandler(async (req, res) => {
    const purchase = await purchaseService.getPurchaseById(req.params.id);
    sendSuccess(res, { purchase }, 'Purchase retrieved successfully');
});

/**
 * @desc    Update purchase
 * @route   PUT /api/purchases/:id
 * @access  Private
 */
export const updatePurchase = asyncHandler(async (req, res) => {
    const purchase = await purchaseService.updatePurchase(req.params.id, req.body);
    sendSuccess(res, { purchase }, 'Purchase updated successfully');
});

/**
 * @desc    Delete purchase
 * @route   DELETE /api/purchases/:id
 * @access  Private (Admin/Accountant only)
 */
export const deletePurchase = asyncHandler(async (req, res) => {
    await purchaseService.deletePurchase(req.params.id);
    sendNoContent(res, 'Purchase deleted successfully');
});

/**
 * @desc    Get purchase summary
 * @route   GET /api/purchases/summary/stats
 * @access  Private
 */
export const getPurchaseSummary = asyncHandler(async (req, res) => {
    const { vendorId, startDate, endDate } = req.query;
    const summary = await purchaseService.getPurchaseSummary(vendorId, startDate, endDate);
    sendSuccess(res, summary, 'Purchase summary retrieved successfully');
});
