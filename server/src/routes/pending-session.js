/**
 * Pending Session Routes
 * Handles cross-device passkey registration flow
 * 
 * Flow:
 * 1. Desktop creates pending session after OTP verification
 * 2. Mobile scans QR, fetches session data
 * 3. Mobile registers passkey and completes session
 * 4. Desktop polls and receives session token
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { UserAccount, PasskeyCredential, DeviceSession } = require('../database/models');

// In-memory storage for pending sessions (use Redis in production)
const pendingSessions = new Map();

// Cleanup expired sessions every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, session] of pendingSessions.entries()) {
        if (now > session.expiresAt) {
            pendingSessions.delete(key);
        }
    }
}, 60000);

/**
 * POST /api/pending-session/create
 * Creates a new pending session for mobile passkey registration
 * Called by desktop after OTP verification
 */
router.post('/create', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Generate session identifiers
        const sessionId = uuidv4();
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

        // Build the mobile registration URL (this is what phones can scan and open)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const mobileRegisterUrl = `${frontendUrl}/mobile/register/${sessionId}`;

        // Generate QR code with URL (not JSON - phones can open URLs directly)
        const qrCodeDataURL = await QRCode.toDataURL(mobileRegisterUrl, {
            width: 280,
            margin: 2,
            color: {
                dark: '#1A1A2E',
                light: '#FFFFFF'
            }
        });

        // Store pending session
        pendingSessions.set(sessionId, {
            email,
            sessionToken,
            expiresAt,
            status: 'pending', // pending -> completed
            createdAt: Date.now(),
            completedData: null
        });

        console.log(`[PendingSession] Created session ${sessionId} for ${email}`);

        res.json({
            success: true,
            sessionId,
            qrCode: {
                dataURL: qrCodeDataURL,
                mobileUrl: mobileRegisterUrl
            },
            expiresAt,
            expiresIn: 5 * 60 * 1000
        });

    } catch (error) {
        console.error('[PendingSession] Create error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create pending session'
        });
    }
});

/**
 * GET /api/pending-session/:sessionId
 * Fetches pending session data (for mobile after QR scan)
 */
router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = pendingSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found or expired'
            });
        }

        if (Date.now() > session.expiresAt) {
            pendingSessions.delete(sessionId);
            return res.status(400).json({
                success: false,
                error: 'Session has expired'
            });
        }

        if (session.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Session already completed'
            });
        }

        res.json({
            success: true,
            session: {
                email: session.email,
                expiresAt: session.expiresAt
            }
        });

    } catch (error) {
        console.error('[PendingSession] Get error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get session'
        });
    }
});

/**
 * POST /api/pending-session/:sessionId/complete
 * Completes the pending session with passkey data (called from mobile)
 */
router.post('/:sessionId/complete', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { credentialId, publicKey, counter, transports, deviceInfo } = req.body;

        const session = pendingSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found or expired'
            });
        }

        if (Date.now() > session.expiresAt) {
            pendingSessions.delete(sessionId);
            return res.status(400).json({
                success: false,
                error: 'Session has expired'
            });
        }

        if (session.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Session already completed'
            });
        }

        if (!credentialId || !publicKey) {
            return res.status(400).json({
                success: false,
                error: 'Credential data is required'
            });
        }

        // Find or create user account
        let userAccount = await UserAccount.findOne({ recovery_email: session.email });

        if (!userAccount) {
            // Create new user account
            const userId = uuidv4();
            userAccount = new UserAccount({
                user_id: userId,
                recovery_email: session.email,
                email_verified: true, // OTP was already verified
                tier: 'layer_1',
                created_at: new Date()
            });
            await userAccount.save();
            console.log(`[PendingSession] Created new user account for ${session.email}`);
        }

        // Create passkey credential
        const passkeyCredential = new PasskeyCredential({
            user_id: userAccount.user_id,
            credential_id: credentialId,
            credential_public_key: Buffer.from(publicKey, 'base64'),
            counter: counter || 0,
            device_type: deviceInfo?.deviceType || 'mobile',
            device_name: deviceInfo?.deviceName || 'Mobile Device',
            transports: transports || ['internal'],
            backup_eligible: true,
            backup_state: false,
            is_primary: true,
            created_at: new Date()
        });

        await passkeyCredential.save();
        console.log(`[PendingSession] Created passkey for user ${userAccount.user_id}`);

        // Create device session for desktop
        const desktopSessionId = uuidv4();
        const desktopSessionToken = crypto.randomBytes(64).toString('hex');
        const sessionExpiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

        const deviceSession = new DeviceSession({
            session_id: desktopSessionId,
            user_id: userAccount.user_id,
            credential_id: credentialId,
            session_token: desktopSessionToken,
            device_fingerprint: 'desktop-via-mobile-handoff',
            expires_at: sessionExpiresAt
        });

        await deviceSession.save();

        // Mark pending session as completed
        session.status = 'completed';
        session.completedData = {
            userId: userAccount.user_id,
            sessionToken: desktopSessionToken,
            expiresAt: sessionExpiresAt.toISOString(),
            userAccount: {
                user_id: userAccount.user_id,
                recovery_email: userAccount.recovery_email,
                tier: userAccount.tier,
                wallet: userAccount.wallet
            }
        };

        console.log(`[PendingSession] Session ${sessionId} completed successfully`);

        res.json({
            success: true,
            message: 'Passkey registered successfully'
        });

    } catch (error) {
        console.error('[PendingSession] Complete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete session'
        });
    }
});

/**
 * GET /api/pending-session/:sessionId/status
 * Polling endpoint for desktop to check if mobile completed registration
 */
router.get('/:sessionId/status', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = pendingSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found or expired'
            });
        }

        if (Date.now() > session.expiresAt && session.status !== 'completed') {
            pendingSessions.delete(sessionId);
            return res.json({
                success: true,
                status: 'expired'
            });
        }

        if (session.status === 'completed' && session.completedData) {
            // Clean up after delivering completion
            setTimeout(() => pendingSessions.delete(sessionId), 5000);

            return res.json({
                success: true,
                status: 'completed',
                sessionToken: session.completedData.sessionToken,
                expiresAt: session.completedData.expiresAt,
                userAccount: session.completedData.userAccount
            });
        }

        res.json({
            success: true,
            status: 'pending',
            expiresAt: session.expiresAt
        });

    } catch (error) {
        console.error('[PendingSession] Status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get session status'
        });
    }
});

module.exports = router;
