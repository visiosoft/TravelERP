import Joi from 'joi';
import validate from '../middleware/validation.js';

// Register validation
export const registerValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
            'any.required': 'Name is required',
        }),
        email: Joi.string().email().lowercase().required().messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required',
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required',
        }),
        role: Joi.string().valid('Admin', 'Accountant', 'SalesAgent').optional(),
        phone: Joi.string().optional(),
    })
);

// Login validation
export const loginValidation = validate(
    Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required',
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required',
        }),
    })
);

// Refresh token validation
export const refreshTokenValidation = validate(
    Joi.object({
        refreshToken: Joi.string().required().messages({
            'any.required': 'Refresh token is required',
        }),
    })
);

// Update profile validation
export const updateProfileValidation = validate(
    Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().optional(),
    })
);

// Change password validation
export const changePasswordValidation = validate(
    Joi.object({
        currentPassword: Joi.string().required().messages({
            'any.required': 'Current password is required',
        }),
        newPassword: Joi.string().min(6).required().messages({
            'string.min': 'New password must be at least 6 characters',
            'any.required': 'New password is required',
        }),
    })
);
