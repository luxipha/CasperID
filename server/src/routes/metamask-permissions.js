const express = require('express');
const router = express.Router();
const metamaskPermissions = require('../services/metamask-permissions');
const {
    DappIntegration, PermissionGrant, UserAccount,
    PermissionUsage, UserProfile, VerificationRequest, Credential
} = require('../database/models');
const { v4: uuidv4 } = require('uuid');

// Import validation middleware
const {
    validateDappRegistration,
    validatePermissionRequest,
    validateVerificationExecution,
    validateMetaMaskLinking,
    validateApiKey,
    permissionRateLimit,
    securityHeaders
} = require('../middleware/validation');

const { verifyWalletSignature } = require('../utils/signature-verifier');

/**
 * MetaMask Advanced Permissions API Routes
 * Handles ERC-7715 permission grants for external dApps
 */

// ============================================
// DAPP REGISTRATION & MANAGEMENT
// ============================================

// Apply security headers to all routes
router.use(securityHeaders);

/**
 * Register a new dApp for permissions integration
 * POST /api/metamask/dapp/register
 */
router.post('/dapp/register', permissionRateLimit, validateDappRegistration, async (req, res) => {
    try {
        const {
            dappName,
            dappOrigin,
            developerEmail,
            supportedNetworks,
            webhookUrl
        } = req.body;

        if (!dappName || !dappOrigin) {
            return res.status(400).json({
                success: false,
                error: 'DApp name and origin are required'
            });
        }

        const result = await metamaskPermissions.registerDapp({
            dappName,
            dappOrigin,
            developerEmail,
            supportedNetworks,
            webhookUrl
        });

        res.json({
            success: true,
            message: 'DApp registered successfully',
            dapp: result
        });

    } catch (error) {
        console.error('DApp registration failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get dApp information
 * GET /api/metamask/dapp/:apiKey
 */
router.get('/dapp/:apiKey', async (req, res) => {
    try {
        const { apiKey } = req.params;

        const dapp = await DappIntegration.findOne({
            api_key: apiKey,
            active: true
        });

        if (!dapp) {
            return res.status(404).json({
                success: false,
                error: 'DApp not found'
            });
        }

        res.json({
            success: true,
            dapp: {
                dapp_id: dapp.dapp_id,
                dapp_name: dapp.dapp_name,
                dapp_origin: dapp.dapp_origin,
                supported_networks: dapp.supported_networks,
                verification_requirements: dapp.verification_requirements,
                total_verifications: dapp.total_verifications,
                total_users: dapp.total_users,
                created_at: dapp.created_at
            }
        });

    } catch (error) {
        console.error('DApp info retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// PERMISSION REQUESTS
// ============================================

/**
 * Request permissions from user
 * POST /api/metamask/permissions/request
 */
router.post('/permissions/request', permissionRateLimit, validateApiKey, validatePermissionRequest, async (req, res) => {
    try {
        const dappApiKey = req.headers['x-api-key'];

        if (!dappApiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required in X-API-Key header'
            });
        }

        const {
            metamaskAddress,
            userEmail,
            requestedPermissions,
            durationDays = 30,
            redirectUrl
        } = req.body;

        if (!metamaskAddress || !requestedPermissions) {
            return res.status(400).json({
                success: false,
                error: 'MetaMask address and permissions are required'
            });
        }

        const result = await metamaskPermissions.requestPermissions(dappApiKey, {
            metamaskAddress,
            userEmail,
            requestedPermissions,
            durationDays,
            redirectUrl
        });

        res.json({
            success: true,
            message: 'Permission request created',
            grant: result
        });

    } catch (error) {
        console.error('Permission request failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generate MetaMask permission request payload
 * POST /api/metamask/permissions/generate-payload
 */
router.post('/permissions/generate-payload', async (req, res) => {
    try {
        const dappApiKey = req.headers['x-api-key'];

        if (!dappApiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required'
            });
        }

        const { permissions, userAddress } = req.body;

        // Get dApp info
        const dapp = await DappIntegration.findOne({
            api_key: dappApiKey,
            active: true
        });

        if (!dapp) {
            return res.status(404).json({
                success: false,
                error: 'Invalid API key'
            });
        }

        const payload = metamaskPermissions.generatePermissionRequestPayload(
            dapp,
            permissions,
            userAddress
        );

        res.json({
            success: true,
            payload
        });

    } catch (error) {
        console.error('Payload generation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// VERIFICATION EXECUTION
// ============================================

/**
 * Execute verification using granted permissions
 * POST /api/metamask/verification/execute
 */
router.post('/verification/execute', async (req, res) => {
    try {
        const dappApiKey = req.headers['x-api-key'];

        if (!dappApiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required'
            });
        }

        const {
            grantId,
            verificationType,
            requestedFields,
            purpose,
            redirectUrl
        } = req.body;

        if (!grantId || !verificationType) {
            return res.status(400).json({
                success: false,
                error: 'Grant ID and verification type are required'
            });
        }

        const result = await metamaskPermissions.executeVerification(dappApiKey, {
            grantId,
            verificationType,
            requestedFields,
            purpose,
            redirectUrl
        });

        res.json({
            success: true,
            message: 'Verification initiated',
            verification: result
        });

    } catch (error) {
        console.error('Verification execution failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get verification status
 * GET /api/metamask/verification/:requestId
 */
router.get('/verification/:requestId', async (req, res) => {
    try {
        const dappApiKey = req.headers['x-api-key'];
        const { requestId } = req.params;

        if (!dappApiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required'
            });
        }

        const result = await metamaskPermissions.getVerificationStatus(dappApiKey, requestId);

        res.json({
            success: true,
            verification: result
        });

    } catch (error) {
        console.error('Verification status check failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// USER PERMISSION MANAGEMENT
// ============================================

/**
 * Get user's permission grants
 * GET /api/metamask/user/permissions
 */
router.get('/user/permissions', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await metamaskPermissions.getUserPermissions(sessionToken);

        res.json({
            success: true,
            userPermissions: result
        });

    } catch (error) {
        console.error('Get user permissions failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Revoke permission grant
 * DELETE /api/metamask/user/permissions/:grantId
 */
router.delete('/user/permissions/:grantId', async (req, res) => {
    try {
        const { grantId } = req.params;
        const { reason } = req.body;

        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await metamaskPermissions.revokePermission(
            sessionToken,
            grantId,
            reason
        );

        res.json({
            success: true,
            message: 'Permission revoked',
            revocation: result
        });

    } catch (error) {
        console.error('Permission revocation failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// LINK METAMASK ACCOUNT
// ============================================

/**
 * Link MetaMask address to existing CasperID account
 * POST /api/metamask/link-account
 */
router.post('/link-account', async (req, res) => {
    try {
        const { metamaskAddress, metamask_address, signature, message, chainId, chain } = req.body;
        const targetAddress = metamaskAddress || metamask_address;

        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!targetAddress) {
            return res.status(400).json({
                success: false,
                error: 'MetaMask address is required'
            });
        }

        // Validate current session
        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        // Verify signature if provided
        if (signature && message) {
            const isValid = verifyWalletSignature(message, signature, targetAddress);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid signature. Proof of ownership failed.'
                });
            }
        }

        // Link MetaMask address to user account
        const userAccount = await UserAccount.findOne({
            user_id: sessionData.userAccount.user_id
        });

        if (!userAccount) {
            return res.status(404).json({
                success: false,
                error: 'User account not found'
            });
        }

        // Check if address already linked to another account
        const existingLink = await UserAccount.findOne({
            metamask_address: targetAddress,
            user_id: { $ne: userAccount.user_id }
        });

        if (existingLink) {
            return res.status(400).json({
                success: false,
                error: 'MetaMask address already linked to another account'
            });
        }

        // Determine chain type (default to ethereum if not specified)
        let chainType = chain || 'ethereum';
        if (chainId) {
            const chainMap = {
                1: 'ethereum',
                137: 'polygon',
                42161: 'arbitrum',
                56: 'bsc',
                11155111: 'ethereum' // Sepolia
            };
            chainType = chainMap[chainId] || chainType;
        }

        // Add to linked_wallets if not already present
        const alreadyLinked = userAccount.linked_wallets.some(w =>
            w.address.toLowerCase() === targetAddress.toLowerCase()
        );

        if (!alreadyLinked) {
            userAccount.linked_wallets.push({
                chain: chainType,
                address: targetAddress,
                verified: true,
                verified_at: new Date()
            });
        }

        // For backward compatibility and identifying the "primary" metamask link
        if (!userAccount.metamask_address || !userAccount.metamask_connected) {
            userAccount.metamask_address = targetAddress;
            userAccount.metamask_connected = true;
        }

        userAccount.updated_at = new Date();
        await userAccount.save();

        res.json({
            success: true,
            message: 'MetaMask account linked successfully',
            userAccount: {
                user_id: userAccount.user_id,
                metamask_address: userAccount.metamask_address,
                metamask_connected: userAccount.metamask_connected,
                tier: userAccount.tier,
                linked_wallets: userAccount.linked_wallets
            }
        });

    } catch (error) {
        console.error('MetaMask linking failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Unlink MetaMask account
 * DELETE /api/metamask/unlink-account
 */
router.delete('/unlink-account', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Validate session
        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        // Revoke all active permission grants
        await PermissionGrant.updateMany(
            {
                user_id: sessionData.userAccount.user_id,
                status: 'active'
            },
            {
                status: 'revoked',
                revoked_reason: 'Account unlinked',
                updated_at: new Date()
            }
        );

        // Unlink MetaMask
        const userAccount = await UserAccount.findOne({
            user_id: sessionData.userAccount.user_id
        });

        userAccount.metamask_address = null;
        userAccount.metamask_connected = false;
        userAccount.updated_at = new Date();
        await userAccount.save();

        res.json({
            success: true,
            message: 'MetaMask account unlinked and all permissions revoked'
        });

    } catch (error) {
        console.error('MetaMask unlinking failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Unlink a specific wallet address from CasperID
 * DELETE /api/metamask/unlink-wallet/:address
 */
router.delete('/unlink-wallet/:address', async (req, res) => {
    try {
        const { address } = req.params;
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

        const userAccount = await UserAccount.findOne({
            user_id: sessionData.userAccount.user_id
        });

        if (!userAccount) {
            return res.status(404).json({ success: false, error: 'User account not found' });
        }

        // Remove from linked_wallets array
        userAccount.linked_wallets = userAccount.linked_wallets.filter(
            w => w.address.toLowerCase() !== address.toLowerCase()
        );

        // If this was the "primary" metamask address, clear it too
        if (userAccount.metamask_address && userAccount.metamask_address.toLowerCase() === address.toLowerCase()) {
            userAccount.metamask_address = null;
            userAccount.metamask_connected = false;
        }

        userAccount.updated_at = new Date();
        await userAccount.save();

        res.json({
            success: true,
            message: 'Wallet unlinked successfully'
        });

    } catch (error) {
        console.error('Wallet unlinking failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// ANALYTICS & MONITORING
// ============================================

/**
 * Get dApp analytics (for dApp developers)
 * GET /api/metamask/dapp/analytics
 */
router.get('/dapp/analytics', async (req, res) => {
    try {
        const dappApiKey = req.headers['x-api-key'];

        if (!dappApiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required'
            });
        }

        const dapp = await DappIntegration.findOne({
            api_key: dappApiKey,
            active: true
        });

        if (!dapp) {
            return res.status(404).json({
                success: false,
                error: 'DApp not found'
            });
        }

        // Get permission grants for this dApp
        const grants = await PermissionGrant.find({
            dapp_origin: dapp.dapp_origin
        });

        const activeGrants = grants.filter(g =>
            g.status === 'active' && g.expires_at > new Date()
        ).length;

        const analytics = {
            dappInfo: {
                name: dapp.dapp_name,
                origin: dapp.dapp_origin,
                createdAt: dapp.created_at
            },
            usage: {
                totalVerifications: dapp.total_verifications,
                totalUsers: dapp.total_users,
                activePermissions: activeGrants,
                totalPermissionGrants: grants.length
            },
            breakdown: {
                byStatus: {
                    active: grants.filter(g => g.status === 'active').length,
                    revoked: grants.filter(g => g.status === 'revoked').length,
                    expired: grants.filter(g => g.status === 'expired').length
                }
            }
        };

        res.json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error('Analytics retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});



/**
 * Update permission grant (Toggle scopes)
 * PATCH /api/metamask/user/permissions/:grantId
 */
router.patch('/user/permissions/:grantId', async (req, res) => {
    try {
        const { grantId } = req.params;
        const { permissions } = req.body; // Array of updated permissions

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

        const grant = await PermissionGrant.findOne({
            grant_id: grantId,
            user_id: sessionData.userAccount.user_id
        });

        if (!grant) {
            return res.status(404).json({ success: false, error: 'Grant not found' });
        }

        // Update permissions
        // In a real implementation, we might want to validate these against the DApp's allowed scopes again
        // For now, we trust the array conforms to schema
        grant.permissions = permissions;
        grant.updated_at = new Date();
        await grant.save();

        res.json({
            success: true,
            message: 'Permissions updated',
            grant
        });

    } catch (error) {
        console.error('Update permissions failed:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * Export user data
 * POST /api/metamask/user/export-data
 */
router.post('/user/export-data', async (req, res) => {
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

        const userId = sessionData.userAccount.user_id;

        // Gather all data
        const [
            userAccount,
            profile,
            verifications,
            credentials,
            grants,
            permissionUsage
        ] = await Promise.all([
            UserAccount.findOne({ user_id: userId }).lean(),
            UserProfile.findOne({ wallet: sessionData.userAccount.wallet }).lean(), // Assuming wallet link
            VerificationRequest.find({ wallet: sessionData.userAccount.wallet }).lean(),
            Credential.find({ wallet: sessionData.userAccount.wallet }).lean(),
            PermissionGrant.find({ user_id: userId }).lean(),
            PermissionUsage.find({ user_id: userId }).lean()
        ]);

        const exportData = {
            metadata: {
                exported_at: new Date(),
                user_id: userId
            },
            account: userAccount ? {
                username: userAccount.username,
                wallet: userAccount.wallet, // Fallback if not in account
                tier: userAccount.tier,
                created_at: userAccount.created_at
            } : null,
            profile: profile || {},
            verifications: verifications || [],
            credentials: credentials || [],
            connected_apps: grants || [],
            audit_log: permissionUsage || []
        };

        res.json({
            success: true,
            data: exportData
        });

    } catch (error) {
        console.error('Data export failed:', error);
        res.status(500).json({ success: false, error: 'Failed to export data' });
    }
});

module.exports = router;