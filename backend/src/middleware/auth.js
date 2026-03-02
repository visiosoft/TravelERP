import { asyncHandler, AppError } from './errorHandler.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('Not authorized. Please login.', 401);
    }

    try {
        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new AppError('User no longer exists', 401);
        }

        if (!user.isActive) {
            throw new AppError('User account is inactive', 401);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        throw new AppError('Not authorized. Token invalid or expired.', 401);
    }
});

/**
 * Restrict access to specific roles
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new AppError(
                'You do not have permission to perform this action',
                403
            );
        }
        next();
    };
};

/**
 * Optional authentication - attach user if token is valid
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.userId).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        } catch (error) {
            // Token invalid, but endpoint is optional, so continue
        }
    }

    next();
});
