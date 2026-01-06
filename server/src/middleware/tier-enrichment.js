const { IdentityCredential } = require('../database/models');
const { normalizeTier } = require('../utils/tier-sync');

/**
 * Middleware to enrich user object with latest tier from credentials
 * Ensures UI always shows correct verification status
 * 
 * This middleware should be applied AFTER authentication middleware
 * so that req.user already exists
 */
async function enrichUserWithTier(req, res, next) {
    // Only enrich if user is authenticated
    if (!req.user || !req.user.wallet) {
        return next();
    }

    try {
        // Get latest non-revoked credential
        const credential = await IdentityCredential.findOne({
            wallet: req.user.wallet,
            revoked: false
        }).sort({ created_at: -1 });

        if (credential) {
            const normalizedTier = normalizeTier(credential.tier);

            // Enrich user object with tier from credential (source of truth)
            req.user.tier = normalizedTier;
            req.user.tier = normalizedTier; // Ensure consistency

            // Add credential metadata for debugging
            req.user.credential_id = credential._id;
            req.user.last_kyc_at = credential.last_kyc_at;
        } else {
            // No credential found, default to layer_0
            req.user.tier = 'layer_0';
            req.user.tier = 'layer_0';
        }

    } catch (error) {
        console.error('[TIER-ENRICHMENT] Error enriching user tier:', error);
        // Don't block request on enrichment failure, just log and continue
    }

    next();
}

module.exports = enrichUserWithTier;
