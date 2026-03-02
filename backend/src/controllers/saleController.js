import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse, sendNoContent } from '../utils/response.js';
import * as saleService from '../services/saleService.js';

/**
 * @desc    Create a new sale
 * @route   POST /api/sales
 * @access  Private
 */
export const createSale = asyncHandler(async (req, res) => {
    const sale = await saleService.createSale(req.body, req.user._id);
    sendCreated(res, { sale }, 'Sale created successfully');
});

/**
 * @desc    Get all sales
 * @route   GET /api/sales
 * @access  Private
 */
export const getAllSales = asyncHandler(async (req, res) => {
    const { sales, total, page, limit } = await saleService.getAllSales(req.query);
    sendPaginatedResponse(res, sales, page, limit, total, 'Sales retrieved successfully');
});

/**
 * @desc    Get sale by ID
 * @route   GET /api/sales/:id
 * @access  Private
 */
export const getSaleById = asyncHandler(async (req, res) => {
    const sale = await saleService.getSaleById(req.params.id);
    sendSuccess(res, { sale }, 'Sale retrieved successfully');
});

/**
 * @desc    Update sale
 * @route   PUT /api/sales/:id
 * @access  Private
 */
export const updateSale = asyncHandler(async (req, res) => {
    const sale = await saleService.updateSale(req.params.id, req.body);
    sendSuccess(res, { sale }, 'Sale updated successfully');
});

/**
 * @desc    Delete sale
 * @route   DELETE /api/sales/:id
 * @access  Private (Admin/Accountant only)
 */
export const deleteSale = asyncHandler(async (req, res) => {
    await saleService.deleteSale(req.params.id);
    sendNoContent(res, 'Sale deleted successfully');
});

/**
 * @desc    Get sale summary
 * @route   GET /api/sales/summary/stats
 * @access  Private
 */
export const getSaleSummary = asyncHandler(async (req, res) => {
    const { customerId, startDate, endDate } = req.query;
    const summary = await saleService.getSaleSummary(customerId, startDate, endDate);
    sendSuccess(res, summary, 'Sale summary retrieved successfully');
});
