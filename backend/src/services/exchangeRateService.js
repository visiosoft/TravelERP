import ExchangeRate from '../models/ExchangeRate.js';
import { getPagination } from '../utils/helpers.js';
import { CURRENCIES } from '../config/constants.js';

/**
 * Exchange Rate Service Layer
 */

export const createExchangeRate = async (rateData, userId) => {
    const rate = await ExchangeRate.create({
        ...rateData,
        createdBy: userId,
    });

    return rate;
};

export const getAllExchangeRates = async (query) => {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const { currency } = query;

    // Build filter
    const filter = {};
    if (currency) filter.currency = currency;

    const [rates, total] = await Promise.all([
        ExchangeRate.find(filter)
            .sort({ effectiveDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ExchangeRate.countDocuments(filter),
    ]);

    return { rates, total, page, limit };
};

export const getExchangeRateById = async (rateId) => {
    const rate = await ExchangeRate.findById(rateId);

    if (!rate) {
        throw new Error('Exchange rate not found');
    }

    return rate;
};

export const getLatestRates = async () => {
    const currencies = Object.values(CURRENCIES).filter(c => c !== CURRENCIES.PKR);

    const latestRates = await Promise.all(
        currencies.map(async (currency) => {
            const rate = await ExchangeRate.findOne({ currency })
                .sort({ effectiveDate: -1 })
                .lean();

            return {
                currency,
                rate: rate ? rate.rateAgainstPKR : null,
                effectiveDate: rate ? rate.effectiveDate : null,
            };
        })
    );

    return latestRates;
};

export const getLatestRate = async (currency) => {
    const rate = await ExchangeRate.getLatestRate(currency);
    return rate;
};

export const getRateOnDate = async (currency, date) => {
    const rate = await ExchangeRate.getRateOnDate(currency, date);
    return rate;
};

export const updateExchangeRate = async (rateId, updateData) => {
    const rate = await ExchangeRate.findByIdAndUpdate(
        rateId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!rate) {
        throw new Error('Exchange rate not found');
    }

    return rate;
};

export const deleteExchangeRate = async (rateId) => {
    const rate = await ExchangeRate.findById(rateId);

    if (!rate) {
        throw new Error('Exchange rate not found');
    }

    // Soft delete
    rate.isDeleted = true;
    await rate.save();

    return rate;
};

export const getCurrencyHistory = async (currency, startDate, endDate) => {
    const filter = { currency };

    if (startDate || endDate) {
        filter.effectiveDate = {};
        if (startDate) filter.effectiveDate.$gte = new Date(startDate);
        if (endDate) filter.effectiveDate.$lte = new Date(endDate);
    }

    const history = await ExchangeRate.find(filter)
        .sort({ effectiveDate: -1 })
        .select('rateAgainstPKR effectiveDate source')
        .lean();

    return history;
};
