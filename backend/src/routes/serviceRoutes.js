import express from 'express';
import {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
    getMainServices,
    getSubServicesByParent,
    getServiceHierarchy,
} from '../controllers/serviceController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    createServiceValidation,
    updateServiceValidation,
} from '../validators/serviceValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Special routes must come before parameterized routes
router.get('/main/list', getMainServices);
router.get('/hierarchy', getServiceHierarchy);
router.get('/parent/:parentId/sub', getSubServicesByParent);

router
    .route('/')
    .get(getAllServices)
    .post(createServiceValidation, createService);

router
    .route('/:id')
    .get(getServiceById)
    .put(updateServiceValidation, updateService)
    .delete(restrictTo(ROLES.ADMIN, ROLES.ACCOUNTANT), deleteService);

export default router;
