import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../config/constants.js';

const expenseSchema = new mongoose.Schema(
    {
        expenseNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: Object.values(EXPENSE_CATEGORIES),
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [300, 'Description cannot exceed 300 characters'],
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
        expenseDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        // Optional vendor link for vendor-related expenses
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
        },
        attachments: [
            {
                filename: String,
                url: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
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
    }
);

// Indexes
expenseSchema.index({ expenseNumber: 1 });
expenseSchema.index({ category: 1, expenseDate: -1 });
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ paymentMethod: 1 });
expenseSchema.index({ createdBy: 1 });

// Query middleware to exclude deleted records
expenseSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
