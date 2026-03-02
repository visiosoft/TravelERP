import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';

export const createCustomerPaymentValidation = validate(
    Joi.object({
        customerId: commonValidations.objectId.required().messages({
            'any.required': 'Customer is required',
        }),
        saleId: commonValidations.objectId.optional(),
        amount: commonValidations.positiveNumber.required().messages({
            'any.required': 'Amount is required',
        }),
        paymentMethod: commonValidations.paymentMethod.required().messages({
            'any.required': 'Payment method is required',
        }),
        referenceNumber: Joi.string().optional(),
        paymentDate: commonValidations.date.optional(),
        notes: Joi.string().max(300).optional(),
    })
);

export const createVendorPaymentValidation = validate(
    Joi.object({
        vendorId: commonValidations.objectId.required().messages({
            'any.required': 'Vendor is required',
        }),
        purchaseId: commonValidations.objectId.optional(),
        currency: commonValidations.currency.required().messages({
            'any.required': 'Currency is required',
        }),
        amountForeign: commonValidations.positiveNumber.required().messages({
            'any.required': 'Amount is required',
        }),
        exchangeRate: commonValidations.positiveNumber.optional(),
        paymentMethod: commonValidations.paymentMethod.required().messages({
            'any.required': 'Payment method is required',
        }),
        referenceNumber: Joi.string().optional(),
        paymentDate: commonValidations.date.optional(),
        notes: Joi.string().max(300).optional(),
    })
);
