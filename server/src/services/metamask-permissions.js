const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const {
    UserAccount,
    PermissionGrant,
    PermissionUsage,
    DappIntegration,
    VerificationRequestV2
} = require('../database/models');

/**
 * MetaMask Advanced Permissions Service
 * Handles ERC-7715 permission grants for verification services
 * Enables dApps to request verification permissions from users
 */
class MetaMaskPermissionsService {
    constructor() {
        this.SUPPORTED_NETWORKS = [
            { chainId: 1, name: 'Ethereum Mainnet' },
            { chainId: 11155111, name: 'Sepolia' },
            { chainId: 8453, name: 'Base' },
            { chainId: 84532, name: 'Base Sepolia' }
        ];
        
        this.DEFAULT_VERIFICATION_PRICING = {
            layer_2: { amount: 5, currency: 'USDC' },
            layer_3: { amount: 10, currency: 'USDC' }
        };
    }

    /**
     * Register a new dApp for permissions integration
     */
    async registerDapp(dappInfo) {
        try {
            const {
                dappName,
                dappOrigin,
                developerEmail,
                supportedNetworks = [],
                webhookUrl
            } = dappInfo;

            if (!dappName || !dappOrigin) {
                throw new Error('DApp name and origin are required');
            }

            // Check if dApp already exists
            const existingDapp = await DappIntegration.findOne({ dapp_origin: dappOrigin });
            if (existingDapp) {
                throw new Error('DApp already registered with this origin');
            }

            // Generate API key
            const apiKey = `ck_${crypto.randomBytes(32).toString('hex')}`;
            const dappId = uuidv4();

            const dappIntegration = new DappIntegration({
                dapp_id: dappId,
                dapp_name: dappName,
                dapp_origin: dappOrigin,
                developer_email: developerEmail,
                api_key: apiKey,
                webhook_url: webhookUrl,
                supported_networks: supportedNetworks.length > 0 ? supportedNetworks : this.SUPPORTED_NETWORKS,
                verification_requirements: [
                    {
                        tier: 'layer_2',
                        required_fields: ['liveness_verified'],
                        max_spend_per_verification: this.DEFAULT_VERIFICATION_PRICING.layer_2
                    },
                    {
                        tier: 'layer_3',
                        required_fields: ['identity_verified', 'liveness_verified'],
                        max_spend_per_verification: this.DEFAULT_VERIFICATION_PRICING.layer_3
                    }
                ]
            });

            await dappIntegration.save();

            return {
                dappId,
                apiKey,
                dappInfo: {
                    dapp_id: dappId,
                    dapp_name: dappName,
                    dapp_origin: dappOrigin,
                    supported_networks: dappIntegration.supported_networks,
                    verification_requirements: dappIntegration.verification_requirements
                }
            };

        } catch (error) {
            console.error('DApp registration failed:', error);
            throw new Error(`DApp registration failed: ${error.message}`);
        }
    }

    /**
     * Request permission grant from user via MetaMask
     * Creates permission request that user can approve in MetaMask
     */
    async requestPermissions(dappApiKey, permissionRequest) {
        try {
            const {
                metamaskAddress,
                userEmail,
                requestedPermissions,
                durationDays = 30,
                redirectUrl
            } = permissionRequest;

            if (!metamaskAddress || !requestedPermissions) {
                throw new Error('MetaMask address and permissions are required');
            }

            // Validate dApp
            const dapp = await DappIntegration.findOne({ 
                api_key: dappApiKey,
                active: true 
            });

            if (!dapp) {
                throw new Error('Invalid or inactive dApp API key');
            }

            // Find or create user account
            let userAccount;
            if (userEmail) {
                userAccount = await UserAccount.findOne({ recovery_email: userEmail });
            } else {
                // Try to find by MetaMask address (if previously linked)
                userAccount = await UserAccount.findOne({ metamask_address: metamaskAddress });
            }

            if (!userAccount) {
                throw new Error('User account not found. User must complete CasperID registration first.');
            }

            // Validate requested permissions
            const validatedPermissions = this.validatePermissions(requestedPermissions, dapp);

            // Check for existing active grants
            const existingGrant = await PermissionGrant.findOne({
                user_id: userAccount.user_id,
                dapp_origin: dapp.dapp_origin,
                status: 'active',
                expires_at: { $gt: new Date() }
            });

            if (existingGrant) {
                // Update existing grant with new permissions
                existingGrant.permissions.push(...validatedPermissions);
                existingGrant.updated_at = new Date();
                await existingGrant.save();

                return {
                    grantId: existingGrant.grant_id,
                    status: 'updated',
                    permissions: existingGrant.permissions,
                    expiresAt: existingGrant.expires_at
                };
            }

            // Create new permission grant
            const grantId = uuidv4();
            const expiresAt = new Date(Date.now() + (durationDays * 24 * 60 * 60 * 1000));

            const permissionGrant = new PermissionGrant({
                grant_id: grantId,
                user_id: userAccount.user_id,
                metamask_address: metamaskAddress,
                dapp_origin: dapp.dapp_origin,
                permissions: validatedPermissions,
                expires_at: expiresAt
            });

            await permissionGrant.save();

            // Update user account with MetaMask connection
            if (!userAccount.metamask_connected) {
                userAccount.metamask_address = metamaskAddress;
                userAccount.metamask_connected = true;
                await userAccount.save();
            }

            return {
                grantId,
                status: 'granted',
                permissions: validatedPermissions,
                expiresAt,
                redirectUrl,
                userAccount: {
                    user_id: userAccount.user_id,
                    tier: userAccount.tier,
                    metamask_connected: true
                }
            };

        } catch (error) {
            console.error('Permission request failed:', error);
            throw new Error(`Permission request failed: ${error.message}`);
        }
    }

    /**
     * Execute verification using granted permissions
     */
    async executeVerification(dappApiKey, verificationRequest) {
        try {
            const {
                grantId,
                verificationType, // 'layer_2' or 'layer_3'
                requestedFields = [],
                purpose,
                redirectUrl
            } = verificationRequest;

            if (!grantId || !verificationType) {
                throw new Error('Grant ID and verification type are required');
            }

            // Validate dApp
            const dapp = await DappIntegration.findOne({ 
                api_key: dappApiKey,
                active: true 
            });

            if (!dapp) {
                throw new Error('Invalid dApp API key');
            }

            // Validate permission grant
            const grant = await PermissionGrant.findOne({
                grant_id: grantId,
                dapp_origin: dapp.dapp_origin,
                status: 'active',
                expires_at: { $gt: new Date() }
            });

            if (!grant) {
                throw new Error('Invalid or expired permission grant');
            }

            // Check if user has required verification permission
            const hasVerificationPermission = grant.permissions.some(perm => 
                (perm.action === 'verify:identity' || 
                 perm.action === 'verify:liveness' || 
                 perm.action === 'verify:kyc') &&
                perm.scope.tier === verificationType
            );

            if (!hasVerificationPermission) {
                throw new Error(`No permission for ${verificationType} verification`);
            }

            // Check spending limits if applicable
            const spendPermission = grant.permissions.find(perm => perm.action === 'spend:verification_fee');
            if (spendPermission) {
                const todaysUsage = await this.calculateTodaysUsage(grantId);
                const verificationCost = this.DEFAULT_VERIFICATION_PRICING[verificationType];
                
                if (todaysUsage.amount + verificationCost.amount > spendPermission.scope.spend_limit.amount) {
                    throw new Error('Daily spending limit exceeded');
                }
            }

            // Create verification request
            const requestId = uuidv4();
            const verificationRequestV2 = new VerificationRequestV2({
                request_id: requestId,
                user_id: grant.user_id,
                dapp_id: dapp.dapp_id,
                grant_id: grantId,
                verification_tier: verificationType,
                requested_fields: requestedFields,
                purpose,
                redirect_url: redirectUrl,
                status: 'pending'
            });

            await verificationRequestV2.save();

            // Record permission usage
            const usageId = uuidv4();
            const permissionUsage = new PermissionUsage({
                usage_id: usageId,
                grant_id: grantId,
                user_id: grant.user_id,
                dapp_origin: dapp.dapp_origin,
                action: `verify:${verificationType}`,
                verification_type: verificationType,
                amount_spent: this.DEFAULT_VERIFICATION_PRICING[verificationType],
                verification_result: 'pending'
            });

            await permissionUsage.save();

            // Update grant usage count
            grant.usage_count += 1;
            grant.last_used = new Date();
            await grant.save();

            // Update dApp statistics
            dapp.total_verifications += 1;
            await dapp.save();

            return {
                requestId,
                status: 'pending',
                verificationType,
                redirectUrl: `${process.env.FRONTEND_URL}/verify/${requestId}`,
                estimatedCompletion: '5-10 minutes',
                cost: this.DEFAULT_VERIFICATION_PRICING[verificationType]
            };

        } catch (error) {
            console.error('Verification execution failed:', error);
            throw new Error(`Verification execution failed: ${error.message}`);
        }
    }

    /**
     * Get verification status and results
     */
    async getVerificationStatus(dappApiKey, requestId) {
        try {
            // Validate dApp
            const dapp = await DappIntegration.findOne({ 
                api_key: dappApiKey,
                active: true 
            });

            if (!dapp) {
                throw new Error('Invalid dApp API key');
            }

            const verificationRequest = await VerificationRequestV2.findOne({
                request_id: requestId,
                dapp_id: dapp.dapp_id
            });

            if (!verificationRequest) {
                throw new Error('Verification request not found');
            }

            const response = {
                requestId,
                status: verificationRequest.status,
                verificationType: verificationRequest.verification_tier,
                createdAt: verificationRequest.created_at,
                completedAt: verificationRequest.completed_at,
                consentGranted: verificationRequest.consent_granted
            };

            // Include results if completed
            if (verificationRequest.status === 'completed' && verificationRequest.proof_generated) {
                response.results = {
                    verified: true,
                    verificationLevel: verificationRequest.verification_tier,
                    proofHash: verificationRequest.proof_data.credential_hash,
                    signature: verificationRequest.proof_data.signature,
                    timestamp: verificationRequest.proof_data.verification_timestamp
                };

                // Include requested data fields (hashed for privacy)
                if (verificationRequest.verification_data) {
                    response.verificationData = {
                        livenessScore: verificationRequest.verification_data.liveness_score,
                        documentVerified: verificationRequest.verification_data.document_verified,
                        identityDataHash: verificationRequest.verification_data.identity_data_hash
                    };
                }
            }

            if (verificationRequest.status === 'failed') {
                response.error = verificationRequest.error_message;
            }

            return response;

        } catch (error) {
            console.error('Verification status check failed:', error);
            throw new Error(`Verification status check failed: ${error.message}`);
        }
    }

    /**
     * List user's granted permissions
     */
    async getUserPermissions(userSessionToken) {
        try {
            // Validate user session (you'll need to implement this with your session system)
            const sessionData = await this.validateUserSession(userSessionToken);
            if (!sessionData) {
                throw new Error('Invalid user session');
            }

            const grants = await PermissionGrant.find({
                user_id: sessionData.userAccount.user_id,
                status: { $in: ['active', 'expired'] }
            }).sort({ created_at: -1 });

            const enrichedGrants = await Promise.all(grants.map(async (grant) => {
                const dapp = await DappIntegration.findOne({ dapp_origin: grant.dapp_origin });
                const recentUsage = await PermissionUsage.find({
                    grant_id: grant.grant_id
                }).sort({ created_at: -1 }).limit(5);

                return {
                    grantId: grant.grant_id,
                    dappName: dapp ? dapp.dapp_name : 'Unknown DApp',
                    dappOrigin: grant.dapp_origin,
                    permissions: grant.permissions,
                    status: grant.status,
                    usageCount: grant.usage_count,
                    lastUsed: grant.last_used,
                    expiresAt: grant.expires_at,
                    recentUsage: recentUsage.map(usage => ({
                        action: usage.action,
                        result: usage.verification_result,
                        createdAt: usage.created_at,
                        cost: usage.amount_spent
                    }))
                };
            }));

            return {
                permissions: enrichedGrants,
                totalGrants: grants.length,
                activeGrants: grants.filter(g => g.status === 'active').length
            };

        } catch (error) {
            console.error('Get user permissions failed:', error);
            throw new Error(`Failed to get user permissions: ${error.message}`);
        }
    }

    /**
     * Revoke permission grant
     */
    async revokePermission(userSessionToken, grantId, reason = 'User revoked') {
        try {
            const sessionData = await this.validateUserSession(userSessionToken);
            if (!sessionData) {
                throw new Error('Invalid user session');
            }

            const grant = await PermissionGrant.findOne({
                grant_id: grantId,
                user_id: sessionData.userAccount.user_id
            });

            if (!grant) {
                throw new Error('Permission grant not found');
            }

            grant.status = 'revoked';
            grant.revoked_reason = reason;
            grant.updated_at = new Date();
            await grant.save();

            return {
                success: true,
                grantId,
                revokedAt: new Date(),
                reason
            };

        } catch (error) {
            console.error('Permission revocation failed:', error);
            throw new Error(`Permission revocation failed: ${error.message}`);
        }
    }

    /**
     * Validate requested permissions against dApp capabilities
     */
    validatePermissions(requestedPermissions, dapp) {
        const validatedPermissions = [];

        for (const permission of requestedPermissions) {
            // Validate permission structure
            if (!permission.action || !permission.scope) {
                continue;
            }

            // Check if dApp supports this verification tier
            if (permission.scope.tier) {
                const supportsTier = dapp.verification_requirements.some(req => 
                    req.tier === permission.scope.tier
                );

                if (!supportsTier) {
                    continue;
                }
            }

            validatedPermissions.push({
                action: permission.action,
                scope: permission.scope,
                granted_at: new Date()
            });
        }

        return validatedPermissions;
    }

    /**
     * Calculate today's usage for spending limits
     */
    async calculateTodaysUsage(grantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysUsage = await PermissionUsage.find({
            grant_id: grantId,
            created_at: { $gte: today, $lt: tomorrow }
        });

        const totalAmount = todaysUsage.reduce((sum, usage) => 
            sum + (usage.amount_spent.amount || 0), 0
        );

        return {
            amount: totalAmount,
            currency: 'USDC',
            transactionCount: todaysUsage.length
        };
    }

    /**
     * Validate user session (integrate with your session system)
     */
    async validateUserSession(sessionToken) {
        // This would integrate with your existing session validation
        // For now, returning a placeholder
        try {
            const webauthnService = require('./webauthn');
            return await webauthnService.validateSession(sessionToken);
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate MetaMask permission request payload
     * This creates the ERC-7715 compatible permission request
     */
    generatePermissionRequestPayload(dappInfo, permissions, userAddress) {
        return {
            method: 'wallet_requestPermissions',
            params: [
                {
                    'casperid:verification': {
                        caveats: [
                            {
                                type: 'filterResponse',
                                value: {
                                    properties: permissions.map(p => p.action)
                                }
                            },
                            {
                                type: 'limitRequestOrigin',
                                value: {
                                    origin: dappInfo.dapp_origin
                                }
                            }
                        ]
                    }
                }
            ]
        };
    }
}

module.exports = new MetaMaskPermissionsService();