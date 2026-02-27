const express = require('express');
const router = express.Router();
const otpPairingService = require('../services/otp-pairing');
const { DeviceSession } = require('../database/models');

/**
 * OTP Pairing Routes
 * Handles extension-to-web pairing via 3-digit OTP
 */

/**
 * Initiate OTP pairing from extension
 * POST /api/passkey/pairing/otp/start
 * Body: { cid: "username" or "email" }
 */
router.post('/start', async (req, res) => {
    try {
        const { cid } = req.body;

        if (!cid) {
            return res.status(400).json({
                success: false,
                error: 'CID (username or email) is required'
            });
        }

        const result = await otpPairingService.initiatePairing(cid);

        res.json({
            success: true,
            pairingId: result.pairingId,
            expiresAt: result.expiresAt,
            expiresIn: result.expiresIn,
            userHint: result.userHint
        });

    } catch (error) {
        console.error('[OTP-Pairing] Start error:', error.message);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to initiate pairing'
        });
    }
});

/**
 * Verify OTP and complete pairing
 * POST /api/passkey/pairing/otp/verify
 * Body: { pairingId, otp, deviceInfo? }
 */
router.post('/verify', async (req, res) => {
    try {
        const { pairingId, otp, deviceInfo } = req.body;

        if (!pairingId || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Pairing ID and OTP are required'
            });
        }

        const result = await otpPairingService.verifyOTP(pairingId, otp, {
            ...deviceInfo,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        res.json({
            success: true,
            sessionToken: result.sessionToken,
            expiresAt: result.expiresAt,
            user: result.user
        });

    } catch (error) {
        console.error('[OTP-Pairing] Verify error:', error.message);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to verify OTP'
        });
    }
});

/**
 * Get pending OTP pairing requests for logged-in user
 * GET /api/passkey/pairing/otp/pending
 * Auth: requires valid session
 */
router.get('/pending', async (req, res) => {
    try {
        // Get session from cookie or header
        const sessionToken = req.cookies?.casperid_session || req.headers['x-session-token'];

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Validate session
        const deviceSession = await DeviceSession.findOne({
            session_token: sessionToken,
            revoked: false,
            expires_at: { $gt: new Date() }
        });

        if (!deviceSession) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        const pending = otpPairingService.getPendingPairings(deviceSession.user_id);

        res.json({
            success: true,
            pending,
            count: pending.length
        });

    } catch (error) {
        console.error('[OTP-Pairing] Pending error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get pending pairings'
        });
    }
});

/**
 * Cancel a pending OTP pairing request
 * DELETE /api/passkey/pairing/otp/:pairingId
 * Auth: requires valid session
 */
router.delete('/:pairingId', async (req, res) => {
    try {
        const { pairingId } = req.params;
        const sessionToken = req.cookies?.casperid_session || req.headers['x-session-token'];

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const deviceSession = await DeviceSession.findOne({
            session_token: sessionToken,
            revoked: false,
            expires_at: { $gt: new Date() }
        });

        if (!deviceSession) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        otpPairingService.cancelPairing(pairingId, deviceSession.user_id);

        res.json({
            success: true,
            message: 'Pairing cancelled'
        });

    } catch (error) {
        console.error('[OTP-Pairing] Cancel error:', error.message);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to cancel pairing'
        });
    }
});

module.exports = router;
