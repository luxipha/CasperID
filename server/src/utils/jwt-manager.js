/**
 * JWT Token Manager for CasperID Authentication
 * Handles token generation, verification, and refresh
 *
 * Algorithm strategy:
 *   - HS256 (HMAC): existing CasperID user sessions (device sessions, passkey flows)
 *   - RS256 (RSA):  business-scoped tokens issued via X-App-ID flow
 *                   — verifiable by external clients using /.well-known/jwks.json
 */

const jwt = require('jsonwebtoken');
const { getCurrentSecret, verifyTokenWithRotation } = require('./jwt-rotation-db');
const rsaKeyManager = require('./rsa-key-manager');

// Token configuration
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '24h';
const ISSUER = 'casperid.com';

/**
 * Generate HS256 JWT token for authenticated user
 * (Unchanged — used by all existing passkey/session flows)
 * @param {Object} userData - User data to encode in token
 * @param {string} platform - Platform domain requesting authentication
 * @returns {string} Signed HS256 JWT token
 */
function generateToken(userData, platform) {
    const payload = {
        wallet: userData.wallet,
        humanId: userData.humanId,
        cnsName: userData.cnsName || null, // Premium name if registered
        verified: userData.verified,
        tier: userData.tier,
        sharedData: userData.sharedData || [],
        platform: platform,
        iss: ISSUER,
        // Internal identifiers for refresh logic
        email: userData.email,
        userId: userData.userId || userData.user_id
    };
    return jwt.sign(payload, getCurrentSecret(), { expiresIn: TOKEN_EXPIRATION });
}

/**
 * Generate RS256 JWT token scoped to a business app.
 * External clients can verify this token locally using:
 *   GET /.well-known/jwks.json
 *
 * @param {Object} userData - User identity claims
 * @param {string} appId - BusinessApp.app_id (becomes the `aud` claim)
 * @returns {string} Signed RS256 JWT
 */
function generateBusinessToken(userData, appId, authorization = {}) {
    const sharedData = userData.sharedData || [];
    const include = (field) => sharedData.includes(field);
    const selectedContext = authorization.selectedContext || undefined;
    const payload = {
        // Standard JWT claims
        iss: ISSUER,
        aud: appId,
        sub: userData.userId || userData.wallet,
        // User identity
        ...(include('wallet') && userData.wallet ? { wallet: userData.wallet } : {}),
        ...(include('human_id') && userData.humanId ? { humanId: userData.humanId } : {}),
        ...(include('name') && userData.name ? { name: userData.name } : {}),
        ...(include('over_18') && typeof userData.over18 === 'boolean' ? { over_18: userData.over18 } : {}),
        cnsName: userData.cnsName || null, // Premium name if registered
        verified: userData.verified,
        tier: userData.tier,
        sharedData,
        ...(include('email') && userData.email ? { email: userData.email } : {}),
        // Business metadata
        app_id: appId,
        token_type: 'business',
        required_tier: authorization.requiredTier || userData.tier,
        scopes: authorization.scopes || [],
        authorization_status: authorization.authorizationStatus || 'complete',
        verification_status: authorization.verificationStatus || 'approved',
        ...(selectedContext ? { selected_context: selectedContext } : {})
    };

    return jwt.sign(payload, rsaKeyManager.getPrivateKey(), {
        algorithm: 'RS256',
        expiresIn: authorization.expiresIn || TOKEN_EXPIRATION,
        keyid: rsaKeyManager.getKid()
    });
}

/**
 * Verify HS256 token (existing CasperID sessions — unchanged)
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
    try {
        const decoded = verifyTokenWithRotation(token, jwt);
        if (decoded && decoded.iss !== ISSUER) {
            console.error('[JWT] Invalid issuer:', decoded.iss);
            return null;
        }
        return decoded;
    } catch (error) {
        console.error('[JWT] Token verification failed:', error.message);
        return null;
    }
}

/**
 * Verify RS256 business token
 * @param {string} token
 * @returns {Object|null}
 */
function verifyBusinessToken(token) {
    try {
        const decoded = rsaKeyManager.verifyRsaToken(token, jwt);
        if (!decoded) return null;
        if (decoded.iss !== ISSUER) return null;
        if (decoded.token_type !== 'business') return null;
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Verify EITHER an HS256 or RS256 token — useful for middleware that
 * needs to accept both token types transparently.
 * @param {string} token
 * @returns {Object|null} Decoded payload with _alg field added
 */
function verifyAnyToken(token) {
    const hs = verifyToken(token);
    if (hs) return { ...hs, _alg: 'HS256' };

    const rs = verifyBusinessToken(token);
    if (rs) return { ...rs, _alg: 'RS256' };

    return null;
}

/**
 * Refresh HS256 token (existing flow — unchanged)
 * @param {string} oldToken
 * @returns {string|null}
 */
function refreshToken(oldToken) {
    const decoded = verifyToken(oldToken);
    if (!decoded) return null;
    const { iat, exp, iss, ...userData } = decoded;
    return generateToken(userData, decoded.platform);
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token
 * @returns {Object|null}
 */
function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch {
        return null;
    }
}

/**
 * Check if token is expired
 * @param {string} token
 * @returns {boolean}
 */
function isTokenExpired(token) {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp < Math.floor(Date.now() / 1000);
}

module.exports = {
    generateToken,
    generateBusinessToken,
    verifyToken,
    verifyBusinessToken,
    verifyAnyToken,
    refreshToken,
    decodeToken,
    isTokenExpired
};
