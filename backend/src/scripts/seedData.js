import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

/**
 * Seed initial data for the application
 */

const seedDatabase = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Create default admin user
        const adminExists = await User.findOne({ role: ROLES.ADMIN });

        if (!adminExists) {
            await User.create({
                name: 'System Administrator',
                email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@travelagency.com',
                password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
                role: ROLES.ADMIN,
                phone: '+92-300-1234567',
            });

            console.log('✅ Default admin created');
            console.log(`   Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@travelagency.com'}`);
            console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123'}`);
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        console.log('✅ Database seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
