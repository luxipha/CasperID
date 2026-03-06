const crypto = require('crypto');

/**
 * Field-Level Encryption Utility
 * Uses AES-256-GCM for authenticated encryption of sensitive data
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get or generate the encryption key
 * In production, this should come from a secure key management service (KMS)
 */
function getEncryptionKey() {
    const key = process.env.FIELD_ENCRYPTION_KEY;

    if (!key) {
        console.warn('⚠️ FIELD_ENCRYPTION_KEY not set. Using derived key from JWT_SECRET.');
        console.warn('⚠️ For production, set FIELD_ENCRYPTION_KEY to a 32-byte hex string.');

        // Derive key from JWT_SECRET as fallback (not recommended for production)
        const jwtSecret = process.env.JWT_SECRET || 'development-secret-key';
        return crypto.createHash('sha256').update(jwtSecret).digest();
    }

    // Expect a 64-character hex string (32 bytes)
    if (key.length !== 64) {
        throw new Error('FIELD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }

    return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string value
 * @param {string} plaintext - The value to encrypt
 * @returns {string} - Base64 encoded encrypted value (iv:authTag:ciphertext)
 */
function encrypt(plaintext) {
    if (!plaintext) return plaintext;

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext (all base64 encoded)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted value
 * @param {string} encryptedValue - The encrypted value (iv:authTag:ciphertext)
 * @returns {string} - The decrypted plaintext
 */
function decrypt(encryptedValue) {
    if (!encryptedValue) return encryptedValue;

    // Check if value is encrypted (contains the delimiter pattern)
    if (!encryptedValue.includes(':')) {
        // Value is not encrypted (legacy data), return as-is
        return encryptedValue;
    }

    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
        // Invalid format, return as-is (might be legacy data)
        return encryptedValue;
    }

    const key = getEncryptionKey();
    const [ivBase64, authTagBase64, ciphertext] = parts;

    try {
        const iv = Buffer.from(ivBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        // Return as-is if decryption fails (might be legacy unencrypted data)
        return encryptedValue;
    }
}

/**
 * Check if a value is encrypted
 * @param {string} value - The value to check
 * @returns {boolean} - True if the value appears to be encrypted
 */
function isEncrypted(value) {
    if (!value || typeof value !== 'string') return false;
    const parts = value.split(':');
    return parts.length === 3 && parts.every(p => p.length > 0);
}

/**
 * Mongoose plugin for automatic field encryption
 * Add to a schema to automatically encrypt/decrypt specified fields
 *
 * @param {Schema} schema - Mongoose schema
 * @param {Object} options - Options with encryptedFields array
 */
function encryptionPlugin(schema, options = {}) {
    const encryptedFields = options.encryptedFields || [];

    // Encrypt before save
    schema.pre('save', function(next) {
        for (const field of encryptedFields) {
            if (this[field] && !isEncrypted(this[field])) {
                this[field] = encrypt(this[field]);
            }
        }
        next();
    });

    // Decrypt after find operations
    const decryptFields = (doc) => {
        if (!doc) return doc;
        for (const field of encryptedFields) {
            if (doc[field]) {
                doc[field] = decrypt(doc[field]);
            }
        }
        return doc;
    };

    // Handle findOne, findById, etc.
    schema.post('findOne', decryptFields);
    schema.post('findById', decryptFields);

    // Handle find (array of docs)
    schema.post('find', function(docs) {
        if (Array.isArray(docs)) {
            docs.forEach(decryptFields);
        }
        return docs;
    });

    // Add instance method for manual decryption
    schema.methods.decryptField = function(field) {
        return decrypt(this[field]);
    };
}

module.exports = {
    encrypt,
    decrypt,
    isEncrypted,
    encryptionPlugin,
    getEncryptionKey
};
