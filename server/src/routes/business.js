const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { BusinessApp, WebhookSubscription, WebhookLog } = require('../database/models');
const { requireAuth } = require('../middleware/auth');
const { rateLimitMiddleware } = require('../utils/rate-limiter');
const { dispatchEvent, sendTestWebhook } = require('../utils/webhook-dispatcher');
const { WEBHOOK_EVENTS } = require('../constants/webhook-events');

// Salt rounds for bcrypt hashing - configurable via environment
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

// Apply general rate limiting to all business routes
router.use(rateLimitMiddleware('business_api'));

/**
 * Generate a secure, prefixed API key
 * @param {string} prefix - e.g. 'app' or 'sk'
 */
function generateKey(prefix) {
    return `${prefix}_${crypto.randomBytes(24).toString('base64url')}`;
}

// ============================================
// APP REGISTRATION & KEY MANAGEMENT
// ============================================

/**
 * Register a new business app
 * POST /api/business/apps
 * Auth: requireAuth (user must be logged in)
 * Body: { name, allowed_origins, environment }
 * Returns: { app_id, api_secret } — api_secret shown ONCE, never retrievable again
 */
router.post('/apps', requireAuth, rateLimitMiddleware('business_api_key_create'), async (req, res) => {
    try {
        const { name, allowed_origins = [], environment = 'sandbox' } = req.body;
        const userId = req.user.userId || req.user.wallet;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'App name must be at least 2 characters' });
        }

        // Limit: max 10 apps per user
        const existingCount = await BusinessApp.countDocuments({ owner_user_id: userId, active: true });
        if (existingCount >= 10) {
            return res.status(400).json({ success: false, error: 'Maximum of 10 apps allowed per account' });
        }

        const app_id = generateKey('app');
        const api_secret = generateKey('sk');
        const api_secret_hash = await bcrypt.hash(api_secret, SALT_ROUNDS);

        const newApp = new BusinessApp({
            app_id,
            name: name.trim(),
            owner_user_id: userId,
            api_secret_hash,
            allowed_origins,
            environment
        });

        await newApp.save();

        return res.status(201).json({
            success: true,
            message: 'App created. Save your api_secret now — it will not be shown again.',
            app: {
                app_id: newApp.app_id,
                name: newApp.name,
                environment: newApp.environment,
                allowed_origins: newApp.allowed_origins,
                created_at: newApp.created_at
            },
            api_secret // plaintext shown ONLY here, one time
        });
    } catch (error) {
        console.error('[Business] App creation failed:', error);
        res.status(500).json({ success: false, error: 'Failed to create app' });
    }
});

/**
 * List all apps owned by the authenticated user
 * GET /api/business/apps
 */
router.get('/apps', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;

        const apps = await BusinessApp.find({ owner_user_id: userId, active: true })
            .select('-api_secret_hash') // never expose hash
            .sort({ created_at: -1 });

        return res.json({
            success: true,
            apps
        });
    } catch (error) {
        console.error('[Business] List apps failed:', error);
        res.status(500).json({ success: false, error: 'Failed to list apps' });
    }
});

/**
 * Get a single app by app_id
 * GET /api/business/apps/:app_id
 */
router.get('/apps/:app_id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id } = req.params;

        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true })
            .select('-api_secret_hash');

        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        return res.json({ success: true, app });
    } catch (error) {
        console.error('[Business] Get app failed:', error);
        res.status(500).json({ success: false, error: 'Failed to get app' });
    }
});

/**
 * Rotate API secret for an app (old secret immediately invalidated)
 * POST /api/business/apps/:app_id/rotate-key
 */
router.post('/apps/:app_id/rotate-key', requireAuth, rateLimitMiddleware('business_api_key_create'), async (req, res) => {
    const userId = req.user.userId || req.user.wallet;
    const { app_id } = req.params;

    try {
        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        const new_secret = generateKey('sk');
        const new_hash = await bcrypt.hash(new_secret, SALT_ROUNDS);

        await BusinessApp.findOneAndUpdate(
            { app_id, owner_user_id: userId },
            { api_secret_hash: new_hash, updated_at: new Date() }
        );

        return res.json({
            success: true,
            message: 'API secret rotated. Save your new api_secret — it will not be shown again.',
            api_secret: new_secret
        });
    } catch (error) {
        console.error('[Business] Key rotation failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to rotate key' });
    }
});

/**
 * Update app settings (name, origins, environment)
 * PATCH /api/business/apps/:app_id
 */
router.patch('/apps/:app_id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id } = req.params;
        const { name, allowed_origins, environment } = req.body;

        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        if (name) app.name = name.trim();
        if (allowed_origins) app.allowed_origins = allowed_origins;
        if (environment && ['sandbox', 'production'].includes(environment)) app.environment = environment;

        await app.save();

        const updated = app.toObject();
        delete updated.api_secret_hash;

        return res.json({ success: true, app: updated });
    } catch (error) {
        console.error('[Business] Update app failed:', error);
        res.status(500).json({ success: false, error: 'Failed to update app' });
    }
});

/**
 * Deactivate (soft delete) an app
 * DELETE /api/business/apps/:app_id
 */
router.delete('/apps/:app_id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id } = req.params;

        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        app.active = false;
        await app.save();

        return res.json({ success: true, message: 'App deactivated successfully' });
    } catch (error) {
        console.error('[Business] Deactivate app failed:', error);
        res.status(500).json({ success: false, error: 'Failed to deactivate app' });
    }
});

// ============================================
// WEBHOOK MANAGEMENT
// ============================================

/**
 * Add a webhook subscription
 * POST /api/business/webhooks
 */
router.post('/webhooks', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id, url, events } = req.body;

        if (!app_id || !url || !events?.length) {
            return res.status(400).json({ success: false, error: 'app_id, url, and events are required' });
        }

        // Verify the user owns the app
        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        const signing_secret = generateKey('whsec');

        const webhook = new WebhookSubscription({
            app_id,
            url,
            events,
            signing_secret
        });
        await webhook.save();

        return res.status(201).json({
            success: true,
            webhook: {
                _id: webhook._id,
                app_id: webhook.app_id,
                url: webhook.url,
                events: webhook.events,
                signing_secret, // shown once for client to save
                created_at: webhook.created_at
            }
        });
    } catch (error) {
        console.error('[Business] Webhook create failed:', error);
        res.status(500).json({ success: false, error: 'Failed to create webhook' });
    }
});

/**
 * List webhooks for an app
 * GET /api/business/webhooks?app_id=app_xxx
 */
router.get('/webhooks', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id } = req.query;

        if (!app_id) {
            return res.status(400).json({ success: false, error: 'app_id query param required' });
        }

        // Verify ownership
        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        const webhooks = await WebhookSubscription.find({ app_id, active: true })
            .select('-signing_secret') // don't re-expose after creation
            .sort({ created_at: -1 });

        return res.json({ success: true, webhooks });
    } catch (error) {
        console.error('[Business] List webhooks failed:', error);
        res.status(500).json({ success: false, error: 'Failed to list webhooks' });
    }
});

/**
 * Delete a webhook subscription
 * DELETE /api/business/webhooks/:webhook_id
 */
router.delete('/webhooks/:webhook_id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { webhook_id } = req.params;

        const webhook = await WebhookSubscription.findById(webhook_id);
        if (!webhook) {
            return res.status(404).json({ success: false, error: 'Webhook not found' });
        }

        // Verify the user owns the associated app
        const app = await BusinessApp.findOne({ app_id: webhook.app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        webhook.active = false;
        await webhook.save();

        return res.json({ success: true, message: 'Webhook removed' });
    } catch (error) {
        console.error('[Business] Delete webhook failed:', error);
        res.status(500).json({ success: false, error: 'Failed to delete webhook' });
    }
});

/**
 * Trigger a test event for a specific webhook
 * POST /api/business/webhooks/:webhook_id/test
 */
router.post('/webhooks/:webhook_id/test', requireAuth, rateLimitMiddleware('business_webhook_test'), async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { webhook_id } = req.params;

        const webhook = await WebhookSubscription.findById(webhook_id);
        if (!webhook) {
            return res.status(404).json({ success: false, error: 'Webhook not found' });
        }

        // Verify ownership
        const app = await BusinessApp.findOne({ app_id: webhook.app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        // Create test payload
        const testPayload = {
            id: 'evt_test_' + crypto.randomBytes(8).toString('hex'),
            object: 'event',
            type: WEBHOOK_EVENTS.TEST_PING,
            created: Math.floor(Date.now() / 1000),
            data: {
                message: 'This is a test webhook from CasperID',
                app_id: webhook.app_id
            }
        };

        // Use the shared sendTestWebhook function (logs the delivery)
        const result = await sendTestWebhook(webhook, testPayload);

        res.json({
            success: result.success,
            message: result.success ? 'Test webhook delivered successfully' : 'Test webhook delivery failed',
            payload: testPayload,
            delivery: {
                id: result.delivery_id,
                status_code: result.status_code,
                duration_ms: result.duration_ms,
                error: result.error
            }
        });

    } catch (error) {
        console.error('[Business] Test webhook failed:', error);
        res.status(500).json({ success: false, error: 'Failed to trigger test webhook' });
    }
});

/**
 * Get webhook delivery logs
 * GET /api/business/webhooks/:webhook_id/logs
 */
router.get('/webhooks/:webhook_id/logs', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { webhook_id } = req.params;
        const { limit = 50, offset = 0, status } = req.query;

        const webhook = await WebhookSubscription.findById(webhook_id);
        if (!webhook) {
            return res.status(404).json({ success: false, error: 'Webhook not found' });
        }

        // Verify ownership
        const app = await BusinessApp.findOne({ app_id: webhook.app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        // Build query
        const query = { webhook_id: webhook._id };
        if (status && ['success', 'failed', 'pending'].includes(status)) {
            query.status = status;
        }

        // Get logs with pagination
        const [logs, total] = await Promise.all([
            WebhookLog.find(query)
                .sort({ created_at: -1 })
                .skip(parseInt(offset))
                .limit(Math.min(parseInt(limit), 100))
                .select('-request_payload') // Exclude payload for list view
                .lean(),
            WebhookLog.countDocuments(query)
        ]);

        // Get stats
        const stats = await WebhookLog.aggregate([
            { $match: { webhook_id: webhook._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avg_duration: { $avg: '$duration_ms' }
                }
            }
        ]);

        const statsMap = stats.reduce((acc, s) => {
            acc[s._id] = { count: s.count, avg_duration: Math.round(s.avg_duration || 0) };
            return acc;
        }, {});

        res.json({
            success: true,
            logs,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: parseInt(offset) + logs.length < total
            },
            stats: {
                success: statsMap.success || { count: 0, avg_duration: 0 },
                failed: statsMap.failed || { count: 0, avg_duration: 0 },
                total: total
            }
        });

    } catch (error) {
        console.error('[Business] Get webhook logs failed:', error);
        res.status(500).json({ success: false, error: 'Failed to get webhook logs' });
    }
});

/**
 * Get single webhook log detail
 * GET /api/business/webhooks/logs/:log_id
 */
router.get('/webhooks/logs/:log_id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { log_id } = req.params;

        const log = await WebhookLog.findById(log_id);
        if (!log) {
            return res.status(404).json({ success: false, error: 'Log not found' });
        }

        // Verify ownership through webhook -> app chain
        const webhook = await WebhookSubscription.findById(log.webhook_id);
        if (!webhook) {
            return res.status(404).json({ success: false, error: 'Webhook not found' });
        }

        const app = await BusinessApp.findOne({ app_id: webhook.app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        res.json({ success: true, log });

    } catch (error) {
        console.error('[Business] Get webhook log detail failed:', error);
        res.status(500).json({ success: false, error: 'Failed to get log detail' });
    }
});

// ============================================
// APP CREDENTIAL VERIFICATION MIDDLEWARE (exported for other routes)
// ============================================

/**
 * Verify X-App-ID + X-Api-Secret headers
 * Used by passkey routes to scope tokens to a business app
 */
async function verifyAppCredentials(app_id, api_secret) {
    if (!app_id || !api_secret) return null;

    const app = await BusinessApp.findOne({ app_id, active: true });
    if (!app) return null;

    const isValid = await bcrypt.compare(api_secret, app.api_secret_hash);
    if (!isValid) return null;

    // Update last used timestamp (fire-and-forget)
    BusinessApp.updateOne({ app_id }, { last_used_at: new Date(), $inc: { request_count: 1 } }).exec();

    return app;
}

// GET /api/business/apps/:app_id/sdk-config - Load SDK theme config for an app
router.get('/apps/:app_id/sdk-config', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id } = req.params;

        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true })
            .select('app_id name sdk_config');

        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        return res.json({ success: true, sdk_config: app.sdk_config || {} });
    } catch (error) {
        console.error('[Business] Get SDK config failed:', error);
        res.status(500).json({ success: false, error: 'Failed to get SDK config' });
    }
});

// PATCH /api/business/apps/:app_id/sdk-config - Save SDK theme config from Design Studio
router.patch('/apps/:app_id/sdk-config', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id } = req.params;
        const { primary_color, border_radius, font_family, logo_url, mode, language } = req.body;

        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        if (!app.sdk_config) app.sdk_config = {};
        if (primary_color !== undefined) app.sdk_config.primary_color = primary_color;
        if (border_radius !== undefined) app.sdk_config.border_radius = border_radius;
        if (font_family !== undefined) app.sdk_config.font_family = font_family;
        if (logo_url !== undefined) app.sdk_config.logo_url = logo_url;
        if (mode !== undefined) app.sdk_config.mode = mode;
        if (language !== undefined) app.sdk_config.language = language;
        app.sdk_config.updated_at = new Date();

        app.markModified('sdk_config');
        await app.save();

        return res.json({ success: true, sdk_config: app.sdk_config });
    } catch (error) {
        console.error('[Business] Update SDK config failed:', error);
        res.status(500).json({ success: false, error: 'Failed to update SDK config' });
    }
});

// GET /api/business/stats - Get aggregated usage stats
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const apps = await BusinessApp.find({ owner_user_id: req.user.userId });

        let totalRequests = 0;
        let activeApps = 0;

        apps.forEach(app => {
            totalRequests += (app.request_count || 0);
            if (app.active) activeApps++;
        });

        // specific app stats for charts (top 5 by usage)
        const topApps = apps
            .sort((a, b) => (b.request_count || 0) - (a.request_count || 0))
            .slice(0, 5)
            .map(app => ({
                name: app.name,
                value: app.request_count || 0
            }));

        res.json({
            success: true,
            stats: {
                total_requests: totalRequests,
                active_apps: activeApps,
                top_apps: topApps,
                total_apps: apps.length
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to load stats' });
    }
});

module.exports = router;
module.exports.verifyAppCredentials = verifyAppCredentials;
