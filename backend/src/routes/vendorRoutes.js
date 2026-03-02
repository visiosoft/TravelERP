import express from 'express';
import {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    getVendorLedger,
    getVendorStats,
} from '../controllers/vendorController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    createVendorValidation,
    updateVendorValidation,
} from '../validators/vendorValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router
    .route('/')
    .get(getAllVendors)
    .post(createVendorValidation, createVendor);

router
    .route('/:id')
    .get(getVendorById)
    .put(updateVendorValidation, updateVendor)
    .delete(restrictTo(ROLES.ADMIN, ROLES.ACCOUNTANT), deleteVendor);

router.get('/:id/ledger', getVendorLedger);
router.get('/:id/stats', getVendorStats);

export default router;
