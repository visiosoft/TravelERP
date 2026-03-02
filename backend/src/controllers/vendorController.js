import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse, sendNoContent } from '../utils/response.js';
import * as vendorService from '../services/vendorService.js';

/**
 * @desc    Create a new vendor
 * @route   POST /api/vendors
 * @access  Private
 */
export const createVendor = asyncHandler(async (req, res) => {
    const vendor = await vendorService.createVendor(req.body, req.user._id);
    sendCreated(res, { vendor }, 'Vendor created successfully');
});

/**
 * @desc    Get all vendors
 * @route   GET /api/vendors
 * @access  Private
 */
export const getAllVendors = asyncHandler(async (req, res) => {
    const { vendors, total, page, limit } = await vendorService.getAllVendors(req.query);
    sendPaginatedResponse(res, vendors, page, limit, total, 'Vendors retrieved successfully');
});

/**
 * @desc    Get vendor by ID
 * @route   GET /api/vendors/:id
 * @access  Private
 */
export const getVendorById = asyncHandler(async (req, res) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    sendSuccess(res, { vendor }, 'Vendor retrieved successfully');
});

/**
 * @desc    Update vendor
 * @route   PUT /api/vendors/:id
 * @access  Private
 */
export const updateVendor = asyncHandler(async (req, res) => {
    const vendor = await vendorService.updateVendor(req.params.id, req.body);
    sendSuccess(res, { vendor }, 'Vendor updated successfully');
});

/**
 * @desc    Delete vendor
 * @route   DELETE /api/vendors/:id
 * @access  Private (Admin only)
 */
export const deleteVendor = asyncHandler(async (req, res) => {
    await vendorService.deleteVendor(req.params.id);
    sendNoContent(res, 'Vendor deleted successfully');
});

/**
 * @desc    Get vendor ledger
 * @route   GET /api/vendors/:id/ledger
 * @access  Private
 */
export const getVendorLedger = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await vendorService.getVendorLedger(req.params.id, startDate, endDate);
    sendSuccess(res, data, 'Vendor ledger retrieved successfully');
});

/**
 * @desc    Get vendor statistics
 * @route   GET /api/vendors/:id/stats
 * @access  Private
 */
export const getVendorStats = asyncHandler(async (req, res) => {
    const stats = await vendorService.getVendorStats(req.params.id);
    sendSuccess(res, stats, 'Vendor statistics retrieved successfully');
});
