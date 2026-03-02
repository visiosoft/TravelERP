import express from 'express';
import {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    deleteSale,
    getSaleSummary,
} from '../controllers/saleController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    createSaleValidation,
    updateSaleValidation,
} from '../validators/saleValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Special routes before parameterized routes
router.get('/summary/stats', getSaleSummary);

router
    .route('/')
    .get(getAllSales)
    .post(createSaleValidation, createSale);

router
    .route('/:id')
    .get(getSaleById)
    .put(updateSaleValidation, updateSale)
    .delete(restrictTo(ROLES.ADMIN, ROLES.ACCOUNTANT), deleteSale);

export default router;
