const express = require('express');
const router = express.Router();
const { UserAccount } = require('../database/models');
const { v4: uuidv4 } = require('uuid');

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
        const { context, alias } = req.body;
        const { userAccount } = req;

        if (!context) {
            return res.status(400).json({ error: 'Context is required' });
        }

        // TIER GATING LOGIC
        // Layer 1: No Context DIDs allowed
        if (userAccount.tier === 'layer_1') {
            return res.status(403).json({
                error: 'Layer 2 verification required to create Context DIDs',
                current_tier: userAccount.tier,
                required_tier: 'layer_2'
            });
        }

        // Layer 2: Only pseudonymous contexts allowed (basic)
        // Layer 3: Unrestricted contexts
        const restrictedContexts = ['professional', 'government', 'banking'];
        if (userAccount.tier === 'layer_2' && restrictedContexts.includes(context)) {
            return res.status(403).json({
                error: `Layer 3 verification required for '${context}' context`,
                current_tier: userAccount.tier,
                required_tier: 'layer_3'
            });
        }

        // Check if context DID already exists for this context
        const existingContext = userAccount.context_dids?.find(c => c.context === context);
        if (existingContext) {
            return res.status(400).json({ error: `Context DID for '${context}' already exists` });
        }

        // Generate Context DID
        // Format: did:casper:context:<context-name>:<uuid-suffix>
        const didSuffix = uuidv4().split('-')[0];
        const contextDID = `did:casper:context:${context}:${didSuffix}`;

        // Save to UserAccount
        const updatedUser = await UserAccount.findOneAndUpdate(
            { user_id: userAccount.user_id },
            {
                $push: {
                    context_dids: {
                        did: contextDID,
                        context: context,
                        tier_required: userAccount.tier,
                        created_at: new Date()
                    }
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Context DID created successfully',
            context_did: {
                did: contextDID,
                context: context,
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
        const user = await UserAccount.findOne({ user_id: req.userAccount.user_id });

        res.json({
            success: true,
            master_did: user.did_address,
            context_dids: user.context_dids || []
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
