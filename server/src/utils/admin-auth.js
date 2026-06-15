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
    const storedHash = Buffer.from(hash, 'hex');
    const candidateHash = Buffer.from(hashVerify, 'hex');

    return storedHash.length === candidateHash.length &&
        crypto.timingSafeEqual(storedHash, candidateHash);
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
 * Set or reset an admin password without requiring the current password.
 * Intended for trusted bootstrap and local recovery tooling only.
 */
async function resetAdminPassword(username, newPassword, role = 'super_admin') {
    const { salt, hash } = hashPassword(newPassword);
    const admin = await AdminUser.findOne({ username });

    if (!admin) {
        return createAdminUser(username, newPassword, role);
    }

    admin.password_hash = hash;
    admin.salt = salt;
    admin.active = true;
    admin.failed_login_attempts = 0;
    admin.locked_until = null;
    admin.updated_at = new Date();
    await admin.save();

    const { password_hash, salt: userSalt, ...safeUser } = admin.toObject();
    return safeUser;
}

/**
 * Initialize default admin user if none exists
 *
 * SECURITY: The default password is written to a secure file, NOT logged to console.
 * This prevents password exposure in container logs, Docker history, or CI/CD output.
 */
async function initializeDefaultAdmin() {
    const fs = require('fs');
    const path = require('path');

    try {
        // Check if any admin exists
        const adminCount = await AdminUser.countDocuments();

        if (adminCount === 0) {
            console.log('🔧 Creating default admin user...');

            const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
            const configuredPassword = process.env.ADMIN_PASSWORD;
            const defaultPassword = configuredPassword || crypto.randomBytes(16).toString('hex');

            await createAdminUser(defaultUsername, defaultPassword, 'super_admin');

            if (!configuredPassword) {
                // Write generated credentials to a secure file instead of logging them.
                const credentialsPath = path.join(__dirname, '../../.admin-credentials');
                const credentialsContent = `# CasperID Default Admin Credentials
# Generated: ${new Date().toISOString()}
#
# IMPORTANT: Delete this file after retrieving the password!
# Change this password immediately after first login.
#
Username: ${defaultUsername}
Password: ${defaultPassword}
`;

                fs.writeFileSync(credentialsPath, credentialsContent, { mode: 0o600 });
                console.log('🔐 Admin credentials saved to: .admin-credentials');
            } else {
                console.log('🔐 Default admin created from ADMIN_USERNAME and ADMIN_PASSWORD');
            }

            console.log('✅ Default admin created successfully!');
            console.log('🔒 Please login and change this password immediately!');
        } else {
            console.log(`✅ Admin system ready (${adminCount} account${adminCount === 1 ? '' : 's'} found)`);
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
    resetAdminPassword,
    initializeDefaultAdmin
};
