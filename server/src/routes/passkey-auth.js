const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const webauthnService = require('../services/webauthn');
const walletGenerator = require('../services/wallet-generator');
const qrPairingService = require('../services/qr-pairing');
const { UserAccount, EmailVerification, RecoveryRequest } = require('../database/models');
const { v4: uuidv4 } = require('uuid');

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
const { dispatchEvent } = require('../utils/webhook-dispatcher');

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

        if (isEmailVerified) {
            console.log(`[Passkey] Suppressing redundant OTP for pre-verified email: ${email}`);
        }

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
                serverUrl: process.env.API_BASE_URL || 'http://localhost:3001',
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
        const registrationResult = await webauthnService.verifyRegistration(
            userId,
            credential,
            enhancedDeviceInfo
        );

        if (!registrationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Registration verification failed'
            });
        }

        // Set session cookie (user is now logged in)
        res.cookie('casperid_session', registrationResult.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // If a BusinessApp sent X-App-ID + X-Api-Secret, also issue an RS256 business token
        // External clients can verify this token locally using /.well-known/jwks.json
        let businessToken = null;
        if (req.businessApp && registrationResult.userAccount) {
            const ua = registrationResult.userAccount;
            businessToken = generateBusinessToken({
                userId: ua.user_id,
                wallet: ua.wallet,
                humanId: ua.human_id || null,
                verified: ua.email_verified || false,
                tier: ua.tier || 'layer_0',
                email: ua.recovery_email,
                sharedData: []
            }, req.businessApp.app_id);

            // Dispatch webhook
            dispatchEvent(req.businessApp.app_id, 'user.registered', {
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
                    metamask_connected: userAccount.metamask_connected
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
// EMAIL VERIFICATION
// ============================================

/**
 * Verify email with code
 * POST /api/passkey/verify-email
 */
router.post('/verify-email', passkeyRateLimit, validateEmailVerification, async (req, res) => {
    try {
        const { verificationId, code } = req.body;

        if (!verificationId || !code) {
            return res.status(400).json({
                success: false,
                error: 'Verification ID and code are required'
            });
        }

        const verificationResult = await webauthnService.verifyEmailCode(verificationId, code);

        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Email verification failed'
            });
        }

        // Generate wallet after email verification (Layer 1)
        const userAccount = await UserAccount.findOne({ user_id: verificationResult.userId });

        if (userAccount && userAccount.active_passkey_id) {
            try {
                const walletInfo = await walletGenerator.generateWalletFromPasskey(
                    userAccount.active_passkey_id,
                    userAccount.recovery_email,
                    userAccount.user_salt
                );

                // Update user account with wallet info
                await walletGenerator.updateUserAccountWithWallet(
                    verificationResult.userId,
                    walletInfo
                );

                res.json({
                    success: true,
                    message: 'Email verified and wallet created',
                    userId: verificationResult.userId,
                    emailVerified: true,
                    layerStatus: 'layer_1',
                    walletInfo: {
                        walletAddress: walletInfo.walletAddress,
                        humanId: walletInfo.humanId,
                        publicKey: walletInfo.publicKey
                    }
                });

            } catch (walletError) {
                console.error('Wallet creation failed:', walletError);
                res.json({
                    success: true,
                    message: 'Email verified but wallet creation failed',
                    userId: verificationResult.userId,
                    emailVerified: true,
                    walletCreationError: walletError.message
                });
            }
        } else {
            res.json({
                success: true,
                message: 'Email verified',
                userId: verificationResult.userId,
                emailVerified: true
            });
        }

    } catch (error) {
        console.error('Email verification failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Resend email verification
 * POST /api/passkey/resend-verification
 */
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const userAccount = await UserAccount.findOne({
            recovery_email: email,
            email_verified: false
        });

        if (!userAccount) {
            return res.status(400).json({
                success: false,
                error: 'User account not found or already verified'
            });
        }

        const emailVerificationId = await webauthnService.initializeEmailVerification(
            email,
            userAccount.user_id,
            'registration'
        );

        res.json({
            success: true,
            message: 'Verification email sent',
            emailVerificationId
        });

    } catch (error) {
        console.error('Resend verification failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
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

        const result = await webauthnService.generateAuthenticationOptions(email);

        res.json({
            success: true,
            challengeId: result.challengeId,
            options: result.options,
            deviceType: result.deviceType,
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

        const authResult = await webauthnService.verifyAuthentication(
            challengeId,
            credential,
            enhancedDeviceInfo
        );

        if (!authResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Authentication verification failed'
            });
        }

        // Set session cookie (optional - can also use token)
        res.cookie('casperid_session', authResult.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // If a BusinessApp sent X-App-ID + X-Api-Secret, also issue an RS256 business token
        let businessToken = null;
        if (req.businessApp && authResult.userAccount) {
            const ua = authResult.userAccount;
            businessToken = generateBusinessToken({
                userId: ua.user_id,
                wallet: ua.wallet,
                humanId: ua.human_id || null,
                verified: ua.email_verified || false,
                tier: ua.tier || 'layer_0',
                email: ua.recovery_email,
                sharedData: []
            }, req.businessApp.app_id);

            // Dispatch webhook
            dispatchEvent(req.businessApp.app_id, 'user.verified', {
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
            expiresAt: authResult.expiresAt,
            userAccount: authResult.userAccount,
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
                metamask_connected: sessionData.userAccount.metamask_connected
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

        // Clear session cookie
        res.clearCookie('casperid_session');

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
        res.cookie('casperid_session', pairingResult.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
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
            console.log(`[Layer 1] Initiating on-chain verification for ${walletInfo.walletAddress}`);

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
                const result = await mintCredential(mockRequest);
                console.log(`✅ Generated initial on-chain credential for ${walletInfo.walletAddress}: ${result.tx_hash}`);
            } catch (mintError) {
                console.error('❌ Failed to mint initial credential:', mintError);
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
        console.log(`✅ Ensured UserProfile exists for ${walletInfo.walletAddress}`);

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
                { did_address: realDID, did_minted: true }
            );
            console.log(`[DID] Synced existing on-chain DID to DB for ${userAccount.wallet}`);
            return res.json({
                success: true,
                message: 'DID already exists on-chain (synced to database)',
                did: realDID,
                alreadyExists: true
            });
        }

        // Database-level race condition guard: Check did_minted flag
        // Reload userAccount to get latest state
        const freshAccount = await UserAccount.findOne({ user_id: userAccount.user_id });
        if (freshAccount?.did_minted) {
            console.log(`[DID] Mint already in progress for ${userAccount.wallet} (skipping)`);
            return res.json({
                success: true,
                message: 'DID minting already in progress',
                did: freshAccount.did_address || `did:casper:${userAccount.wallet}`,
                alreadyExists: true
            });
        }

        // Set did_minted flag IMMEDIATELY to prevent race conditions
        await UserAccount.updateOne(
            { user_id: userAccount.user_id },
            { $set: { did_minted: true } }
        );

        console.log(`[DID] Minting Master DID for ${userAccount.wallet}`);
        const txHash = await casperService.mintDID(userAccount.wallet, userAccount.tier || 'layer_1');

        const realDID = `did:casper:${userAccount.wallet}`;

        // Update user account with real DID
        // Also ensure linked_wallets has the Casper wallet entry
        await UserAccount.updateOne(
            { user_id: userAccount.user_id },
            {
                did_address: realDID,
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

        // TODO: Add to analytics service when available
        console.log(`📊 Account creation completed for user: ${sessionData.userAccount.user_id}`);

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
// ACCOUNT RECOVERY
// ============================================

/**
 * Start account recovery by email
 * POST /api/passkey/recovery/begin
 */
router.post('/recovery/begin', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const userAccount = await UserAccount.findOne({
            recovery_email: email
        });

        if (!userAccount) {
            // Don't reveal if account exists for security
            return res.json({
                success: true,
                message: 'If an account with this email exists, recovery instructions have been sent'
            });
        }

        const emailVerificationId = await webauthnService.initializeEmailVerification(
            email,
            userAccount.user_id,
            'recovery'
        );

        res.json({
            success: true,
            message: 'Recovery email sent',
            emailVerificationId
        });

    } catch (error) {
        console.error('Recovery begin failed:', error);
        res.status(500).json({
            success: false,
            error: 'Recovery process failed'
        });
    }
});

/**
 * Verify recovery email and allow new passkey
 * POST /api/passkey/recovery/verify
 */
router.post('/recovery/verify', async (req, res) => {
    try {
        const { verificationId, code } = req.body;

        const verificationResult = await webauthnService.verifyEmailCode(verificationId, code);

        if (!verificationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Verification failed'
            });
        }

        // User can now register new passkey for recovery
        const userAccount = await UserAccount.findOne({
            user_id: verificationResult.userId
        });

        res.json({
            success: true,
            message: 'Email verified for recovery',
            userId: verificationResult.userId,
            userEmail: userAccount ? userAccount.recovery_email : null,
            canRegisterNewPasskey: true
        });

    } catch (error) {
        console.error('Recovery verification failed:', error);
        res.status(400).json({
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
        const { DeviceSession, UserAccount } = require('../database/models');

        let userAccount = null;
        let isBusinessToken = false;
        let sharedData = [];
        let scopedAppId = null;

        // Strategy 1: RS256 business token or HS256 JWT
        const decoded = verifyAnyToken(token);
        if (decoded) {
            isBusinessToken = decoded._alg === 'RS256';
            sharedData = decoded.sharedData || [];
            scopedAppId = decoded.app_id || null;

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

        const profile = {
            user_id: userAccount.user_id,
            verified: userAccount.email_verified,
            tier: userAccount.tier,
            ...((!isBusinessToken || sharedData.includes('email')) && userAccount.recovery_email && {
                email: userAccount.recovery_email
            }),
            ...((!isBusinessToken || sharedData.includes('wallet')) && userAccount.wallet && {
                wallet: userAccount.wallet
            }),
            ...((!isBusinessToken || sharedData.includes('human_id')) && userAccount.human_id && {
                human_id: userAccount.human_id
            })
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

module.exports = router;