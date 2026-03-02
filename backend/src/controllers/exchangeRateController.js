import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendCreated, sendPaginatedResponse, sendNoContent } from '../utils/response.js';
import * as exchangeRateService from '../services/exchangeRateService.js';

/**
 * @desc    Create a new exchange rate
 * @route   POST /api/exchange-rates
 * @access  Private
 */
export const createExchangeRate = asyncHandler(async (req, res) => {
    const rate = await exchangeRateService.createExchangeRate(req.body, req.user._id);
    sendCreated(res, { rate }, 'Exchange rate created successfully');
});

/**
 * @desc    Get all exchange rates
 * @route   GET /api/exchange-rates
 * @access  Private
 */
export const getAllExchangeRates = asyncHandler(async (req, res) => {
    const { rates, total, page, limit } = await exchangeRateService.getAllExchangeRates(req.query);
    sendPaginatedResponse(res, rates, page, limit, total, 'Exchange rates retrieved successfully');
});

/**
 * @desc    Get exchange rate by ID
 * @route   GET /api/exchange-rates/:id
 * @access  Private
 */
export const getExchangeRateById = asyncHandler(async (req, res) => {
    const rate = await exchangeRateService.getExchangeRateById(req.params.id);
    sendSuccess(res, { rate }, 'Exchange rate retrieved successfully');
});

/**
 * @desc    Get latest rates for all currencies
 * @route   GET /api/exchange-rates/latest/all
 * @access  Private
 */
export const getLatestRates = asyncHandler(async (req, res) => {
    const rates = await exchangeRateService.getLatestRates();
    sendSuccess(res, { rates }, 'Latest exchange rates retrieved successfully');
});

/**
 * @desc    Get latest rate for a currency
 * @route   GET /api/exchange-rates/latest/:currency
 * @access  Private
 */
export const getLatestRate = asyncHandler(async (req, res) => {
    const rate = await exchangeRateService.getLatestRate(req.params.currency);
    sendSuccess(res, { rate }, 'Latest rate retrieved successfully');
});

/**
 * @desc    Get currency history
 * @route   GET /api/exchange-rates/history/:currency
 * @access  Private
 */
export const getCurrencyHistory = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const history = await exchangeRateService.getCurrencyHistory(
        req.params.currency,
        startDate,
        endDate
    );
    sendSuccess(res, { history }, 'Currency history retrieved successfully');
});

/**
 * @desc    Update exchange rate
 * @route   PUT /api/exchange-rates/:id
 * @access  Private
 */
export const updateExchangeRate = asyncHandler(async (req, res) => {
    const rate = await exchangeRateService.updateExchangeRate(req.params.id, req.body);
    sendSuccess(res, { rate }, 'Exchange rate updated successfully');
});

/**
 * @desc    Delete exchange rate
 * @route   DELETE /api/exchange-rates/:id
 * @access  Private (Admin only)
 */
export const deleteExchangeRate = asyncHandler(async (req, res) => {
    await exchangeRateService.deleteExchangeRate(req.params.id);
    sendNoContent(res, 'Exchange rate deleted successfully');
});
