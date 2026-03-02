import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';

export const createSaleValidation = validate(
    Joi.object({
        customerId: commonValidations.objectId.required().messages({
            'any.required': 'Customer is required',
        }),
        serviceId: commonValidations.objectId.required().messages({
            'any.required': 'Service is required',
        }),
        linkedPurchaseId: commonValidations.objectId.optional(),
        quantity: Joi.number().min(1).default(1),
        sellingPricePKR: commonValidations.positiveNumber.required().messages({
            'any.required': 'Selling price is required',
        }),
        invoiceNumber: Joi.string().optional(),
        saleDate: commonValidations.date.optional(),
        notes: Joi.string().max(500).optional(),
    })
);

export const updateSaleValidation = validate(
    Joi.object({
        invoiceNumber: Joi.string().optional(),
        notes: Joi.string().max(500).optional(),
    })
);
