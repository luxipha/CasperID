const { ViewEvent, Notification, UserProfile } = require('../database/models');

/**
 * Log a view event and trigger privacy notifications
 * @param {string} viewerWallet - Wallet of the viewer (or 'anonymous')
 * @param {string} ownerWallet - Wallet of the profile owner
 * @param {string} endpoint - The endpoint accessed
 * @param {Array<string>} accessedFields - List of sensitive fields returned
 * @param {Object} req - Express request object for IP/UserAgent
 */
const logViewEvent = async (viewerWallet, ownerWallet, endpoint, accessedFields = [], req) => {
    try {
        // Don't log self-views
        if (viewerWallet === ownerWallet) return;

        // 1. Create View Event
        const viewEvent = new ViewEvent({
            viewerWallet: viewerWallet || 'anonymous',
            ownerWallet,
            endpoint,
            accessedFields,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
        await viewEvent.save();

        // 2. Check Owner's Privacy Settings
        const profile = await UserProfile.findOne({ wallet: ownerWallet });
        const alertOnView = profile?.privacySettings?.alertOnView ?? true; // Default to true

        // 3. Create Notification if enabled
        if (alertOnView) {
            const message = viewerWallet
                ? `Wallet ${viewerWallet.substring(0, 6)}... viewed your profile.`
                : `Anonymous user viewed your profile.`;

            const notification = new Notification({
                recipientWallet: ownerWallet,
                type: 'view_alert',
                message,
                metadata: {
                    viewEventId: viewEvent._id,
                    endpoint,
                    viewer: viewerWallet || 'anonymous'
                }
            });
            await notification.save();
        }

    } catch (error) {
        console.error('[ViewLogger] Error logging view:', error);
        // Don't block the response flow for logging errors
    }
};

module.exports = { logViewEvent };
