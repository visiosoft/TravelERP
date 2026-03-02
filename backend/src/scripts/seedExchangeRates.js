import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExchangeRate from '../models/ExchangeRate.js';
import User from '../models/User.js';

dotenv.config();

/**
 * Seed exchange rates
 */

const seedExchangeRates = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get admin user
        const admin = await User.findOne({ role: 'Admin' });

        if (!admin) {
            console.log('❌ Admin user not found. Please run seedData.js first.');
            process.exit(1);
        }

        const rates = [
            { currency: 'USD', rateAgainstPKR: 278.50, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'EUR', rateAgainstPKR: 303.20, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'GBP', rateAgainstPKR: 354.75, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'AED', rateAgainstPKR: 75.85, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'SAR', rateAgainstPKR: 74.27, effectiveDate: new Date(), createdBy: admin._id },
        ];

        for (const rateData of rates) {
            const existing = await ExchangeRate.findOne({
                currency: rateData.currency
            }).sort({ effectiveDate: -1 });

            if (!existing) {
                await ExchangeRate.create(rateData);
                console.log(`✅ Created exchange rate for ${rateData.currency}: PKR ${rateData.rateAgainstPKR}`);
            } else {
                console.log(`ℹ️  Exchange rate for ${rateData.currency} already exists (PKR ${existing.rateAgainstPKR})`);
            }
        }

        console.log('\n✅ Exchange rates seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding exchange rates:', error);
        process.exit(1);
    }
};

seedExchangeRates();
