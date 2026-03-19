/**
 * CasperID Authentication Routes
 * Handles "Sign in with CasperID" login flow
 */

const express = require('express');
const router = express.Router();
const { Credential, LoginSession, UserAccount } = require('../database/models');
const { generateToken, verifyToken, refreshToken } = require('../utils/jwt-manager');
const { generateNonce, validateNonce, verifyWalletSignature, createSignatureMessage } = require('../utils/signature-verifier');

/**
 * GET /api/casperid/nonce
 * Generate a nonce for signature request
 */
router.get('/nonce', (req, res) => {
    const nonce = generateNonce();
    res.json({
        nonce,
        message: 'Sign this nonce with your Casper wallet',
        expiresIn: 300 // 5 minutes
    });
});

/**
 * POST /api/casperid/login
 * Authenticate user and issue JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { wallet, signature, nonce, platform, requestedData } = req.body;

        // Validation
        if (!wallet || !signature || !nonce) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: wallet, signature, nonce'
            });
        }

        // Validate nonce
        if (!validateNonce(nonce)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired nonce'
            });
        }

        // Verify signature
        const message = createSignatureMessage(wallet, platform || 'unknown', nonce);
        const isValidSignature = verifyWalletSignature(message, signature, wallet);
        if (!isValidSignature) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }


        // Check if user is verified
        const credential = await Credential.findOne({ wallet, revoked: false });

        if (!credential) {
            return res.status(404).json({
                success: false,
                error: 'User not verified',
                message: 'Please complete verification at casperid.com/me before signing in'
            });
        }

        // Fetch user account to get premium cns_name if available
        const userAccount = await UserAccount.findOne({ wallet });

        // Prepare user data for token
        const userData = {
            wallet: credential.wallet,
            humanId: credential.human_id || 'unknown',
            cnsName: userAccount?.cns_name || null, // Include premium name if registered
            verified: true,
            tier: credential.tier,
            sharedData: requestedData || []
        };

        // Generate JWT token
        const token = generateToken(userData, platform || 'unknown');

        // Calculate expiration
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store session in database
        const session = new LoginSession({
            wallet: credential.wallet,
            token,
            platform: platform || 'unknown',
            sharedData: requestedData || [],
            ip: req.ip,
            userAgent: req.get('user-agent'),
            expiresAt
        });

        await session.save();


        // Respond with token and user data
        res.json({
            success: true,
            token,
            expiresIn: 86400, // 24 hours in seconds
            user: {
                wallet: credential.wallet,
                humanId: credential.human_id,
                cnsName: userAccount?.cns_name || null,
                verified: true,
                tier: credential.tier,
                sharedData: userData.sharedData
            }
        });

    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * POST /api/casperid/verify-token
 * Verify JWT token and return user data
 */
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                valid: false,
                error: 'Token required'
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                valid: false,
                error: 'Invalid or expired token'
            });
        }

        // Check if session is revoked
        const session = await LoginSession.findOne({ token, revoked: false });

        if (!session) {
            return res.status(401).json({
                valid: false,
                error: 'Session not found or revoked'
            });
        }

        // Return user data from token
        res.json({
            valid: true,
            user: {
                wallet: decoded.wallet,
                humanId: decoded.humanId,
                name: decoded.name || null,
                verified: decoded.verified,
                tier: decoded.tier,
                sharedData: decoded.sharedData
            },
            platform: decoded.platform,
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });

    } catch (error) {
        console.error('[Auth] Token verification error:', error);
        res.status(500).json({
            valid: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/casperid/session
 * Get current session info (requires Authorization header)
 */
router.get('/session', async (req, res) => {
    try {
        const authHeader = req.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                active: false,
                error: 'Authorization token required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                active: false,
                error: 'Invalid or expired token'
            });
        }

        // Get session from database
        const session = await LoginSession.findOne({ token, revoked: false });

        if (!session) {
            return res.status(401).json({
                active: false,
                error: 'Session not found or expired'
            });
        }

        res.json({
            active: true,
            user: {
                wallet: decoded.wallet,
                humanId: decoded.humanId,
                verified: decoded.verified,
                tier: decoded.tier
            },
            platform: session.platform,
            createdAt: session.createdAt.toISOString(),
            expiresAt: session.expiresAt.toISOString()
        });

    } catch (error) {
        console.error('[Auth] Session check error:', error);
        res.status(500).json({
            active: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/casperid/logout
 * Revoke current session
 */
router.post('/logout', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token required'
            });
        }

        // Revoke session
        const result = await LoginSession.updateOne(
            { token },
            { revoked: true }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }


        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('[Auth] Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/casperid/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token required'
            });
        }

        // Verify old token to get wallet/identity
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        // Fetch latest data from database
        let userData = {
            wallet: decoded.wallet,
            humanId: decoded.humanId,
            verified: decoded.verified,
            tier: decoded.tier,
            sharedData: decoded.sharedData,
            email: decoded.email
        };

        const { UserAccount, UserProfile } = require('../database/models');

        // 1. BRIDGE PENDING SESSIONS: If wallet is pending but we have email, try to find the minted wallet
        if (userData.wallet === 'pending_wallet' && userData.email) {
            const account = await UserAccount.findOne({ recovery_email: userData.email.toLowerCase() });
            if (account && account.wallet) {
                userData.wallet = account.wallet;
                userData.user_id = account.user_id;
            }
        }

        // 2. FETCH FRESH DATA: If we have a real wallet, get latest credential AND profile
        if (userData.wallet && userData.wallet !== 'pending_wallet') {
            const credential = await Credential.findOne({ wallet: userData.wallet, revoked: false });
            if (credential) {
                userData.humanId = credential.human_id || userData.humanId;
                userData.tier = credential.tier || userData.tier;
                userData.verified = true;
            }

            // Fetch name from UserProfile to ensure it's not null in business token
            const profile = await UserProfile.findOne({ wallet: userData.wallet });
            if (profile) {
                userData.name = profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null;
            }
        }

        // Generate new token with FRESHEST data
        const newToken = generateToken(userData, decoded.platform || 'unknown');

        // BUSINESS TOKEN: If an apiKey is provided, also issue a business token
        let businessToken = null;
        const { apiKey } = req.body;
        if (apiKey) {
            const { BusinessApp } = require('../database/models');
            const { generateBusinessToken } = require('../utils/jwt-manager');
            const businessApp = await BusinessApp.findOne({ api_key: apiKey });
            
            if (businessApp) {
                businessToken = generateBusinessToken({
                    userId: userData.user_id || userData.wallet,
                    wallet: userData.wallet,
                    humanId: userData.humanId,
                    name: userData.name || null,
                    verified: userData.verified,
                    tier: userData.tier,
                    email: userData.email,
                    sharedData: userData.sharedData || []
                }, businessApp.app_id);
            }
        }

        // Update session in database
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await LoginSession.updateOne(
            { token },
            {
                token: newToken,
                expiresAt,
                wallet: userData.wallet // Ensure wallet is updated if it was pending
            }
        );

        res.json({
            success: true,
            token: newToken,
            business_token: businessToken,
            expiresIn: 86400,
            user: userData
        });

    } catch (error) {
        console.error('[Auth] Refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
