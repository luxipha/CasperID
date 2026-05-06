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
 * Convert hex fingerprint (AA:BB:CC:...) to base64url format
 */
function hexFingerprintToBase64url(hexFingerprint) {
    // Remove colons and convert hex to buffer
    const hexClean = hexFingerprint.replace(/:/g, '');
    const buffer = Buffer.from(hexClean, 'hex');
    // Convert to base64url (replace + with -, / with _, remove =)
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Build Android WebAuthn origins from android_digital_assets
 * Format: android:apk-key-hash:<BASE64URL_SHA256>
 */
function buildAndroidOrigins(androidDigitalAssets) {
    if (!androidDigitalAssets || !Array.isArray(androidDigitalAssets)) {
        return [];
    }

    const androidOrigins = [];
    for (const asset of androidDigitalAssets) {
        if (asset.sha256_fingerprints && Array.isArray(asset.sha256_fingerprints)) {
            for (const fingerprint of asset.sha256_fingerprints) {
                let base64urlFingerprint = fingerprint;

                // Check if fingerprint is in hex format (contains colons)
                if (fingerprint.includes(':')) {
                    base64urlFingerprint = hexFingerprintToBase64url(fingerprint);
                }

                androidOrigins.push(`android:apk-key-hash:${base64urlFingerprint}`);
            }
        }
    }
    return androidOrigins;
}

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

        // Merge allowed_origins with Android origins from digital assets
        const androidOrigins = buildAndroidOrigins(app.android_digital_assets);
        const allOrigins = [...(app.allowed_origins || []), ...androidOrigins];

        req.businessApp = {
            app_id: app.app_id,
            name: app.name,
            environment: app.environment,
            allowed_origins: allOrigins,
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
 *
 * Also attempts origin-based lookup when no credentials provided,
 * allowing SDK integrations to work without exposing API secrets client-side.
 */
const extractApp = async (req, res, next) => {
    const appId = req.headers['x-app-id'];
    const apiSecret = req.headers['x-api-secret'];
    const origin = req.headers.origin;

    // Strategy 1: Explicit credentials provided
    if (appId && apiSecret) {
        try {
            const app = await BusinessApp.findOne({ app_id: appId, active: true });
            if (app) {
                const valid = await bcrypt.compare(apiSecret, app.api_secret_hash);
                if (valid) {
                    // Origin check (soft — log only, don't block in extract mode)
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

                    // Merge allowed_origins with Android origins from digital assets
                    const androidOrigins = buildAndroidOrigins(app.android_digital_assets);
                    const allOrigins = [...(app.allowed_origins || []), ...androidOrigins];

                    req.businessApp = {
                        app_id: app.app_id,
                        name: app.name,
                        environment: app.environment,
                        allowed_origins: allOrigins,
                        owner_user_id: app.owner_user_id
                    };
                    return next();
                }
            }
        } catch (err) {
            console.error('[AppAuth] Extract error (non-fatal):', err.message);
        }
        return next();
    }

    // Strategy 2: No credentials — try origin-based lookup for SDK integrations
    // This allows the SDK to work without exposing API secrets client-side
    if (origin) {
        try {
            const app = await BusinessApp.findOne({
                active: true,
                allowed_origins: origin
            });

            if (app) {
                console.log(`[AppAuth] Origin-based match for ${origin} -> app ${app.app_id}`);

                BusinessApp.findOneAndUpdate(
                    { app_id: app.app_id },
                    { $inc: { request_count: 1 }, $set: { last_used_at: new Date() } }
                ).exec().catch(() => { });

                // Merge allowed_origins with Android origins from digital assets
                const androidOrigins = buildAndroidOrigins(app.android_digital_assets);
                const allOrigins = [...(app.allowed_origins || []), ...androidOrigins];

                req.businessApp = {
                    app_id: app.app_id,
                    name: app.name,
                    environment: app.environment,
                    allowed_origins: allOrigins,
                    owner_user_id: app.owner_user_id
                };
                return next();
            }
        } catch (err) {
            console.error('[AppAuth] Origin lookup error (non-fatal):', err.message);
        }
    }

    // Strategy 3: X-App-Id only (no secret) — for mobile SDK integrations
    // Mobile apps can't safely include API secrets, so we allow app lookup by ID alone
    // This only loads the app's origin config for WebAuthn validation, not for auth
    if (appId && !apiSecret) {
        try {
            const app = await BusinessApp.findOne({ app_id: appId, active: true });
            if (app) {
                console.log(`[AppAuth] App-ID only match for ${appId} (mobile SDK mode)`);

                BusinessApp.findOneAndUpdate(
                    { app_id: appId },
                    { $inc: { request_count: 1 }, $set: { last_used_at: new Date() } }
                ).exec().catch(() => { });

                // Merge allowed_origins with Android origins from digital assets
                const androidOrigins = buildAndroidOrigins(app.android_digital_assets);
                const allOrigins = [...(app.allowed_origins || []), ...androidOrigins];

                console.log(`[AppAuth] Built Android origins for ${appId}:`, androidOrigins);

                req.businessApp = {
                    app_id: app.app_id,
                    name: app.name,
                    environment: app.environment,
                    allowed_origins: allOrigins,
                    owner_user_id: app.owner_user_id
                };
            }
        } catch (err) {
            console.error('[AppAuth] App-ID lookup error (non-fatal):', err.message);
        }
    }

    next();
};

module.exports = { requireApp, extractApp };
