const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
// Load env vars from server root (one directory up)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { AdminUser } = require('../src/database/models');
const { hashPassword } = require('../src/utils/admin-auth');

async function resetPassword() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        const username = 'admin'; // Default admin username
        // You can change this if you want to target a specific user

        console.log(`🔍 Finding admin user '${username}'...`);
        const admin = await AdminUser.findOne({ username });

        if (!admin) {
            console.error(`❌ Admin user '${username}' not found!`);
            process.exit(1);
        }

        const newPassword = 'password123';
        console.log(`🔐 Resetting password to: ${newPassword}`);

        // Use the app's hashing logic
        const { salt, hash } = hashPassword(newPassword);

        admin.password_hash = hash;
        admin.salt = salt;
        admin.failed_login_attempts = 0;
        admin.locked_until = null;

        await admin.save();

        console.log('✅ Password successfully reset!');
        console.log('---------------------------------------------------');
        console.log('Username:', username);
        console.log('Password:', newPassword);
        console.log('---------------------------------------------------');
        console.log('You can now log in.');

    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetPassword();
