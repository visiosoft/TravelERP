import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as reportService from '../services/reportService.js';

/**
 * @desc    Get dashboard KPIs
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
export const getDashboardKPIs = asyncHandler(async (req, res) => {
    const kpis = await reportService.getDashboardKPIs();
    sendSuccess(res, kpis, 'Dashboard KPIs retrieved successfully');
});

/**
 * @desc    Get daily financial summary
 * @route   GET /api/reports/daily-summary
 * @access  Private
 */
export const getDailyFinancialSummary = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const summary = await reportService.getDailyFinancialSummary(date);
    sendSuccess(res, summary, 'Daily financial summary retrieved successfully');
});

/**
 * @desc    Get monthly profit report
 * @route   GET /api/reports/monthly-profit
 * @access  Private
 */
export const getMonthlyProfitReport = asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    const report = await reportService.getMonthlyProfitReport(
        parseInt(month),
        parseInt(year)
    );
    sendSuccess(res, report, 'Monthly profit report retrieved successfully');
});

/**
 * @desc    Get customer outstanding report
 * @route   GET /api/reports/customer-outstanding
 * @access  Private
 */
export const getCustomerOutstandingReport = asyncHandler(async (req, res) => {
    const report = await reportService.getCustomerOutstandingReport();
    sendSuccess(res, report, 'Customer outstanding report retrieved successfully');
});

/**
 * @desc    Get vendor payable report
 * @route   GET /api/reports/vendor-payable
 * @access  Private
 */
export const getVendorPayableReport = asyncHandler(async (req, res) => {
    const report = await reportService.getVendorPayableReport();
    sendSuccess(res, report, 'Vendor payable report retrieved successfully');
});

/**
 * @desc    Get service profitability report
 * @route   GET /api/reports/service-profitability
 * @access  Private
 */
export const getServiceProfitabilityReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const report = await reportService.getServiceProfitabilityReport(startDate, endDate);
    sendSuccess(res, { services: report }, 'Service profitability report retrieved successfully');
});

/**
 * @desc    Get cash flow report
 * @route   GET /api/reports/cash-flow
 * @access  Private
 */
export const getCashFlowReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const report = await reportService.getCashFlowReport(startDate, endDate);
    sendSuccess(res, { cashFlows: report }, 'Cash flow report retrieved successfully');
});
