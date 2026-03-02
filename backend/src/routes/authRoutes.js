import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    updateProfile,
    changePassword,
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    registerValidation,
    loginValidation,
    refreshTokenValidation,
    updateProfileValidation,
    changePasswordValidation,
} from '../validators/authValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, login);
router.post('/refresh', refreshTokenValidation, refreshToken);

// Protected routes
router.use(protect); // All routes below this require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);

// Admin only routes
router.post(
    '/register',
    restrictTo(ROLES.ADMIN),
    registerValidation,
    register
);

export default router;
