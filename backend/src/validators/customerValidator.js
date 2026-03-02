import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';

export const createCustomerValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(200).required().messages({
            'any.required': 'Customer name is required',
            'string.min': 'Name must be at least 2 characters',
        }),
        phone: Joi.string().required().messages({
            'any.required': 'Phone number is required',
        }),
        email: commonValidations.email.optional(),
        passportNo: Joi.string().optional(),
        cnicNo: Joi.string().optional(),
        address: Joi.object({
            street: Joi.string().optional(),
            city: Joi.string().optional(),
            country: Joi.string().optional(),
            postalCode: Joi.string().optional(),
        }).optional(),
        status: Joi.string().valid('active', 'inactive', 'blocked').optional(),
        notes: Joi.string().max(500).optional(),
    })
);

export const updateCustomerValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(200).optional(),
        phone: Joi.string().optional(),
        email: commonValidations.email.optional(),
        passportNo: Joi.string().optional(),
        cnicNo: Joi.string().optional(),
        address: Joi.object({
            street: Joi.string().optional(),
            city: Joi.string().optional(),
            country: Joi.string().optional(),
            postalCode: Joi.string().optional(),
        }).optional(),
        status: Joi.string().valid('active', 'inactive', 'blocked').optional(),
        notes: Joi.string().max(500).optional(),
    })
);
