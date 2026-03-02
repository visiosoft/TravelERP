import express from 'express';
import {
    getDashboardKPIs,
    getDailyFinancialSummary,
    getMonthlyProfitReport,
    getCustomerOutstandingReport,
    getVendorPayableReport,
    getServiceProfitabilityReport,
    getCashFlowReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardKPIs);
router.get('/daily-summary', getDailyFinancialSummary);
router.get('/monthly-profit', getMonthlyProfitReport);
router.get('/customer-outstanding', getCustomerOutstandingReport);
router.get('/vendor-payable', getVendorPayableReport);
router.get('/service-profitability', getServiceProfitabilityReport);
router.get('/cash-flow', getCashFlowReport);

export default router;
