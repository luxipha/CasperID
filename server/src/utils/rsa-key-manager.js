/**
 * RSA Key Manager for CasperID Business Platform
 *
 * Manages the RSA-2048 key pair used to sign business-scoped JWTs (RS256).
 * The private key stays server-side; the public key is exposed via /.well-known/jwks.json.
 *
 * Strategy: keep HS256 for existing CasperID user sessions (zero disruption).
 *           Use RS256 only for business-scoped tokens (X-App-ID flow).
 */

const crypto = require('crypto');
const mongoose = require('mongoose');

// -------------------------------------------------------
// MongoDB schema to persist the key pair across restarts
// -------------------------------------------------------
const rsaKeyPairSchema = new mongoose.Schema({
    kid: {           // Key ID (for JWKS key rotation)
        type: String,
        required: true,
        unique: true
    },
    privateKeyPem: { // RSA private key (raw PEM — only ever accessed server-side)
        type: String,
        required: true
    },
    publicKeyPem: {  // RSA public key PEM
        type: String,
        required: true
    },
    algorithm: {
        type: String,
        default: 'RS256'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {     // Rotate keys every 90 days
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

const RsaKeyPair = mongoose.model('RsaKeyPair', rsaKeyPairSchema);

// In-memory cache — avoids DB round-trip on every token sign
let activeKey = null;
let previousKey = null; // kept 24h after rotation for verification

/**
 * Generate a fresh RSA-2048 key pair
 */
function generateRsaKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
}

/**
 * Derive a short, stable kid from the public key
 */
function deriveKid(publicKeyPem) {
    return crypto.createHash('sha256').update(publicKeyPem).digest('base64url').slice(0, 16);
}

/**
 * Initialize (or load) the RSA key pair on server start
 */
async function initializeRsaKeys() {
    console.log('🔑 Initializing RSA key manager...');
    try {
        const now = new Date();

        // Try to load an existing active key
        let record = await RsaKeyPair.findOne({ active: true }).sort({ createdAt: -1 });

        if (!record || record.expiresAt < now) {
            if (record) {
                // Retire old key — keep in memory for verification for 24h
                console.log('📅 RSA key past expiry — rotating...');
                previousKey = { kid: record.kid, privateKeyPem: record.privateKeyPem, publicKeyPem: record.publicKeyPem };
                record.active = false;
                await record.save();
            }

            // Generate new key pair
            console.log('📝 Generating new RSA-2048 key pair...');
            const { privateKey, publicKey } = generateRsaKeyPair();
            const kid = deriveKid(publicKey);
            const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

            record = new RsaKeyPair({ kid, privateKeyPem: privateKey, publicKeyPem: publicKey, expiresAt });
            await record.save();
            console.log(`✅ New RSA key pair generated (kid: ${kid})`);
        } else {
            const days = Math.ceil((record.expiresAt - now) / (24 * 60 * 60 * 1000));
            console.log(`✅ RSA key loaded (kid: ${record.kid}, expires in ${days} days)`);
        }

        activeKey = {
            kid: record.kid,
            privateKeyPem: record.privateKeyPem,
            publicKeyPem: record.publicKeyPem
        };

        // Check every 24h for key expiry
        setInterval(checkKeyRotation, 24 * 60 * 60 * 1000);

        console.log('✅ RSA key manager initialized');
    } catch (err) {
        console.error('❌ RSA key manager init failed:', err.message);
        // Fallback: ephemeral key (not persisted — all tokens invalidated on restart)
        const { privateKey, publicKey } = generateRsaKeyPair();
        activeKey = { kid: 'ephemeral', privateKeyPem: privateKey, publicKeyPem: publicKey };
    }
}

async function checkKeyRotation() {
    try {
        const now = new Date();
        const record = await RsaKeyPair.findOne({ active: true });
        if (record && record.expiresAt < now) {
            await initializeRsaKeys();
        }
    } catch (err) {
        console.error('❌ RSA key rotation check failed:', err.message);
    }
}

/**
 * Returns the active private key PEM for signing
 */
function getPrivateKey() {
    if (!activeKey) throw new Error('RSA key manager not initialized');
    return activeKey.privateKeyPem;
}

/**
 * Returns the active public key PEM for verification
 */
function getPublicKey() {
    if (!activeKey) throw new Error('RSA key manager not initialized');
    return activeKey.publicKeyPem;
}

/**
 * Returns the active key ID
 */
function getKid() {
    return activeKey?.kid || 'unknown';
}

/**
 * Build JWKS JSON with active (and optionally previous) key
 * Spec: https://datatracker.ietf.org/doc/html/rfc7517
 */
function getJWKS() {
    const keys = [];

    if (activeKey) {
        keys.push(publicPemToJwk(activeKey.publicKeyPem, activeKey.kid));
    }
    if (previousKey) {
        keys.push(publicPemToJwk(previousKey.publicKeyPem, previousKey.kid));
    }

    return { keys };
}

/**
 * Convert a PEM public key to JWK format (RSA n, e components)
 */
function publicPemToJwk(publicKeyPem, kid) {
    const keyObj = crypto.createPublicKey(publicKeyPem);
    const jwk = keyObj.export({ format: 'jwk' });

    return {
        kty: 'RSA',
        use: 'sig',
        alg: 'RS256',
        kid,
        n: jwk.n,
        e: jwk.e
    };
}

/**
 * Verify an RS256 token — tries active then previous key
 */
function verifyRsaToken(token, jwt) {
    const keysToTry = [activeKey, previousKey].filter(Boolean);

    for (const key of keysToTry) {
        try {
            return jwt.verify(token, key.publicKeyPem, { algorithms: ['RS256'] });
        } catch (_) {
            continue;
        }
    }
    return null;
}

module.exports = {
    initializeRsaKeys,
    getPrivateKey,
    getPublicKey,
    getKid,
    getJWKS,
    verifyRsaToken,
    publicPemToJwk
};
