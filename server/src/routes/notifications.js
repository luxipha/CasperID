const express = require('express');
const router = express.Router();
const { Notification, ViewEvent } = require('../database/models');
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
