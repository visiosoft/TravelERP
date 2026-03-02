import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import ExchangeRate from '../models/ExchangeRate.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

/**
 * Complete database setup - Admin + Exchange Rates
 */

const setupDatabase = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n✅ Connected to MongoDB\n');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('   TRAVEL AGENCY ERP - DATABASE SETUP');
        console.log('═══════════════════════════════════════════════════════════\n');

        // 1. Create default admin user
        console.log('1️⃣ Creating Admin User...');
        const adminExists = await User.findOne({ role: ROLES.ADMIN });

        if (!adminExists) {
            await User.create({
                name: 'System Administrator',
                email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@travelagency.com',
                password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
                role: ROLES.ADMIN,
                phone: '+92-300-1234567',
            });

            console.log('   ✅ Admin user created');
            console.log(`   📧 Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@travelagency.com'}`);
            console.log(`   🔑 Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123'}\n`);
        } else {
            console.log('   ℹ️  Admin user already exists\n');
        }

        // 2. Create exchange rates
        console.log('2️⃣ Creating Exchange Rates...');
        const admin = await User.findOne({ role: ROLES.ADMIN });

        const rates = [
            { currency: 'USD', rateAgainstPKR: 278.50, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'EUR', rateAgainstPKR: 303.20, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'GBP', rateAgainstPKR: 354.75, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'AED', rateAgainstPKR: 75.85, effectiveDate: new Date(), createdBy: admin._id },
            { currency: 'SAR', rateAgainstPKR: 74.27, effectiveDate: new Date(), createdBy: admin._id },
        ];

        let created = 0;
        for (const rateData of rates) {
            const existing = await ExchangeRate.findOne({
                currency: rateData.currency
            }).sort({ effectiveDate: -1 });

            if (!existing) {
                await ExchangeRate.create(rateData);
                console.log(`   ✅ ${rateData.currency}: PKR ${rateData.rateAgainstPKR}`);
                created++;
            } else {
                console.log(`   ℹ️  ${rateData.currency}: PKR ${existing.rateAgainstPKR} (already exists)`);
            }
        }

        if (created > 0) {
            console.log(`\n   ✅ Created ${created} exchange rates\n`);
        } else {
            console.log('   ℹ️  All exchange rates already exist\n');
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ DATABASE SETUP COMPLETED!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('🚀 Next Steps:');
        console.log('   1. Start backend: cd backend && node src/server.js');
        console.log('   2. Start frontend: cd frontend && npm run dev');
        console.log('   3. Login at: http://localhost:5173');
        console.log('   4. Use credentials above to login\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
};

setupDatabase();
