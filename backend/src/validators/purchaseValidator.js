import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';

export const createPurchaseValidation = validate(
    Joi.object({
        vendorId: commonValidations.objectId.required().messages({
            'any.required': 'Vendor is required',
        }),
        serviceId: commonValidations.objectId.required().messages({
            'any.required': 'Service is required',
        }),
        quantity: Joi.number().min(1).default(1),
        currency: commonValidations.currency.required().messages({
            'any.required': 'Currency is required',
        }),
        unitCostForeign: commonValidations.positiveNumber.required().messages({
            'any.required': 'Unit cost is required',
        }),
        exchangeRate: commonValidations.positiveNumber.optional(),
        invoiceNumber: Joi.string().optional(),
        purchaseDate: commonValidations.date.optional(),
        notes: Joi.string().max(500).optional(),
    })
);

export const updatePurchaseValidation = validate(
    Joi.object({
        invoiceNumber: Joi.string().optional(),
        notes: Joi.string().max(500).optional(),
    })
);
