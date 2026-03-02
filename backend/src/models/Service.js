import mongoose from 'mongoose';
import { SERVICE_TYPES } from '../config/constants.js';

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
            index: true,
        },
        code: {
            type: String,
            trim: true,
            uppercase: true,
            unique: true,
            sparse: true,
        },
        type: {
            type: String,
            enum: Object.values(SERVICE_TYPES),
            required: true,
            default: SERVICE_TYPES.SUB,
        },
        parentService: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            default: null,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        // Default pricing (optional, can be overridden per transaction)
        defaultCostPrice: {
            type: Number,
            min: 0,
        },
        defaultSellingPrice: {
            type: Number,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Statistics
        totalSalesCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPurchasesCount: {
            type: Number,
            default: 0,
            min: 0,
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
serviceSchema.index({ name: 1 });
serviceSchema.index({ type: 1 });
serviceSchema.index({ parentService: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ createdAt: -1 });

// Virtual for sub-services (if main service)
serviceSchema.virtual('subServices', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'parentService',
});

// Validation: sub-service must have a parent
serviceSchema.pre('save', function (next) {
    if (this.type === SERVICE_TYPES.SUB && !this.parentService) {
        return next(new Error('Sub-service must have a parent service'));
    }
    if (this.type === SERVICE_TYPES.MAIN && this.parentService) {
        return next(new Error('Main service cannot have a parent'));
    }
    next();
});

// Query middleware to exclude deleted records
serviceSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
