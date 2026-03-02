import mongoose from 'mongoose';
import { STATUS } from '../config/constants.js';

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            index: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        passportNo: {
            type: String,
            trim: true,
            uppercase: true,
        },
        cnicNo: {
            type: String,
            trim: true,
        },
        address: {
            street: String,
            city: String,
            country: String,
            postalCode: String,
        },
        // Financial fields
        balance: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalReceivable: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalReceived: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalSales: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(STATUS),
            default: STATUS.ACTIVE,
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
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for outstanding balance
customerSchema.virtual('outstandingBalance').get(function () {
    return this.totalReceivable;
});

// Query middleware to exclude deleted records
customerSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
