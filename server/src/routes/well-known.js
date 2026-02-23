/**
 * /.well-known/ routes — JWKS and OpenID Connect Discovery
 *
 * Endpoints:
 *   GET /.well-known/jwks.json              — RSA public keys for JWT verification
 *   GET /.well-known/openid-configuration   — OpenID Connect discovery document
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

const BASE_URL = process.env.FRONTEND_URL || 'https://casperid.com';

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
 * GET /.well-known/openid-configuration
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
        authorization_endpoint: `${BASE_URL}/authorize`,
        token_endpoint: `${issuer}/api/passkey/authenticate`,
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
            'wallet', 'humanId', 'verified', 'tier',
            'email', 'app_id', 'token_type', 'sharedData'
        ],

        // Additional CasperID-specific links
        service_documentation: `${BASE_URL}/business/docs`,
        op_policy_uri: `${BASE_URL}/legal/privacy`,
        op_tos_uri: `${BASE_URL}/legal/terms`
    });
});

module.exports = router;
