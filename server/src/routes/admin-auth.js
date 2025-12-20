/**
 * Admin authentication routes
 * Handles admin login, logout, and password management
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticateAdmin, changeAdminPassword, createAdminUser } = require('../utils/admin-auth');
const { adminLoginRateLimit, adminAuth } = require('../middleware/auth');
const { getCurrentSecret, forceRotation, getRotationStatus } = require('../utils/jwt-rotation-db');

/**
 * POST /api/admin/login
 * Admin login endpoint
 */
router.post('/login', adminLoginRateLimit, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Username and password are required' 
            });
        }

        // Authenticate admin
        const admin = await authenticateAdmin(username, password);
        
        if (!admin) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Create JWT token with current secret
        const token = jwt.sign(
            {
                adminId: admin._id,
                username: admin.username,
                role: admin.role,
                isAdmin: true
            },
            getCurrentSecret(),
            { expiresIn: '8h' } // Admin sessions expire in 8 hours
        );

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                lastLogin: admin.last_login
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        
        if (error.message.includes('locked')) {
            return res.status(423).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/admin/change-password
 * Change admin password
 */
router.post('/change-password', adminAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'New password must be at least 8 characters long'
            });
        }

        // Change password
        await changeAdminPassword(req.admin.username, currentPassword, newPassword);

        res.json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        
        if (error.message.includes('incorrect')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to change password' });
    }
});

/**
 * POST /api/admin/create-user
 * Create new admin user (super_admin only)
 */
router.post('/create-user', adminAuth, async (req, res) => {
    try {
        // Only super_admin can create new admin users
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                error: 'Only super admins can create new admin users'
            });
        }

        const { username, password, role = 'admin' } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }

        if (!['admin', 'super_admin'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role. Must be admin or super_admin'
            });
        }

        // Create admin user
        const newAdmin = await createAdminUser(username, password, role);

        res.status(201).json({
            message: 'Admin user created successfully',
            admin: newAdmin
        });

    } catch (error) {
        console.error('Create admin error:', error);
        
        if (error.message.includes('already exists')) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to create admin user' });
    }
});

/**
 * GET /api/admin/profile
 * Get current admin profile
 */
router.get('/profile', adminAuth, async (req, res) => {
    try {
        res.json({
            admin: {
                id: req.admin.id,
                username: req.admin.username,
                role: req.admin.role
            }
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

/**
 * POST /api/admin/logout
 * Admin logout (placeholder for token invalidation if needed)
 */
router.post('/logout', adminAuth, async (req, res) => {
    try {
        // In a more sophisticated system, we could blacklist the JWT token
        // For now, we just confirm the logout
        res.json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

/**
 * POST /api/admin/rotate-jwt-secret
 * Force JWT secret rotation (super_admin only)
 */
router.post('/rotate-jwt-secret', adminAuth, async (req, res) => {
    try {
        // Only super_admin can rotate JWT secrets
        if (req.admin.role !== 'super_admin') {
            return res.status(403).json({
                error: 'Only super admins can rotate JWT secrets'
            });
        }

        const result = forceRotation();
        
        res.json({
            message: 'JWT secret rotated successfully',
            rotationTime: result.rotationTime,
            gracePeriodHours: result.gracePeriodHours
        });

    } catch (error) {
        console.error('JWT rotation error:', error);
        res.status(500).json({ error: 'Failed to rotate JWT secret' });
    }
});

/**
 * GET /api/admin/jwt-status
 * Get JWT rotation status
 */
router.get('/jwt-status', adminAuth, async (req, res) => {
    try {
        const status = getRotationStatus();
        
        res.json({
            rotationStatus: status,
            currentTime: new Date()
        });

    } catch (error) {
        console.error('JWT status error:', error);
        res.status(500).json({ error: 'Failed to get JWT status' });
    }
});

module.exports = router;