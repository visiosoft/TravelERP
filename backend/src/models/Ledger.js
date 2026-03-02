import mongoose from 'mongoose';
import { ACCOUNT_TYPES, REFERENCE_TYPES, CURRENCIES } from '../config/constants.js';

const ledgerSchema = new mongoose.Schema(
    {
        // Account information
        accountType: {
            type: String,
            enum: Object.values(ACCOUNT_TYPES),
            required: true,
            index: true,
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        accountName: {
            type: String,
            required: true,
        },
        // Reference to source transaction
        referenceType: {
            type: String,
            enum: Object.values(REFERENCE_TYPES),
            required: true,
            index: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        referenceNumber: {
            type: String,
            index: true,
        },
        // Double-entry bookkeeping
        debit: {
            type: Number,
            default: 0,
            min: 0,
        },
        credit: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Currency tracking
        currency: {
            type: String,
            enum: Object.values(CURRENCIES),
            default: CURRENCIES.PKR,
        },
        // Foreign amount (if applicable)
        foreignAmount: {
            type: Number,
            default: 0,
        },
        exchangeRate: {
            type: Number,
            default: 1,
        },
        // Running balance (for easier reporting)
        balance: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        transactionDate: {
            type: Date,
            default: Date.now,
            index: true,
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

// Compound indexes for efficient queries
ledgerSchema.index({ accountType: 1, accountId: 1, transactionDate: -1 });
ledgerSchema.index({ referenceType: 1, referenceId: 1 });
ledgerSchema.index({ transactionDate: -1 });
ledgerSchema.index({ accountId: 1, transactionDate: -1 });

// Validation: Either debit or credit should be present, not both
ledgerSchema.pre('save', function (next) {
    if (this.debit > 0 && this.credit > 0) {
        return next(new Error('Entry cannot have both debit and credit'));
    }
    if (this.debit === 0 && this.credit === 0) {
        return next(new Error('Entry must have either debit or credit'));
    }
    next();
});

// Static method to get account balance
ledgerSchema.statics.getAccountBalance = async function (accountType, accountId) {
    const result = await this.aggregate([
        {
            $match: {
                accountType,
                accountId: new mongoose.Types.ObjectId(accountId),
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: null,
                totalDebit: { $sum: '$debit' },
                totalCredit: { $sum: '$credit' },
            },
        },
    ]);

    if (result.length === 0) {
        return 0;
    }

    // Balance calculation depends on account type
    // Assets & Expenses: Debit - Credit
    // Liabilities, Equity & Revenue: Credit - Debit
    const { totalDebit, totalCredit } = result[0];

    if (
        accountType === ACCOUNT_TYPES.CUSTOMER ||
        accountType === ACCOUNT_TYPES.EXPENSE ||
        accountType === ACCOUNT_TYPES.CASH ||
        accountType === ACCOUNT_TYPES.BANK
    ) {
        return totalDebit - totalCredit;
    } else {
        return totalCredit - totalDebit;
    }
};

// Static method to get ledger entries for an account
ledgerSchema.statics.getAccountLedger = async function (
    accountType,
    accountId,
    startDate,
    endDate
) {
    const query = {
        accountType,
        accountId: new mongoose.Types.ObjectId(accountId),
        isDeleted: false,
    };

    if (startDate || endDate) {
        query.transactionDate = {};
        if (startDate) query.transactionDate.$gte = new Date(startDate);
        if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    return await this.find(query)
        .sort({ transactionDate: 1, createdAt: 1 })
        .lean();
};

// Query middleware
ledgerSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Ledger = mongoose.model('Ledger', ledgerSchema);

export default Ledger;
