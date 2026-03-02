import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let supportsTransactions = false;

const connectDatabase = async () => {
    try {
        const options = {
            // Use new URL parser
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Automatically build indexes
            autoIndex: true,
            // Server selection timeout
            serverSelectionTimeoutMS: 5000,
            // Socket timeout
            socketTimeoutMS: 45000,
            // Max pool size
            maxPoolSize: 10,
            minPoolSize: 2,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);

        // Check if replica set is configured (required for transactions)
        try {
            const admin = mongoose.connection.db.admin();
            const serverStatus = await admin.serverStatus();
            supportsTransactions = serverStatus.repl && serverStatus.repl.setName;

            if (supportsTransactions) {
                console.log('💹 Transactions: Enabled (Replica Set)');
            } else {
                console.log('⚠️  Transactions: Disabled (Standalone MongoDB)');
                console.log('   → For transactions, configure MongoDB as replica set');
            }
        } catch (err) {
            console.log('⚠️  Transactions: Disabled (Could not detect replica set)');
            supportsTransactions = false;
        }

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

export const isTransactionSupported = () => supportsTransactions;

export default connectDatabase;
