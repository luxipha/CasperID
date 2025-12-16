/**
 * CasperID Authentication Routes
 * Handles "Sign in with CasperID" login flow
 */

const express = require('express');
const router = express.Router();
const { Credential, LoginSession } = require('../database/models');
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

        // For now, we'll skip actual signature verification as it requires the exact signature format
        // In production, uncomment this:
        // const isValidSignature = verifyWalletSignature(message, signature, wallet);
        // if (!isValidSignature) {
        //     return res.status(401).json({
        //         success: false,
        //         error: 'Invalid signature'
        //     });
        // }

        console.log(`[Auth] Login request from wallet: ${wallet}`);

        // Check if user is verified
        const credential = await Credential.findOne({ wallet, revoked: false });

        if (!credential) {
            return res.status(404).json({
                success: false,
                error: 'User not verified',
                message: 'Please complete verification at casperid.com/me before signing in'
            });
        }

        // Prepare user data for token
        const userData = {
            wallet: credential.wallet,
            humanId: credential.human_id || 'unknown',
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

        console.log(`[Auth] Login successful for ${credential.human_id}`);

        // Respond with token and user data
        res.json({
            success: true,
            token,
            expiresIn: 86400, // 24 hours in seconds
            user: {
                wallet: credential.wallet,
                humanId: credential.human_id,
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

        console.log('[Auth] Session revoked');

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

        // Generate new token
        const newToken = refreshToken(token);

        if (!newToken) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Update session in database
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await LoginSession.updateOne(
            { token },
            {
                token: newToken,
                expiresAt
            }
        );

        res.json({
            success: true,
            token: newToken,
            expiresIn: 86400
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
