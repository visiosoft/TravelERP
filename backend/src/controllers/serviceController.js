import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse, sendNoContent } from '../utils/response.js';
import * as serviceService from '../services/serviceService.js';

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private
 */
export const createService = asyncHandler(async (req, res) => {
    const service = await serviceService.createService(req.body, req.user._id);
    sendCreated(res, { service }, 'Service created successfully');
});

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Private
 */
export const getAllServices = asyncHandler(async (req, res) => {
    const { services, total, page, limit } = await serviceService.getAllServices(req.query);
    sendPaginatedResponse(res, services, page, limit, total, 'Services retrieved successfully');
});

/**
 * @desc    Get service by ID
 * @route   GET /api/services/:id
 * @access  Private
 */
export const getServiceById = asyncHandler(async (req, res) => {
    const service = await serviceService.getServiceById(req.params.id);
    sendSuccess(res, { service }, 'Service retrieved successfully');
});

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private
 */
export const updateService = asyncHandler(async (req, res) => {
    const service = await serviceService.updateService(req.params.id, req.body);
    sendSuccess(res, { service }, 'Service updated successfully');
});

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private (Admin only)
 */
export const deleteService = asyncHandler(async (req, res) => {
    await serviceService.deleteService(req.params.id);
    sendNoContent(res, 'Service deleted successfully');
});

/**
 * @desc    Get main services
 * @route   GET /api/services/main/list
 * @access  Private
 */
export const getMainServices = asyncHandler(async (req, res) => {
    const services = await serviceService.getMainServices();
    sendSuccess(res, { services }, 'Main services retrieved successfully');
});

/**
 * @desc    Get sub-services by parent
 * @route   GET /api/services/parent/:parentId/sub
 * @access  Private
 */
export const getSubServicesByParent = asyncHandler(async (req, res) => {
    const services = await serviceService.getSubServicesByParent(req.params.parentId);
    sendSuccess(res, { services }, 'Sub-services retrieved successfully');
});

/**
 * @desc    Get service hierarchy
 * @route   GET /api/services/hierarchy
 * @access  Private
 */
export const getServiceHierarchy = asyncHandler(async (req, res) => {
    const hierarchy = await serviceService.getServiceHierarchy();
    sendSuccess(res, { hierarchy }, 'Service hierarchy retrieved successfully');
});
