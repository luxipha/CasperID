/**
 * Tier Level Constants
 * Single source of truth for all tier/verification level values
 * 
 * USE THIS EVERYWHERE - Backend models, frontend types, validation, etc.
 */

const TIER_LEVELS = {
    LAYER_0: 'layer_0',  // No verification (new user)
    LAYER_1: 'layer_1',  // Basic: Passkey + Email verified
    LAYER_2: 'layer_2',  // Liveness: Layer 1 + Liveness check completed
    LAYER_3: 'layer_3'   // Full KYC: Layer 2 + Government ID verified
};

// Array of all valid tier values (for schema enum)
const TIER_ENUM = Object.values(TIER_LEVELS);

// Numeric mapping for smart contracts (u8)
const TIER_NUMERIC = {
    [TIER_LEVELS.LAYER_0]: 0,
    [TIER_LEVELS.LAYER_1]: 1,
    [TIER_LEVELS.LAYER_2]: 2,
    [TIER_LEVELS.LAYER_3]: 3
};

// Tier display names for UI
const TIER_LABELS = {
    [TIER_LEVELS.LAYER_0]: 'Not Verified',
    [TIER_LEVELS.LAYER_1]: 'Basic',
    [TIER_LEVELS.LAYER_2]: 'Liveness Verified',
    [TIER_LEVELS.LAYER_3]: 'Fully Verified'
};

// Persona limits per tier
const PERSONA_LIMITS = {
    [TIER_LEVELS.LAYER_0]: 0,
    [TIER_LEVELS.LAYER_1]: 1,
    [TIER_LEVELS.LAYER_2]: 5,
    [TIER_LEVELS.LAYER_3]: 10
};

// Tier progression order
const TIER_ORDER = [
    TIER_LEVELS.LAYER_0,
    TIER_LEVELS.LAYER_1,
    TIER_LEVELS.LAYER_2,
    TIER_LEVELS.LAYER_3
];

/**
 * Get tier index for comparison
 * @param {string} tier - Tier level
 * @returns {number} Index in progression (0-3)
 */
function getTierIndex(tier) {
    return TIER_ORDER.indexOf(tier);
}

/**
 * Compare two tiers
 * @param {string} tier1 
 * @param {string} tier2 
 * @returns {number} -1 if tier1 < tier2, 0 if equal, 1 if tier1 > tier2
 */
function compareTiers(tier1, tier2) {
    const index1 = getTierIndex(tier1);
    const index2 = getTierIndex(tier2);
    return index1 - index2;
}

/**
 * Normalize legacy tier values to standard format
 * @param {string} tier - Any tier value (including legacy)
 * @returns {string} Normalized tier (layer_0, layer_1, layer_2, or layer_3)
 */
function normalizeTier(tier) {
    if (!tier) return TIER_LEVELS.LAYER_0;

    // Legacy mappings
    const legacyMap = {
        'layer_1': TIER_LEVELS.LAYER_1,
        'layer_3': TIER_LEVELS.LAYER_3
    };

    // Return normalized or already-standard value
    return legacyMap[tier] || tier;
}

/**
 * Get persona limit for a specific tier
 * @param {string} tier 
 * @returns {number}
 */
function getPersonaLimit(tier) {
    return PERSONA_LIMITS[tier] || 0;
}

module.exports = {
    TIER_LEVELS,
    TIER_ENUM,
    TIER_NUMERIC,
    TIER_LABELS,
    TIER_ORDER,
    PERSONA_LIMITS,
    getTierIndex,
    compareTiers,
    normalizeTier,
    getPersonaLimit
};
