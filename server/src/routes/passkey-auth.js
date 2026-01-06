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
router.post('/register/begin', passkeyRateLimit, validatePasskeyRegistration, async (req, res) => {
    try {
        const { email, name, crossDevice } = req.body;

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

        const result = await webauthnService.generateRegistrationOptions(email, name);

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
router.post('/register/finish', passkeyRateLimit, validatePasskeyAuth, async (req, res) => {
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

        res.json({
            success: true,
            message: 'Account created and logged in successfully',
            userId: registrationResult.userId,
            credentialId: registrationResult.credentialId,
            sessionId: registrationResult.sessionId,
            sessionToken: registrationResult.sessionToken,
            expiresAt: registrationResult.expiresAt,
            emailVerificationId: registrationResult.emailVerificationId,
            userAccount: registrationResult.userAccount
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
                    layer_status: userAccount.layer_status,
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

        console.log(`🔍 Checking device fingerprint: ${deviceFingerprint}`);

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

            console.log(`✅ Found existing device for user: ${existingSession.user_id}`);

            return res.json({
                success: true,
                deviceExists: true,
                userId: existingSession.user_id,
                userEmail: userAccount?.recovery_email,
                lastActivity: existingSession.last_activity
            });
        } else {
            console.log(`🆕 Device fingerprint not found, new device`);

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
router.post('/auth/finish', async (req, res) => {
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

        res.json({
            success: true,
            message: 'Authentication successful',
            sessionId: authResult.sessionId,
            sessionToken: authResult.sessionToken,
            expiresAt: authResult.expiresAt,
            userAccount: authResult.userAccount
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
                layer_status: sessionData.userAccount.layer_status,
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
            const newCredential = new Credential({
                wallet: walletInfo.walletAddress,
                human_id: walletInfo.humanId,
                tier: 'basic', // Initial tier
                last_kyc_at: Math.floor(Date.now() / 1000),
                issuer_id: 'CasperID-System',
                credential_json: JSON.stringify({
                    subject_wallet: walletInfo.walletAddress,
                    tier: 'basic',
                    issued_at: Date.now()
                }),
                credential_hash: crypto.createHash('sha256').update(userAccount.user_id).digest('hex'),
                created_at: new Date()
            });
            await newCredential.save();
            console.log(`✅ Generated initial credential for ${walletInfo.walletAddress}`);
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

        // Check if DID already exists
        if (userAccount.did_address) {
            return res.json({
                success: true,
                message: 'DID already exists',
                did: userAccount.did_address,
                alreadyExists: true
            });
        }

        // Mint DID using Casper blockchain service
        // TODO: Implement actual DID minting when Casper service is ready
        const mockDID = `did:casper:${userAccount.wallet}`;

        // For now, just update the user account with a mock DID
        await UserAccount.updateOne(
            { user_id: userAccount.user_id },
            { did_address: mockDID }
        );

        res.json({
            success: true,
            message: 'DID minted successfully',
            did: mockDID
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
            layer_status: userAccount.layer_status,
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

module.exports = router;