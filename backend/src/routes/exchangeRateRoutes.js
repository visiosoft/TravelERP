import express from 'express';
import {
    createExchangeRate,
    getAllExchangeRates,
    getExchangeRateById,
    updateExchangeRate,
    deleteExchangeRate,
    getLatestRates,
    getLatestRate,
    getCurrencyHistory,
} from '../controllers/exchangeRateController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    createExchangeRateValidation,
    updateExchangeRateValidation,
} from '../validators/exchangeRateValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Special routes must come before parameterized routes
router.get('/latest/all', getLatestRates);
router.get('/latest/:currency', getLatestRate);
router.get('/history/:currency', getCurrencyHistory);

router
    .route('/')
    .get(getAllExchangeRates)
    .post(createExchangeRateValidation, createExchangeRate);

router
    .route('/:id')
    .get(getExchangeRateById)
    .put(updateExchangeRateValidation, updateExchangeRate)
    .delete(restrictTo(ROLES.ADMIN, ROLES.ACCOUNTANT), deleteExchangeRate);

export default router;
