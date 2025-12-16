/**
 * Datadog Metrics Helper
 * Simplified interface for emitting custom metrics
 */

const metrics = require('datadog-metrics');

// Initialize metrics client
metrics.init({
    host: 'casperid-api',
    prefix: 'casperid.',
    defaultTags: [
        `env:${process.env.NODE_ENV || 'development'}`,
        'service:casperid-api'
    ],
    flushIntervalSeconds: 15
});

/**
 * Track Gemini API call
 * @param {string} endpoint - API endpoint (verify-kyc, verify-liveness)
 * @param {number} latency - Response time in ms
 * @param {number} confidence - AI confidence score (0-1)
 * @param {string} result - success/failure
 */
function trackGeminiCall(endpoint, latency, confidence, result) {
    metrics.gauge('gemini.latency', latency, [`endpoint:${endpoint}`, `result:${result}`]);
    metrics.gauge('gemini.confidence', confidence, [`endpoint:${endpoint}`]);
    metrics.increment('gemini.calls.total', 1, [`endpoint:${endpoint}`, `result:${result}`]);
}

/**
 * Track verification outcome
 * @param {string} tier - Verification tier (basic, full_kyc)
 * @param {boolean} verified - Verification result
 * @param {string} reason - Rejection reason if failed
 */
function trackVerification(tier, verified, reason = null) {
    const outcome = verified ? 'success' : 'failed';
    metrics.increment('verification.result', 1, [
        `tier:${tier}`,
        `outcome:${outcome}`,
        ...(reason ? [`reason:${reason}`] : [])
    ]);
}

/**
 * Track fraud attempt
 * @param {string} type - Type of fraud detected
 * @param {string} wallet - Wallet address (hashed for privacy)
 */
function trackFraudAttempt(type, wallet) {
    metrics.increment('fraud.attempts', 1, [`type:${type}`]);
    console.warn(`[FRAUD] Detected ${type} from wallet ${wallet.slice(0, 10)}...`);
}

/**
 * Track token usage (for cost monitoring)
 * @param {number} inputTokens - Input tokens used
 * @param {number} outputTokens - Output tokens generated
 * @param {string} model - Model name
 */
function trackTokenUsage(inputTokens, outputTokens, model) {
    metrics.increment('gemini.tokens.input', inputTokens, [`model:${model}`]);
    metrics.increment('gemini.tokens.output', outputTokens, [`model:${model}`]);

    // Estimate cost (example rates, adjust based on actual pricing)
    const estimatedCost = (inputTokens * 0.00001) + (outputTokens * 0.00003);
    metrics.gauge('gemini.cost.estimated', estimatedCost, [`model:${model}`]);
}

/**
 * Track document quality
 * @param {string} documentType - Type of document (passport, drivers_license, etc)
 * @param {number} qualityScore - Quality score (0-1)
 */
function trackDocumentQuality(documentType, qualityScore) {
    metrics.gauge('document.quality', qualityScore, [`type:${documentType}`]);
}

/**
 * Flush metrics immediately (useful for testing)
 */
function flush() {
    metrics.flush();
}

// ============================================================================
// DAY 5: ADVANCED METRICS
// ============================================================================

/**
 * Track cost per verification (business metric)
 * @param {number} cost - Total cost in dollars
 * @param {boolean} successful - Whether verification succeeded
 * @param {string} tier - Verification tier
 */
function trackCostPerVerification(cost, successful, tier) {
    // Track individual cost
    metrics.gauge('business.cost_per_attempt', cost, [
        `tier:${tier}`,
        `outcome:${successful ? 'success' : 'failed'}`
    ]);

    // Track cost efficiency (negative cost for failures)
    const efficiency = successful ? cost : -cost;
    metrics.gauge('business.verification_efficiency', efficiency, [`tier:${tier}`]);

    console.log(`[Business] Verification cost: $${cost.toFixed(4)} (${successful ? 'success' : 'failed'})`);
}

/**
 * Track model version performance (ML maturity)
 * @param {string} modelVersion - Model version (e.g., 'gemini-1.5-pro')
 * @param {number} confidence - Confidence score
 * @param {boolean} successful - Verification result
 * @param {number} latency - Response time
 */
function trackModelVersion(modelVersion, confidence, successful, latency) {
    metrics.gauge('ml.model.confidence', confidence, [`model:${modelVersion}`]);
    metrics.gauge('ml.model.latency', latency, [`model:${modelVersion}`]);
    metrics.increment('ml.model.calls', 1, [
        `model:${modelVersion}`,
        `outcome:${successful ? 'success' : 'failed'}`
    ]);

    console.log(`[ML] Model ${modelVersion}: confidence=${confidence}, latency=${latency}ms`);
}

/**
 * Track false positives/negatives (quality metric)
 * @param {string} aiDecision - AI decision (approved/rejected)
 * @param {string} humanDecision - Human override decision (if any)
 * @param {number} aiConfidence - AI confidence score
 * @param {string} tier - Verification tier
 */
function trackFalsePositive(aiDecision, humanDecision, aiConfidence, tier) {
    // Only track when human overrides AI
    if (aiDecision !== humanDecision) {
        const errorType = aiDecision === 'approved' ? 'false_positive' : 'false_negative';

        metrics.increment('ml.errors', 1, [
            `type:${errorType}`,
            `tier:${tier}`,
            `confidence:${aiConfidence > 0.8 ? 'high' : aiConfidence > 0.6 ? 'medium' : 'low'}`
        ]);

        console.warn(`[Quality] ${errorType} detected: AI=${aiDecision}, Human=${humanDecision}, Confidence=${aiConfidence}`);
    }
}

/**
 * Track geographic performance (visual heatmap)
 * @param {string} country - Country code (ISO 2-letter)
 * @param {boolean} successful - Verification result
 * @param {number} confidence - AI confidence
 * @param {number} latency - Response time
 */
function trackGeographicPerformance(country, successful, confidence, latency) {
    const countryTag = country || 'unknown';

    metrics.increment('geo.verifications', 1, [
        `country:${countryTag}`,
        `outcome:${successful ? 'success' : 'failed'}`
    ]);

    metrics.gauge('geo.confidence', confidence, [`country:${countryTag}`]);
    metrics.gauge('geo.latency', latency, [`country:${countryTag}`]);

    console.log(`[Geo] ${countryTag}: ${successful ? 'success' : 'failed'}, confidence=${confidence}`);
}

/**
 * Track adversarial attack attempts (security)
 * @param {string} attackType - Type of attack detected
 * @param {string} severity - Severity level (low/medium/high/critical)
 * @param {object} metadata - Additional attack metadata
 */
function trackAdversarialAttack(attackType, severity, metadata = {}) {
    metrics.increment('security.adversarial.attempts', 1, [
        `type:${attackType}`,
        `severity:${severity}`
    ]);

    console.warn(`[SECURITY] Adversarial attack detected: ${attackType} (${severity})`, metadata);

    // Critical attacks trigger immediate alert metric
    if (severity === 'critical') {
        metrics.increment('security.critical_threats', 1, [`type:${attackType}`]);
    }
}

/**
 * Detect potential adversarial patterns in verification request
 * @param {object} verificationData - Verification request data
 * @returns {object} Detection result
 */
function detectAdversarialPatterns(verificationData) {
    const patterns = [];

    // Pattern 1: Suspiciously perfect confidence (possible synthetic data)
    if (verificationData.confidence > 0.99) {
        patterns.push({
            type: 'synthetic_data_suspected',
            severity: 'medium',
            reason: 'Confidence too perfect (>99%)'
        });
    }

    // Pattern 2: Multiple failed attempts from same source
    if (verificationData.previousAttempts > 5) {
        patterns.push({
            type: 'brute_force_pattern',
            severity: 'high',
            reason: `${verificationData.previousAttempts} attempts from same source`
        });
    }

    // Pattern 3: Unusual verification timing (too fast)
    if (verificationData.submissionTime < 2000) { // Less than 2 seconds
        patterns.push({
            type: 'automated_submission',
            severity: 'medium',
            reason: 'Submission unusually fast (<2s)'
        });
    }

    // Track detected patterns
    patterns.forEach(pattern => {
        trackAdversarialAttack(pattern.type, pattern.severity, {
            reason: pattern.reason,
            wallet: verificationData.wallet?.slice(0, 10)
        });
    });

    return {
        detected: patterns.length > 0,
        patterns,
        riskScore: patterns.reduce((score, p) => {
            const weights = { low: 1, medium: 3, high: 7, critical: 10 };
            return score + (weights[p.severity] || 0);
        }, 0)
    };
}

module.exports = {
    trackGeminiCall,
    trackVerification,
    trackFraudAttempt,
    trackTokenUsage,
    trackDocumentQuality,
    flush,
    // Day 5: Advanced metrics
    trackCostPerVerification,
    trackModelVersion,
    trackFalsePositive,
    trackGeographicPerformance,
    trackAdversarialAttack,
    detectAdversarialPatterns,
    metrics // Export raw metrics client for advanced use
};
