const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { UserAccount, LoginSession, UserProfile, Credential } = require('../database/models');
const { generateToken } = require('../utils/jwt-manager');
const emailService = require('../services/emailService');

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Clean up expired OTPs every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of otpStorage.entries()) {
        if (now > value.expiresAt) {
            otpStorage.delete(key);
        }
    }
}, 60000);

// Environment variables for OAuth
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || 'YOUR_LINKEDIN_CLIENT_ID';
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || 'YOUR_TWITTER_CLIENT_ID';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const REDIRECT_URI_BASE = process.env.API_URL || 'http://localhost:3001';

// ============================================
// OTP AUTHENTICATION
// ============================================

/**
 * Send OTP to email
 * POST /api/auth/send-otp
 */
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

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

        // Check if user already exists with this email
        const { UserAccount, PasskeyCredential } = require('../database/models');
        const existingUser = await UserAccount.findOne({
            recovery_email: email
        });

        if (existingUser) {
            // Check if user has any active passkey credentials
            const userCredentials = await PasskeyCredential.find({
                user_id: existingUser.user_id,
                revoked: false
            });

            if (userCredentials && userCredentials.length > 0) {
                // Returning user with passkey - direct to passkey auth
                console.log(`🔑 Returning user detected: ${email} - directing to passkey auth`);
                return res.json({
                    success: true,
                    userExists: true,
                    hasPasskey: true,
                    message: 'Returning user detected. Use your passkey to sign in.',
                    email: email
                });
            }
        }

        // Generate OTP and verification ID
        const otp = emailService.generateOTP();
        const verificationId = uuidv4();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

        // Store OTP with expiration
        otpStorage.set(verificationId, {
            email,
            otp,
            expiresAt,
            attempts: 0,
            verified: false
        });

        console.log(`📧 Generated OTP for ${email}: ${otp} (ID: ${verificationId})`);

        // Send OTP email
        await emailService.sendOTP(email, otp);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            verificationId,
            expiresIn: 10 * 60 * 1000 // 10 minutes in milliseconds
        });

    } catch (error) {
        console.error('Send OTP failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send OTP'
        });
    }
});

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
    try {
        const { verificationId, otp } = req.body;

        if (!verificationId || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Verification ID and OTP are required'
            });
        }

        const storedData = otpStorage.get(verificationId);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired verification ID'
            });
        }

        const now = Date.now();

        // Check if expired
        if (now > storedData.expiresAt) {
            otpStorage.delete(verificationId);
            return res.status(400).json({
                success: false,
                error: 'OTP has expired. Please request a new one.'
            });
        }

        // Check if already verified
        if (storedData.verified) {
            return res.status(400).json({
                success: false,
                error: 'OTP has already been used'
            });
        }

        // Increment attempt count
        storedData.attempts += 1;

        // Check attempt limit
        if (storedData.attempts > 5) {
            otpStorage.delete(verificationId);
            return res.status(400).json({
                success: false,
                error: 'Too many failed attempts. Please request a new OTP.'
            });
        }

        // Verify OTP
        if (storedData.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP. Please try again.',
                attemptsLeft: Math.max(0, 5 - storedData.attempts)
            });
        }

        // Mark as verified
        storedData.verified = true;

        console.log(`✅ OTP verified successfully for ${storedData.email}`);

        // Generate Session Token
        // 1. Find user account to get wallet/human_id
        const userAccount = await UserAccount.findOne({ recovery_email: storedData.email });

        let wallet = null;
        let humanId = null;
        let verified = false;
        let tier = 'Unverified';

        if (userAccount) {
            wallet = userAccount.wallet;

            // Get credential for verification status
            if (wallet) {
                const credential = await Credential.findOne({ wallet, revoked: false });
                if (credential) {
                    humanId = credential.human_id;
                    verified = true;
                    tier = credential.tier;
                }
            }
        }

        // Prepare user data for token
        // If no wallet (new user), we might issue a temporary token or one without wallet
        // But for Profile access, wallet is needed. 
        // We'll issue what we have. Frontend should handle onboarding if wallet is missing.
        const userData = {
            wallet: wallet || 'pending_wallet',
            humanId: humanId || 'unknown',
            verified: verified,
            tier: tier,
            email: storedData.email
        };

        const token = generateToken(userData, 'email_otp');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create Login Session
        await LoginSession.create({
            wallet: wallet || 'pending_wallet',
            token,
            platform: 'email_otp',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            expiresAt
        });

        res.json({
            success: true,
            message: 'OTP verified successfully',
            email: storedData.email,
            verified: true,
            sessionToken: token,
            expiresAt: expiresAt.toISOString(),
            userExists: !!userAccount
        });

    } catch (error) {
        console.error('Verify OTP failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify OTP'
        });
    }
});

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
router.post('/resend-otp', async (req, res) => {
    try {
        const { verificationId } = req.body;

        if (!verificationId) {
            return res.status(400).json({
                success: false,
                error: 'Verification ID is required'
            });
        }

        const storedData = otpStorage.get(verificationId);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification ID'
            });
        }

        // Generate new OTP
        const newOtp = emailService.generateOTP();
        const newExpiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

        // Update stored data
        storedData.otp = newOtp;
        storedData.expiresAt = newExpiresAt;
        storedData.attempts = 0;
        storedData.verified = false;

        console.log(`📧 Resending OTP to ${storedData.email}: ${newOtp}`);

        // Send new OTP email
        await emailService.sendOTP(storedData.email, newOtp);

        res.json({
            success: true,
            message: 'New OTP sent successfully',
            expiresIn: 10 * 60 * 1000 // 10 minutes in milliseconds
        });

    } catch (error) {
        console.error('Resend OTP failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to resend OTP'
        });
    }
});

// ============================================
// OAUTH AUTHENTICATION
// ============================================

/**
 * GET /api/auth/linkedin
 * Redirects to LinkedIn OAuth
 */
router.get('/linkedin', (req, res) => {
    const { wallet } = req.query;
    const state = Buffer.from(JSON.stringify({ wallet, provider: 'linkedin' })).toString('base64');
    const redirectUri = `${REDIRECT_URI_BASE}/api/auth/callback/linkedin`;

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=openid%20profile%20email`;

    res.redirect(url);
});

/**
 * GET /api/auth/twitter
 * Redirects to Twitter OAuth
 */
router.get('/twitter', (req, res) => {
    const { wallet } = req.query;
    const state = Buffer.from(JSON.stringify({ wallet, provider: 'twitter' })).toString('base64');
    const redirectUri = `${REDIRECT_URI_BASE}/api/auth/callback/twitter`;

    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=users.read%20tweet.read&code_challenge=challenge&code_challenge_method=plain`;

    res.redirect(url);
});

/**
 * GET /api/auth/google
 * Redirects to Google OAuth
 */
router.get('/google', (req, res) => {
    const { wallet } = req.query;
    const state = Buffer.from(JSON.stringify({ wallet, provider: 'google' })).toString('base64');
    const redirectUri = `${REDIRECT_URI_BASE}/api/auth/callback/google`;

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email%20profile`;

    res.redirect(url);
});

/**
 * GET /api/auth/callback/:provider
 * Handles OAuth callback
 */
router.get('/callback/:provider', (req, res) => {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
        return res.send(`
            <script>
                window.opener.postMessage({ type: 'AUTH_ERROR', provider: '${provider}', error: '${error}' }, '*');
                window.close();
            </script>
        `);
    }

    // In a real implementation, we would exchange the code for a token here
    // and verify the user profile.

    // For now, we assume success to demonstrate the flow (since we don't have real keys to exchange code)
    // But this endpoint IS the real callback handler structure.

    res.send(`
        <script>
            window.opener.postMessage({ type: 'AUTH_SUCCESS', provider: '${provider}', code: '${code}' }, '*');
            window.close();
        </script>
    `);
});

// ============================================
// AUTHENTICATED USER OTP (for export-did, etc.)
// ============================================

/**
 * Send OTP to authenticated user for sensitive operations
 * POST /api/auth/send-verification-otp
 * Body: { purpose: 'export-did' }
 */
router.post('/send-verification-otp', require('../middleware/auth').requireAuth, async (req, res) => {
    try {
        const { purpose } = req.body;
        const userId = req.user.userId || req.user.wallet; // Handle both JWT formats

        // Validate purpose
        const validPurposes = ['export-did', 'delete-account', 'change-email'];
        if (!purpose || !validPurposes.includes(purpose)) {
            return res.status(400).json({
                success: false,
                error: 'Valid purpose is required'
            });
        }

        // Get user account  
        const userAccount = await UserAccount.findOne({
            $or: [
                { user_id: userId },
                { wallet: userId }
            ]
        });

        if (!userAccount || !userAccount.recovery_email) {
            return res.status(404).json({
                success: false,
                error: 'No recovery email found for this account'
            });
        }

        // Generate OTP and verification ID
        const otp = emailService.generateOTP();
        const verificationId = `${userAccount.user_id}-${purpose}-${Date.now()}`;
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

        // Store OTP with user and purpose info
        otpStorage.set(verificationId, {
            userId: userAccount.user_id,
            email: userAccount.recovery_email,
            purpose,
            otp,
            expiresAt,
            attempts: 0,
            verified: false
        });

        console.log(`📧 Generated ${purpose} OTP for user ${userAccount.user_id}: ${otp}`);

        // Send OTP email with purpose context
        await emailService.sendOTP(userAccount.recovery_email, otp, `CasperID - ${purpose.replace('-', ' ').toUpperCase()} Verification`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            verificationId,
            purpose,
            expiresIn: 10 * 60 * 1000
        });

    } catch (error) {
        console.error('Send OTP failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send OTP'
        });
    }
});

/**
 * Verify OTP for authenticated user
 * POST /api/auth/verify-verification-otp
 * Body: { otp: '123456', purpose: 'export-did' }
 */
router.post('/verify-verification-otp', require('../middleware/auth').requireAuth, async (req, res) => {
    try {
        const { otp, purpose } = req.body;
        const userId = req.user.userId || req.user.wallet; // Handle both JWT formats

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

        if (!otp || !purpose) {
            return res.status(400).json({
                success: false,
                error: 'OTP and purpose are required'
            });
        }

        // Find OTP entry for this user and purpose
        let otpEntry = null;
        let otpKey = null;

        for (const [key, value] of otpStorage.entries()) {
            if (value.userId === userAccount.user_id &&
                value.purpose === purpose &&
                !value.verified) {
                otpEntry = value;
                otpKey = key;
                break;
            }
        }

        if (!otpEntry) {
            return res.status(400).json({
                success: false,
                error: 'No valid OTP found. Please request a new one.'
            });
        }

        // Check if expired
        if (Date.now() > otpEntry.expiresAt) {
            otpStorage.delete(otpKey);
            return res.status(400).json({
                success: false,
                error: 'OTP has expired. Please request a new one.'
            });
        }

        // Check attempts
        if (otpEntry.attempts >= 3) {
            otpStorage.delete(otpKey);
            return res.status(400).json({
                success: false,
                error: 'Too many failed attempts. Please request a new OTP.'
            });
        }

        // Verify OTP
        if (otpEntry.otp !== otp) {
            otpEntry.attempts++;
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP. Please try again.',
                attemptsLeft: 3 - otpEntry.attempts
            });
        }

        // Success - mark as verified
        otpEntry.verified = true;

        console.log(`✅ OTP verified for user ${userAccount.user_id} - ${purpose}`);

        // Store verification token for subsequent requests (using in-memory for now)
        const verificationToken = `${userAccount.user_id}-${purpose}-${Date.now()}-verified`;
        otpStorage.set(verificationToken, {
            userId: userAccount.user_id,
            purpose,
            verified: true,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes validity
        });

        // Clean up OTP
        otpStorage.delete(otpKey);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            purpose,
            validFor: 5 * 60 * 1000, // 5 minutes
            verificationToken // Send token back to client
        });

    } catch (error) {
        console.error('Verify OTP failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify OTP'
        });
    }
});

/**
 * Export DID (requires OTP verification)
 * POST /api/auth/export-did
 * Body: { verificationToken: 'token-from-otp-verification' }
 * Requires prior OTP verification for 'export-did' purpose
 */
router.post('/export-did', require('../middleware/auth').requireAuth, async (req, res) => {
    try {
        const { verificationToken } = req.body;
        const userId = req.user.userId || req.user.wallet; // Handle both JWT formats

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

        // Check if user has verified OTP for export-did
        const verification = otpStorage.get(verificationToken);
        if (!verification || !verification.verified ||
            verification.purpose !== 'export-did' ||
            verification.userId !== userAccount.user_id ||
            Date.now() > verification.expiresAt) {
            return res.status(403).json({
                success: false,
                error: 'OTP verification required. Please verify your OTP first.'
            });
        }

        // Get user profile
        const userProfile = await UserProfile.findOne({ user_id: userAccount.user_id });
        // Create DID document export
        const didExport = {
            did: userAccount.did || `did:casper:${userAccount.user_id}`,
            userId: userAccount.user_id,
            walletAddress: userAccount.wallet,
            recoveryEmail: userAccount.recovery_email,
            profile: userProfile ? {
                firstName: userProfile.first_name,
                lastName: userProfile.last_name,
                displayName: userProfile.display_name,
                verificationLevel: userProfile.verification_level
            } : null,
            credentials: [], // TODO: Add actual credentials
            exportedAt: new Date().toISOString(),
            exportedBy: userAccount.user_id
        };

        // Clear the verification after use (one-time use)
        otpStorage.delete(verificationToken);

        // Generate export file name
        const filename = `casperid-export-${userAccount.user_id}-${Date.now()}.json`;

        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            exportData: didExport
        });

    } catch (error) {
        console.error('Export DID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export DID'
        });
    }
});

/**
 * DELETE /api/auth/account
 * Permanently delete user account and data
 */
router.delete('/account', require('../middleware/auth').requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const wallet = req.user.wallet;

        console.log(`⚠️ DELETING ACCOUNT: ${userId} (${wallet})`);

        // 1. Delete User Account
        await UserAccount.deleteOne({ user_id: userId });

        // 2. Delete User Profile
        await UserProfile.deleteOne({ wallet: wallet });

        // 3. Delete Credentials (Wallet based)
        await Credential.deleteMany({ wallet: wallet });

        // 4. Delete Passkeys (User ID based)
        if (req.user.user_id) {
            const { PasskeyCredential } = require('../database/models');
            await PasskeyCredential.deleteMany({ user_id: userId });
        }

        // 5. Clear session cookie
        res.clearCookie('casperid_session');

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account'
        });
    }
});

module.exports = router;
