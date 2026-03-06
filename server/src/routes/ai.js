const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    performKYCVerification,
    verifyLivenessGesture,
    verifyLivenessSequence,
    parseResume,
    generateCoverLetter,
    matchJobWithProfile
} = require('../services/gemini');
const { getCNSInfo, checkNameAvailability, estimateClaimCost, claimName } = require('../services/cns');

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * POST /api/ai/verify-kyc
 * AI-powered KYC verification
 */
router.post('/ai/verify-kyc', upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'livenessPhoto', maxCount: 1 }
]), async (req, res) => {
    try {
        const { expectedGesture, country, wallet } = req.body;

        if (!req.files || !req.files.idDocument || !req.files.selfie) {
            return res.status(400).json({
                error: 'ID document and selfie are required'
            });
        }

        const idBuffer = req.files.idDocument[0].buffer;
        const selfieBuffer = req.files.selfie[0].buffer;
        const livenessBuffer = req.files.livenessPhoto ? req.files.livenessPhoto[0].buffer : null;


        const result = await performKYCVerification(
            idBuffer,
            selfieBuffer,
            livenessBuffer,
            expectedGesture || null
        );

        res.json(result);
    } catch (error) {
        console.error('[AI] KYC verification error:', error);

        res.status(500).json({
            error: 'Failed to perform KYC verification',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/verify-liveness
 * Standalone liveness check (legacy single frame)
 */
router.post('/ai/verify-liveness', upload.single('photo'), async (req, res) => {
    try {
        const { expectedGesture } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Photo is required' });
        }

        if (!expectedGesture) {
            return res.status(400).json({ success: false, error: 'Expected gesture is required' });
        }

        const result = await verifyLivenessGesture(req.file.buffer, expectedGesture);

        res.json(result);
    } catch (error) {
        console.error('[AI] Liveness verification error:', error);

        res.status(500).json({
            error: 'Failed to verify liveness',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/verify-liveness-sequence
 * Advanced liveness check with multiple frames and movement detection
 */
router.post('/ai/verify-liveness-sequence', upload.fields([
    { name: 'frame_0', maxCount: 1 },
    { name: 'frame_1', maxCount: 1 },
    { name: 'frame_2', maxCount: 1 },
    { name: 'frame_3', maxCount: 1 },
    { name: 'frame_4', maxCount: 1 },
    { name: 'frame_5', maxCount: 1 },
    { name: 'frame_6', maxCount: 1 },
    { name: 'frame_7', maxCount: 1 },
    { name: 'frame_8', maxCount: 1 },
    { name: 'frame_9', maxCount: 1 },
    { name: 'frame_10', maxCount: 1 },
    { name: 'frame_11', maxCount: 1 },
    { name: 'frame_12', maxCount: 1 },
    { name: 'frame_13', maxCount: 1 },
    { name: 'frame_14', maxCount: 1 },
    { name: 'frame_15', maxCount: 1 },
    { name: 'frame_16', maxCount: 1 },
    { name: 'frame_17', maxCount: 1 },
    { name: 'frame_18', maxCount: 1 },
    { name: 'frame_19', maxCount: 1 },
    { name: 'frame_20', maxCount: 1 },
    { name: 'frame_21', maxCount: 1 },
    { name: 'frame_22', maxCount: 1 },
    { name: 'frame_23', maxCount: 1 },
    { name: 'frame_24', maxCount: 1 },
    { name: 'frame_25', maxCount: 1 },
    { name: 'frame_26', maxCount: 1 },
    { name: 'frame_27', maxCount: 1 },
    { name: 'frame_28', maxCount: 1 },
    { name: 'frame_29', maxCount: 1 },
    { name: 'frame_30', maxCount: 1 },
]), async (req, res) => {
    try {
        const { stepSequence, totalFrames } = req.body;

        // 1. Validate Session & Identify User
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({ success: false, error: 'Invalid or expired session' });
        }

        const userAccount = sessionData.userAccount;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, error: 'Video frames are required' });
        }

        const frameCount = parseInt(totalFrames) || Object.keys(req.files).length;
        const frames = [];

        // Extract frames in order
        for (let i = 0; i < frameCount; i++) {
            const frameKey = `frame_${i}`;
            if (req.files[frameKey] && req.files[frameKey][0]) {
                frames.push(req.files[frameKey][0].buffer);
            }
        }

        if (frames.length < 10) {
            return res.status(400).json({ success: false, error: 'Insufficient frames for liveness verification' });
        }



        const result = await verifyLivenessSequence(frames, JSON.parse(stepSequence || '[]'));

        // 2. If Passed, Handle Based on Layer
        if (result.passed) {
            const { Credential, UserAccount } = require('../database/models');
            const crypto = require('crypto');
            const jwt = require('jsonwebtoken');
            const casperService = require('../services/casper');
            const { walletToHuman } = require('../utils/wallet-to-human');
            const fs = require('fs');
            const path = require('path');

            // Check if this is Layer 3 flow (user already has Layer 2)
            if (userAccount.tier === 'layer_2') {
                // Layer 3 flow - DON'T mint credential yet
                // Save key frames for admin review

                // Save 5 key frames to disk for admin review
                const uploadsDir = path.join(__dirname, '../../uploads/liveness');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const frameInterval = Math.floor(frames.length / 5);
                const keyFrameIndices = [0, frameInterval, frameInterval * 2, frameInterval * 3, frames.length - 1];
                const savedFramePaths = [];

                for (const idx of keyFrameIndices) {
                    if (frames[idx]) {
                        const frameId = `${userAccount.wallet.slice(-12)}-${Date.now()}-${idx}`;
                        const framePath = path.join(uploadsDir, `${frameId}.jpg`);
                        fs.writeFileSync(framePath, frames[idx]);
                        savedFramePaths.push(`/uploads/liveness/${frameId}.jpg`);
                    }
                }

                // Store liveness result with frame paths for the verification request
                // We'll use a simple file-based approach for now
                const livenessDataPath = path.join(uploadsDir, `${userAccount.wallet.slice(-20)}-result.json`);
                fs.writeFileSync(livenessDataPath, JSON.stringify({
                    wallet: userAccount.wallet,
                    passed: true,
                    completed_at: new Date().toISOString(),
                    frame_paths: savedFramePaths,
                    analysis: result
                }));

                return res.json({
                    ...result,
                    layer: 3,
                    next_step: 'review_submit',
                    liveness_frames: savedFramePaths,
                    message: 'Liveness verification complete. Please proceed to submit your verification request.'
                });
            }

            // Layer 2 flow - Mint credential immediately
            console.log(`[AI] Layer 2 liveness passed for ${userAccount.wallet}. Minting credential...`);

            const now = Math.floor(Date.now() / 1000); // Unix timestamp

            // Create credential JSON
            const credentialData = {
                subject_wallet: userAccount.wallet,
                tier: 'layer_2',
                last_kyc_at: now,
                last_liveness_at: now,
                issuer: process.env.ISSUER_ID || 'CasperID-Demo',
                issued_at: now,
                expires_at: 0
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
            const tx_hash = await casperService.updateTier(
                userAccount.wallet,
                'layer_2'
            );

            // Generate human-friendly ID
            const { humanId } = walletToHuman(userAccount.wallet);

            // Check if credential exists (upgrade scenario)
            const existingCredential = await Credential.findOne({
                wallet: userAccount.wallet,
                revoked: false
            });

            if (existingCredential) {
                // Upgrade existing credential
                await Credential.findOneAndUpdate(
                    { wallet: userAccount.wallet, revoked: false },
                    {
                        tier: 'layer_2',
                        last_kyc_at: now,
                        last_liveness_at: now,
                        credential_json,
                        credential_hash,
                        onchain_tx_hash: tx_hash,
                        updated_at: new Date()
                    },
                    { new: true }
                );
                console.log(`[AI] Upgraded credential for wallet: ${userAccount.wallet}`);
            } else {
                // Create new credential
                const credential = new Credential({
                    wallet: userAccount.wallet,
                    human_id: humanId,
                    tier: 'layer_2',
                    last_kyc_at: now,
                    last_liveness_at: now,
                    issuer_id: process.env.ISSUER_ID || 'CasperID-Demo',
                    credential_json,
                    credential_hash,
                    onchain_tx_hash: tx_hash
                });
                await credential.save();
                console.log(`[AI] Created new Layer 2 credential for wallet: ${userAccount.wallet}`);
            }

            // Update UserAccount status
            if (userAccount.tier !== 'layer_2' && userAccount.tier !== 'layer_3') {
                await UserAccount.updateOne(
                    { _id: userAccount._id },
                    { $set: { tier: 'layer_2', updated_at: new Date() } }
                );
            }
        }

        res.json(result);
    } catch (error) {
        console.error('[AI] Liveness sequence verification error:', error);
        res.status(500).json({
            error: 'Failed to verify liveness sequence',
            details: error.message
        });
    }
});

/**
 * GET /api/cns/info?wallet=<address>
 * Get CNS information for a wallet
 */
router.get('/cns/info', async (req, res) => {
    try {
        const { wallet } = req.query;

        if (!wallet) {
            return res.status(400).json({ success: false, error: 'Wallet address is required' });
        }

        // Optionally include profile data for better name suggestions
        const profileData = {
            name: req.query.name,
            email: req.query.email
        };

        const cnsInfo = await getCNSInfo(wallet, profileData);
        res.json(cnsInfo);
    } catch (error) {
        console.error('[CNS] Get info error:', error);
        res.status(500).json({
            error: 'Failed to get CNS information',
            details: error.message
        });
    }
});

/**
 * GET /api/cns/check-availability?name=<name>
 * Check if a CNS name is available
 */
router.get('/cns/check-availability', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const isAvailable = await checkNameAvailability(name);
        const cost = isAvailable ? await estimateClaimCost(name) : null;

        res.json({
            name: `${name}.cspr`,
            available: isAvailable,
            cost
        });
    } catch (error) {
        console.error('[CNS] Check availability error:', error);
        res.status(500).json({
            error: 'Failed to check name availability',
            details: error.message
        });
    }
});

/**
 * POST /api/cns/claim
 * Claim a CNS name
 */
router.post('/cns/claim', async (req, res) => {
    try {
        const { wallet, name } = req.body;

        if (!wallet || !name) {
            return res.status(400).json({
                error: 'Wallet address and name are required'
            });
        }

        // Check availability first
        const isAvailable = await checkNameAvailability(name);
        if (!isAvailable) {
            return res.status(400).json({
                error: 'Name is not available'
            });
        }

        const result = await claimName(wallet, name);
        res.json(result);
    } catch (error) {
        console.error('[CNS] Claim name error:', error);
        res.status(500).json({
            error: 'Failed to claim name',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/parse-resume
 * Parse a resume and extract profile data
 */
router.post('/ai/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Resume file is required' });
        }

        console.log(`[AI] Parsing resume: ${req.file.originalname} (${req.file.mimetype})`);

        // Only accept PDF files
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                error: `Only PDF files are supported. You uploaded: ${req.file.mimetype}`,
                details: 'Please convert your resume to PDF format and try again.'
            });
        }

        const result = await parseResume(req.file.buffer, req.file.mimetype);
        console.log('[AI] Resume parsing successful, sending response...');
        console.log('[AI] Result keys:', Object.keys(result));
        res.json({
            success: true,
            data: result,
            message: 'Resume parsed successfully'
        });
    } catch (error) {
        console.error('[AI] Resume parse error:', error);
        res.status(500).json({
            error: 'Failed to parse resume',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/generate-cover-letter
 * Generate a tailored cover letter
 */
router.post('/ai/generate-cover-letter', async (req, res) => {
    try {
        const { profileData, jobDescription } = req.body;

        if (!profileData || !jobDescription) {
            return res.status(400).json({
                error: 'Profile data and job description are required'
            });
        }

        console.log('[AI] Generating cover letter...');
        const result = await generateCoverLetter(profileData, jobDescription);
        res.json(result);
    } catch (error) {
        console.error('[AI] Cover letter generation error:', error);
        res.status(500).json({
            error: 'Failed to generate cover letter',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/match-job
 * Match a profile with a job description
 */
router.post('/ai/match-job', async (req, res) => {
    try {
        const { profileData, jobDescription } = req.body;

        if (!profileData || !jobDescription) {
            return res.status(400).json({
                error: 'Profile data and job description are required'
            });
        }

        console.log('[AI] Matching job with profile...');
        const result = await matchJobWithProfile(profileData, jobDescription);
        res.json(result);
    } catch (error) {
        console.error('[AI] Job matching error:', error);
        res.status(500).json({
            error: 'Failed to perform job matching',
            details: error.message
        });
    }
});

module.exports = router;
