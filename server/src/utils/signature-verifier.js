/**
 * Signature Verifier for Casper Wallet Signatures
 * Handles nonce generation and validation
 */

const crypto = require('crypto');
const { Keys } = require('casper-js-sdk');

// In-memory nonce storage (in production, use Redis)
const nonces = new Map();
const NONCE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a cryptographically secure nonce
 * @returns {string} Unique nonce
 */
function generateNonce() {
    const nonce = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + NONCE_EXPIRATION;

    nonces.set(nonce, {
        created: Date.now(),
        expiresAt,
        used: false
    });

    // Cleanup expired nonces
    cleanupExpiredNonces();

    return nonce;
}

/**
 * Validate nonce (check exists, not expired, not used)
 * @param {string} nonce - Nonce to validate
 * @returns {boolean} True if valid
 */
function validateNonce(nonce) {
    const nonceData = nonces.get(nonce);

    if (!nonceData) {
        console.log('[Nonce] Not found');
        return false;
    }

    if (nonceData.used) {
        console.log('[Nonce] Already used');
        return false;
    }

    if (Date.now() > nonceData.expiresAt) {
        console.log('[Nonce] Expired');
        nonces.delete(nonce);
        return false;
    }

    // Mark as used
    nonceData.used = true;
    nonces.set(nonce, nonceData);

    return true;
}

/**
 * Cleanup expired nonces from memory
 */
function cleanupExpiredNonces() {
    const now = Date.now();
    for (const [nonce, data] of nonces.entries()) {
        if (now > data.expiresAt) {
            nonces.delete(nonce);
        }
    }
}

/**
 * Verify Casper wallet signature
 * @param {string} message - Original message that was signed
 * @param {string} signature - Signature hex string
 * @param {string} publicKey - Public key hex string
 * @returns {boolean} True if signature is valid
 */
function verifyWalletSignature(message, signature, publicKey) {
    try {
        // Convert hex strings to Uint8Array
        const messageBytes = Buffer.from(message, 'utf8');
        const signatureBytes = Buffer.from(signature, 'hex');
        const publicKeyBytes = Buffer.from(publicKey, 'hex');

        // Create public key object
        // Casper uses Ed25519 by default
        const pubKey = Keys.Ed25519.parsePublicKey(publicKeyBytes);

        // Verify signature
        const isValid = pubKey.verify(messageBytes, signatureBytes);

        console.log('[Signature] Verification result:', isValid);
        return isValid;
    } catch (error) {
        console.error('[Signature] Verification error:', error.message);
        return false;
    }
}

/**
 * Create message for user to sign
 * @param {string} wallet - Wallet address
 * @param {string} platform - Platform domain
 * @param {string} nonce - Unique nonce
 * @returns {string} Message to sign
 */
function createSignatureMessage(wallet, platform, nonce) {
    return `Sign in to ${platform} with CasperID\n\nWallet: ${wallet}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
}

module.exports = {
    generateNonce,
    validateNonce,
    verifyWalletSignature,
    createSignatureMessage,
    cleanupExpiredNonces
};
