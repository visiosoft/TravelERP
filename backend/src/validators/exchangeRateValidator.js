import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';

export const createExchangeRateValidation = validate(
    Joi.object({
        currency: commonValidations.currency.required().messages({
            'any.required': 'Currency is required',
        }),
        rateAgainstPKR: commonValidations.positiveNumber.required().messages({
            'any.required': 'Exchange rate is required',
        }),
        effectiveDate: commonValidations.date.optional(),
        source: Joi.string().max(200).optional(),
        notes: Joi.string().max(200).optional(),
    })
);

export const updateExchangeRateValidation = validate(
    Joi.object({
        rateAgainstPKR: commonValidations.positiveNumber.optional(),
        effectiveDate: commonValidations.date.optional(),
        source: Joi.string().max(200).optional(),
        notes: Joi.string().max(200).optional(),
    })
);
