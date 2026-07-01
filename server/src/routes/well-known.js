/**
 * /.well-known/ routes — JWKS, OpenID Connect Discovery, and Android Digital Asset Links
 *
 * Endpoints:
 *   GET /.well-known/jwks.json              — RSA public keys for JWT verification
 *   GET /.well-known/openid-configuration   — OpenID Connect discovery document
 *   GET /.well-known/assetlinks.json        — Android Digital Asset Links for passkey support
 *
 * External clients use these to verify CasperID business tokens locally
 * WITHOUT making an API call on every request.
 *
 * Example (Node.js client):
 *   const jwks = await fetch('https://casperid.com/.well-known/jwks.json').then(r => r.json());
 *   const key = jwks.keys.find(k => k.kid === token.header.kid);
 *   const publicKey = KeyObject.from(key);  // or jwk-to-pem library
 *   jwt.verify(token, publicKey, { algorithms: ['RS256'] });
 */

const express = require('express');
const router = express.Router();
const { getJWKS } = require('../utils/rsa-key-manager');
const { BusinessApp } = require('../database/models');

const BASE_URL = process.env.FRONTEND_URL || 'https://casperid.com';
const ACCOUNT_URL = process.env.ACCOUNT_FRONTEND_URL || BASE_URL;
const API_URL = process.env.API_BASE_URL || 'https://apis.casperid.com';

/**
 * GET /.well-known/jwks.json
 *
 * Returns the JSON Web Key Set containing CasperID's RSA public signing key.
 * Clients SHOULD cache this response and refresh every 24h or on kid mismatch.
 */
router.get('/jwks.json', (req, res) => {
    res.set({
        'Cache-Control': 'public, max-age=86400', // 24-hour cache
        'Content-Type': 'application/json'
    });
    res.json(getJWKS());
});

/**
 * GET /.well-known/openid-conf
 *
 * OpenID Connect discovery document. Allows clients to auto-discover all
 * endpoint URLs, supported algorithms, and claims.
 * Spec: https://openid.net/specs/openid-connect-discovery-1_0.html
 */
router.get('/openid-configuration', (req, res) => {
    const issuer = 'https://casperid.com';

    res.set({ 'Cache-Control': 'public, max-age=3600' });
    res.json({
        issuer,
        authorization_endpoint: `${ACCOUNT_URL}/authorize`,
        token_endpoint: `${API_URL}/api/oauth/token`,
        userinfo_endpoint: `${issuer}/api/passkey/me`,
        jwks_uri: `${issuer}/.well-known/jwks.json`,
        registration_endpoint: `${issuer}/api/business/apps`,

        // Supported specs
        response_types_supported: ['token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256', 'HS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
        claims_supported: [
            'sub', 'iss', 'aud', 'exp', 'iat',
            'wallet', 'humanId', 'name', 'verified', 'tier',
            'email', 'app_id', 'token_type', 'sharedData'
        ],

        // Additional CasperID-specific links
        service_documentation: `${BASE_URL}/business/docs`,
        op_policy_uri: `${BASE_URL}/legal/privacy`,
        op_tos_uri: `${BASE_URL}/legal/terms`
    });
});

/**
 * GET /.well-known/assetlinks.json
 *
 * Android Digital Asset Links for app verification.
 * Aggregates all active business apps' Android configurations.
 * Enables Android passkey/WebAuthn support via automatic verification.
 *
 * Android verifies:
 * 1. App package name matches
 * 2. SHA256 certificate fingerprint matches
 * 3. This file is served from the WebAuthn RP ID domain
 *
 * Spec: https://developers.google.com/digital-asset-links/v1/getting-started
 */
router.get('/assetlinks.json', async (req, res) => {
    try {
        // Fetch all active business apps with Android configurations
        const apps = await BusinessApp.find({
            active: true,
            'android_digital_assets.0': { $exists: true } // Only apps with at least one Android config
        }).select('android_digital_assets');

        // Aggregate all unique Android packages
        const assetLinks = [];
        const seenPackages = new Set();

        for (const app of apps) {
            for (const asset of app.android_digital_assets || []) {
                if (!asset.package_name || seenPackages.has(asset.package_name)) continue;

                seenPackages.add(asset.package_name);

                assetLinks.push({
                    relation: [
                        'delegate_permission/common.handle_all_urls',
                        'delegate_permission/common.get_login_creds'
                    ],
                    target: {
                        namespace: 'android_app',
                        package_name: asset.package_name,
                        sha256_cert_fingerprints: asset.sha256_fingerprints || []
                    }
                });
            }
        }

        res.set({
            'Cache-Control': 'public, max-age=3600', // 1-hour cache (shorter than JWKS for faster updates)
            'Content-Type': 'application/json'
        });

        res.json(assetLinks);
    } catch (error) {
        console.error('[Well-Known] Failed to fetch assetlinks:', error);
        res.status(500).json({ error: 'Failed to generate assetlinks' });
    }
});

module.exports = router;
