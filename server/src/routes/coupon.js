const express = require('express');
const router = express.Router();
const Coupon = require('../database/coupon.model');
const cnsResolver = require('../services/cns-resolver');
const { UserAccount } = require('../database/models');

// Middleware to validate session (Optional for validate, required for claim)
const validateSession = async (req, res, next) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const webauthnService = require('../services/webauthn');
        const session = await webauthnService.verifySession(sessionToken);

        if (!session || !session.isValid) {
            return res.status(401).json({ success: false, error: 'Invalid or expired session' });
        }

        req.userAccount = session.userAccount;
        next();
    } catch (error) {
        console.error('Session validation error:', error);
        res.status(401).json({ success: false, error: 'Authentication failed' });
    }
};

/**
 * POST /api/coupon/validate
 * Validates if a coupon code exists and is unused
 */
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, error: 'Coupon code is required' });
        }

        const normalizedCode = code.trim().toUpperCase();

        const coupon = await Coupon.findOne({ code: normalizedCode });

        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Invalid coupon code' });
        }

        if (coupon.isUsed) {
            return res.status(400).json({ success: false, error: 'This coupon has already been used' });
        }

        res.json({
            success: true,
            message: 'Coupon is valid',
            discountPercentage: coupon.discountPercentage
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ success: false, error: 'Failed to validate coupon' });
    }
});

/**
 * POST /api/coupon/claim
 * Uses a valid coupon to register a CNS name for free
 */
router.post('/claim', validateSession, async (req, res) => {
    try {
        const { code, domainName, years } = req.body;
        const wallet = req.userAccount.wallet;

        if (!code || !domainName) {
            return res.status(400).json({ success: false, error: 'Coupon code and domain name are required' });
        }

        const normalizedCode = code.trim().toUpperCase();

        // Use a transaction if possible, or simple check-and-update
        const coupon = await Coupon.findOne({ code: normalizedCode });

        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Invalid coupon code' });
        }

        if (coupon.isUsed) {
            return res.status(400).json({ success: false, error: 'This coupon has already been used' });
        }

        if (coupon.discountPercentage !== 100) {
            return res.status(400).json({ success: false, error: 'This endpoint only supports 100% discount coupons' });
        }

        // Check if name is already taken
        const isAvailable = await cnsResolver.checkNameAvailability(domainName);
        if (!isAvailable) {
            return res.status(400).json({ success: false, error: 'Name is no longer available' });
        }

        // Mark coupon as used BEFORE registering to prevent race conditions
        const updateResult = await Coupon.updateOne(
            { _id: coupon._id, isUsed: false },
            {
                $set: {
                    isUsed: true,
                    usedByWallet: wallet,
                    usedForCns: domainName,
                    usedAt: new Date()
                }
            }
        );

        if (updateResult.modifiedCount !== 1) {
            // Either the coupon didn't exist or was used by someone else exactly in that millisecond
            return res.status(400).json({ success: false, error: 'Coupon was just claimed by someone else or is invalid' });
        }

        try {
            // Register the premium name
            const result = await cnsResolver.registerPremiumName(wallet, domainName);

            res.json({
                success: true,
                message: 'Name successfully claimed with coupon',
                ...result
            });
        } catch (registrationError) {
            // If registration fails, we should ideally rollback the coupon usage
            console.error('Registration failed after coupon consumption, rolling back...', registrationError);

            await Coupon.updateOne(
                { _id: coupon._id },
                {
                    $set: {
                        isUsed: false,
                        usedByWallet: null,
                        usedForCns: null,
                        usedAt: null
                    }
                }
            );

            throw registrationError;
        }

    } catch (error) {
        console.error('Coupon claim error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to claim name with coupon' });
    }
});

module.exports = router;
