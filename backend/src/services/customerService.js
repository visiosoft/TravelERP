import Customer from '../models/Customer.js';
import { getPagination, buildSearchQuery } from '../utils/helpers.js';
import Ledger from '../models/Ledger.js';
import { ACCOUNT_TYPES } from '../config/constants.js';

/**
 * Customer Service Layer
 */

export const createCustomer = async (customerData, userId) => {
    const customer = await Customer.create({
        ...customerData,
        createdBy: userId,
    });

    return customer;
};

export const getAllCustomers = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { search, status } = query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    // Search
    if (search) {
        const searchQuery = buildSearchQuery(
            ['name', 'phone', 'email', 'passportNo'],
            search
        );
        Object.assign(filter, searchQuery);
    }

    const [customers, total] = await Promise.all([
        Customer.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Customer.countDocuments(filter),
    ]);

    return { customers, total, page, limit };
};

export const getCustomerById = async (customerId) => {
    const customer = await Customer.findById(customerId);

    if (!customer) {
        throw new Error('Customer not found');
    }

    return customer;
};

export const updateCustomer = async (customerId, updateData) => {
    const customer = await Customer.findByIdAndUpdate(
        customerId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!customer) {
        throw new Error('Customer not found');
    }

    return customer;
};

export const deleteCustomer = async (customerId) => {
    const customer = await Customer.findById(customerId);

    if (!customer) {
        throw new Error('Customer not found');
    }

    // Check if customer has outstanding balance
    if (customer.totalReceivable > 0) {
        throw new Error('Cannot delete customer with outstanding balance');
    }

    // Soft delete
    customer.isDeleted = true;
    await customer.save();

    return customer;
};

export const getCustomerLedger = async (customerId, startDate, endDate) => {
    const customer = await getCustomerById(customerId);

    const ledger = await Ledger.getAccountLedger(
        ACCOUNT_TYPES.CUSTOMER,
        customerId,
        startDate,
        endDate
    );

    return {
        customer,
        ledger,
        balance: customer.totalReceivable,
    };
};

export const getCustomerStats = async (customerId) => {
    const customer = await getCustomerById(customerId);

    // Get additional statistics if needed
    const stats = {
        totalSales: customer.totalSales,
        totalReceived: customer.totalReceived,
        outstandingBalance: customer.totalReceivable,
    };

    return stats;
};
