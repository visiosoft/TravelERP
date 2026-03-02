/**
 * Standardized API Response Utilities
 */

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const sendPaginatedResponse = (
    res,
    data,
    page,
    limit,
    total,
    message = 'Success'
) => {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            pageSize: limit,
            totalRecords: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    });
};

export const sendCreated = (res, data, message = 'Created successfully') => {
    return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res, message = 'Deleted successfully') => {
    return res.status(200).json({
        success: true,
        message,
    });
};
