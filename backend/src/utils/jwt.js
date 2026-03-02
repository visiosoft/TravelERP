import jwt from 'jsonwebtoken';

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (userId, role) => {
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId);

    return { accessToken, refreshToken };
};
