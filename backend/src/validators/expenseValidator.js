import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';
import { EXPENSE_CATEGORIES } from '../config/constants.js';

export const createExpenseValidation = validate(
    Joi.object({
        category: Joi.string()
            .valid(...Object.values(EXPENSE_CATEGORIES))
            .required()
            .messages({
                'any.required': 'Category is required',
            }),
        description: Joi.string().min(3).max(300).required().messages({
            'any.required': 'Description is required',
            'string.min': 'Description must be at least 3 characters',
        }),
        amount: commonValidations.positiveNumber.required().messages({
            'any.required': 'Amount is required',
        }),
        paymentMethod: commonValidations.paymentMethod.required().messages({
            'any.required': 'Payment method is required',
        }),
        referenceNumber: Joi.string().optional(),
        expenseDate: commonValidations.date.optional(),
        vendorId: commonValidations.objectId.optional(),
        notes: Joi.string().max(500).optional(),
    })
);

export const updateExpenseValidation = validate(
    Joi.object({
        description: Joi.string().min(3).max(300).optional(),
        referenceNumber: Joi.string().optional(),
        notes: Joi.string().max(500).optional(),
    })
);
