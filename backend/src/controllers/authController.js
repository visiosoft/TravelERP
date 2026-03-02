import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Private (Admin only)
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('User with this email already exists', 400);
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || ROLES.SALES_AGENT,
        phone,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    sendCreated(
        res,
        {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        },
        'User registered successfully'
    );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
        throw new AppError('Account is inactive. Contact administrator.', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Save refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    sendSuccess(
        res,
        {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        },
        'Login successful'
    );
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
    }

    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and validate refresh token
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            throw new AppError('Invalid refresh token', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is inactive', 401);
        }

        // Generate new tokens
        const tokens = generateTokens(user._id, user.role);

        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        sendSuccess(res, tokens, 'Token refreshed successfully');
    } catch (error) {
        throw new AppError('Invalid or expired refresh token', 401);
    }
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    // Clear refresh token
    req.user.refreshToken = null;
    await req.user.save();

    sendSuccess(res, null, 'Logout successful');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    sendSuccess(res, { user }, 'User profile retrieved');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    sendSuccess(res, { user }, 'Profile updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError('Please provide current and new password', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    if (!(await user.comparePassword(currentPassword))) {
        throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendSuccess(res, null, 'Password changed successfully');
});
