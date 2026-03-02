/**
 * Utility Helper Functions
 */

/**
 * Calculate pagination parameters
 */
export const getPagination = (page = 1, limit = 10) => {
    const currentPage = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (currentPage - 1) * pageSize;

    return {
        page: currentPage,
        limit: pageSize,
        skip,
    };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Round to 2 decimal places for monetary values
 */
export const roundMoney = (value) => {
    return Math.round(value * 100) / 100;
};

/**
 * Convert foreign currency to PKR
 */
export const convertToPKR = (amount, exchangeRate) => {
    return roundMoney(amount * exchangeRate);
};

/**
 * Calculate profit
 */
export const calculateProfit = (revenue, cost, expenses = 0) => {
    return roundMoney(revenue - cost - expenses);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return roundMoney((value / total) * 100);
};

/**
 * Generate reference number
 */
export const generateReference = (prefix = 'REF') => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

/**
 * Get date range for queries
 */
export const getDateRange = (startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

/**
 * Sanitize object by removing undefined values
 */
export const sanitizeObject = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
};

/**
 * Build search query for MongoDB
 */
export const buildSearchQuery = (fields, searchTerm) => {
    if (!searchTerm) return {};

    const regex = new RegExp(searchTerm, 'i');
    return {
        $or: fields.map((field) => ({ [field]: regex })),
    };
};
