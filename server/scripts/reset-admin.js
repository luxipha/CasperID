
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { AdminUser } = require('../src/database/models');
const { hashPassword } = require('../src/utils/admin-auth');

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        const username = 'admin';
        const password = 'password123'; // Default reset password

        let admin = await AdminUser.findOne({ username });

        const { salt, hash } = hashPassword(password);

        if (admin) {
            console.log('Found existing admin user. Updating password...');
            admin.password_hash = hash;
            admin.salt = salt;
            admin.failed_login_attempts = 0;
            admin.locked_until = null;
            await admin.save();
            console.log('✅ Admin password updated successfully!');
        } else {
            console.log('Creating new admin user...');
            admin = new AdminUser({
                username,
                password_hash: hash,
                salt,
                role: 'super_admin'
            });
            await admin.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log(`\nCredentials:`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

resetAdmin();
