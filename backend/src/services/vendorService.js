import Vendor from '../models/Vendor.js';
import { getPagination, buildSearchQuery } from '../utils/helpers.js';
import Ledger from '../models/Ledger.js';
import { ACCOUNT_TYPES } from '../config/constants.js';

/**
 * Vendor Service Layer
 */

export const createVendor = async (vendorData, userId) => {
    const vendor = await Vendor.create({
        ...vendorData,
        createdBy: userId,
    });

    return vendor;
};

export const getAllVendors = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, status, country, currency } = query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (country) filter.country = country;
    if (currency) filter.defaultCurrency = currency;

    // Search
    if (search) {
        const searchQuery = buildSearchQuery(
            ['name', 'contactPerson', 'phone', 'email'],
            search
        );
        Object.assign(filter, searchQuery);
    }

    const [vendors, total] = await Promise.all([
        Vendor.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Vendor.countDocuments(filter),
    ]);

    return { vendors, total, page, limit };
};

export const getVendorById = async (vendorId) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw new Error('Vendor not found');
    }

    return vendor;
};

export const updateVendor = async (vendorId, updateData) => {
    const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!vendor) {
        throw new Error('Vendor not found');
    }

    return vendor;
};

export const deleteVendor = async (vendorId) => {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw new Error('Vendor not found');
    }

    // Check if vendor has outstanding payables
    if (vendor.totalPayable > 0) {
        throw new Error('Cannot delete vendor with outstanding payables');
    }

    // Soft delete
    vendor.isDeleted = true;
    await vendor.save();

    return vendor;
};

export const getVendorLedger = async (vendorId, startDate, endDate) => {
    const vendor = await getVendorById(vendorId);

    const ledger = await Ledger.getAccountLedger(
        ACCOUNT_TYPES.VENDOR,
        vendorId,
        startDate,
        endDate
    );

    return {
        vendor,
        ledger,
        balance: vendor.totalPayable,
    };
};

export const getVendorStats = async (vendorId) => {
    const vendor = await getVendorById(vendorId);

    const stats = {
        totalPurchases: vendor.totalPurchases,
        totalPaid: vendor.totalPaid,
        outstandingPayable: vendor.totalPayable,
    };

    return stats;
};
