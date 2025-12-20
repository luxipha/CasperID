/**
 * Admin authentication utilities
 * Handles secure admin login, password hashing, and session management
 */

const crypto = require('crypto');
const { AdminUser } = require('../database/models');

/**
 * Hash a password with salt
 * @param {string} password - Plain text password
 * @returns {Object} Object containing salt and hash
 */
function hashPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
        salt,
        hash
    };
}

/**
 * Verify a password against stored hash
 * @param {string} password - Plain text password
 * @param {string} salt - Stored salt
 * @param {string} hash - Stored hash
 * @returns {boolean} Whether password is valid
 */
function verifyPassword(password, salt, hash) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

/**
 * Create a new admin user
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @param {string} role - Admin role (admin|super_admin)
 * @returns {Promise<Object>} Created admin user
 */
async function createAdminUser(username, password, role = 'admin') {
    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ username });
    if (existingAdmin) {
        throw new Error('Admin user already exists');
    }

    // Hash password
    const { salt, hash } = hashPassword(password);

    // Create admin user
    const adminUser = new AdminUser({
        username,
        password_hash: hash,
        salt,
        role
    });

    await adminUser.save();
    
    // Return user without sensitive data
    const { password_hash, salt: userSalt, ...safeUser } = adminUser.toObject();
    return safeUser;
}

/**
 * Authenticate an admin user
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<Object|null>} Admin user if authenticated, null otherwise
 */
async function authenticateAdmin(username, password) {
    // Find admin user
    const admin = await AdminUser.findOne({ username, active: true });
    if (!admin) {
        return null;
    }

    // Check if account is locked
    if (admin.locked_until && admin.locked_until > new Date()) {
        throw new Error('Account is temporarily locked due to failed login attempts');
    }

    // Verify password
    const isValidPassword = verifyPassword(password, admin.salt, admin.password_hash);
    
    if (!isValidPassword) {
        // Increment failed attempts
        admin.failed_login_attempts += 1;
        
        // Lock account after 5 failed attempts for 15 minutes
        if (admin.failed_login_attempts >= 5) {
            admin.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }
        
        await admin.save();
        return null;
    }

    // Successful login - reset failed attempts
    admin.failed_login_attempts = 0;
    admin.locked_until = null;
    admin.last_login = new Date();
    await admin.save();

    // Return user without sensitive data
    const { password_hash, salt, ...safeUser } = admin.toObject();
    return safeUser;
}

/**
 * Change admin password
 * @param {string} username - Admin username
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
async function changeAdminPassword(username, currentPassword, newPassword) {
    const admin = await AdminUser.findOne({ username, active: true });
    if (!admin) {
        throw new Error('Admin user not found');
    }

    // Verify current password
    const isValidPassword = verifyPassword(currentPassword, admin.salt, admin.password_hash);
    if (!isValidPassword) {
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const { salt, hash } = hashPassword(newPassword);
    
    // Update password
    admin.password_hash = hash;
    admin.salt = salt;
    admin.updated_at = new Date();
    
    await admin.save();
    return true;
}

/**
 * Initialize default admin user if none exists
 */
async function initializeDefaultAdmin() {
    try {
        // Check if any admin exists
        const adminCount = await AdminUser.countDocuments();
        
        if (adminCount === 0) {
            console.log('🔧 Creating default admin user...');
            
            // Generate a secure random password for initial setup
            const defaultPassword = crypto.randomBytes(16).toString('hex');
            
            await createAdminUser('admin', defaultPassword, 'super_admin');
            
            console.log('✅ Default admin created successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🚨 IMPORTANT: Default admin credentials:');
            console.log(`   Username: admin`);
            console.log(`   Password: ${defaultPassword}`);
            console.log('🔒 Please login and change this password immediately!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    } catch (error) {
        console.error('Failed to initialize default admin:', error);
    }
}

module.exports = {
    hashPassword,
    verifyPassword,
    createAdminUser,
    authenticateAdmin,
    changeAdminPassword,
    initializeDefaultAdmin
};