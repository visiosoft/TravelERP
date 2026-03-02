import mongoose from 'mongoose';
import { PAYMENT_METHODS, CURRENCIES } from '../config/constants.js';

// Customer Payment (Receipt Voucher)
const customerPaymentSchema = new mongoose.Schema(
    {
        paymentNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer is required'],
            index: true,
        },
        sale: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sale',
        },
        // Customer snapshot
        customerSnapshot: {
            name: String,
            phone: String,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount must be positive'],
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PAYMENT_METHODS),
            required: true,
            default: PAYMENT_METHODS.CASH,
        },
        referenceNumber: {
            type: String,
            trim: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        notes: {
            type: String,
            maxlength: [300, 'Notes cannot exceed 300 characters'],
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
customerPaymentSchema.index({ paymentNumber: 1 });
customerPaymentSchema.index({ customer: 1, paymentDate: -1 });
customerPaymentSchema.index({ sale: 1 });
customerPaymentSchema.index({ paymentDate: -1 });
customerPaymentSchema.index({ paymentMethod: 1 });

// Query middleware
customerPaymentSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

// Vendor Payment Schema
const vendorPaymentSchema = new mongoose.Schema(
    {
        paymentNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Vendor is required'],
            index: true,
        },
        purchase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase',
        },
        // Vendor snapshot
        vendorSnapshot: {
            name: String,
            country: String,
        },
        // Foreign currency payment
        currency: {
            type: String,
            enum: Object.values(CURRENCIES),
            required: true,
        },
        amountForeign: {
            type: Number,
            required: [true, 'Foreign amount is required'],
            min: [0, 'Amount must be positive'],
        },
        // Exchange rate at payment time (CRITICAL)
        exchangeRateUsed: {
            type: Number,
            required: [true, 'Exchange rate is required'],
            min: [0, 'Exchange rate must be positive'],
        },
        // PKR equivalent
        amountPKR: {
            type: Number,
            min: 0,
            // Calculated in pre-save hook: amountForeign * exchangeRateUsed
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PAYMENT_METHODS),
            required: true,
            default: PAYMENT_METHODS.BANK,
        },
        referenceNumber: {
            type: String,
            trim: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        // Exchange gain/loss tracking
        exchangeGainLoss: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            maxlength: [300, 'Notes cannot exceed 300 characters'],
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
vendorPaymentSchema.index({ paymentNumber: 1 });
vendorPaymentSchema.index({ vendor: 1, paymentDate: -1 });
vendorPaymentSchema.index({ purchase: 1 });
vendorPaymentSchema.index({ paymentDate: -1 });
vendorPaymentSchema.index({ paymentMethod: 1 });

// Pre-save to calculate PKR amount
vendorPaymentSchema.pre('save', function (next) {
    // Calculate PKR equivalent
    this.amountPKR = this.amountForeign * this.exchangeRateUsed;
    this.amountPKR = Math.round(this.amountPKR * 100) / 100;

    next();
});

// Query middleware
vendorPaymentSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

export const CustomerPayment = mongoose.model('CustomerPayment', customerPaymentSchema);
export const VendorPayment = mongoose.model('VendorPayment', vendorPaymentSchema);
