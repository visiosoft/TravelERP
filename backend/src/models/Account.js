import mongoose from 'mongoose';
import { ACCOUNT_TYPES, CURRENCIES } from '../config/constants.js';

/**
 * Account Schema for Chart of Accounts
 * This is the master list of all accounts used in the ledger
 */
const accountSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Account code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Account name is required'],
            trim: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(ACCOUNT_TYPES),
            required: true,
            index: true,
        },
        currency: {
            type: String,
            enum: Object.values(CURRENCIES),
            default: CURRENCIES.PKR,
        },
        parentAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null,
        },
        // Current balance (cached for performance)
        currentBalance: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            maxlength: [300, 'Description cannot exceed 300 characters'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isSystemAccount: {
            type: Boolean,
            default: false,
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

// Indexes
accountSchema.index({ code: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ isActive: 1 });

// Query middleware
accountSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
