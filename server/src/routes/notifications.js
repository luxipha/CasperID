const express = require('express');
const router = express.Router();
const { Notification, ViewEvent, UserAccount } = require('../database/models');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/notifications
 * Fetch unread notifications for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const wallet = req.user.wallet;

        const notifications = await Notification.find({
            recipientWallet: wallet,
            read: false
        }).sort({ createdAt: -1 }).limit(50);

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

/**
 * GET /api/notifications/preferences
 * Fetch notification preferences
 */
router.get('/preferences', requireAuth, async (req, res) => {
    try {
        const userAccount = await UserAccount.findOne({ wallet: req.user.wallet });

        if (!userAccount) {
            return res.status(404).json({ error: 'User account not found' });
        }

        res.json({
            success: true,
            preferences: userAccount.notification_preferences || {
                security_alerts: true,
                kyc_updates: true,
                marketing_news: false
            }
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

/**
 * PATCH /api/notifications/preferences
 * Update notification preferences
 */
router.patch('/preferences', requireAuth, async (req, res) => {
    try {
        const updates = req.body;

        // Validate allowed fields
        const allowedFields = ['security_alerts', 'kyc_updates', 'marketing_news'];
        const sanitizedUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                sanitizedUpdates[`notification_preferences.${key}`] = updates[key];
            }
        });

        if (Object.keys(sanitizedUpdates).length === 0) {
            return res.status(400).json({ error: 'No valid preferences provided' });
        }

        const userAccount = await UserAccount.findOneAndUpdate(
            { wallet: req.user.wallet },
            { $set: sanitizedUpdates },
            { new: true }
        );

        res.json({
            success: true,
            preferences: userAccount.notification_preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post('/:id/read', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const wallet = req.user.wallet;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipientWallet: wallet },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

/**
 * GET /api/notifications/access-logs
 * Fetch view events (who viewed my profile)
 */
router.get('/access-logs', requireAuth, async (req, res) => {
    try {
        const wallet = req.user.wallet;

        const logs = await ViewEvent.find({
            ownerWallet: wallet
        }).sort({ timestamp: -1 }).limit(100);

        res.json({
            success: true,
            logs
        });
    } catch (error) {
        console.error('Get access logs error:', error);
        res.status(500).json({ error: 'Failed to fetch access logs' });
    }
});

module.exports = router;
