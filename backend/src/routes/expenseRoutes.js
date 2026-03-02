import express from 'express';
import {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
    getExpenseByCategory,
} from '../controllers/expenseController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
    createExpenseValidation,
    updateExpenseValidation,
} from '../validators/expenseValidator.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Special routes before parameterized routes
router.get('/summary/stats', getExpenseSummary);
router.get('/summary/by-category', getExpenseByCategory);

router
    .route('/')
    .get(getAllExpenses)
    .post(createExpenseValidation, createExpense);

router
    .route('/:id')
    .get(getExpenseById)
    .put(updateExpenseValidation, updateExpense)
    .delete(restrictTo(ROLES.ADMIN, ROLES.ACCOUNTANT), deleteExpense);

export default router;
