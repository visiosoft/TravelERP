import mongoose from 'mongoose';
import { PAYMENT_STATUS, CURRENCIES } from '../config/constants.js';

const purchaseSchema = new mongoose.Schema(
    {
        purchaseNumber: {
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
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: [true, 'Service is required'],
            index: true,
        },
        // Snapshot to preserve historical data
        serviceSnapshot: {
            name: String,
            code: String,
        },
        vendorSnapshot: {
            name: String,
            country: String,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
            default: 1,
        },
        // Foreign currency pricing
        currency: {
            type: String,
            enum: Object.values(CURRENCIES),
            required: true,
        },
        unitCostForeign: {
            type: Number,
            required: [true, 'Unit cost is required'],
            min: [0, 'Unit cost must be positive'],
        },
        totalCostForeign: {
            type: Number,
            min: 0,
            // Calculated in pre-save hook: quantity * unitCostForeign
        },
        // Exchange rate snapshot (CRITICAL for accounting)
        exchangeRateSnapshot: {
            type: Number,
            required: [true, 'Exchange rate snapshot is required'],
            min: [0, 'Exchange rate must be positive'],
        },
        // PKR equivalent
        totalCostPKR: {
            type: Number,
            min: 0,
            // Calculated in pre-save hook: totalCostForeign * exchangeRateSnapshot
        },
        // Payment tracking
        payableAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        paidAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.UNPAID,
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        invoiceNumber: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
purchaseSchema.index({ purchaseNumber: 1 });
purchaseSchema.index({ vendor: 1, purchaseDate: -1 });
purchaseSchema.index({ service: 1 });
purchaseSchema.index({ paymentStatus: 1 });
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
purchaseSchema.pre('save', function (next) {
    // Calculate total foreign cost
    this.totalCostForeign = this.quantity * this.unitCostForeign;

    // Calculate PKR equivalent using snapshot rate
    this.totalCostPKR = this.totalCostForeign * this.exchangeRateSnapshot;

    // Round to 2 decimal places
    this.totalCostPKR = Math.round(this.totalCostPKR * 100) / 100;

    // Set initial payable amount
    if (this.isNew) {
        this.payableAmount = this.totalCostPKR;
    }

    next();
});

// Method to update payment status
purchaseSchema.methods.updatePaymentStatus = function () {
    if (this.paidAmount === 0) {
        this.paymentStatus = PAYMENT_STATUS.UNPAID;
    } else if (this.paidAmount >= this.payableAmount) {
        this.paymentStatus = PAYMENT_STATUS.PAID;
    } else {
        this.paymentStatus = PAYMENT_STATUS.PARTIAL;
    }
};

// Query middleware to exclude deleted records
purchaseSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
