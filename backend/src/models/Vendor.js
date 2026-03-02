import mongoose from 'mongoose';
import { STATUS, CURRENCIES } from '../config/constants.js';

const vendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vendor name is required'],
            trim: true,
            index: true,
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
        },
        defaultCurrency: {
            type: String,
            enum: Object.values(CURRENCIES),
            default: CURRENCIES.USD,
            required: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        address: {
            street: String,
            city: String,
            country: String,
            postalCode: String,
        },
        paymentTerms: {
            type: String,
            trim: true,
            default: 'Net 30',
        },
        // Financial fields
        totalPayable: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPurchases: {
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
vendorSchema.index({ name: 1 });
vendorSchema.index({ country: 1 });
vendorSchema.index({ defaultCurrency: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ createdAt: -1 });

// Virtual for outstanding balance
vendorSchema.virtual('outstandingBalance').get(function () {
    return this.totalPayable;
});

// Query middleware to exclude deleted records
vendorSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
