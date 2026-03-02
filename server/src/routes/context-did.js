const express = require('express');
const router = express.Router();
const { UserAccount } = require('../database/models');
const { v4: uuidv4 } = require('uuid');
const { TIER_LEVELS, getPersonaLimit } = require('../constants/tier-levels');

/**
 * Context DID Management Routes
 * Handles creation and management of tier-gated context DIDs
 */

// Middleware to validate session
const validateSession = async (req, res, next) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        req.userAccount = sessionData.userAccount;
        next();
    } catch (error) {
        console.error('Session validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Create a new Context DID
 * POST /api/passkey/context-did/create
 * Body: { context: string, alias: string }
 */
router.post('/create', validateSession, async (req, res) => {
    try {
        const { context, alias, disclosures, routingType, targetWallet } = req.body;
        const { userAccount } = req;

        if (!context) {
            return res.status(400).json({ error: 'Context type is required' });
        }

        if (!alias) {
            return res.status(400).json({ error: 'Alias (handle) is required' });
        }

        // TIER-BASED PERSONA LIMITS
        const personaCount = userAccount.context_dids?.length || 0;
        const personaLimit = getPersonaLimit(userAccount.tier);

        if (personaCount >= personaLimit) {
            const nextTierMap = {
                [TIER_LEVELS.LAYER_1]: 'Layer 2',
                [TIER_LEVELS.LAYER_2]: 'Layer 3'
            };
            const nextTierName = nextTierMap[userAccount.tier];

            return res.status(403).json({
                error: `Persona limit reached for your current tier (${userAccount.tier}). You have ${personaCount}/${personaLimit} personas.`,
                limit_reached: true,
                current_count: personaCount,
                limit: personaLimit,
                next_tier_required: nextTierName
            });
        }

        // CONTEXT TYPE GATING
        // Layer 1 & 2: Restricted from high-security/business contexts
        const restrictedContexts = ['professional', 'government', 'banking'];
        if ((userAccount.tier === TIER_LEVELS.LAYER_1 || userAccount.tier === TIER_LEVELS.LAYER_2) && restrictedContexts.includes(context)) {
            return res.status(403).json({
                error: `Layer 3 verification required for '${context}' context`,
                current_tier: userAccount.tier,
                required_tier: TIER_LEVELS.LAYER_3
            });
        }

        // Check if alias already exists for this user
        const existingAlias = userAccount.context_dids?.find(c => c.alias === alias);
        if (existingAlias) {
            return res.status(400).json({ error: `Persona with alias '${alias}' already exists` });
        }

        // Generate Context DID
        const { v4: uuidv4 } = require('uuid');
        const didSuffix = uuidv4().split('-')[0];
        const contextDID = `did:casper:context:${alias}:${didSuffix}`;

        // Get master name (strip .cid if already present to avoid double suffix)
        let masterName = userAccount.cns_name || userAccount.human_id;
        if (masterName && masterName.endsWith('.cid')) {
            masterName = masterName.slice(0, -4); // Remove trailing .cid
        }

        // Build the full name: alias.masterName.cid
        const fullName = masterName ? `${alias}.${masterName}.cid` : null;

        // Prepare context DID object - ALWAYS saved for both identity and wallet types
        const contextDidObj = {
            did: contextDID,
            alias: alias,
            context: context,
            routing_type: routingType || 'identity',
            target_wallet: routingType === 'wallet' ? targetWallet : undefined,
            disclosures: routingType === 'identity' ? (disclosures || {}) : {},
            tier_required: userAccount.tier,
            created_at: new Date()
        };

        // Prepare the update object with combined $push
        const updateObj = {
            $push: {
                context_dids: contextDidObj
            }
        };

        // Also add to cns_routing if we have a master name
        if (fullName) {
            const routingEntry = {
                name: fullName,
                target_type: routingType === 'wallet' ? 'wallet_only' : 'context_did',
                target_id: routingType === 'wallet' ? targetWallet : contextDID,
                active: true
            };
            updateObj.$push.cns_routing = routingEntry;
        }

        // Save to UserAccount
        const updatedUser = await UserAccount.findOneAndUpdate(
            { user_id: userAccount.user_id },
            updateObj,
            { new: true }
        );

        res.json({
            success: true,
            message: 'Context DID created successfully',
            context_did: {
                did: contextDID,
                alias: alias,
                context: context,
                routing_type: routingType || 'identity',
                full_name: fullName,
                tier: userAccount.tier
            }
        });

    } catch (error) {
        console.error('Create Context DID error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * List all Context DIDs
 * GET /api/passkey/context-did/list
 */
router.get('/list', validateSession, async (req, res) => {
    try {
        // Only select the fields we need for better performance
        const user = await UserAccount.findOne({ user_id: req.userAccount.user_id })
            .select('did_address context_dids')
            .lean();

        res.json({
            success: true,
            master_did: user?.did_address,
            context_dids: user?.context_dids || []
        });

    } catch (error) {
        console.error('List Context DIDs error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Revoke a Context DID
 * DELETE /api/passkey/context-did/:did
 */
router.delete('/:did', validateSession, async (req, res) => {
    try {
        const { did } = req.params;
        const { userAccount } = req;

        // Remove from UserAccount
        await UserAccount.updateOne(
            { user_id: userAccount.user_id },
            {
                $pull: {
                    context_dids: { did: did }
                }
            }
        );

        res.json({
            success: true,
            message: 'Context DID revoked successfully'
        });

    } catch (error) {
        console.error('Revoke Context DID error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
