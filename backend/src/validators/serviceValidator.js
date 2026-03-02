import Joi from 'joi';
import validate, { commonValidations } from '../middleware/validation.js';

export const createServiceValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(200).required().messages({
            'any.required': 'Service name is required',
            'string.min': 'Name must be at least 2 characters',
        }),
        code: Joi.string().optional(),
        type: Joi.string().valid('main', 'sub').required().messages({
            'any.required': 'Service type is required',
        }),
        parentService: commonValidations.objectId.when('type', {
            is: 'sub',
            then: Joi.required().messages({
                'any.required': 'Parent service is required for sub-service',
            }),
            otherwise: Joi.forbidden(),
        }),
        description: Joi.string().max(500).optional(),
        defaultCostPrice: commonValidations.positiveNumber.optional(),
        defaultSellingPrice: commonValidations.positiveNumber.optional(),
        isActive: Joi.boolean().optional(),
    })
);

export const updateServiceValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(200).optional(),
        code: Joi.string().optional(),
        description: Joi.string().max(500).optional(),
        defaultCostPrice: commonValidations.positiveNumber.optional(),
        defaultSellingPrice: commonValidations.positiveNumber.optional(),
        isActive: Joi.boolean().optional(),
    })
);
