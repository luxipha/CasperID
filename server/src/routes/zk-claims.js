/**
 * ZK Claims Routes
 *
 * Endpoints for generating and verifying Zero-Knowledge claim proofs.
 * Allows users to prove claims without revealing actual data.
 */

const express = require('express');
const router = express.Router();
const zkClaimsService = require('../services/zk-claims');

/**
 * GET /api/zk-claims/available
 * Get available claims for the authenticated user
 */
router.get('/available', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const claims = await zkClaimsService.getAvailableClaims(sessionToken);

        res.json({
            success: true,
            claims
        });

    } catch (error) {
        console.error('Failed to get available claims:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/zk-claims/generate
 * Generate a ZK claim proof package
 */
router.post('/generate', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { claims } = req.body;

        if (!claims || !Array.isArray(claims) || claims.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one claim is required'
            });
        }

        const proofPackage = await zkClaimsService.generateClaimProof(sessionToken, claims);

        res.json({
            success: true,
            proofPackage
        });

    } catch (error) {
        console.error('Failed to generate ZK claim proof:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/zk-claims/verify
 * Verify a ZK claim proof package (public endpoint - no auth required)
 */
router.post('/verify', async (req, res) => {
    try {
        const { proof, proofPackage } = req.body;

        const proofData = proof || proofPackage;

        if (!proofData) {
            return res.status(400).json({
                success: false,
                error: 'Proof data is required'
            });
        }

        const result = await zkClaimsService.verifyClaimProof(proofData);

        res.json({
            success: result.valid,
            ...result
        });

    } catch (error) {
        console.error('Failed to verify ZK claim proof:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/zk-claims/verify/:proofId
 * Verify a ZK claim proof by ID (for QR code scanning)
 * This endpoint accepts the proof as a query parameter
 */
router.get('/verify/:proofId', async (req, res) => {
    try {
        const { proof } = req.query;

        if (!proof) {
            return res.status(400).json({
                success: false,
                error: 'Proof data is required as query parameter'
            });
        }

        const result = await zkClaimsService.verifyClaimProof(proof);

        res.json({
            success: result.valid,
            ...result
        });

    } catch (error) {
        console.error('Failed to verify ZK claim proof:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
