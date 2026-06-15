const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { BusinessApp, WebhookSubscription, WebhookLog, VerificationRequestV2, Notification } = require('../database/models');
const { requireAuth } = require('../middleware/auth');
const { rateLimitMiddleware } = require('../utils/rate-limiter');
const { dispatchEvent, sendTestWebhook } = require('../utils/webhook-dispatcher');
const { WEBHOOK_EVENTS } = require('../constants/webhook-events');
const multer = require('multer');
const path = require('path');
const imagekit = require('../services/imagekit');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|svg|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images (JPG, PNG, SVG, WebP) are allowed'));
    }
});

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

function normalizeRedirectUris(value) {
    const values = typeof value === 'string' ? value.split(',') : value;
    if (!Array.isArray(values)) {
        const error = new Error('redirect_uris must be an array or comma-separated string');
        error.status = 400;
        throw error;
    }

    return [...new Set(values.map(uri => uri.trim()).filter(Boolean).map(uri => {
        let parsed;
        try {
            parsed = new URL(uri);
        } catch {
            const error = new Error('Redirect URIs must be valid absolute URLs');
            error.status = 400;
            throw error;
        }
        const isLocalhost = parsed.hostname === 'localhost' && parsed.protocol === 'http:';
        if (parsed.protocol !== 'https:' && !isLocalhost) {
            const error = new Error('Redirect URIs must use HTTPS, except localhost development URLs');
            error.status = 400;
            throw error;
        }
        return parsed.toString();
    }))];
}

async function createBusinessNotification(ownerUserId, type, title, message, metadata = {}) {
    try {
        await Notification.create({
            user_id: ownerUserId,
            type,
            title,
            message,
            metadata,
            data: {
                scope: 'business',
                ...metadata,
            },
            read: false,
        });
    } catch (error) {
        console.error('[Business] Failed to create notification:', error.message);
    }
}

function mapBusinessNotification(notification) {
    return {
        id: notification._id,
        type: notification.type,
        title: notification.title || 'Business update',
        message: notification.message,
        read: !!notification.read,
        createdAt: notification.createdAt || notification.created_at,
        metadata: notification.metadata || {},
    };
}

// ============================================
// BUSINESS NOTIFICATIONS
// ============================================

router.get('/notifications', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const notifications = await Notification.find({
            user_id: userId,
            'data.scope': 'business',
        }).sort({ createdAt: -1 }).limit(50).lean();

        return res.json({
            success: true,
            notifications: notifications.map(mapBusinessNotification),
            unread_count: notifications.filter(notification => !notification.read).length,
        });
    } catch (error) {
        console.error('[Business] Get notifications failed:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch business notifications' });
    }
});

router.post('/notifications/:id/read', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user_id: userId, 'data.scope': 'business' },
            { $set: { read: true } },
            { new: true }
        ).lean();

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        return res.json({ success: true, notification: mapBusinessNotification(notification) });
    } catch (error) {
        console.error('[Business] Mark notification read failed:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
});

router.post('/notifications/read-all', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const result = await Notification.updateMany(
            { user_id: userId, 'data.scope': 'business', read: false },
            { $set: { read: true } }
        );

        return res.json({ success: true, updated_count: result.modifiedCount || 0 });
    } catch (error) {
        console.error('[Business] Mark all notifications read failed:', error);
        res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
    }
});

// ============================================
// APP REGISTRATION & KEY MANAGEMENT
// ============================================

/**
 * Register a new business app
 * POST /api/business/apps
 * Auth: requireAuth (user must be logged in)
 * Body: { name, allowed_origins, redirect_uris, environment }
 * Returns: { app_id, api_secret } — api_secret shown ONCE, never retrievable again
 */
router.post('/apps', requireAuth, rateLimitMiddleware('business_api_key_create'), async (req, res) => {
    try {
        let {
            name,
            allowed_origins = [],
            redirect_uris = [],
            environment = 'sandbox',
            website_url = '',
            description = ''
        } = req.body;
        const userId = req.user.userId || req.user.wallet;

        // Handle comma-separated string from dashboard
        if (typeof allowed_origins === 'string') {
            allowed_origins = allowed_origins.split(',').map(o => o.trim()).filter(Boolean);
        }
        redirect_uris = normalizeRedirectUris(redirect_uris);

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
            redirect_uris,
            environment,
            website_url: (website_url || '').trim(),
            description: (description || '').trim().slice(0, 300)
        });

        await newApp.save();
        await createBusinessNotification(
            userId,
            'business_app_created',
            'Application created',
            `"${newApp.name}" is ready. Save the API secret now because it will not be shown again.`,
            { app_id: newApp.app_id, app_name: newApp.name, environment: newApp.environment }
        );

        if (!res.headersSent) {
            return res.status(201).json({
                success: true,
                message: 'App created. Save your api_secret now — it will not be shown again.',
                app: {
                    app_id: newApp.app_id,
                    name: newApp.name,
                    environment: newApp.environment,
                    allowed_origins: newApp.allowed_origins,
                    redirect_uris: newApp.redirect_uris,
                    created_at: newApp.created_at
                },
                api_secret // plaintext shown ONLY here, one time
            });
        }
    } catch (error) {
        console.error('[Business] App creation failed:', error);
        if (!res.headersSent) {
            res.status(error.status || 500).json({
                success: false,
                error: error.status ? error.message : 'Failed to create app'
            });
        }
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
        await createBusinessNotification(
            userId,
            'business_secret_rotated',
            'API secret rotated',
            `The API secret for "${app.name}" was rotated successfully.`,
            { app_id: app.app_id, app_name: app.name }
        );

        if (!res.headersSent) {
            return res.json({
                success: true,
                message: 'API secret rotated. Save your new api_secret — it will not be shown again.',
                api_secret: new_secret
            });
        }
    } catch (error) {
        console.error('[Business] Key rotation failed:', error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: 'Failed to rotate key' });
        }
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
        const {
            name,
            allowed_origins,
            redirect_uris,
            android_digital_assets,
            environment,
            website_url,
            description,
            listing_status,
            sdk_config
        } = req.body;

        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        if (name) app.name = name.trim();
        if (allowed_origins !== undefined) {
            // Handle comma-separated string from dashboard
            if (typeof allowed_origins === 'string') {
                app.allowed_origins = allowed_origins.split(',').map(o => o.trim()).filter(Boolean);
            } else {
                app.allowed_origins = allowed_origins;
            }
            app.markModified('allowed_origins');
        }
        if (redirect_uris !== undefined) {
            app.redirect_uris = normalizeRedirectUris(redirect_uris);
            app.markModified('redirect_uris');
        }
        if (android_digital_assets !== undefined) {
            // Validate and sanitize Android Digital Asset Links
            if (Array.isArray(android_digital_assets)) {
                app.android_digital_assets = android_digital_assets.map(asset => ({
                    package_name: asset.package_name?.trim(),
                    sha256_fingerprints: Array.isArray(asset.sha256_fingerprints)
                        ? asset.sha256_fingerprints.map(fp => fp.trim().toUpperCase()).filter(Boolean)
                        : [],
                    created_at: asset.created_at || new Date()
                })).filter(asset => asset.package_name);
            } else {
                app.android_digital_assets = [];
            }
            app.markModified('android_digital_assets');
        }
        if (environment && ['sandbox', 'production'].includes(environment)) app.environment = environment;
        if (website_url !== undefined) app.website_url = website_url.trim();
        if (description !== undefined) app.description = description.trim().slice(0, 300);
        if (listing_status && ['unlisted', 'listed'].includes(listing_status)) app.listing_status = listing_status;

        // Handle SDK config updates (Tier and Proofs)
        if (sdk_config) {
            // Ensure sdk_config exists
            if (!app.sdk_config) {
                app.sdk_config = {
                    primary_color: '#8651e1',
                    border_radius: '12',
                    font_family: 'Inter',
                    mode: 'light',
                    layout: 'auto',
                    platform: 'desktop',
                    language: 'EN'
                };
            }
            
            if (sdk_config.requiredTier !== undefined) {
                app.sdk_config.requiredTier = sdk_config.requiredTier;
            }
            
            if (sdk_config.proofs !== undefined) {
                app.sdk_config.proofs = sdk_config.proofs;
            }
            
            app.markModified('sdk_config');
        }

        await app.save();
        await createBusinessNotification(
            userId,
            'business_app_updated',
            'Application updated',
            `Settings for "${app.name}" were updated.`,
            { app_id: app.app_id, app_name: app.name }
        );

        const updated = app.toObject();
        delete updated.api_secret_hash;

        return res.json({ success: true, app: updated });
    } catch (error) {
        console.error('[Business] Update app failed:', error);
        res.status(error.status || 500).json({
            success: false,
            error: error.status ? error.message : 'Failed to update app'
        });
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
        await createBusinessNotification(
            userId,
            'business_app_deleted',
            'Application deactivated',
            `"${app.name}" was deactivated.`,
            { app_id: app.app_id, app_name: app.name }
        );

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
        await createBusinessNotification(
            userId,
            'business_webhook_created',
            'Webhook added',
            `A webhook was added for "${app.name}".`,
            { app_id: app.app_id, app_name: app.name, webhook_id: webhook._id, url: webhook.url }
        );

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
        await createBusinessNotification(
            userId,
            'business_webhook_deleted',
            'Webhook removed',
            `A webhook was removed from "${app.name}".`,
            { app_id: app.app_id, app_name: app.name, webhook_id: webhook._id, url: webhook.url }
        );

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
        await createBusinessNotification(
            userId,
            result.success ? 'business_webhook_test_success' : 'business_webhook_test_failed',
            result.success ? 'Webhook test delivered' : 'Webhook test failed',
            result.success
                ? `Test delivery to ${webhook.url} succeeded for "${app.name}".`
                : `Test delivery to ${webhook.url} failed for "${app.name}".`,
            {
                app_id: app.app_id,
                app_name: app.name,
                webhook_id: webhook._id,
                url: webhook.url,
                status_code: result.status_code,
                delivery_id: result.delivery_id,
                error: result.error,
            }
        );

        if (!res.headersSent) {
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
        }

    } catch (error) {
        console.error('[Business] Test webhook failed:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Failed to trigger test webhook' });
        }
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

// POST /api/business/apps/:app_id/logo - Upload and set app logo
router.post('/apps/:app_id/logo', requireAuth, upload.single('logo'), async (req, res) => {
    try {
        const userId = req.user.userId || req.user.wallet;
        const { app_id } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No logo file provided' });
        }

        const app = await BusinessApp.findOne({ app_id, owner_user_id: userId, active: true });
        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        // Upload to ImageKit
        const uploadResponse = await imagekit.files.upload({
            file: req.file.buffer.toString('base64'),
            fileName: `logo_${app_id}_${Date.now()}${path.extname(req.file.originalname)}`,
            folder: `/business/logos/${app_id}`,
            useUniqueFileName: true
        });

        // Update app config
        if (!app.sdk_config) app.sdk_config = {};
        app.sdk_config.logo_url = uploadResponse.url;
        app.sdk_config.updated_at = new Date();
        
        app.markModified('sdk_config');
        await app.save();

        return res.json({ 
            success: true, 
            logo_url: uploadResponse.url,
            sdk_config: app.sdk_config 
        });
    } catch (error) {
        console.error('[Business] Logo upload failed:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to upload logo' });
    }
});

// GET /api/business/stats - Get aggregated usage stats
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const apps = await BusinessApp.find({ owner_user_id: req.user.userId, active: true })
            .select('app_id name active request_count');
        const appIds = apps.map(app => app.app_id);
        const appNameMap = new Map(apps.map(app => [app.app_id, app.name]));

        let totalRequests = 0;
        let activeApps = 0;

        apps.forEach(app => {
            totalRequests += (app.request_count || 0);
            if (app.active) activeApps++;
        });

        // Verification aggregation for heatmap (last 180 days)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

        const [activityData, verificationTotals, recentActivity] = await Promise.all([
            VerificationRequestV2.aggregate([
                {
                    $match: {
                        dapp_id: { $in: appIds },
                        created_at: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),
            VerificationRequestV2.aggregate([
                {
                    $match: {
                        dapp_id: { $in: appIds }
                    }
                },
                {
                    $group: {
                        _id: '$dapp_id',
                        count: { $sum: 1 }
                    }
                }
            ]),
            {
                $match: {
                    dapp_id: { $in: appIds }
                }
            },
            {
                $sort: { created_at: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    request_id: 1,
                    dapp_id: 1,
                    verification_tier: 1,
                    status: 1,
                    created_at: 1
                }
            }
        ]);

        const activity = activityData.map(item => ({
            date: item._id,
            count: item.count
        }));

        const totalVerifications = verificationTotals.reduce((sum, item) => sum + item.count, 0);
        const topApps = apps
            .map(app => ({
                name: app.name,
                value: app.request_count || 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const normalizedRecentActivity = recentActivity.map(item => ({
            request_id: item.request_id,
            app_id: item.dapp_id,
            app_name: appNameMap.get(item.dapp_id) || item.dapp_id,
            verification_tier: item.verification_tier,
            status: item.status,
            created_at: item.created_at
        }));

        res.json({
            success: true,
            stats: {
                total_requests: totalRequests,
                total_verifications: totalVerifications,
                active_apps: activeApps,
                total_apps: apps.length,
                activity,
                top_apps: topApps,
                recent_activity: normalizedRecentActivity
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to load stats' });
    }
});

// GET /api/business/app-metadata/:app_id - PUBLIC ENDPOINT for SDK branding
router.get('/app-metadata/:app_id', async (req, res) => {
    try {
        const { app_id } = req.params;

        // Publicly expose ONLY name, branding info, and requested scopes
        const app = await BusinessApp.findOne({ app_id, active: true })
            .select('app_id name sdk_config requested_scopes website_url description');

        if (!app) {
            return res.status(404).json({ success: false, error: 'App not found' });
        }

        return res.json({
            success: true,
            app: {
                app_id: app.app_id,
                name: app.name,
                logo_url: app.sdk_config?.logo_url || '',
                required_tier: app.sdk_config?.requiredTier || 'L1',
                website_url: app.website_url || '',
                description: app.description || '',
                requested_scopes: app.requested_scopes || ['verify:identity', 'read:profile', 'read:kyc_level'],
                theme: {
                    primaryColor: app.sdk_config?.primary_color || '#8651e1',
                    borderRadius: app.sdk_config?.border_radius || '12',
                    fontFamily: app.sdk_config?.font_family || 'Inter',
                    mode: app.sdk_config?.mode || 'light'
                }
            }
        });
    } catch (error) {
        console.error('[Business] Get app metadata failed:', error);
        res.status(500).json({ success: false, error: 'Failed to get app metadata' });
    }
});

// ============================================
// PUBLIC INTEGRATIONS DIRECTORY
// ============================================

/**
 * Public app directory — no auth required.
 * Returns apps that have opted into the directory (listing_status: 'listed') in production.
 * GET /api/business/public/apps
 */
router.get('/public/apps', async (req, res) => {
    try {
        const apps = await BusinessApp.find({
            active: true,
            listing_status: 'listed',
            environment: 'production'
        })
            .select('app_id name description website_url sdk_config.logo_url created_at')
            .sort({ request_count: -1 })
            .limit(50)
            .lean();

        return res.json({
            success: true,
            apps: apps.map(app => ({
                app_id: app.app_id,
                name: app.name,
                description: app.description || '',
                website_url: app.website_url || '',
                logo_url: app.sdk_config?.logo_url || '',
                created_at: app.created_at
            }))
        });
    } catch (error) {
        console.error('[Business] Public apps listing failed:', error);
        res.status(500).json({ success: false, error: 'Failed to load app directory' });
    }
});

module.exports = router;
module.exports.verifyAppCredentials = verifyAppCredentials;
