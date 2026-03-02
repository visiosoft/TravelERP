import express from 'express';
import {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
    updatePurchase,
    deletePurchase,
    getPurchaseSummary,
} from '../controllers/purchaseController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    createPurchaseValidation,
    updatePurchaseValidation,
} from '../validators/purchaseValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Special routes before parameterized routes
router.get('/summary/stats', getPurchaseSummary);

router
    .route('/')
    .get(getAllPurchases)
    .post(createPurchaseValidation, createPurchase);

router
    .route('/:id')
    .get(getPurchaseById)
    .put(updatePurchaseValidation, updatePurchase)
    .delete(restrictTo(ROLES.ADMIN, ROLES.ACCOUNTANT), deletePurchase);

export default router;
