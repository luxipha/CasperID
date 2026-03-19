/**
 * Signature Verifier — Multi-algorithm
 * Supports:
 *   - Ethereum / MetaMask (ECDSA secp256k1, EIP-191 personal_sign)
 *   - Casper Wallet (Ed25519)
 */

const crypto = require('crypto');
const { Keys } = require('casper-js-sdk');
const { ethers } = require('ethers');

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

// ─── Ethereum / ECDSA ───────────────────────────────────────────────────────

/**
 * Verify an EIP-191 personal_sign signature from MetaMask.
 * Recovers the signer address and compares it to the expected address.
 *
 * @param {string} message   - The plaintext message that was signed
 * @param {string} signature - 0x-prefixed hex signature (65 bytes)
 * @param {string} address   - Expected Ethereum address (0x…)
 * @returns {boolean}
 */
function verifyEcdsaSignature(message, signature, address) {
    try {
        const recovered = ethers.verifyMessage(message, signature);
        const isValid = recovered.toLowerCase() === address.toLowerCase();
        console.log('[Signature/ECDSA] Recovered:', recovered, '| Expected:', address, '| Valid:', isValid);
        return isValid;
    } catch (error) {
        console.error('[Signature/ECDSA] Verification error:', error.message);
        return false;
    }
}

// ─── Casper / Ed25519 ───────────────────────────────────────────────────────

/**
 * Verify a Casper Ed25519 wallet signature.
 *
 * @param {string} message   - The plaintext message that was signed
 * @param {string} signature - Hex signature string
 * @param {string} publicKey - Hex public key string (32 bytes)
 * @returns {boolean}
 */
function verifyCasperSignature(message, signature, publicKey) {
    try {
        const messageBytes = Buffer.from(message, 'utf8');
        const signatureBytes = Buffer.from(signature, 'hex');
        const publicKeyBytes = Buffer.from(publicKey, 'hex');

        const pubKey = Keys.Ed25519.parsePublicKey(publicKeyBytes);
        const isValid = pubKey.verify(messageBytes, signatureBytes);

        console.log('[Signature/Ed25519] Verification result:', isValid);
        return isValid;
    } catch (error) {
        console.error('[Signature/Ed25519] Verification error:', error.message);
        return false;
    }
}

// ─── Unified entry point ─────────────────────────────────────────────────────

/**
 * Verify a wallet signature.
 *
 * Automatically detects the signature algorithm:
 *   - Ethereum address (0x + 40 hex chars) → ECDSA / EIP-191 personal_sign
 *   - Everything else                       → Casper Ed25519
 *
 * @param {string} message          - Original message that was signed
 * @param {string} signature        - Signature string (hex)
 * @param {string} publicKeyOrAddress - Ethereum address OR Casper public key hex
 * @returns {boolean} True if signature is valid
 */
function verifyWalletSignature(message, signature, publicKeyOrAddress) {
    // Ethereum address: 0x followed by exactly 40 hex characters
    if (/^0x[0-9a-fA-F]{40}$/.test(publicKeyOrAddress)) {
        return verifyEcdsaSignature(message, signature, publicKeyOrAddress);
    }

    // Fall back to Casper Ed25519
    return verifyCasperSignature(message, signature, publicKeyOrAddress);
}

/**
 * Create message for user to sign
 * @param {string} wallet    - Wallet address
 * @param {string} platform  - Platform domain
 * @param {string} nonce     - Unique nonce
 * @returns {string} Message to sign
 */
function createSignatureMessage(wallet, platform, nonce) {
    return `Sign in to ${platform} with CasperID\n\nWallet: ${wallet}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
}

module.exports = {
    generateNonce,
    validateNonce,
    verifyWalletSignature,
    verifyCasperSignature,
    verifyEcdsaSignature,
    createSignatureMessage,
    cleanupExpiredNonces
};
