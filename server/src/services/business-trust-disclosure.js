const { calculateTrustScore } = require('./trust-score');
const { TRUST_CAPACITY_SCOPE, resolveRequestedScopes } = require('../utils/business-scopes');

function publicRoleScore(result) {
    return {
        score: result.score,
        status: result.status,
        identity_readiness: result.identity_readiness,
        policy_version: result.policy_version
    };
}

/**
 * Builds the minimal, consented trust claim for a mobility Business App.
 * It deliberately excludes evidence, event history, reviews and reasons.
 */
async function buildTrustCapacityDisclosure(userId, app, now = new Date()) {
    if (!resolveRequestedScopes(app).includes(TRUST_CAPACITY_SCOPE)) return null;

    try {
        const [provider, consumer] = await Promise.all([
            calculateTrustScore(userId, 'provider'),
            calculateTrustScore(userId, 'consumer')
        ]);
        return {
            service_category: 'mobility',
            calculated_at: now.toISOString(),
            provider: publicRoleScore(provider),
            consumer: publicRoleScore(consumer)
        };
    } catch (error) {
        console.error('[BusinessTrustDisclosure] Could not calculate consented trust capacity:', error.message);
        return {
            service_category: 'mobility',
            calculated_at: now.toISOString(),
            status: 'unavailable',
            provider: null,
            consumer: null
        };
    }
}

module.exports = {
    buildTrustCapacityDisclosure,
    publicRoleScore
};
