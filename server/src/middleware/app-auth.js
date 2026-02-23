/**
 * App Authentication Middleware — Day 3
 *
 * Validates `X-App-ID` + `X-Api-Secret` headers that external clients send
 * when embedding CasperID's passkey flow.
 *
 * Usage:
 *   // Require valid app credentials:
 *   router.post('/some-route', requireApp, handler);
 *
 *   // Accept app credentials if present (but don't block if absent):
 *   router.post('/some-route', extractApp, handler);
 *
 * If valid, attaches `req.app` to the request:
 *   req.app = { app_id, name, allowed_origins, environment, owner_user_id }
 */

const bcrypt = require('bcrypt');
const { BusinessApp } = require('../database/models');

/**
 * Validate X-App-ID + X-Api-Secret and attach req.app.
 * Returns 401 if credentials are missing or invalid.
 */
const requireApp = async (req, res, next) => {
    const appId = req.headers['x-app-id'];
    const apiSecret = req.headers['x-api-secret'];

    if (!appId || !apiSecret) {
        return res.status(401).json({
            success: false,
            error: 'X-App-ID and X-Api-Secret headers are required'
        });
    }

    try {
        const app = await BusinessApp.findOne({ app_id: appId, active: true });
        if (!app) {
            return res.status(401).json({ success: false, error: 'Invalid app credentials' });
        }

        const valid = await bcrypt.compare(apiSecret, app.api_secret_hash);
        if (!valid) {
            return res.status(401).json({ success: false, error: 'Invalid app credentials' });
        }

        // Optional: enforce allowed_origins (for CORS-equivalent check)
        const origin = req.headers.origin;
        if (app.allowed_origins.length > 0 && origin) {
            const allowed = app.allowed_origins.some(o => o === origin || o === '*');
            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    error: `Origin ${origin} is not whitelisted for app ${appId}`
                });
            }
        }

        // Update usage tracking (fire-and-forget)
        BusinessApp.findOneAndUpdate(
            { app_id: appId },
            { $inc: { request_count: 1 }, $set: { last_used_at: new Date() } }
        ).exec().catch(() => { });

        req.businessApp = {
            app_id: app.app_id,
            name: app.name,
            environment: app.environment,
            allowed_origins: app.allowed_origins,
            owner_user_id: app.owner_user_id
        };

        next();
    } catch (err) {
        console.error('[AppAuth] Error:', err.message);
        res.status(500).json({ success: false, error: 'Authentication error' });
    }
};

/**
 * Extract app credentials if present — does NOT return 401 if absent.
 * Sets req.businessApp only when valid credentials are provided.
 */
const extractApp = async (req, res, next) => {
    const appId = req.headers['x-app-id'];
    const apiSecret = req.headers['x-api-secret'];

    if (!appId || !apiSecret) {
        return next(); // No app credentials — continue as normal CasperID auth
    }

    try {
        const app = await BusinessApp.findOne({ app_id: appId, active: true });
        if (app) {
            const valid = await bcrypt.compare(apiSecret, app.api_secret_hash);
            if (valid) {
                // Origin check (soft — log only, don't block in extract mode)
                const origin = req.headers.origin;
                if (app.allowed_origins.length > 0 && origin) {
                    const allowed = app.allowed_origins.some(o => o === origin || o === '*');
                    if (!allowed) {
                        console.warn(`[AppAuth] Origin ${origin} not whitelisted for ${appId} — proceeding without app context`);
                        return next();
                    }
                }

                BusinessApp.findOneAndUpdate(
                    { app_id: appId },
                    { $inc: { request_count: 1 }, $set: { last_used_at: new Date() } }
                ).exec().catch(() => { });

                req.businessApp = {
                    app_id: app.app_id,
                    name: app.name,
                    environment: app.environment,
                    allowed_origins: app.allowed_origins,
                    owner_user_id: app.owner_user_id
                };
            }
        }
    } catch (err) {
        console.error('[AppAuth] Extract error (non-fatal):', err.message);
    }

    next();
};

module.exports = { requireApp, extractApp };
