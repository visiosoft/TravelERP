/**
 * Centralized Error Handling Middleware
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Handle MongoDB Duplicate Key Error
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists. Please use a different value.`;
    return new AppError(message, 400);
};

// Handle MongoDB Validation Error
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(e => e.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// Handle MongoDB Cast Error
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// Handle JWT Errors
const handleJWTError = () => new AppError('Invalid token. Please login again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please login again.', 401);

// Development Error Response
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        status: err.statusCode,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

// Production Error Response
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            status: err.statusCode,
            message: err.message,
        });
    } else {
        // Programming or unknown error: don't leak error details
        console.error('❌ ERROR:', err);

        res.status(500).json({
            success: false,
            status: 500,
            message: 'Something went wrong on the server',
        });
    }
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific error types
        if (err.code === 11000) error = handleDuplicateKeyError(err);
        if (err.name === 'ValidationError') error = handleValidationError(err);
        if (err.name === 'CastError') error = handleCastError(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

// Async Handler Wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 Handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

export { AppError, errorHandler, asyncHandler, notFound };
