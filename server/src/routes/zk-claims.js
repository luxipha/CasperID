/**
 * Private Claims Routes
 *
 * Endpoints for generating and verifying selectively disclosed claims.
 * Allows users to prove claims without revealing actual data.
 */

const express = require('express');
const router = express.Router();
const zkClaimsService = require('../services/zk-claims');
const { ZKProofShare } = require('../database/temporary-shares');

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
 * Generate a signed private-claim package. Route name retained for compatibility.
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

        const generatedProof = await zkClaimsService.generateClaimProof(sessionToken, claims);
        const { _storageOwner, ...proofPackage } = generatedProof;

        // Store in TTL collection for QR code sharing (1 hour expiry)
        const zkShare = new ZKProofShare({
            proof_id: proofPackage.proof_id,
            user_id: _storageOwner.user_id,
            wallet: _storageOwner.wallet,
            human_id: _storageOwner.human_id,
            proof: proofPackage.proof,
            proof_hash: proofPackage.proof_hash,
            claims: proofPackage.claims,
            issuer: { id: 'CasperID' },
            expires_at: new Date(proofPackage.expires_at)
        });
        await zkShare.save();

        // Return with simple verification URL
        res.json({
            success: true,
            proofPackage: {
                ...proofPackage,
                // Simple URL for QR codes - no long proof in URL
                verification_url: `/verify-zk/${proofPackage.proof_id}`
            }
        });

    } catch (error) {
        console.error('Failed to generate private claim:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/zk-claims/verify
 * Verify a signed private-claim package (public endpoint - no auth required)
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
        console.error('Failed to verify private claim:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/zk-claims/proof/:proofId
 * Retrieve a stored private claim by ID (for QR code verification pages)
 * Returns the proof data for client-side display
 */
router.get('/proof/:proofId', async (req, res) => {
    try {
        const { proofId } = req.params;

        // Find the stored proof
        const zkShare = await ZKProofShare.findOne({ proof_id: proofId });

        if (!zkShare) {
            return res.status(404).json({
                success: false,
                error: 'Proof not found or has expired'
            });
        }

        // Increment view count
        zkShare.view_count += 1;
        await zkShare.save();

        // Verify the proof is still valid
        const result = await zkClaimsService.verifyClaimProof(zkShare.proof);

        const responseStatus = result.valid ? 200 : (result.expired ? 410 : 400);
        res.status(responseStatus).json({
            success: result.valid,
            proof_id: zkShare.proof_id,
            claims: result.claims || [],
            issuer: result.issuer,
            created_at: zkShare.created_at,
            expires_at: result.expires_at || zkShare.expires_at,
            view_count: zkShare.view_count,
            verification: result
        });

    } catch (error) {
        console.error('Failed to retrieve private claim:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
