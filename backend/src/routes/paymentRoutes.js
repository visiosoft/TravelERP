import express from 'express';
import {
    createCustomerPayment,
    getAllCustomerPayments,
    getCustomerPaymentById,
    createVendorPayment,
    getAllVendorPayments,
    getVendorPaymentById,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import {
    createCustomerPaymentValidation,
    createVendorPaymentValidation,
} from '../validators/paymentValidator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer Payment Routes
router
    .route('/customer')
    .get(getAllCustomerPayments)
    .post(createCustomerPaymentValidation, createCustomerPayment);

router.get('/customer/:id', getCustomerPaymentById);

// Vendor Payment Routes
router
    .route('/vendor')
    .get(getAllVendorPayments)
    .post(createVendorPaymentValidation, createVendorPayment);

router.get('/vendor/:id', getVendorPaymentById);

export default router;
