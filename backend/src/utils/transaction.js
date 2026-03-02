import mongoose from 'mongoose';
import { isTransactionSupported } from '../config/database.js';

/**
 * Execute code with or without transactions based on MongoDB configuration
 * @param {Function} callback - Async function that receives session parameter
 * @returns {Promise} Result from callback
 */
export const withOptionalTransaction = async (callback) => {
    const useTransactions = isTransactionSupported();

    if (!useTransactions) {
        // No transaction support - run directly without session
        return await callback(null);
    }

    // Transaction supported - use it
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await callback(session);
        await session.commitTransaction();
        return result;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Helper to add session to mongoose operations if session is provided
 * @param {Object} operation - Mongoose query or operation
 * @param {Session|null} session - Mongoose session or null
 * @returns {Object} Operation with session if provided
 */
export const withSession = (operation, session) => {
    if (session) {
        return operation.session(session);
    }
    return operation;
};
