import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const saleSchema = new mongoose.Schema(
    {
        saleNumber: {
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
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: [true, 'Service is required'],
            index: true,
        },
        // Link to purchase (for profit calculation)
        linkedPurchase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase',
        },
        // Snapshots to preserve historical data
        serviceSnapshot: {
            name: String,
            code: String,
        },
        customerSnapshot: {
            name: String,
            phone: String,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
            default: 1,
        },
        // All sales are in PKR
        sellingPricePKR: {
            type: Number,
            required: [true, 'Selling price is required'],
            min: [0, 'Selling price must be positive'],
        },
        totalAmount: {
            type: Number,
            min: 0,
            // Calculated in pre-save hook: quantity * sellingPricePKR
        },
        // Payment tracking
        receivableAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        receivedAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.UNPAID,
        },
        saleDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        invoiceNumber: {
            type: String,
            trim: true,
        },
        // For profit calculation (stored at time of sale)
        costPKR: {
            type: Number,
            default: 0,
            min: 0,
        },
        profitAmount: {
            type: Number,
            default: 0,
        },
        profitPercentage: {
            type: Number,
            default: 0,
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
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ customer: 1, saleDate: -1 });
saleSchema.index({ service: 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
saleSchema.pre('save', function (next) {
    // Calculate total amount
    this.totalAmount = this.quantity * this.sellingPricePKR;

    // Round to 2 decimal places
    this.totalAmount = Math.round(this.totalAmount * 100) / 100;

    // Set initial receivable amount
    if (this.isNew) {
        this.receivableAmount = this.totalAmount;
    }

    // Calculate profit if cost is available
    if (this.costPKR > 0) {
        this.profitAmount = this.totalAmount - this.costPKR;
        this.profitPercentage = (this.profitAmount / this.totalAmount) * 100;

        // Round profit values
        this.profitAmount = Math.round(this.profitAmount * 100) / 100;
        this.profitPercentage = Math.round(this.profitPercentage * 100) / 100;
    }

    next();
});

// Method to update payment status
saleSchema.methods.updatePaymentStatus = function () {
    if (this.receivedAmount === 0) {
        this.paymentStatus = PAYMENT_STATUS.UNPAID;
    } else if (this.receivedAmount >= this.receivableAmount) {
        this.paymentStatus = PAYMENT_STATUS.PAID;
    } else {
        this.paymentStatus = PAYMENT_STATUS.PARTIAL;
    }
};

// Query middleware to exclude deleted records
saleSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
