import mongoose from 'mongoose';
import { CURRENCIES } from '../config/constants.js';

const exchangeRateSchema = new mongoose.Schema(
    {
        currency: {
            type: String,
            enum: Object.values(CURRENCIES),
            required: [true, 'Currency is required'],
            index: true,
        },
        rateAgainstPKR: {
            type: Number,
            required: [true, 'Exchange rate is required'],
            min: [0, 'Exchange rate must be positive'],
        },
        effectiveDate: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        source: {
            type: String,
            trim: true,
            default: 'Manual Entry',
        },
        notes: {
            type: String,
            maxlength: [200, 'Notes cannot exceed 200 characters'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for currency and date
exchangeRateSchema.index({ currency: 1, effectiveDate: -1 });
exchangeRateSchema.index({ createdAt: -1 });

// Static method to get latest rate for a currency
exchangeRateSchema.statics.getLatestRate = async function (currency) {
    if (currency === CURRENCIES.PKR) {
        return 1; // PKR to PKR is always 1
    }

    const rate = await this.findOne({ currency })
        .sort({ effectiveDate: -1 })
        .select('rateAgainstPKR effectiveDate');

    if (!rate) {
        throw new Error(`No exchange rate found for ${currency}`);
    }

    return rate.rateAgainstPKR;
};

// Static method to get rate on specific date
exchangeRateSchema.statics.getRateOnDate = async function (currency, date) {
    if (currency === CURRENCIES.PKR) {
        return 1;
    }

    const rate = await this.findOne({
        currency,
        effectiveDate: { $lte: date },
    })
        .sort({ effectiveDate: -1 })
        .select('rateAgainstPKR effectiveDate');

    if (!rate) {
        throw new Error(`No exchange rate found for ${currency} on ${date}`);
    }

    return rate.rateAgainstPKR;
};

// Query middleware to exclude deleted records
exchangeRateSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

export default ExchangeRate;
