/**
 * OTP Pairing Service
 * Handles extension-to-web pairing via 3-digit OTP codes
 *
 * Flow:
 * 1. Extension initiates pairing with CID
 * 2. Backend generates 3-digit OTP, stores with user association
 * 3. Web portal (logged in user) sees pending pairing request with OTP
 * 4. User enters OTP in extension
 * 5. Extension receives session token
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { UserAccount, DeviceSession } = require('../database/models');
const { normalizeEmail } = require('../utils/email-normalizer');

// In-memory storage for OTP pairing sessions (use Redis in production)
const otpPairingSessions = new Map();

// Configuration
const OTP_EXPIRY_MS = 3 * 60 * 1000; // 3 minutes
const MAX_ATTEMPTS = 3;

// Cleanup expired sessions every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, session] of otpPairingSessions.entries()) {
        if (now > session.expiresAt) {
            otpPairingSessions.delete(key);
        }
    }
}, 60000);

/**
 * Generate a 3-digit OTP code
 */
function generateOTP() {
    return Math.floor(100 + Math.random() * 900).toString(); // 100-999
}

/**
 * Initiate OTP pairing from extension
 * @param {string} cid - The CasperID (username/slug)
 * @returns {Object} Pairing session info
 */
async function initiatePairing(cid) {
    if (!cid || typeof cid !== 'string') {
        throw new Error('CID is required');
    }

    // Normalize CID (lowercase, trim)
    const normalizedCid = cid.toLowerCase().trim();
    // If the CID looks like an email, apply Gmail dot normalization
    const normalizedEmail = normalizedCid.includes('@') ? normalizeEmail(normalizedCid) : null;

    // For email lookups, check both original and normalized forms for Gmail compatibility
    const emailQueries = normalizedEmail ? [
        { recovery_email: normalizedEmail },
        { recovery_email: normalizedCid }
    ] : [{ recovery_email: normalizedCid }];

    // Build queries for CID/Username/CNS
    const cidQueries = [
        { cns_name: normalizedCid },
        { 'profile.slug': normalizedCid },
        { 'profile.username': normalizedCid },
        { wallet: normalizedCid }
    ];

    // If it doesn't have .cid, try adding it for CNS lookup
    if (!normalizedCid.endsWith('.cid')) {
        cidQueries.push({ cns_name: `${normalizedCid}.cid` });
    } else {
        // If it has .cid, try removing it for slug/username lookups
        const withoutSuffix = normalizedCid.replace('.cid', '');
        cidQueries.push({ 'profile.slug': withoutSuffix });
        cidQueries.push({ 'profile.username': withoutSuffix });
    }

    const userAccount = await UserAccount.findOne({
        $or: [
            ...cidQueries,
            ...emailQueries // Email lookups with Gmail normalization
        ]
    });

    if (!userAccount) {
        throw new Error('CasperID not found');
    }

    // Check if there's already an active pairing for this user
    for (const [key, session] of otpPairingSessions.entries()) {
        if (session.userId === userAccount.user_id && Date.now() < session.expiresAt) {
            // Return existing session
            return {
                pairingId: key,
                expiresAt: session.expiresAt,
                expiresIn: session.expiresAt - Date.now(),
                userHint: maskEmail(userAccount.recovery_email)
            };
        }
    }

    // Generate new pairing session
    const pairingId = uuidv4();
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpPairingSessions.set(pairingId, {
        pairingId,
        userId: userAccount.user_id,
        userEmail: userAccount.recovery_email,
        otp,
        expiresAt,
        attempts: 0,
        status: 'pending', // pending, completed, expired, failed
        createdAt: Date.now(),
        cid: normalizedCid
    });

    console.log(`[OTP-Pairing] Created session ${pairingId} for ${normalizedCid}`);

    return {
        pairingId,
        expiresAt,
        expiresIn: OTP_EXPIRY_MS,
        userHint: maskEmail(userAccount.recovery_email)
    };
}

/**
 * Verify OTP and complete pairing
 * @param {string} pairingId - The pairing session ID
 * @param {string} otp - The 3-digit OTP entered by user
 * @param {Object} deviceInfo - Device information from extension
 * @returns {Object} Session token and user info
 */
async function verifyOTP(pairingId, otp, deviceInfo = {}) {
    const session = otpPairingSessions.get(pairingId);

    if (!session) {
        throw new Error('Pairing session not found or expired');
    }

    if (Date.now() > session.expiresAt) {
        otpPairingSessions.delete(pairingId);
        throw new Error('Pairing session has expired');
    }

    if (session.status === 'completed') {
        throw new Error('Pairing session already completed');
    }

    if (session.attempts >= MAX_ATTEMPTS) {
        otpPairingSessions.delete(pairingId);
        throw new Error('Too many failed attempts. Please start a new pairing.');
    }

    // Verify OTP
    if (session.otp !== otp.toString()) {
        session.attempts++;
        throw new Error(`Invalid OTP. ${MAX_ATTEMPTS - session.attempts} attempts remaining.`);
    }

    // OTP verified! Create session for extension
    const userAccount = await UserAccount.findOne({ user_id: session.userId });
    if (!userAccount) {
        throw new Error('User account not found');
    }

    // Create device session for extension
    const sessionId = uuidv4();
    const sessionToken = crypto.randomBytes(64).toString('hex');
    const sessionExpiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days for extension

    const deviceSession = new DeviceSession({
        session_id: sessionId,
        user_id: userAccount.user_id,
        credential_id: 'extension-otp-pairing',
        session_token: sessionToken,
        device_fingerprint: deviceInfo.fingerprint || 'extension-' + crypto.randomBytes(8).toString('hex'),
        ip_address: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent || 'CasperID-Extension',
        expires_at: sessionExpiresAt
    });

    await deviceSession.save();

    // Mark pairing as completed
    session.status = 'completed';
    session.completedAt = Date.now();

    // Clean up after a short delay
    setTimeout(() => otpPairingSessions.delete(pairingId), 5000);

    console.log(`[OTP-Pairing] Session ${pairingId} completed for user ${userAccount.user_id}`);

    return {
        success: true,
        sessionToken,
        expiresAt: sessionExpiresAt.toISOString(),
        user: {
            userId: userAccount.user_id,
            email: userAccount.recovery_email,
            tier: userAccount.tier,
            wallet: userAccount.wallet,
            human_id: userAccount.cns_name ? userAccount.cns_name.split('.')[0] : userAccount.user_id,
            humanId: userAccount.cns_name ? userAccount.cns_name.split('.')[0] : userAccount.user_id,
            cns_name: userAccount.cns_name || null,
            cnsName: userAccount.cns_name || null,
            verified: ['layer_1', 'layer_2', 'layer_3'].includes(userAccount.tier),
            emailVerified: userAccount.email_verified
        }
    };
}

/**
 * Get pending OTP pairing requests for a logged-in user
 * Called by web portal to display OTP to user
 * @param {string} userId - The logged-in user's ID
 * @returns {Array} List of pending pairing requests
 */
function getPendingPairings(userId) {
    const pending = [];
    const now = Date.now();

    for (const [key, session] of otpPairingSessions.entries()) {
        if (session.userId === userId && session.status === 'pending' && now < session.expiresAt) {
            pending.push({
                pairingId: key,
                otp: session.otp,
                expiresAt: session.expiresAt,
                expiresIn: session.expiresAt - now,
                createdAt: session.createdAt,
                cid: session.cid
            });
        }
    }

    return pending;
}

/**
 * Cancel a pairing request
 * @param {string} pairingId - The pairing session ID
 * @param {string} userId - The user requesting cancellation
 */
function cancelPairing(pairingId, userId) {
    const session = otpPairingSessions.get(pairingId);

    if (!session) {
        throw new Error('Pairing session not found');
    }

    if (session.userId !== userId) {
        throw new Error('Unauthorized to cancel this pairing');
    }

    otpPairingSessions.delete(pairingId);
    console.log(`[OTP-Pairing] Session ${pairingId} cancelled by user`);

    return { success: true };
}

/**
 * Mask email for privacy (show first 2 chars + domain)
 */
function maskEmail(email) {
    if (!email) return '***';
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.slice(0, 2)}***@${domain}`;
}

module.exports = {
    initiatePairing,
    verifyOTP,
    getPendingPairings,
    cancelPairing,
    generateOTP
};
