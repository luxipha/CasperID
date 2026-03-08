/**
 * ZK Proof Routes (Starknet)
 *
 * Handles Zero-Knowledge proof submission and verification on Starknet.
 * This provides privacy-preserving identity verification.
 *
 * FLOW:
 * 1. Liveness passes (ai.js) → returns liveness_session token
 * 2. Frontend generates ZK proof with nullifier
 * 3. This endpoint: validates session → checks nullifier → submits to Starknet → mints Casper credential
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const starknetService = require('../services/starknet');
const casperService = require('../services/casper');
const webauthnService = require('../services/webauthn');
const { UserAccount, Credential } = require('../database/models');
const { walletToHuman } = require('../utils/wallet-to-human');

/**
 * POST /api/zk/submit-proof
 * Submit a ZK proof of liveness to Starknet
 * This registers the user's identity on-chain without revealing biometric data
 *
 * SYNCHRONIZED FLOW:
 * 1. Validate user session
 * 2. Verify liveness session token (from ai.js)
 * 3. PRE-FLIGHT: Check if nullifier already used (free read, saves gas)
 * 4. Submit to Starknet
 * 5. Mint Casper Layer 2 credential (only after Starknet success)
 */
router.post('/zk/submit-proof', async (req, res) => {
    try {
        const { proof, proofHash, publicInputs, livenessSession } = req.body;

        // ═══════════════════════════════════════════════════════════════
        // 1. VALIDATE USER SESSION
        // ═══════════════════════════════════════════════════════════════
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const sessionData = await webauthnService.validateSession(sessionToken);
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session',
                code: 'SESSION_EXPIRED'
            });
        }

        const userAccount = sessionData.userAccount;
        const walletAddress = userAccount.wallet; // Use authenticated wallet, not frontend-provided

        console.log('[ZK] Processing proof for authenticated user:', walletAddress);

        // ═══════════════════════════════════════════════════════════════
        // 2. VALIDATE REQUIRED FIELDS
        // ═══════════════════════════════════════════════════════════════
        if (!proof || !proofHash || !publicInputs) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: proof, proofHash, publicInputs',
                code: 'MISSING_FIELDS'
            });
        }

        if (!publicInputs.nullifier) {
            return res.status(400).json({
                success: false,
                error: 'Missing required public input: nullifier',
                code: 'MISSING_NULLIFIER'
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // 3. VALIDATE LIVENESS SESSION (optional but recommended)
        // ═══════════════════════════════════════════════════════════════
        if (livenessSession) {
            if (userAccount.liveness_session_token !== livenessSession) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid liveness session. Please complete liveness verification again.',
                    code: 'INVALID_LIVENESS_SESSION'
                });
            }

            if (userAccount.liveness_session_expiry && Date.now() > userAccount.liveness_session_expiry) {
                return res.status(400).json({
                    success: false,
                    error: 'Liveness session expired. Please complete liveness verification again.',
                    code: 'LIVENESS_SESSION_EXPIRED'
                });
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // 4. PRE-FLIGHT CHECK: Is nullifier already used? (FREE read)
        // ═══════════════════════════════════════════════════════════════
        console.log('[ZK] Pre-flight check: nullifier', publicInputs.nullifier);

        const isNullifierUsed = await starknetService.isNullifierUsed(publicInputs.nullifier);
        if (isNullifierUsed) {
            console.log('[ZK] SYBIL DETECTED: Nullifier already registered');
            return res.status(409).json({
                success: false,
                error: 'This biometric identity is already registered with another account',
                code: 'NULLIFIER_ALREADY_USED',
                sybil: true
            });
        }

        // Also check if wallet is already verified
        const isWalletVerified = await starknetService.isWalletVerified(walletAddress);
        if (isWalletVerified) {
            console.log('[ZK] Wallet already verified:', walletAddress);
            return res.status(409).json({
                success: false,
                error: 'This wallet is already verified',
                code: 'WALLET_ALREADY_VERIFIED'
            });
        }

        // ═══════════════════════════════════════════════════════════════
        // 5. SUBMIT TO STARKNET
        // ═══════════════════════════════════════════════════════════════
        console.log('[ZK] Submitting proof to Starknet...');
        console.log('[ZK] Nullifier:', publicInputs.nullifier);
        console.log('[ZK] Wallet:', walletAddress);

        // Override wallet address with authenticated user's wallet
        const starknetResult = await starknetService.submitProofToStarknet({
            proof,
            proofHash,
            publicInputs: {
                ...publicInputs,
                walletAddress: walletAddress // Use authenticated wallet
            }
        });

        console.log('[ZK] Starknet submission successful:', starknetResult.transactionHash);

        // ═══════════════════════════════════════════════════════════════
        // 6. MINT CASPER LAYER 2 CREDENTIAL (only after Starknet success)
        // ═══════════════════════════════════════════════════════════════
        console.log('[ZK] Minting Casper Layer 2 credential...');

        const now = Math.floor(Date.now() / 1000);

        // Create credential JSON
        const credentialData = {
            subject_wallet: walletAddress,
            tier: 'layer_2',
            last_kyc_at: now,
            last_liveness_at: now,
            issuer: process.env.ISSUER_ID || 'CasperID-Demo',
            issued_at: now,
            expires_at: 0,
            zk_verified: true,
            starknet_tx: starknetResult.transactionHash
        };

        // Sign credential (JWT)
        const credential_json = jwt.sign(
            credentialData,
            process.env.JWT_SECRET,
            { expiresIn: '10y' }
        );

        // Compute credential hash
        const credential_hash = crypto
            .createHash('sha256')
            .update(credential_json)
            .digest('hex');

        // Call Casper contract to upgrade verification tier
        let casper_tx_hash = null;
        try {
            casper_tx_hash = await casperService.updateTier(walletAddress, 'layer_2');
            console.log('[ZK] Casper tier updated:', casper_tx_hash);
        } catch (casperError) {
            console.warn('[ZK] Casper tier update failed (non-fatal):', casperError.message);
            // Continue - Starknet is the source of truth
        }

        // Generate human-friendly ID
        const { humanId } = walletToHuman(walletAddress);

        // Check if credential exists (upgrade scenario)
        const existingCredential = await Credential.findOne({
            wallet: walletAddress,
            revoked: false
        });

        if (existingCredential) {
            // Upgrade existing credential
            await Credential.findOneAndUpdate(
                { wallet: walletAddress, revoked: false },
                {
                    tier: 'layer_2',
                    last_kyc_at: now,
                    last_liveness_at: now,
                    credential_json,
                    credential_hash,
                    onchain_tx_hash: casper_tx_hash,
                    zk_verified: true,
                    zk_transaction_hash: starknetResult.transactionHash,
                    zk_nullifier: publicInputs.nullifier,
                    updated_at: new Date()
                },
                { new: true }
            );
            console.log('[ZK] Upgraded credential for wallet:', walletAddress);
        } else {
            // Create new credential
            const credential = new Credential({
                wallet: walletAddress,
                human_id: humanId,
                tier: 'layer_2',
                last_kyc_at: now,
                last_liveness_at: now,
                issuer_id: process.env.ISSUER_ID || 'CasperID-Demo',
                credential_json,
                credential_hash,
                onchain_tx_hash: casper_tx_hash,
                zk_verified: true,
                zk_transaction_hash: starknetResult.transactionHash,
                zk_nullifier: publicInputs.nullifier
            });
            await credential.save();
            console.log('[ZK] Created new Layer 2 credential for wallet:', walletAddress);
        }

        // ═══════════════════════════════════════════════════════════════
        // 7. UPDATE USER ACCOUNT
        // ═══════════════════════════════════════════════════════════════
        await UserAccount.findOneAndUpdate(
            { wallet: walletAddress },
            {
                tier: 'layer_2',
                zk_verified: true,
                zk_transaction_hash: starknetResult.transactionHash,
                zk_verified_at: new Date(),
                zk_nullifier: publicInputs.nullifier,
                // Clear liveness session
                liveness_session_token: null,
                liveness_session_expiry: null,
                updated_at: new Date()
            },
            { upsert: false }
        );
        console.log('[ZK] User account updated with ZK verification');

        // ═══════════════════════════════════════════════════════════════
        // 8. RETURN SUCCESS
        // ═══════════════════════════════════════════════════════════════
        res.json({
            success: true,
            transactionHash: starknetResult.transactionHash,
            explorerUrl: starknetResult.explorerUrl,
            casperTxHash: casper_tx_hash,
            tier: 'layer_2',
            message: 'ZK proof verified and credential minted successfully'
        });

    } catch (error) {
        console.error('[ZK] Proof submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit ZK proof',
            details: error.message,
            code: 'SUBMISSION_FAILED'
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
