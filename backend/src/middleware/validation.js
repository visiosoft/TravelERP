import Joi from 'joi';
import { AppError } from './errorHandler.js';

/**
 * Request Validation Middleware
 */

const validate = (schema) => {
    return (req, res, next) => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };

        const { error, value } = schema.validate(req.body, validationOptions);

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');

            throw new AppError(errorMessage, 400);
        }

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};

// Common validation schemas
export const commonValidations = {
    objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid ObjectId'),
    email: Joi.string().email().lowercase().trim(),
    phone: Joi.string().pattern(/^[\d\s\+\-\(\)]+$/),
    currency: Joi.string().valid('PKR', 'USD', 'SAR', 'AED', 'EUR', 'GBP'),
    paymentMethod: Joi.string().valid('cash', 'bank', 'transfer', 'cheque'),
    positiveNumber: Joi.number().positive(),
    date: Joi.date(),
};

export default validate;
