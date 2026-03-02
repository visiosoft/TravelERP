import express from 'express';
import {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomerLedger,
    getCustomerStats,
} from '../controllers/customerController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    createCustomerValidation,
    updateCustomerValidation,
} from '../validators/customerValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router
    .route('/')
    .get(getAllCustomers)
    .post(createCustomerValidation, createCustomer);

router
    .route('/:id')
    .get(getCustomerById)
    .put(updateCustomerValidation, updateCustomer)
    .delete(restrictTo(ROLES.ADMIN, ROLES.ACCOUNTANT), deleteCustomer);

router.get('/:id/ledger', getCustomerLedger);
router.get('/:id/stats', getCustomerStats);

export default router;
