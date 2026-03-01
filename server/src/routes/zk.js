/**
 * ZK Proof Routes (Starknet)
 *
 * Handles Zero-Knowledge proof submission and verification on Starknet.
 * This provides privacy-preserving identity verification.
 */

const express = require('express');
const router = express.Router();
const starknetService = require('../services/starknet');
const { UserAccount } = require('../database/models');

/**
 * POST /api/zk/submit-proof
 * Submit a ZK proof of liveness to Starknet
 * This registers the user's identity on-chain without revealing biometric data
 */
router.post('/zk/submit-proof', async (req, res) => {
    try {
        const { proof, proofHash, publicInputs } = req.body;

        // Validate required fields
        if (!proof || !proofHash || !publicInputs) {
            return res.status(400).json({
                error: 'Missing required fields: proof, proofHash, publicInputs'
            });
        }

        if (!publicInputs.nullifier || !publicInputs.walletAddress) {
            return res.status(400).json({
                error: 'Missing required public inputs: nullifier, walletAddress'
            });
        }

        console.log('[ZK] Submitting proof to Starknet...');
        console.log('[ZK] Nullifier:', publicInputs.nullifier);
        console.log('[ZK] Wallet:', publicInputs.walletAddress);

        // Submit to Starknet
        const result = await starknetService.submitProofToStarknet({
            proof,
            proofHash,
            publicInputs
        });

        // Update user record with ZK verification status
        try {
            await UserAccount.findOneAndUpdate(
                { wallet: publicInputs.walletAddress },
                {
                    zk_verified: true,
                    zk_transaction_hash: result.transactionHash,
                    zk_verified_at: new Date(),
                    zk_nullifier: publicInputs.nullifier
                },
                { upsert: false }
            );
            console.log('[ZK] User record updated with ZK verification');
        } catch (dbError) {
            console.warn('[ZK] Could not update user record:', dbError.message);
            // Don't fail the request - Starknet submission succeeded
        }

        res.json({
            success: true,
            transactionHash: result.transactionHash,
            explorerUrl: result.explorerUrl,
            message: 'ZK proof submitted successfully to Starknet'
        });
    } catch (error) {
        console.error('[ZK] Proof submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit ZK proof',
            details: error.message
        });
    }
});

/**
 * GET /api/zk/verification/:walletAddress
 * Check if a wallet address is ZK-verified on Starknet
 */
router.get('/zk/verification/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        // Check Starknet
        const isVerified = await starknetService.isWalletVerified(walletAddress);

        // Also check local database for transaction hash
        let dbRecord = null;
        try {
            dbRecord = await UserAccount.findOne(
                { wallet: walletAddress },
                { zk_verified: 1, zk_transaction_hash: 1, zk_verified_at: 1 }
            );
        } catch (dbError) {
            console.warn('[ZK] Could not fetch user record:', dbError.message);
        }

        res.json({
            success: true,
            isVerified,
            transactionHash: dbRecord?.zk_transaction_hash || null,
            verifiedAt: dbRecord?.zk_verified_at || null
        });
    } catch (error) {
        console.error('[ZK] Verification check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check ZK verification',
            details: error.message
        });
    }
});

/**
 * GET /api/zk/status
 * Get Starknet service status
 */
router.get('/zk/status', async (req, res) => {
    try {
        const status = starknetService.getServiceStatus();
        const verifiedCount = await starknetService.getVerifiedCount();

        res.json({
            success: true,
            ...status,
            verifiedCount
        });
    } catch (error) {
        console.error('[ZK] Status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get ZK service status',
            details: error.message
        });
    }
});

/**
 * POST /api/zk/check-nullifier
 * Check if a nullifier has already been used (Sybil prevention)
 */
router.post('/zk/check-nullifier', async (req, res) => {
    try {
        const { nullifier } = req.body;

        if (!nullifier) {
            return res.status(400).json({ error: 'Nullifier is required' });
        }

        const isUsed = await starknetService.isNullifierUsed(nullifier);

        res.json({
            success: true,
            nullifier,
            isUsed
        });
    } catch (error) {
        console.error('[ZK] Nullifier check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check nullifier',
            details: error.message
        });
    }
});

module.exports = router;
