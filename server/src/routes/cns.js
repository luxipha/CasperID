/**
 * CasperID Name Service (CNS) API Routes
 * Handles .cid name resolution and registration
 */

const express = require('express');
const router = express.Router();
const cnsResolver = require('../services/cns-resolver');
const { getRootNameForAccount, buildContextualName } = require('../services/contextual-names');
const { findCompletedPaymentForUser, finalizeCompletedPayment } = require('../services/payment-fulfillment');

// ============================================
// WALLET SANITIZATION UTILITY
// ============================================

/**
 * Sanitize wallet address for consistent lookups
 * Handles case sensitivity and whitespace issues
 * @param {string} wallet - Raw wallet address
 * @returns {string} - Normalized wallet address (trimmed, lowercase)
 */
function sanitizeWallet(wallet) {
    if (!wallet) return wallet;
    return wallet.trim().toLowerCase();
}

// Middleware to validate session
const validateSession = async (req, res, next) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({ success: false, error: 'Invalid session' });
        }

        req.session = sessionData.session;
        req.userAccount = sessionData.userAccount;
        next();
    } catch (error) {
        console.error('CNS Session validation error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

/**
 * GET /api/resolve/:name
 * Public endpoint to resolve any .cid name to its identity data
 * 
 * Examples:
 * - GET /api/resolve/alice.cid
 * - GET /api/resolve/work.alice.cid
 * - GET /api/resolve/balana-mona.cid
 */
router.get('/resolve/:name', async (req, res) => {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name parameter is required'
            });
        }

        const resolved = await cnsResolver.resolve(name);

        if (!resolved) {
            return res.status(404).json({
                success: false,
                error: 'Name not found',
                name: name
            });
        }

        // Return resolved data (privacy-filtered)
        res.json({
            success: true,
            data: {
                name: resolved.name,
                did: resolved.did,
                tier: resolved.tier,
                isPremium: resolved.isPremium,
                contextType: resolved.contextType,
                verified: resolved.verified,
                resolvedAt: resolved.resolvedAt,
                // Only include limited profile data
                profile: resolved.profileData ? {
                    displayName: resolved.profileData.display_name || resolved.profileData.firstName,
                    bio: resolved.profileData.bio,
                    avatar: resolved.profileData.avatar,
                    publicLinks: resolved.profileData.social_profiles
                } : null
            }
        });
    } catch (error) {
        console.error('CNS resolve error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resolve name'
        });
    }
});

/**
 * GET /api/cns/check/:name
 * Check if a name is available for registration
 */
router.get('/cns/check/:name', async (req, res) => {
    try {
        const { name } = req.params;

        const result = await cnsResolver.isNameAvailable(name);

        res.json({
            success: true,
            name: name,
            ...result
        });
    } catch (error) {
        console.error('CNS check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check name availability'
        });
    }
});

/**
 * POST /api/cns/register
 * Register a premium .cid name (authenticated)
 * Requires: name, payment confirmation
 */
router.post('/cns/register', validateSession, async (req, res) => {
    try {
        const { name, paymentReference } = req.body;
        const wallet = sanitizeWallet(req.userAccount.wallet);

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        // Check tier requirement (Layer 2+ for premium names)
        const { UserAccount } = require('../database/models');
        const userAccount = await UserAccount.findOne({ wallet });

        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'User account not found'
            });
        }

        if (!paymentReference) {
            return res.status(403).json({
                success: false,
                error: 'Completed payment reference is required for premium registration'
            });
        }

        const payment = await findCompletedPaymentForUser({
            reference: paymentReference,
            userId: userAccount.user_id,
            wallet,
            domainName: name
        });

        if (!payment) {
            return res.status(403).json({
                success: false,
                error: 'No completed payment found for this name'
            });
        }

        const result = await finalizeCompletedPayment(payment, {
            transactionId: payment.orderId || payment.reference
        });

        res.json({
            success: true,
            message: 'Name registered successfully',
            name: result.name,
            txHash: result.txHash,
            alreadyMinted: result.alreadyMinted
        });
    } catch (error) {
        console.error('CNS register error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to register name'
        });
    }
});

/**
 * GET /api/cns/my-names
 * Get all names owned by the authenticated user
 */
router.get('/cns/my-names', validateSession, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.userAccount.wallet);

        const { UserAccount } = require('../database/models');
        const { walletToHuman } = require('../utils/wallet-to-human');

        const userAccount = await UserAccount.findOne({ wallet });

        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'User account not found'
            });
        }

        const { humanId } = walletToHuman(wallet);
        const rootName = getRootNameForAccount(userAccount);

        const names = [];

        // Add Markov name (free)
        names.push({
            name: `${humanId}.cid`,
            type: 'markov',
            isPremium: false,
            contextType: 'master',
            did: userAccount.did_address
        });

        // Helper to ensure name ends with .cid (handles both formats)
        const ensureCidSuffix = (name) => name.endsWith('.cid') ? name : `${name}.cid`;

        // Add premium name if exists
        if (userAccount.cns_name) {
            names.push({
                name: ensureCidSuffix(userAccount.cns_name),
                type: 'premium',
                isPremium: true,
                contextType: 'master',
                did: userAccount.did_address
            });
        }

        // Add context DIDs as subdomains
        if (userAccount.context_dids && userAccount.context_dids.length > 0) {
            for (const contextDid of userAccount.context_dids) {
                names.push({
                    name: buildContextualName(contextDid.alias, rootName),
                    type: 'subdomain',
                    isPremium: !!userAccount.cns_name,
                    contextType: contextDid.context,
                    did: contextDid.did
                });
            }
        }

        res.json({
            success: true,
            wallet: wallet,
            tier: userAccount.tier,
            names: names
        });
    } catch (error) {
        console.error('CNS my-names error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch names'
        });
    }
});

/**
 * POST /api/cns/bind-subdomain
 * Bind a subdomain to a context DID
 */
router.post('/cns/bind-subdomain', validateSession, async (req, res) => {
    try {
        const { subdomain, contextDid } = req.body;
        const wallet = sanitizeWallet(req.userAccount.wallet);

        if (!subdomain || !contextDid) {
            return res.status(400).json({
                success: false,
                error: 'Subdomain and contextDid are required'
            });
        }

        const { UserAccount } = require('../database/models');
        const userAccount = await UserAccount.findOne({ wallet });

        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'User account not found'
            });
        }

        // Verify the user owns this context DID
        const contextExists = userAccount.context_dids?.some(c => c.did === contextDid);

        if (!contextExists) {
            return res.status(403).json({
                success: false,
                error: 'Context DID not found or not owned by user'
            });
        }

        // Update the context with the subdomain binding
        await UserAccount.updateOne(
            { wallet, 'context_dids.did': contextDid },
            { $set: { 'context_dids.$.alias': subdomain } }
        );

        res.json({
            success: true,
            message: 'Subdomain bound successfully',
            subdomain: subdomain,
            contextDid: contextDid
        });
    } catch (error) {
        console.error('CNS bind-subdomain error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to bind subdomain'
        });
    }
});

/**
 * GET /api/cns/routes
 * Get all routing preferences for the authenticated user
 */
router.get('/cns/routes', validateSession, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.userAccount.wallet);
        const { UserAccount } = require('../database/models');
        const userAccount = await UserAccount.findOne({ wallet });

        res.json({
            success: true,
            routes: userAccount?.cns_routing || []
        });
    } catch (error) {
        console.error('CNS get-routes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch routes'
        });
    }
});

/**
 * POST /api/cns/route
 * Save or update a routing preference for a name
 */
router.post('/cns/route', validateSession, async (req, res) => {
    try {
        const { name, target_type, target_id, redirect_url } = req.body;
        const wallet = sanitizeWallet(req.userAccount.wallet);

        if (!name || !target_type) {
            return res.status(400).json({
                success: false,
                error: 'Name and target_type are required'
            });
        }

        const { UserAccount } = require('../database/models');
        const userAccount = await UserAccount.findOne({ wallet });

        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'Account not found'
            });
        }

        // Initialize routing array if it doesn't exist
        if (!userAccount.cns_routing) {
            userAccount.cns_routing = [];
        }

        // Check if route already exists for this name
        const existingIndex = userAccount.cns_routing.findIndex(r => r.name === name);

        const newRoute = {
            name,
            target_type,
            target_id,
            redirect_url,
            active: true
        };

        if (existingIndex !== -1) {
            // Update existing route
            userAccount.cns_routing[existingIndex] = newRoute;
        } else {
            // Add new route
            userAccount.cns_routing.push(newRoute);
        }

        await userAccount.save();

        res.json({
            success: true,
            message: 'Routing preference saved successfully',
            route: newRoute
        });
    } catch (error) {
        console.error('CNS save-route error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save routing preference'
        });
    }
});

/**
 * POST /api/cns/subname
 * Create a sub-name tied to a Context DID (L2+ required)
 * 
 * Body: { parentName: "alice.cid", prefix: "gaming", contextType: "gaming" }
 * Result: gaming.alice.cid bound to a new Context DID
 */
router.post('/cns/subname', validateSession, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.userAccount.wallet);
        const { parentName, prefix, contextType } = req.body;

        // Validate required fields
        if (!parentName || !prefix || !contextType) {
            return res.status(400).json({
                success: false,
                error: 'parentName, prefix, and contextType are required'
            });
        }

        // Validate prefix format
        if (!/^[a-z][a-z0-9-]{0,14}$/.test(prefix)) {
            return res.status(400).json({
                success: false,
                error: 'Prefix must be 1-15 lowercase letters/numbers, starting with a letter'
            });
        }

        // Tier-gate: L2+ required for sub-names
        const { UserAccount } = require('../database/models');
        const userAccount = await UserAccount.findOne({ wallet });

        if (!userAccount || userAccount.tier === 'layer_1') {
            return res.status(403).json({
                success: false,
                error: 'Layer 2 or higher verification required for sub-names'
            });
        }

        const rootName = getRootNameForAccount(userAccount);
        const normalizedParentName = parentName.endsWith('.cid') ? parentName : `${parentName}.cid`;
        const expectedParentName = `${rootName}.cid`;

        if (normalizedParentName !== expectedParentName) {
            return res.status(403).json({
                success: false,
                error: 'You do not own this parent name'
            });
        }

        const subName = buildContextualName(prefix, rootName);

        if ((userAccount.context_dids || []).some((contextDid) => contextDid.alias === prefix)) {
            return res.status(400).json({
                success: false,
                error: 'Sub-name already exists'
            });
        }

        const contextDid = `did:casper:context:${prefix}:${Date.now().toString(36)}`;
        userAccount.context_dids = userAccount.context_dids || [];
        userAccount.cns_routing = userAccount.cns_routing || [];

        userAccount.context_dids.push({
            did: contextDid,
            alias: prefix,
            context: contextType,
            routing_type: 'identity',
            disclosures: {},
            tier_required: userAccount.tier,
            created_at: new Date()
        });

        userAccount.cns_routing.push({
            name: subName,
            target_type: 'context_did',
            target_id: contextDid,
            active: true
        });

        await userAccount.save();

        console.log(`[CNS] Created sub-name ${subName} -> ${contextDid}`);

        res.json({
            success: true,
            subName,
            contextDid,
            contextType,
            message: `Sub-name ${subName} created successfully`
        });
    } catch (error) {
        console.error('CNS subname creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create sub-name'
        });
    }
});

module.exports = router;
