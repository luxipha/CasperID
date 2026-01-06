const { UserAccount, IdentityCredential } = require('../database/models');

/**
 * Tier Synchronization Utility
 * Ensures UserAccount.tier is always synchronized with IdentityCredentials.tier
 * IdentityCredentials.tier is the source of truth
 */

/**
 * Syncs tier from IdentityCredentials to UserAccount
 * @param {string} wallet - The wallet address to sync
 * @param {object} options - Optional settings
 * @param {boolean} options.skipIfEqual - Skip update if already synced
 * @returns {Promise<{success: boolean, tier: string, updated: boolean}>}
 */
async function syncTierToUserAccount(wallet, options = {}) {
    const { skipIfEqual = true } = options;

    try {
        // Get latest credential for this wallet
        const credential = await IdentityCredential.findOne({ wallet, revoked: false })
            .sort({ created_at: -1 });

        if (!credential) {
            console.warn(`[TIER-SYNC] No credential found for wallet: ${wallet}`);
            return { success: false, tier: null, updated: false };
        }

        // Normalize tier value (handle legacy values)
        let normalizedTier = normalizeTier(credential.tier);

        // Get user account
        const userAccount = await UserAccount.findOne({ wallet });

        if (!userAccount) {
            console.warn(`[TIER-SYNC] No UserAccount found for wallet: ${wallet}`);
            return { success: false, tier: normalizedTier, updated: false };
        }

        // Check if already synced
        if (skipIfEqual && userAccount.tier === normalizedTier) {
            console.log(`[TIER-SYNC] Already synced for ${wallet}: ${normalizedTier}`);
            return { success: true, tier: normalizedTier, updated: false };
        }

        // Update UserAccount
        userAccount.tier = normalizedTier;
        await userAccount.save();

        console.log(`[TIER-SYNC] ✅ Synced ${wallet}: ${userAccount.tier} → ${normalizedTier}`);

        return {
            success: true,
            tier: normalizedTier,
            updated: true,
            previousTier: userAccount.tier
        };

    } catch (error) {
        console.error(`[TIER-SYNC] Error syncing tier for ${wallet}:`, error);
        return { success: false, error: error.message, updated: false };
    }
}

/**
 * Normalize tier values to standard layer_0 through layer_3 format
 * @param {string} tier - The tier value to normalize
 * @returns {string} Normalized tier value
 */
function normalizeTier(tier) {
    if (!tier) return 'layer_0';

    const tierMap = {
        'layer_1': 'layer_1',        // Basic verification (passkey + email)
        'layer_3': 'layer_3',     // Full KYC verification
        'layer_0': 'layer_0',      // No verification
        'layer_1': 'layer_1',      // Passkey + email
        'layer_2': 'layer_2',      // + Liveness check
        'layer_3': 'layer_3'       // + Full KYC
    };

    return tierMap[tier] || 'layer_1';
}

/**
 * Sync all user accounts in batch
 * Use for migrations or mass updates
 * @param {object} options - Batch options
 * @param {number} options.limit - Max number of accounts to sync
 * @param {boolean} options.dryRun - If true, only log changes without saving
 * @returns {Promise<{total: number, synced: number, skipped: number, errors: number}>}
 */
async function syncAllTiers(options = {}) {
    const { limit = null, dryRun = false } = options;

    console.log(`[TIER-SYNC] Starting batch sync... ${dryRun ? '(DRY RUN)' : ''}`);

    let query = UserAccount.find({});
    if (limit) query = query.limit(limit);

    const users = await query;
    const stats = { total: users.length, synced: 0, skipped: 0, errors: 0 };

    for (const user of users) {
        try {
            const credential = await IdentityCredential
                .findOne({ wallet: user.wallet, revoked: false })
                .sort({ created_at: -1 });

            if (!credential) {
                console.log(`[TIER-SYNC] No credential for ${user.wallet}, skipping`);
                stats.skipped++;
                continue;
            }

            const normalizedTier = normalizeTier(credential.tier);

            if (user.tier === normalizedTier) {
                stats.skipped++;
                continue;
            }

            console.log(`[TIER-SYNC] ${user.wallet}: ${user.tier} → ${normalizedTier}`);

            if (!dryRun) {
                user.tier = normalizedTier;
                await user.save();

                // Also normalize the credential tier if needed
                if (credential.tier !== normalizedTier) {
                    credential.tier = normalizedTier;
                    await credential.save();
                }
            }

            stats.synced++;

        } catch (error) {
            console.error(`[TIER-SYNC] Error syncing ${user.wallet}:`, error);
            stats.errors++;
        }
    }

    console.log(`[TIER-SYNC] Batch complete:`, stats);
    return stats;
}

/**
 * Get tier comparison for debugging
 * @param {string} wallet - Wallet address
 * @returns {Promise<object>} Comparison data
 */
async function getTierComparison(wallet) {
    const userAccount = await UserAccount.findOne({ wallet });
    const credential = await IdentityCredential
        .findOne({ wallet, revoked: false })
        .sort({ created_at: -1 });

    return {
        wallet,
        userAccount: {
            exists: !!userAccount,
            tier: userAccount?.tier || null
        },
        credential: {
            exists: !!credential,
            tier: credential?.tier || null,
            normalized: credential ? normalizeTier(credential.tier) : null
        },
        inSync: userAccount?.tier === (credential ? normalizeTier(credential.tier) : null)
    };
}

module.exports = {
    syncTierToUserAccount,
    normalizeTier,
    syncAllTiers,
    getTierComparison
};
