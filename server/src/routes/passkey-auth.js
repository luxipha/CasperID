const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const webauthnService = require('../services/webauthn');
const walletGenerator = require('../services/wallet-generator');
const qrPairingService = require('../services/qr-pairing');
const { UserAccount, EmailVerification, RecoveryRequest, DeviceSession } = require('../database/models');
const { v4: uuidv4 } = require('uuid');
const { eventBus, EVENTS } = require('../services/eventBus');

// Import validation middleware
const {
    validatePasskeyRegistration,
    validatePasskeyAuth,
    validateEmailVerification,
    passkeyRateLimit,
    securityHeaders
} = require('../middleware/validation');
const { extractViewer } = require('../middleware/auth');
const { extractApp } = require('../middleware/app-auth');
const { generateBusinessToken } = require('../utils/jwt-manager');
const { expandScopesToSharedFields } = require('../utils/business-disclosure');
const { resolveRequestedScopes } = require('../utils/business-scopes');
const { buildTrustCapacityDisclosure } = require('../services/business-trust-disclosure');
const { dispatchEvent } = require('../utils/webhook-dispatcher');
const { normalizeEmail, buildEmailQuery } = require('../utils/email-normalizer');
const { WEBHOOK_EVENTS } = require('../constants/webhook-events');

/**
 * Passkey Authentication Routes
 * Handles Layer 0 (biometric) and Layer 1 (wallet creation) authentication
 */

// ============================================
// PASSKEY REGISTRATION (Layer 0)
// ============================================

// Apply security headers to all routes
router.use(securityHeaders);

/**
 * Start passkey registration process
 * POST /api/passkey/register/begin
 */
router.post('/register/begin', passkeyRateLimit, extractViewer, validatePasskeyRegistration, async (req, res) => {
    try {
        const { email, name, crossDevice } = req.body;

        // Check if email is already verified in this session (e.g. from initial OTP)
        // requireAuth/extractViewer populates req.user.email
        const isEmailVerified = !!(req.user && req.user.email && req.user.email.toLowerCase() === email.toLowerCase());

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // WebAuthn credentials are always scoped to CasperID's configured RP ID.
        // Affiliate origins must use the hosted CasperID authorization flow.
        webauthnService.assertOriginCanUseRpID(req.headers.origin);
        const result = await webauthnService.generateRegistrationOptions(email, name, isEmailVerified);

        // If cross-device registration, generate QR code
        let qrCode = null;
        if (crossDevice) {
            const QRCode = require('qrcode');

            const qrPayload = {
                type: 'casperid_registration',
                version: 1,
                userId: result.userId,
                email: email,
                name: name,
                options: result.options,
                serverUrl: process.env.API_BASE_URL || (process.env.API_HOST ? `https://${process.env.API_HOST}` : 'http://localhost:3001'),
                expiresAt: Date.now() + result.expiresIn
            };

            // Create URL that will open mobile pairing page
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const pairingUrl = `${frontendUrl}/pair?data=${encodeURIComponent(JSON.stringify(qrPayload))}`;

            qrCode = {
                dataURL: await QRCode.toDataURL(pairingUrl, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#1A1A2E',
                        light: '#FFFFFF'
                    }
                }),
                payload: qrPayload,
                url: pairingUrl
            };
        }

        res.json({
            success: true,
            userId: result.userId,
            options: result.options,
            expiresIn: result.expiresIn,
            qrCode: qrCode
        });

    } catch (error) {
        console.error('Registration begin failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Complete passkey registration
 * POST /api/passkey/register/finish
 */
router.post('/register/finish', passkeyRateLimit, validatePasskeyAuth, extractApp, async (req, res) => {
    try {
        const { userId, credential, deviceInfo } = req.body;

        if (!userId || !credential) {
            return res.status(400).json({
                success: false,
                error: 'User ID and credential are required'
            });
        }

        // Add IP and user agent to device info
        const enhancedDeviceInfo = {
            ...deviceInfo,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Complete passkey registration
        // Pass allowed_origins from BusinessApp for dynamic origin validation
        const registrationResult = await webauthnService.verifyRegistration(
            userId,
            credential,
            enhancedDeviceInfo,
            req.businessApp?.allowed_origins
        );

        if (!registrationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Registration verification failed'
            });
        }

        // Set session cookie (user is now logged in)
        // Use secure cookies when accessed via HTTPS (ngrok, production, etc.)
        const isSecure = process.env.NODE_ENV === 'production' ||
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https';
        res.cookie('casperid_session', registrationResult.sessionToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax', // 'none' required for cross-site cookies with secure
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // If a BusinessApp sent X-App-ID + X-Api-Secret, also issue an RS256 business token
        // External clients can verify this token locally using /.well-known/jwks.json
        let businessToken = null;
        if (req.businessApp && registrationResult.userAccount) {
            const ua = registrationResult.userAccount;
            const { UserProfile } = require('../database/models');
            const profile = await UserProfile.findOne({ wallet: ua.wallet });
            const name = profile ? (profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null) : (ua.name || null);

            businessToken = generateBusinessToken({
                userId: ua.user_id,
                wallet: ua.wallet,
                humanId: ua.human_id || null,
                name: name,
                verified: ua.email_verified || false,
                tier: ua.tier || 'layer_0',
                email: ua.recovery_email,
                sharedData: expandScopesToSharedFields(resolveRequestedScopes(req.businessApp)),
                trustCapacity: await buildTrustCapacityDisclosure(ua.user_id, req.businessApp)
            }, req.businessApp.app_id);

            // Dispatch webhook
            dispatchEvent(req.businessApp.app_id, WEBHOOK_EVENTS.USER_REGISTERED, {
                user_id: ua.user_id,
                wallet: ua.wallet,
                registered_at: new Date().toISOString()
            }).catch(err => console.error('Webhook dispatch error:', err));
        }

        res.json({
            success: true,
            message: 'Account created and logged in successfully',
            userId: registrationResult.userId,
            credentialId: registrationResult.credentialId,
            sessionId: registrationResult.sessionId,
            sessionToken: registrationResult.sessionToken,
            expiresAt: registrationResult.expiresAt,
            emailVerificationId: registrationResult.emailVerificationId,
            userAccount: registrationResult.userAccount,
            // Only present when X-App-ID was provided:
            ...(businessToken && { business_token: businessToken, app_id: req.businessApp.app_id })
        });

    } catch (error) {
        console.error('Registration finish failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Check registration status for cross-device flow
 * GET /api/passkey/register/:userId/status
 */
router.get('/register/:userId/status', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Check if user account has been created (registration completed)
        const userAccount = await UserAccount.findOne({ user_id: userId });

        if (!userAccount) {
            // Registration not yet completed
            return res.json({
                success: true,
                status: 'pending',
                completed: false
            });
        }

        // Registration completed, return session info if available
        const { DeviceSession } = require('../database/models');
        const latestSession = await DeviceSession.findOne({
            user_id: userId,
            revoked: false,
            expires_at: { $gt: new Date() }
        }).sort({ created_at: -1 });

        if (latestSession) {
            // Set session cookie for the polling desktop device
            // This allows cross-device registration to work properly
            const isSecure = process.env.NODE_ENV === 'production' ||
                req.secure ||
                req.headers['x-forwarded-proto'] === 'https';
            res.cookie('casperid_session', latestSession.session_token, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({
                success: true,
                status: 'completed',
                completed: true,
                sessionToken: latestSession.session_token,
                sessionId: latestSession.session_id,
                expiresAt: latestSession.expires_at,
                userAccount: {
                    user_id: userAccount.user_id,
                    recovery_email: userAccount.recovery_email,
                    tier: userAccount.tier,
                    email_verified: userAccount.email_verified,
                    wallet: userAccount.wallet,
                    metamask_connected: userAccount.metamask_connected,
                    cns_name: userAccount.cns_name || null
                }
            });
        } else {
            res.json({
                success: true,
                status: 'completed',
                completed: true,
                message: 'Registration completed but no active session found'
            });
        }

    } catch (error) {
        console.error('Registration status check failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Start adding a passkey after email-based recovery.
 * POST /api/passkey/recovery/register/begin
 */
router.post('/recovery/register/begin', passkeyRateLimit, async (req, res) => {
    try {
        const { recoveryToken } = req.body;

        if (!recoveryToken) {
            return res.status(400).json({
                success: false,
                error: 'Recovery token is required'
            });
        }

        webauthnService.assertOriginCanUseRpID(req.headers.origin);

        const recoveryRequest = await RecoveryRequest.findOne({
            recovery_id: recoveryToken,
            status: 'email_verified',
            expires_at: { $gt: new Date() }
        });

        if (!recoveryRequest) {
            return res.status(403).json({
                success: false,
                error: 'Recovery session is invalid or expired'
            });
        }

        const userAccount = await UserAccount.findOne({ user_id: recoveryRequest.user_id });
        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'User account not found'
            });
        }

        const result = await webauthnService.generateRecoveryRegistrationOptions(userAccount);

        res.json({
            success: true,
            options: result.options,
            expiresIn: result.expiresIn,
            email: userAccount.recovery_email
        });
    } catch (error) {
        console.error('Recovery registration begin failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Complete adding a passkey after email-based recovery.
 * POST /api/passkey/recovery/register/finish
 */
router.post('/recovery/register/finish', passkeyRateLimit, validatePasskeyAuth, async (req, res) => {
    try {
        const { recoveryToken, credential, deviceInfo } = req.body;

        if (!recoveryToken || !credential) {
            return res.status(400).json({
                success: false,
                error: 'Recovery token and credential are required'
            });
        }

        const recoveryRequest = await RecoveryRequest.findOne({
            recovery_id: recoveryToken,
            status: 'email_verified',
            expires_at: { $gt: new Date() }
        });

        if (!recoveryRequest) {
            return res.status(403).json({
                success: false,
                error: 'Recovery session is invalid or expired'
            });
        }

        const userAccount = await UserAccount.findOne({ user_id: recoveryRequest.user_id });
        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'User account not found'
            });
        }

        const enhancedDeviceInfo = {
            ...deviceInfo,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        const recoveryResult = await webauthnService.verifyRecoveryRegistration(
            userAccount,
            credential,
            enhancedDeviceInfo
        );

        recoveryRequest.status = 'completed';
        recoveryRequest.new_passkey_credential_id = recoveryResult.credentialId;
        recoveryRequest.completed_at = new Date();
        recoveryRequest.verification_steps_completed.push({
            step: 'passkey_registered',
            completed_at: new Date(),
            metadata: {
                credential_id: recoveryResult.credentialId
            }
        });
        await recoveryRequest.save();

        const isSecure = process.env.NODE_ENV === 'production' ||
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https';
        res.cookie('casperid_session', recoveryResult.sessionToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Device passkey added successfully',
            sessionId: recoveryResult.sessionId,
            sessionToken: recoveryResult.sessionToken,
            expiresAt: recoveryResult.expiresAt,
            userAccount: recoveryResult.userAccount
        });
    } catch (error) {
        console.error('Recovery registration finish failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// DEVICE DETECTION
// ============================================

/**
 * Check if device fingerprint already exists
 * POST /api/passkey/device/check
 */
router.post('/device/check', async (req, res) => {
    try {
        const { deviceFingerprint } = req.body;

        if (!deviceFingerprint) {
            return res.status(400).json({
                success: false,
                error: 'Device fingerprint is required'
            });
        }


        // Check if device exists in sessions
        const { DeviceSession } = require('../database/models');
        const existingSession = await DeviceSession.findOne({
            device_fingerprint: deviceFingerprint,
            revoked: false
        });

        if (existingSession) {
            // Get user account info
            const { UserAccount } = require('../database/models');
            const userAccount = await UserAccount.findOne({
                user_id: existingSession.user_id
            });


            return res.json({
                success: true,
                deviceExists: true,
                userId: existingSession.user_id,
                userEmail: userAccount?.recovery_email,
                lastActivity: existingSession.last_activity
            });
        } else {

            return res.json({
                success: true,
                deviceExists: false
            });
        }

    } catch (error) {
        console.error('Device check failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to check device'
        });
    }
});

// ============================================
// PASSKEY AUTHENTICATION
// ============================================

/**
 * Start passkey authentication
 * POST /api/passkey/auth/begin
 */
router.post('/auth/begin', async (req, res) => {
    try {
        const { email } = req.body;

        // WebAuthn credentials are always scoped to CasperID's configured RP ID.
        webauthnService.assertOriginCanUseRpID(req.headers.origin);
        const result = await webauthnService.generateAuthenticationOptions(email);

        res.json({
            success: true,
            challengeId: result.challengeId,
            options: result.options,
            deviceType: result.deviceType,
            transports: result.transports,
            expiresIn: result.expiresIn
        });

    } catch (error) {
        console.error('Authentication begin failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Complete passkey authentication
 * POST /api/passkey/auth/finish
 */
router.post('/auth/finish', extractApp, async (req, res) => {
    try {
        const { challengeId, credential, deviceInfo } = req.body;

        if (!challengeId || !credential) {
            return res.status(400).json({
                success: false,
                error: 'Challenge ID and credential are required'
            });
        }

        // Add IP and user agent to device info
        const enhancedDeviceInfo = {
            ...deviceInfo,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Pass allowed_origins from BusinessApp for dynamic origin validation
        const authResult = await webauthnService.verifyAuthentication(
            challengeId,
            credential,
            enhancedDeviceInfo,
            req.businessApp?.allowed_origins
        );

        if (!authResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Authentication verification failed'
            });
        }

        // Set session cookie (optional - can also use token)
        // Use secure cookies when accessed via HTTPS (ngrok, production, etc.)
        const isSecure = process.env.NODE_ENV === 'production' ||
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https';
        res.cookie('casperid_session', authResult.sessionToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax', // 'none' required for cross-site cookies with secure
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Emit login event
        if (authResult.userAccount) {
            const ua = authResult.userAccount;

            // Check if this is a new device
            const deviceFingerprint = req.get('User-Agent') || 'unknown';
            const { escapeRegex } = require('../utils/email-normalizer');
            const escapedFingerprint = escapeRegex(deviceFingerprint.substring(0, 50));
            const existingSession = await DeviceSession.findOne({
                user_id: ua.user_id,
                device_fingerprint: { $regex: escapedFingerprint, $options: 'i' }
            });

            eventBus.emit(EVENTS.USER_LOGIN, {
                userId: ua.user_id,
                email: ua.recovery_email,
                wallet: ua.wallet,
                method: 'passkey',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                isNewDevice: !existingSession
            });
        }

        // If a BusinessApp sent X-App-ID + X-Api-Secret, also issue an RS256 business token
        let businessToken = null;
        if (req.businessApp && authResult.userAccount) {
            const ua = authResult.userAccount;
            const { UserProfile } = require('../database/models');
            const profile = await UserProfile.findOne({ wallet: ua.wallet });
            const name = profile ? (profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null) : (ua.name || null);

            businessToken = generateBusinessToken({
                userId: ua.user_id,
                wallet: ua.wallet,
                humanId: ua.human_id || null,
                name: name,
                verified: ua.email_verified || false,
                tier: ua.tier || 'layer_0',
                email: ua.recovery_email,
                sharedData: expandScopesToSharedFields(resolveRequestedScopes(req.businessApp)),
                trustCapacity: await buildTrustCapacityDisclosure(ua.user_id, req.businessApp)
            }, req.businessApp.app_id);

            // Emit app authorization event (subscribers handle email, webhook)
            eventBus.emit(EVENTS.USER_APP_AUTH, {
                userId: ua.user_id,
                email: ua.recovery_email,
                wallet: ua.wallet,
                appId: req.businessApp.app_id,
                appName: req.businessApp.name || req.businessApp.app_id,
                scopes: ['profile', 'identity'],
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            // Dispatch webhook (keep for backward compatibility, will be migrated to EventBus)
            dispatchEvent(req.businessApp.app_id, WEBHOOK_EVENTS.USER_VERIFIED, {
                user_id: ua.user_id,
                wallet: ua.wallet,
                verified_at: new Date().toISOString()
            }).catch(err => console.error('Webhook dispatch error:', err));
        }

        res.json({
            success: true,
            message: 'Authentication successful',
            sessionId: authResult.sessionId,
            sessionToken: authResult.sessionToken,
            session_token: authResult.sessionToken, // SDK expects snake_case
            expiresAt: authResult.expiresAt,
            userAccount: authResult.userAccount,
            user: authResult.userAccount, // SDK expects 'user' instead of 'userAccount'
            // Only present when X-App-ID was provided
            ...(businessToken && { business_token: businessToken, app_id: req.businessApp.app_id })
        });

    } catch (error) {
        console.error('Authentication finish failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Validate current session
 * GET /api/passkey/session
 */
router.get('/session', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '') ||
            req.body.sessionToken;

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'No session token provided'
            });
        }

        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        res.json({
            success: true,
            session: {
                sessionId: sessionData.session.session_id,
                userId: sessionData.session.user_id,
                credentialId: sessionData.session.credential_id,
                lastActivity: sessionData.session.last_activity,
                expiresAt: sessionData.session.expires_at
            },
            userAccount: {
                user_id: sessionData.userAccount.user_id,
                recovery_email: sessionData.userAccount.recovery_email,
                tier: sessionData.userAccount.tier,
                email_verified: sessionData.userAccount.email_verified,
                wallet: sessionData.userAccount.wallet,
                metamask_connected: sessionData.userAccount.metamask_connected,
                cns_name: sessionData.userAccount.cns_name || null, // Premium name if registered
                points: sessionData.userAccount.points || 0,
                completed_quests: sessionData.userAccount.completed_quests || []
            }
        });

    } catch (error) {
        console.error('Session validation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Logout and revoke session
 * POST /api/passkey/logout
 */
router.post('/logout', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '') ||
            req.body.sessionToken;

        if (sessionToken) {
            await webauthnService.revokeSession(sessionToken);
        }

        // Clear session cookie (must use same options as when setting)
        const isSecure = process.env.NODE_ENV === 'production' ||
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https';
        res.clearCookie('casperid_session', {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax'
        });

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// QR CODE DEVICE PAIRING
// ============================================

/**
 * Generate QR code for device pairing
 * POST /api/passkey/pairing/generate
 */
router.post('/pairing/generate', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const deviceInfo = {
            deviceName: req.body.deviceName,
            deviceType: req.body.deviceType,
            userAgent: req.get('User-Agent')
        };

        const pairingResult = await qrPairingService.generatePairingQR(sessionToken, deviceInfo);

        res.json({
            success: true,
            pairing: pairingResult
        });

    } catch (error) {
        console.error('QR generation failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Scan QR code and get pairing info
 * POST /api/passkey/pairing/scan
 */
router.post('/pairing/scan', async (req, res) => {
    try {
        const { qrCodeData } = req.body;

        if (!qrCodeData) {
            return res.status(400).json({
                success: false,
                error: 'QR code data is required'
            });
        }

        const pairingInfo = await qrPairingService.scanPairingQR(qrCodeData);

        res.json({
            success: true,
            pairingInfo
        });

    } catch (error) {
        console.error('QR scanning failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Complete device pairing
 * POST /api/passkey/pairing/complete
 */
router.post('/pairing/complete', async (req, res) => {
    try {
        const { pairingId, passkeyData, deviceInfo } = req.body;

        if (!pairingId || !passkeyData) {
            return res.status(400).json({
                success: false,
                error: 'Pairing ID and passkey data are required'
            });
        }

        const enhancedDeviceInfo = {
            ...deviceInfo,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        const pairingResult = await qrPairingService.completePairing(
            pairingId,
            passkeyData,
            enhancedDeviceInfo
        );

        // Set session cookie for new device
        // Use secure cookies when accessed via HTTPS (ngrok, production, etc.)
        const isSecure = process.env.NODE_ENV === 'production' ||
            req.secure ||
            req.headers['x-forwarded-proto'] === 'https';
        res.cookie('casperid_session', pairingResult.sessionToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax', // 'none' required for cross-site cookies with secure
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            success: true,
            message: 'Device pairing completed successfully',
            pairing: pairingResult
        });

    } catch (error) {
        console.error('Pairing completion failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get pairing status
 * GET /api/passkey/pairing/:pairingId/status
 */
router.get('/pairing/:pairingId/status', async (req, res) => {
    try {
        const { pairingId } = req.params;

        const status = await qrPairingService.getPairingStatus(pairingId);

        res.json({
            success: true,
            status
        });

    } catch (error) {
        console.error('Pairing status check failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// DEVICE MANAGEMENT
// ============================================

/**
 * List user devices
 * GET /api/passkey/devices
 */
router.get('/devices', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const devices = await qrPairingService.getUserDevices(sessionToken);

        res.json({
            success: true,
            devices
        });

    } catch (error) {
        console.error('Device listing failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Revoke device access
 * DELETE /api/passkey/devices/:credentialId
 */
router.delete('/devices/:credentialId', async (req, res) => {
    try {
        const { credentialId } = req.params;
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await qrPairingService.revokeDevice(sessionToken, credentialId);

        res.json({
            success: true,
            message: 'Device access revoked',
            result
        });

    } catch (error) {
        console.error('Device revocation failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// WALLET GENERATION
// ============================================

/**
 * Generate wallet for authenticated user
 * POST /api/passkey/wallet/generate
 */
router.post('/wallet/generate', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Validate session and get user info
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        const userAccount = sessionData.userAccount;

        // Check if user already has a wallet
        if (userAccount.wallet) {
            return res.json({
                success: true,
                message: 'Wallet already exists',
                walletInfo: {
                    walletAddress: userAccount.wallet,
                    publicKey: userAccount.public_key
                },
                alreadyExists: true
            });
        }

        // Generate wallet using the wallet generator service
        const walletInfo = await walletGenerator.generateWalletFromPasskey(
            userAccount.active_passkey_id,
            userAccount.recovery_email,
            userAccount.user_salt
        );

        // Update user account with wallet info
        // Update user account with wallet info
        await walletGenerator.updateUserAccountWithWallet(
            userAccount.user_id,
            walletInfo
        );

        // CREATE INITIAL CREDENTIAL (Identitiy Badge)
        // This ensures the user appears in the 'credentials' table
        const { Credential, UserProfile } = require('../database/models');
        const { v4: uuidv4 } = require('uuid');

        const existingCredential = await Credential.findOne({ wallet: walletInfo.walletAddress });

        if (!existingCredential) {
            // Use the shared credential minter to log on-chain immediately
            const { mintCredential } = require('../utils/credential-minter');

            // Create a mock request object for the minter
            const mockRequest = {
                wallet: walletInfo.walletAddress,
                tier: 'layer_1', // Basic Tier
                status: 'approved',
                first_name: '',
                last_name: '',
                email: userAccount.recovery_email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                save: async () => { } // Mock save function
            };

            try {
                await mintCredential(mockRequest);
            } catch (mintError) {
                // Fallback to DB-only if chain fails, to not block onboarding? 
                // For now, allow error to bubble up or log it.
                // We'll proceed silently to ensure user can still login.
            }
        }

        // ENSURE USER PROFILE EXISTS (Explicit Creation)
        await UserProfile.findOneAndUpdate(
            { wallet: walletInfo.walletAddress },
            {
                $setOnInsert: {
                    wallet: walletInfo.walletAddress,
                    email: userAccount.recovery_email,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: 'Wallet generated successfully',
            walletInfo: {
                walletAddress: walletInfo.walletAddress,
                humanId: walletInfo.humanId,
                publicKey: walletInfo.publicKey
            }
        });

    } catch (error) {
        console.error('Wallet generation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// DID MINTING
// ============================================

/**
 * Mint DID on Casper blockchain
 * POST /api/passkey/did/mint
 */
router.post('/did/mint', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const sessionData = await webauthnService.validateSession(sessionToken);
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const userAccount = sessionData.userAccount;

        // Validate wallet exists before attempting DID operations
        if (!userAccount.wallet) {
            return res.status(400).json({
                success: false,
                error: 'Wallet not yet created. Please wait for wallet generation to complete.',
                code: 'WALLET_REQUIRED'
            });
        }

        // Check if DID already exists in database
        if (userAccount.did_address) {
            return res.json({
                success: true,
                message: 'DID already exists',
                did: userAccount.did_address,
                alreadyExists: true
            });
        }

        // Mint DID using Casper blockchain service
        // Real implementation using the Identity Registry
        const casperService = require('../services/casper');


        // Safety check: Query on-chain state before minting
        // This prevents DIDAlreadyExists errors when DB is out of sync
        const existingOnChain = await casperService.getVerificationStatus(userAccount.wallet);
        if (existingOnChain) {
            // DID exists on-chain but not in DB - sync and return
            const realDID = `did:casper:${userAccount.wallet}`;
            await UserAccount.updateOne(
                { user_id: userAccount.user_id },
                {
                    $set: {
                        did_address: realDID,
                        did_minted: true,
                        did_mint_status: 'confirmed'
                    },
                    $unset: { did_mint_error: 1, did_mint_started_at: 1 }
                }
            );
            return res.json({
                success: true,
                message: 'DID already exists on-chain (synced to database)',
                did: realDID,
                alreadyExists: true
            });
        }

        const mintLockTimeoutMs = Number(process.env.DID_MINT_LOCK_TIMEOUT_MS || 300000);
        const staleMintCutoff = new Date(Date.now() - mintLockTimeoutMs);
        const mintClaim = await UserAccount.findOneAndUpdate(
            {
                user_id: userAccount.user_id,
                did_minted: { $ne: true },
                $or: [
                    { did_mint_status: { $ne: 'pending' } },
                    { did_mint_started_at: { $lt: staleMintCutoff } }
                ]
            },
            {
                $set: {
                    did_mint_status: 'pending',
                    did_mint_started_at: new Date()
                },
                $unset: { did_mint_error: 1 }
            },
            { new: true }
        );

        if (!mintClaim) {
            return res.status(409).json({
                success: false,
                error: 'DID minting is already in progress. Please retry shortly.',
                code: 'DID_MINT_IN_PROGRESS'
            });
        }

        let txHash;
        try {
            txHash = await casperService.mintDID(userAccount.wallet, userAccount.tier || 'layer_1');
        } catch (mintError) {
            await UserAccount.updateOne(
                { user_id: userAccount.user_id, did_mint_status: 'pending' },
                {
                    $set: {
                        did_minted: false,
                        did_mint_status: 'failed',
                        did_mint_error: mintError.message
                    },
                    $unset: { did_mint_started_at: 1 }
                }
            ).catch((rollbackError) => {
                console.error('Failed to release DID mint lock:', rollbackError.message);
            });
            throw mintError;
        }

        const realDID = `did:casper:${userAccount.wallet}`;

        // Update user account with real DID
        // Also ensure linked_wallets has the Casper wallet entry
        await UserAccount.updateOne(
            { user_id: userAccount.user_id },
            {
                $set: {
                    did_address: realDID,
                    did_minted: true,
                    did_mint_status: 'confirmed'
                },
                $unset: { did_mint_error: 1, did_mint_started_at: 1 },
                $addToSet: {
                    linked_wallets: {
                        chain: 'casper',
                        address: userAccount.wallet,
                        verified: true,
                        verified_at: new Date()
                    }
                }
            }
        );

        res.json({
            success: true,
            message: 'DID minted successfully on Casper blockchain',
            did: realDID,
            tx_hash: txHash
        });

    } catch (error) {
        console.error('DID minting failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/passkey/did/export
 * Export DID document and metadata
 */
router.get('/did/export', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const sessionData = await webauthnService.validateSession(sessionToken);
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const userAccount = sessionData.userAccount;

        // Build DID export document
        const didExport = {
            did: userAccount.did_address || null,
            wallet: userAccount.wallet,
            recovery_email: userAccount.recovery_email,
            email_verified: userAccount.email_verified,
            tier: userAccount.tier,
            created_at: userAccount.created_at,
            export_date: new Date().toISOString(),
            metadata: {
                user_id: userAccount.user_id,
                active_passkey_id: userAccount.active_passkey_id,
                backup_passkeys_count: userAccount.backup_passkeys?.length || 0
            }
        };

        res.json({
            success: true,
            data: didExport
        });

    } catch (error) {
        console.error('DID export failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// SECURITY SETUP
// ============================================

/**
 * Generate backup recovery keys
 * POST /api/passkey/security/backup-keys
 */
router.post('/security/backup-keys', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const sessionData = await webauthnService.validateSession(sessionToken);
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const userAccount = sessionData.userAccount;

        // Generate backup recovery data using wallet generator
        // Use a temporary master password derived from user data for automatic backup
        const tempMasterPassword = crypto.createHash('sha256')
            .update(userAccount.user_salt + userAccount.active_passkey_id)
            .digest('hex');

        const backupData = await walletGenerator.generateBackupRecoveryData(
            userAccount.user_id,
            tempMasterPassword
        );

        // Generate a backup ID for reference
        const backupId = `backup_${userAccount.user_id}_${Date.now()}`;

        res.json({
            success: true,
            message: 'Backup keys generated successfully',
            backupId: backupId,
            backup: {
                encrypted: backupData.encryptedBackup,
                authTag: backupData.authTag,
                iv: backupData.iv,
                version: backupData.version
            }
        });

    } catch (error) {
        console.error('Backup key generation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Initialize security preferences and device fingerprinting
 * POST /api/passkey/security/initialize
 */
router.post('/security/initialize', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const sessionData = await webauthnService.validateSession(sessionToken);
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const { deviceFingerprint, timezone, language, screenResolution } = req.body;

        // Update user account with security preferences
        await UserAccount.updateOne(
            { user_id: sessionData.userAccount.user_id },
            {
                timezone,
                language,
                security_preferences: {
                    deviceFingerprint,
                    screenResolution,
                    setupCompleted: true,
                    setupDate: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: 'Security preferences initialized successfully'
        });

    } catch (error) {
        console.error('Security initialization failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * Record successful account creation
 * POST /api/passkey/analytics/account-created
 */
router.post('/analytics/account-created', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const sessionData = await webauthnService.validateSession(sessionToken);
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        // Update user account to mark onboarding as completed
        await UserAccount.updateOne(
            { user_id: sessionData.userAccount.user_id },
            {
                onboarding_completed: true,
                onboarding_completed_at: new Date()
            }
        );

        res.json({
            success: true,
            message: 'Account creation recorded successfully'
        });

    } catch (error) {
        console.error('Account creation recording failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// BUSINESS SCOPED PROFILE ENDPOINT (Day 3)
// ============================================

/**
 * GET /api/passkey/me
 *
 * Returns the authenticated user's profile, scoped to what the business app
 * is allowed to see. Works with BOTH token types:
 *
 *   1. Device session token (CasperID native) — returns full profile
 *   2. RS256 business_token (X-App-ID flow)   — returns only whitelisted fields
 *
 * External clients should pass the business_token from auth/finish:
 *   Authorization: Bearer <business_token>
 *
 * Optionally also accepts origin scoping via X-App-ID header.
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];

        const { verifyAnyToken } = require('../utils/jwt-manager');
        const { DeviceSession, UserAccount, UserProfile } = require('../database/models');

        let userAccount = null;
        let isBusinessToken = false;
        let sharedData = [];
        let scopedAppId = null;
        let selectedContext = null;

        // Strategy 1: RS256 business token or HS256 JWT
        const decoded = verifyAnyToken(token);
        if (decoded) {
            isBusinessToken = decoded._alg === 'RS256';
            sharedData = decoded.sharedData || [];
            scopedAppId = decoded.app_id || null;
            selectedContext = decoded.selected_context || null;

            if (isBusinessToken) {
                const userId = decoded.sub || decoded.userId;
                userAccount = await UserAccount.findOne({
                    $or: [{ user_id: userId }, { wallet: decoded.wallet }].filter(c => Object.values(c)[0])
                });
            } else {
                userAccount = await UserAccount.findOne({ user_id: decoded.userId });
            }
        }

        // Strategy 2: Opaque device session token (32-byte hex, not a JWT)
        if (!userAccount) {
            const deviceSession = await DeviceSession.findOne({
                session_token: token,
                revoked: false,
                expires_at: { $gt: new Date() }
            });
            if (deviceSession) {
                userAccount = await UserAccount.findOne({ user_id: deviceSession.user_id });
            } else if (!decoded) {
                return res.status(401).json({ success: false, error: 'Invalid or expired token' });
            }
        }

        if (!userAccount) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Build scoped profile
        // For business tokens, only expose fields listed in sharedData claim

        const userProfile = userAccount.wallet
            ? await UserProfile.findOne({ wallet: userAccount.wallet }).lean()
            : null;
        const resolvedName = userProfile?.name ||
            [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') ||
            userAccount.name ||
            null;
        const persona = isBusinessToken && selectedContext?.type === 'persona'
            ? userAccount.context_dids?.find((contextDid) => contextDid.did === selectedContext.did && contextDid.routing_type !== 'wallet')
            : null;
        const personaDisclosures = persona?.disclosures || {};
        const personaDisplayName =
            [personaDisclosures.firstName ? userProfile?.first_name : null, personaDisclosures.lastName ? userProfile?.last_name : null]
                .filter(Boolean)
                .join(' ') ||
            selectedContext?.name ||
            selectedContext?.alias ||
            null;
        const exposedName = persona ? personaDisplayName : resolvedName;
        const exposedHumanId = persona
            ? (selectedContext?.name || selectedContext?.alias || persona.did)
            : (userProfile?.human_id || userAccount.human_id || null);
        const exposedEmail = persona
            ? (personaDisclosures.email ? (userProfile?.email || userAccount.recovery_email || null) : null)
            : (userAccount.recovery_email || null);
        const exposedWallet = persona && persona.routing_type === 'wallet'
            ? persona.target_wallet || null
            : userAccount.wallet || null;

        const profile = {
            user_id: userAccount.user_id,
            verified: userAccount.email_verified,
            tier: userAccount.tier,
            ...((!isBusinessToken || sharedData.includes('name')) && exposedName && {
                name: exposedName
            }),
            ...((!isBusinessToken || sharedData.includes('email')) && exposedEmail && {
                email: exposedEmail
            }),
            ...((!isBusinessToken || sharedData.includes('wallet')) && exposedWallet && {
                wallet: exposedWallet
            }),
            ...((!isBusinessToken || sharedData.includes('human_id')) && exposedHumanId && {
                human_id: exposedHumanId
            }),
            ...(isBusinessToken && selectedContext ? {
                selected_context: selectedContext
            } : {})
        };

        res.json({
            success: true,
            profile,
            ...(isBusinessToken && {
                scoped_to_app: scopedAppId,
                token_type: 'business',
                alg: 'RS256'
            })
        });
    } catch (error) {
        console.error('[Passkey/me] Error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
        }
    }
});

/**
 * Verify Passkey for Export DID Purpose
 * POST /api/passkey/export-did-verify
 * Verifies passkey authentication for export-did purpose and returns verification token
 */
router.post('/export-did-verify', require('../middleware/auth').requireAuth, async (req, res) => {
    try {
        const { challengeId, credential, purpose } = req.body;
        const userId = req.user.userId || req.user.wallet;

        if (!challengeId || !credential || purpose !== 'export-did') {
            return res.status(400).json({
                success: false,
                error: 'Challenge ID, credential, and valid purpose are required'
            });
        }

        // Get actual user_id from database
        const userAccount = await UserAccount.findOne({
            $or: [
                { user_id: userId },
                { wallet: userId }
            ]
        });

        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'User account not found'
            });
        }

        // Verify passkey authentication
        const authResult = await webauthnService.verifyAuthentication(
            challengeId,
            credential,
            {}
        );

        if (!authResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Passkey verification failed'
            });
        }

        // Check if the verified user matches the requesting user
        if (authResult.userAccount.user_id !== userAccount.user_id) {
            return res.status(403).json({
                success: false,
                error: 'Passkey does not match authenticated user'
            });
        }

        // Create verification token for export-did (similar to OTP flow)
        const verificationToken = `${userAccount.user_id}-${purpose}-${Date.now()}-verified`;
        await EmailVerification.create({
            verification_id: verificationToken,
            email: userAccount.recovery_email,
            user_id: userAccount.user_id,
            verification_code: 'verified',
            type: 'verification_token',
            purpose: `${purpose}-verified`,
            verified: true,
            verified_at: new Date(),
            expires_at: new Date(Date.now() + (5 * 60 * 1000)) // 5 minutes validity
        });

        res.json({
            success: true,
            message: 'Passkey verified successfully',
            purpose,
            validFor: 5 * 60 * 1000, // 5 minutes
            verificationToken
        });

    } catch (error) {
        console.error('Passkey export-did verification failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify passkey'
        });
    }
});

module.exports = router;
