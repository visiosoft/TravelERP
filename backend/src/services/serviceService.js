import Service from '../models/Service.js';
import { getPagination, buildSearchQuery } from '../utils/helpers.js';
import { SERVICE_TYPES } from '../config/constants.js';

/**
 * Service Service Layer
 */

export const createService = async (serviceData, userId) => {
    const service = await Service.create({
        ...serviceData,
        createdBy: userId,
    });

    // Populate parent service if exists
    if (service.parentService) {
        await service.populate('parentService', 'name type');
    }

    return service;
};

export const getAllServices = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, type, parentService, isActive } = query;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (parentService) filter.parentService = parentService;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Search
    if (search) {
        const searchQuery = buildSearchQuery(['name', 'code', 'description'], search);
        Object.assign(filter, searchQuery);
    }

    const [services, total] = await Promise.all([
        Service.find(filter)
            .populate('parentService', 'name type')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Service.countDocuments(filter),
    ]);

    return { services, total, page, limit };
};

export const getServiceById = async (serviceId) => {
    const service = await Service.findById(serviceId).populate(
        'parentService',
        'name type'
    );

    if (!service) {
        throw new Error('Service not found');
    }

    return service;
};

export const updateService = async (serviceId, updateData) => {
    const service = await Service.findByIdAndUpdate(
        serviceId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('parentService', 'name type');

    if (!service) {
        throw new Error('Service not found');
    }

    return service;
};

export const deleteService = async (serviceId) => {
    const service = await Service.findById(serviceId);

    if (!service) {
        throw new Error('Service not found');
    }

    // Check if it's a main service with sub-services
    if (service.type === SERVICE_TYPES.MAIN) {
        const hasSubServices = await Service.exists({ parentService: serviceId });
        if (hasSubServices) {
            throw new Error('Cannot delete main service with existing sub-services');
        }
    }

    // Soft delete
    service.isDeleted = true;
    await service.save();

    return service;
};

export const getMainServices = async () => {
    const services = await Service.find({ type: SERVICE_TYPES.MAIN, isActive: true })
        .sort({ name: 1 })
        .lean();

    return services;
};

export const getSubServicesByParent = async (parentServiceId) => {
    const services = await Service.find({
        parentService: parentServiceId,
        isActive: true,
    })
        .sort({ name: 1 })
        .lean();

    return services;
};

export const getServiceHierarchy = async () => {
    const mainServices = await Service.find({
        type: SERVICE_TYPES.MAIN,
        isActive: true,
    })
        .sort({ name: 1 })
        .lean();

    const hierarchy = await Promise.all(
        mainServices.map(async (mainService) => {
            const subServices = await Service.find({
                parentService: mainService._id,
                isActive: true,
            })
                .sort({ name: 1 })
                .lean();

            return {
                ...mainService,
                subServices,
            };
        })
    );

    return hierarchy;
};
