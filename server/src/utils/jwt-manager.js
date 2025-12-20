/**
 * JWT Token Manager for CasperID Authentication
 * Handles token generation, verification, and refresh
 */

const jwt = require('jsonwebtoken');
const { getCurrentSecret, verifyTokenWithRotation } = require('./jwt-rotation-db');

// Token configuration
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '24h';
const ISSUER = 'casperid.com';

/**
 * Generate JWT token for authenticated user
 * @param {Object} userData - User data to encode in token
 * @param {string} userData.wallet - Wallet address
 * @param {string} userData.humanId - Human-readable ID
 * @param {boolean} userData.verified - Verification status
 * @param {string} userData.tier - Verification tier
 * @param {Array<string>} userData.sharedData - Data fields shared with platform
 * @param {string} platform - Platform domain requesting authentication
 * @returns {string} Signed JWT token
 */
function generateToken(userData, platform) {
    const payload = {
        wallet: userData.wallet,
        humanId: userData.humanId,
        verified: userData.verified,
        tier: userData.tier,
        sharedData: userData.sharedData || [],
        platform: platform,
        iss: ISSUER
    };

    const options = {
        expiresIn: TOKEN_EXPIRATION
    };

    return jwt.sign(payload, getCurrentSecret(), options);
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
    try {
        // Use rotation-aware verification
        const decoded = verifyTokenWithRotation(token, jwt);
        
        // Additional issuer check
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
 * Refresh token (issue new token with same claims but new expiration)
 * @param {string} oldToken - Existing token to refresh
 * @returns {string|null} New token or null if old token invalid
 */
function refreshToken(oldToken) {
    const decoded = verifyToken(oldToken);

    if (!decoded) {
        return null;
    }

    // Remove JWT metadata fields
    const { iat, exp, iss, ...userData } = decoded;

    // Generate new token with same claims
    return generateToken(userData, decoded.platform);
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload
 */
function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
function isTokenExpired(token) {
    const decoded = decodeToken(token);

    if (!decoded || !decoded.exp) {
        return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
}

module.exports = {
    generateToken,
    verifyToken,
    refreshToken,
    decodeToken,
    isTokenExpired
};
