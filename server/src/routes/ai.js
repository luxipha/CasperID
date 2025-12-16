const express = require('express');
const router = express.Router();
const multer = require('multer');
const { performKYCVerification, verifyLivenessGesture, verifyLivenessSequence } = require('../services/gemini');
const { getCNSInfo, checkNameAvailability, estimateClaimCost, claimName } = require('../services/cns');
const {
    trackGeminiCall,
    trackVerification,
    trackFraudAttempt,
    trackCostPerVerification,
    trackModelVersion,
    trackGeographicPerformance,
    detectAdversarialPatterns
} = require('../utils/datadog-metrics');
const tracer = require('dd-trace');

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
    const span = tracer.startSpan('gemini.verify_kyc');
    const startTime = Date.now();
    const requestStart = Date.now();

    try {
        const { expectedGesture, country, wallet } = req.body;

        if (!req.files || !req.files.idDocument || !req.files.selfie) {
            span.setTag('error', true);
            span.setTag('error.type', 'validation');
            span.finish();
            return res.status(400).json({
                error: 'ID document and selfie are required'
            });
        }

        const idBuffer = req.files.idDocument[0].buffer;
        const selfieBuffer = req.files.selfie[0].buffer;
        const livenessBuffer = req.files.livenessPhoto ? req.files.livenessPhoto[0].buffer : null;

        console.log('[AI] Starting KYC verification...');

        const result = await performKYCVerification(
            idBuffer,
            selfieBuffer,
            livenessBuffer,
            expectedGesture || null
        );

        // Calculate metrics
        const latency = Date.now() - startTime;
        const confidence = result.confidence || 0;
        const outcome = result.verified ? 'success' : 'failed';
        const submissionTime = Date.now() - requestStart;

        // Base metrics
        trackGeminiCall('verify-kyc', latency, confidence, outcome);
        trackVerification('full_kyc', result.verified, result.reason);

        // DAY 5: Advanced metrics
        const modelVersion = 'gemini-1.5-pro';
        const estimatedCost = (latency / 1000) * 0.002; // Example cost model

        // 1. Cost per verification
        trackCostPerVerification(estimatedCost, result.verified, 'full_kyc');

        // 2. Model version tracking
        trackModelVersion(modelVersion, confidence, result.verified, latency);

        // 3. Geographic performance
        if (country) {
            trackGeographicPerformance(country, result.verified, confidence, latency);
        }

        // 4. Adversarial attack detection
        const adversarialCheck = detectAdversarialPatterns({
            confidence,
            previousAttempts: 0, // TODO: Track from database
            submissionTime,
            wallet
        });

        // Add tags to span
        span.setTag('verification.result', result.verified);
        span.setTag('confidence.score', confidence);
        span.setTag('latency.ms', latency);
        span.setTag('model.version', modelVersion);
        span.setTag('cost.estimated', estimatedCost);
        if (country) span.setTag('geo.country', country);
        if (adversarialCheck.detected) {
            span.setTag('security.risk_score', adversarialCheck.riskScore);
        }
        span.finish();

        console.log(`[Datadog] KYC verification: ${outcome}, confidence: ${confidence}, latency: ${latency}ms, cost: $${estimatedCost.toFixed(4)}`);

        // Include risk score in response for high-risk verifications
        const response = {
            ...result,
            ...(adversarialCheck.riskScore > 5 && {
                security: {
                    riskScore: adversarialCheck.riskScore,
                    flagged: true
                }
            })
        };

        res.json(response);
    } catch (error) {
        const latency = Date.now() - startTime;

        console.error('[AI] KYC verification error:', error);

        trackGeminiCall('verify-kyc', latency, 0, 'error');

        span.setTag('error', true);
        span.setTag('error.message', error.message);
        span.finish();

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
    const span = tracer.startSpan('gemini.verify_liveness');
    const startTime = Date.now();

    try {
        const { expectedGesture } = req.body;

        if (!req.file) {
            span.setTag('error', true);
            span.finish();
            return res.status(400).json({ error: 'Photo is required' });
        }

        if (!expectedGesture) {
            span.setTag('error', true);
            span.finish();
            return res.status(400).json({ error: 'Expected gesture is required' });
        }

        const result = await verifyLivenessGesture(req.file.buffer, expectedGesture);

        // Track metrics
        const latency = Date.now() - startTime;
        const confidence = result.confidence || 0;
        const outcome = result.passed ? 'success' : 'failed';

        trackGeminiCall('verify-liveness', latency, confidence, outcome);

        span.setTag('liveness.result', result.passed);
        span.setTag('confidence.score', confidence);
        span.setTag('gesture', expectedGesture);
        span.finish();

        res.json(result);
    } catch (error) {
        const latency = Date.now() - startTime;

        console.error('[AI] Liveness verification error:', error);

        trackGeminiCall('verify-liveness', latency, 0, 'error');

        span.setTag('error', true);
        span.setTag('error.message', error.message);
        span.finish();

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

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'Video frames are required' });
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
            return res.status(400).json({ error: 'Insufficient frames for liveness verification' });
        }

        console.log(`[AI] Verifying liveness sequence with ${frames.length} frames`);

        const span = tracer.startSpan('gemini.verify_liveness_sequence');
        const startTime = Date.now();

        const result = await verifyLivenessSequence(frames, JSON.parse(stepSequence || '[]'));

        const latency = Date.now() - startTime;
        const confidence = result.confidence || 0;
        const outcome = result.passed ? 'success' : 'failed';

        trackGeminiCall('verify-liveness-sequence', latency, confidence, outcome);

        span.setTag('frames.count', frames.length);
        span.setTag('liveness.result', result.passed);
        span.setTag('confidence.score', confidence);
        span.finish();

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
            return res.status(400).json({ error: 'Wallet address is required' });
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
            return res.status(400).json({ error: 'Name is required' });
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

module.exports = router;
