const express = require('express');
const router = express.Router();
const { adminAuthWithRateLimit } = require('../middleware/auth');
const { VerificationRequest, VerificationRequestV2, Credential, UserProfile, UserAccount, AdminSetting } = require('../database/models');
const { walletToHuman } = require('../utils/wallet-to-human');
const { mintCredential } = require('../utils/credential-minter');
const { eventBus, EVENTS } = require('../services/eventBus');
const PAYMENT_SETTINGS_KEY = 'payment_settings';
const DEFAULT_MONNIFY_USD_TO_NGN_RATE = Number(process.env.MONNIFY_USD_TO_NGN_RATE || process.env.NGN_USD_RATE || 1650);
const DEFAULT_VERIFICATION_FEE_NGN = Number(
    process.env.MONNIFY_VERIFICATION_FEE_NGN ||
    process.env.MONNIFY_NIN_VERIFICATION_FEE_NGN ||
    process.env.MONNIFY_BVN_VERIFICATION_FEE_NGN ||
    1500
);

async function readPaymentSettings() {
    const settingsRecord = await AdminSetting.findOne({ key: PAYMENT_SETTINGS_KEY }).lean();
    const stored = settingsRecord?.value || {};
    const verificationFeeNgn = Number(stored.verification_fee_ngn);
    const usdToNgnRate = Number(stored.usd_to_ngn_rate);

    return {
        verification_fee_ngn: Number.isFinite(verificationFeeNgn) && verificationFeeNgn > 0
            ? verificationFeeNgn
            : DEFAULT_VERIFICATION_FEE_NGN,
        usd_to_ngn_rate: Number.isFinite(usdToNgnRate) && usdToNgnRate > 0
            ? usdToNgnRate
            : DEFAULT_MONNIFY_USD_TO_NGN_RATE,
        source: settingsRecord ? 'admin' : 'env'
    };
}

async function writePaymentSettings(partialSettings = {}) {
    const currentSettings = await readPaymentSettings();
    const nextSettings = {
        verification_fee_ngn: Number(partialSettings.verification_fee_ngn ?? currentSettings.verification_fee_ngn),
        usd_to_ngn_rate: Number(partialSettings.usd_to_ngn_rate ?? currentSettings.usd_to_ngn_rate)
    };

    if (!Number.isFinite(nextSettings.verification_fee_ngn) || nextSettings.verification_fee_ngn <= 0) {
        throw new Error('verification_fee_ngn must be a positive number');
    }
    if (!Number.isFinite(nextSettings.usd_to_ngn_rate) || nextSettings.usd_to_ngn_rate <= 0) {
        throw new Error('usd_to_ngn_rate must be a positive number');
    }

    await AdminSetting.findOneAndUpdate(
        { key: PAYMENT_SETTINGS_KEY },
        {
            key: PAYMENT_SETTINGS_KEY,
            value: nextSettings,
            updated_at: new Date()
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    return {
        ...nextSettings,
        source: 'admin'
    };
}

router.get('/payment-settings', adminAuthWithRateLimit, async (req, res) => {
    try {
        const settings = await readPaymentSettings();
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('[Admin] Failed to read payment settings:', error);
        res.status(500).json({ success: false, error: 'Failed to load payment settings' });
    }
});

router.patch('/payment-settings', adminAuthWithRateLimit, async (req, res) => {
    try {
        const settings = await writePaymentSettings(req.body || {});
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('[Admin] Failed to update payment settings:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to update payment settings' });
    }
});

/**
 * GET /api/admin/verification-requests
 * Get all verification requests (admin only)
 * Includes both legacy VerificationRequest and new VerificationRequestV2
 */
router.get('/verification-requests', adminAuthWithRateLimit, async (req, res) => {
    try {
        const requestedStatus = typeof req.query.status === 'string' ? req.query.status : undefined;
        const isAllFilter = requestedStatus === 'all';
        const status = isAllFilter ? undefined : requestedStatus;

        // Default to showing pending/in_progress requests
        // For "pending" filter, V2 uses "in_progress" so include both
        const filterV1 = status ? { status } : { status: 'pending' };
        const filterV2Status = status === 'pending'
            ? { status: { $in: ['pending', 'in_progress'] } }  // "pending" includes V2's "in_progress"
            : status === 'approved'
                ? { status: 'completed' }
                : status
                    ? { status }
                    : isAllFilter
                        ? {}
                        : { status: { $in: ['pending', 'in_progress'] } };
        const filterV2 = (isAllFilter || !status || ['pending', 'in_progress'].includes(status))
            ? {
                ...filterV2Status,
                $or: [
                    { verification_tier: { $ne: 'layer_3' } },
                    { 'verification_data.submitted_at': { $exists: true, $nin: [null, ''] } }
                ]
            }
            : filterV2Status;

        // Fetch from both collections
        const [requestsV1, requestsV2] = await Promise.all([
            VerificationRequest.find(filterV1).sort({ created_at: -1 }),
            VerificationRequestV2.find(filterV2).sort({ created_at: -1 })
        ]);

        // Map V1 requests (legacy format)
        const mappedV1 = requestsV1.map(r => ({
            id: r._id,
            request_id: r._id.toString(),
            source: 'v1',
            wallet: r.wallet,
            tier: r.tier,
            email: r.email,
            status: r.status,
            created_at: r.created_at,
            updated_at: r.updated_at,
            verification_method: r.verification_method,
            document_type: r.document_type,
            document_data: r.document_data,
            liveness_verified: r.liveness_verified,
            upload_id: r.upload_id,
            first_name: r.first_name || r.document_data?.first_name,
            last_name: r.last_name || r.document_data?.last_name,
            name: r.name,
            date_of_birth: r.date_of_birth || r.document_data?.date_of_birth,
            phone_number: r.phone_number || r.document_data?.phone_number,
            home_address: r.home_address || r.document_data?.address,
            location: r.location,
            age: r.age,
            education: r.education,
            work_history: r.work_history,
            job_title: r.job_title,
            skills: r.skills,
            info: r.info,
            image_url: r.image_url,
            socials: r.socials,
            cns_name: r.cns_name,
            metadata: r.metadata
        }));

        // Map V2 requests (new format with verification_data)
        const mappedV2 = await Promise.all(requestsV2.map(async r => {
            // Fetch user account to get wallet and email
            const userAccount = await UserAccount.findOne({ user_id: r.user_id });
            const vData = r.verification_data || {};

            // Fetch user profile for additional data
            let userProfile = null;
            if (userAccount?.wallet) {
                userProfile = await UserProfile.findOne({ wallet: userAccount.wallet });
            }

            return {
                id: r._id,
                request_id: r.request_id,
                source: 'v2',
                wallet: userAccount?.wallet || null,
                user_id: r.user_id,
                tier: r.verification_tier,
                status: r.status === 'completed' ? 'approved' : r.status,
                purpose: r.purpose,
                created_at: r.created_at,
                updated_at: r.updated_at,
                expires_at: r.expires_at,

                // Layer 3 document data from verification_data
                verification_method: vData.verification_method || 'document_upload',
                country_context: vData.country_context || null,
                identity_provider: vData.identity_provider || null,
                document_type: vData.document_type,
                document_number: vData.document_number,
                nin_verified: vData.nin_verified || false,
                bvn_verified: vData.bvn_verified || false,
                liveness_verified: vData.liveness_verified,
                upload_id: vData.upload_id,

                // Personal info from verification_data (with fallback to profile)
                first_name: vData.first_name || userProfile?.first_name,
                middle_name: vData.middle_name,
                last_name: vData.last_name || userProfile?.last_name,
                full_name: vData.full_name || [vData.first_name, vData.middle_name, vData.last_name].filter(Boolean).join(' ') || null,
                email: userAccount?.recovery_email || userAccount?.email,
                date_of_birth: vData.date_of_birth || userProfile?.date_of_birth,
                gender: vData.gender,
                nationality: vData.nationality,
                nin: vData.nin,
                home_address: vData.home_address,
                phone_number: vData.phone_number || userProfile?.phone_number,

                // Document images
                front_image_url: vData.front_image_url,
                front_image_file_id: vData.front_image_file_id,
                back_image_url: vData.back_image_url,
                back_image_file_id: vData.back_image_file_id,

                // Liveness frames and AI analysis
                liveness_frame_urls: vData.liveness_frame_urls || [],
                liveness_completed_at: vData.liveness_completed_at,
                liveness_confidence: vData.liveness_confidence,
                liveness_ai_passed: vData.liveness_ai_passed,
                liveness_ai_reasoning: vData.liveness_ai_reasoning,

                // Submission timestamp
                submitted_at: vData.submitted_at,

                // Create metadata object for frontend compatibility
                metadata: {
                    liveness_frames: vData.liveness_frame_urls || [],
                    liveness_verified: vData.liveness_verified,
                    liveness_completed_at: vData.liveness_completed_at,
                    liveness_confidence: vData.liveness_confidence,
                    liveness_ai_passed: vData.liveness_ai_passed,
                    liveness_ai_reasoning: vData.liveness_ai_reasoning,
                    document_type: vData.document_type,
                    document_number: vData.document_number,
                    country_context: vData.country_context,
                    identity_provider: vData.identity_provider,
                    nin_verified: vData.nin_verified,
                    bvn_verified: vData.bvn_verified,
                    nin: vData.nin,
                    bvn: vData.bvn,
                    gender: vData.gender,
                    nationality: vData.nationality,
                    upload_id: vData.upload_id,
                    provider_reference: vData.provider_reference,
                    provider_results: vData.provider_results,
                    provider_document_match: vData.provider_document_match
                },

                // Profile data
                human_id: userProfile?.human_id,
                cns_name: userProfile?.cns_name,
                socials: userProfile?.socials || {},
                job_title: userProfile?.job_title,
                education: userProfile?.education,
                info: userProfile?.about
            };
        }));

        // Combine and sort by created_at descending
        const allRequests = [...mappedV1, ...mappedV2].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({
            count: allRequests.length,
            requests: allRequests
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch verification requests' });
    }
});

/**
 * POST /api/admin/issue-credential
 * Issue credentials (approve verification)
 * Supports both V1 (VerificationRequest) and V2 (VerificationRequestV2)
 */
router.post('/issue-credential', adminAuthWithRateLimit, async (req, res) => {
    try {
        const { request_id, approve, source, rejection_reason } = req.body;

        if (!request_id || approve === undefined) {
            return res.status(400).json({ success: false, error: 'request_id and approve are required' });
        }

        // Rejection reason is required when rejecting
        if (!approve && !rejection_reason) {
            return res.status(400).json({ error: 'rejection_reason is required when rejecting a request' });
        }

        let request = null;
        let isV2 = source === 'v2';

        // Try to find in V1 first (by MongoDB _id), then V2 (by request_id string)
        if (!isV2) {
            try {
                request = await VerificationRequest.findById(request_id);
            } catch (e) {
                // Not a valid MongoDB ObjectId, might be a V2 request_id
            }
        }

        // If not found in V1, try V2
        if (!request) {
            request = await VerificationRequestV2.findOne({ request_id: request_id });
            if (request) isV2 = true;
        }

        // Also try V2 by _id if still not found
        if (!request) {
            try {
                request = await VerificationRequestV2.findById(request_id);
                if (request) isV2 = true;
            } catch (e) {
                // Ignore
            }
        }

        if (!request) {
            return res.status(404).json({ success: false, error: 'Verification request not found' });
        }

        if (isV2 && request.verification_tier === 'layer_3' && !request.verification_data?.submitted_at) {
            return res.status(400).json({ success: false, error: 'Layer 3 draft has not been submitted for review' });
        }

        const validStatuses = isV2 ? ['pending', 'in_progress'] : ['pending'];
        if (!validStatuses.includes(request.status)) {
            return res.status(400).json({ success: false, error: 'Request already processed' });
        }

        // Handle rejection
        if (!approve) {
            request.status = 'rejected';
            request.rejection_reason = rejection_reason;
            request.rejected_at = new Date();
            request.rejected_by = req.admin?.username || 'admin';
            await request.save();

            // Send rejection notification to user
            try {
                const { Notification } = require('../database/models');

                // Get user info for notification
                let userId, userEmail;
                if (isV2) {
                    const userAccount = await UserAccount.findOne({ user_id: request.user_id });
                    userId = request.user_id;
                    userEmail = userAccount?.email;
                } else {
                    userId = request.wallet;
                    userEmail = request.email;
                }

                // Create in-app notification
                if (userId) {
                    await Notification.create({
                        user_id: userId,
                        type: 'verification_rejected',
                        title: 'Verification Request Rejected',
                        message: `Your Layer 3 verification request was rejected. Reason: ${rejection_reason}`,
                        data: {
                            request_id: isV2 ? request.request_id : request._id.toString(),
                            rejection_reason,
                            rejected_at: new Date().toISOString()
                        },
                        read: false
                    });
                }

                // Emit verification rejected event (subscribers handle email, activity)
                eventBus.emit(EVENTS.VERIFICATION_REJECTED, {
                    userId: isV2 ? request.user_id : null,
                    email: userEmail,
                    wallet: isV2 ? null : request.wallet,
                    tier: isV2 ? request.verification_tier : request.tier,
                    reason: rejection_reason,
                    requestId: isV2 ? request.request_id : request._id.toString()
                });
            } catch (notifError) {
                console.warn('[Admin] Failed to send rejection notification:', notifError.message);
            }

            return res.json({
                message: 'Verification request rejected',
                request: {
                    id: request._id,
                    request_id: isV2 ? request.request_id : request._id.toString(),
                    status: request.status,
                    rejection_reason
                }
            });
        }

        // For V2 requests, we need to construct the request object for mintCredential
        if (isV2) {
            // Get the user account to find wallet
            const userAccount = await UserAccount.findOne({ user_id: request.user_id });
            if (!userAccount || !userAccount.wallet) {
                return res.status(400).json({ error: 'User wallet not found' });
            }

            const vData = request.verification_data || {};

            // Construct V1-compatible request object for mintCredential
            const v1CompatibleRequest = {
                wallet: userAccount.wallet,
                tier: request.verification_tier, // 'layer_3'
                email: userAccount.email,
                first_name: vData.first_name,
                last_name: vData.last_name,
                date_of_birth: vData.date_of_birth,
                phone_number: vData.phone_number,
                home_address: vData.home_address,
                document_type: vData.document_type,
                document_number: vData.document_number,
                liveness_verified: vData.liveness_verified,
                status: 'pending'
            };

            // Mint credential
            const { credential } = await mintCredential(v1CompatibleRequest);

            // Update V2 request status
            request.status = 'completed';
            request.completed_at = new Date();
            request.proof_generated = true;
            await request.save();

            // Update user account tier
            userAccount.tier = request.verification_tier;
            userAccount.updated_at = new Date();
            await userAccount.save();

            // Emit L3 verification completed event (subscribers handle email, activity, webhook)
            const userName = vData.first_name ? `${vData.first_name} ${vData.last_name || ''}`.trim() : null;
            eventBus.emit(EVENTS.VERIFICATION_L3_COMPLETED, {
                userId: userAccount.user_id,
                email: userAccount.recovery_email || userAccount.email,
                name: userName,
                wallet: userAccount.wallet,
                tier: request.verification_tier,
                dappId: request.dapp_id
            });

            return res.json({
                message: 'Credential issued successfully',
                credential: {
                    wallet: credential.wallet,
                    tier: credential.tier,
                    last_kyc_at: credential.last_kyc_at,
                    last_liveness_at: credential.last_liveness_at,
                    credential_hash: credential.credential_hash,
                    tx_hash: credential.onchain_tx_hash
                }
            });
        }

        // V1 flow (legacy)
        const { credential } = await mintCredential(request);

        // Emit L3 verification completed event for V1 (subscribers handle email, activity)
        const userName = request.first_name ? `${request.first_name} ${request.last_name || ''}`.trim() : null;
        eventBus.emit(EVENTS.VERIFICATION_L3_COMPLETED, {
            userId: null,
            email: request.email,
            name: userName,
            wallet: request.wallet,
            tier: request.tier || 'layer_3',
            dappId: null
        });

        res.json({
            message: 'Credential issued successfully',
            credential: {
                wallet: credential.wallet,
                tier: credential.tier,
                last_kyc_at: credential.last_kyc_at,
                last_liveness_at: credential.last_liveness_at,
                credential_hash: credential.credential_hash,
                tx_hash: credential.onchain_tx_hash
            }
        });
    } catch (error) {
        console.error('Issue credential error:', error);
        res.status(500).json({ success: false, error: 'Failed to issue credential' });
    }
});

/**
 * POST /api/admin/revoke
 * Revoke a credential
 */
router.post('/revoke', adminAuthWithRateLimit, async (req, res) => {
    try {
        const { wallet, reason } = req.body;

        if (!wallet) {
            return res.status(400).json({ success: false, error: 'Wallet address is required' });
        }

        const credential = await Credential.findOne({ wallet });

        if (!credential) {
            return res.status(404).json({ success: false, error: 'Credential not found' });
        }

        if (credential.revoked) {
            return res.status(400).json({ success: false, error: 'Credential already revoked' });
        }

        // Mark as revoked
        credential.revoked = true;
        credential.revocation_reason = reason || 'No reason provided';
        await credential.save();

        // Update Casper contract to set tier to layer_0 (unverified)
        try {
            const casperService = require('../services/casper');
            await casperService.updateTier(wallet, 'layer_0');
            console.log(`[Admin] Updated on-chain tier to layer_0 for revoked credential: ${wallet}`);
        } catch (contractError) {
            console.error('[Admin] Failed to update Casper contract on revocation:', contractError);
            // Continue with revocation even if contract update fails
            // Admin can manually fix on-chain state if needed
        }

        res.json({
            message: 'Credential revoked successfully',
            wallet: credential.wallet,
            revoked: true,
            reason: credential.revocation_reason
        });
    } catch (error) {
        console.error('Revoke credential error:', error);
        res.status(500).json({ success: false, error: 'Failed to revoke credential' });
    }
});

/**
 * POST /api/admin/sync-verified-profiles
 * Manually sync all existing verified users' data to their profiles
 */
router.post('/sync-verified-profiles', adminAuthWithRateLimit, async (req, res) => {
    try {

        // Find all approved verification requests
        const approvedRequests = await VerificationRequest.find({ status: 'approved' });

        let syncedCount = 0;
        let errorCount = 0;
        const results = [];

        for (const request of approvedRequests) {
            try {
                // Generate human ID for this wallet
                const { humanId } = walletToHuman(request.wallet);

                // Prepare verified data
                const verifiedProfileData = {
                    first_name: request.first_name,
                    last_name: request.last_name,
                    email: request.email,
                    phone_number: request.phone_number,

                    // Format address properly if it's an object
                    ...(request.home_address && typeof request.home_address === 'object' ? {
                        city: request.home_address.city,
                        country: request.home_address.country,
                    } : {}),

                    human_id: humanId,
                    verified_at: new Date(),
                    verification_source: 'manual_sync'
                };

                // Update or create profile
                const updatedProfile = await UserProfile.findOneAndUpdate(
                    { wallet: request.wallet },
                    {
                        $set: verifiedProfileData,
                        $setOnInsert: {
                            wallet: request.wallet,
                            created_at: new Date()
                        }
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true
                    }
                );

                results.push({
                    wallet: request.wallet,
                    name: `${request.first_name} ${request.last_name}`,
                    status: 'success',
                    profile_id: updatedProfile._id
                });

                syncedCount++;

            } catch (error) {
                console.error(`❌ Error syncing ${request.wallet}:`, error);
                results.push({
                    wallet: request.wallet,
                    name: `${request.first_name} ${request.last_name}`,
                    status: 'error',
                    error: error.message
                });
                errorCount++;
            }
        }

        res.json({
            message: 'Profile sync completed',
            summary: {
                total_requests: approvedRequests.length,
                synced_successfully: syncedCount,
                errors: errorCount
            },
            results
        });

    } catch (error) {
        console.error('Manual sync error:', error);
        res.status(500).json({ success: false, error: 'Failed to sync verified profiles' });
    }
});

/**
 * POST /api/admin/issue-missing-credentials
 * Audit and fix missing credentials for existing users who already have wallets
 */
router.post('/issue-missing-credentials', adminAuthWithRateLimit, async (req, res) => {
    try {
        const { UserAccount } = require('../database/models');
        const crypto = require('crypto');

        // Find all users who have a wallet address
        const usersWithWallet = await UserAccount.find({
            wallet: { $exists: true, $ne: null }
        });

        let fixedCount = 0;
        let skippedCount = 0;
        const results = [];

        for (const user of usersWithWallet) {
            // Check if Credential exists
            const exists = await Credential.findOne({ wallet: user.wallet });

            if (!exists) {

                // Determine Human ID (placeholder or fetch)
                const { getHumanIdForWallet } = require('../utils/wallet-to-human');
                let humanId = null;
                try {
                    humanId = await getHumanIdForWallet(user.wallet);
                } catch (e) { /* ignore */ }

                const newCredential = new Credential({
                    wallet: user.wallet,
                    human_id: humanId,
                    tier: user.tier || 'layer_1',
                    last_kyc_at: Math.floor(Date.now() / 1000),
                    issuer_id: 'CasperID-System-Migration',
                    credential_json: JSON.stringify({
                        subject_wallet: user.wallet,
                        tier: user.tier || 'layer_1',
                        issued_at: Date.now(),
                        migration: true
                    }),
                    credential_hash: crypto.createHash('sha256').update(user.user_id).digest('hex'),
                    created_at: new Date()
                });

                await newCredential.save();
                fixedCount++;
                results.push({ wallet: user.wallet, status: 'fixed' });
            } else {
                skippedCount++;
            }
        }

        res.json({
            message: 'Credential audit completed',
            summary: {
                total_analyzed: usersWithWallet.length,
                missing_credentials_fixed: fixedCount,
                already_valid: skippedCount
            },
            fixed_wallets: results
        });

    } catch (error) {
        console.error('Credential audit error:', error);
        res.status(500).json({ success: false, error: 'Failed to run credential audit' });
    }
});

/**
 * POST /api/admin/test-email
 * Send test emails to verify templates
 * Body: { type: "otp" | "welcome" | "verification_success" | "profile_viewed" | "profile_completed" | "payment_confirmation" | "security_alert", email: "test@example.com" }
 */
router.post('/test-email', adminAuthWithRateLimit, async (req, res) => {
    try {
        const emailManager = require('../services/email/EmailManager');
        const { type, email } = req.body;

        if (!type || !email) {
            return res.status(400).json({ error: 'type and email are required' });
        }

        const testData = {
            recipientName: 'Test User',
            frontendUrl: process.env.FRONTEND_URL || 'https://casperid.com'
        };

        let result;

        switch (type) {
            case 'otp':
                result = await emailManager.sendOTP(email, '123456');
                break;

            case 'welcome':
                result = await emailManager.sendWelcomeEmail(email, testData.recipientName);
                break;

            case 'verification_success':
                result = await emailManager.sendVerificationSuccessEmail(email, 'layer_3', testData.recipientName);
                break;

            case 'profile_viewed':
                result = await emailManager.sendProfileViewedEmail(
                    email,
                    'someone',
                    `${testData.frontendUrl}/profile/test-user`
                );
                break;

            case 'profile_completed':
                result = await emailManager.sendProfileCompletedEmail(
                    email,
                    testData.recipientName,
                    `${testData.frontendUrl}/profile/test-user`
                );
                break;

            case 'payment_confirmation':
                result = await emailManager.sendPaymentConfirmationEmail(email, {
                    amount: '25.00',
                    currency: 'USD',
                    items: 'Layer 3 KYC Verification',
                    transactionId: 'TXN-TEST-123456789'
                });
                break;

            case 'security_alert':
                result = await emailManager.sendSecurityAlertEmail(email, 'new_device', {
                    description: 'New device login detected',
                    ipAddress: '192.168.1.1',
                    device: 'Chrome on macOS',
                    location: 'Lagos, Nigeria'
                });
                break;

            case 'all':
                // Send all email types
                const results = {};

                results.otp = await emailManager.sendOTP(email, '123456');
                results.welcome = await emailManager.sendWelcomeEmail(email, testData.recipientName);
                results.verification_success = await emailManager.sendVerificationSuccessEmail(email, 'layer_3', testData.recipientName);
                results.profile_viewed = await emailManager.sendProfileViewedEmail(email, 'someone', `${testData.frontendUrl}/profile/test-user`);
                results.profile_completed = await emailManager.sendProfileCompletedEmail(email, testData.recipientName, `${testData.frontendUrl}/profile/test-user`);
                results.payment_confirmation = await emailManager.sendPaymentConfirmationEmail(email, {
                    amount: '25.00',
                    currency: 'USD',
                    items: 'Layer 3 KYC Verification',
                    transactionId: 'TXN-TEST-123456789'
                });
                results.security_alert = await emailManager.sendSecurityAlertEmail(email, 'new_device', {
                    description: 'New device login detected',
                    ipAddress: '192.168.1.1',
                    device: 'Chrome on macOS',
                    location: 'Lagos, Nigeria'
                });

                return res.json({
                    success: true,
                    message: `All test emails sent to ${email}`,
                    results
                });

            default:
                return res.status(400).json({
                    error: 'Invalid email type',
                    validTypes: ['otp', 'welcome', 'verification_success', 'profile_viewed', 'profile_completed', 'payment_confirmation', 'security_alert', 'all']
                });
        }

        res.json({
            success: true,
            message: `Test ${type} email sent to ${email}`,
            result
        });

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: 'Failed to send test email', details: error.message });
    }
});

module.exports = router;
