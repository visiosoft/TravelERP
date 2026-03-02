import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';

export const createVendorValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(200).required().messages({
            'any.required': 'Vendor name is required',
            'string.min': 'Name must be at least 2 characters',
        }),
        country: Joi.string().required().messages({
            'any.required': 'Country is required',
        }),
        defaultCurrency: commonValidations.currency.required(),
        contactPerson: Joi.string().optional(),
        phone: Joi.string().optional(),
        email: commonValidations.email.optional(),
        address: Joi.object({
            street: Joi.string().optional(),
            city: Joi.string().optional(),
            country: Joi.string().optional(),
            postalCode: Joi.string().optional(),
        }).optional(),
        paymentTerms: Joi.string().optional(),
        status: Joi.string().valid('active', 'inactive', 'blocked').optional(),
        notes: Joi.string().max(500).optional(),
    })
);

export const updateVendorValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(200).optional(),
        country: Joi.string().optional(),
        defaultCurrency: commonValidations.currency.optional(),
        contactPerson: Joi.string().optional(),
        phone: Joi.string().optional(),
        email: commonValidations.email.optional(),
        address: Joi.object({
            street: Joi.string().optional(),
            city: Joi.string().optional(),
            country: Joi.string().optional(),
            postalCode: Joi.string().optional(),
        }).optional(),
        paymentTerms: Joi.string().optional(),
        status: Joi.string().valid('active', 'inactive', 'blocked').optional(),
        notes: Joi.string().max(500).optional(),
    })
);
