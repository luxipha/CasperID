const express = require('express');
const router = express.Router();
const { adminAuthWithRateLimit } = require('../middleware/auth');
const { VerificationRequest, Credential, UserProfile } = require('../database/models');
const { walletToHuman } = require('../utils/wallet-to-human');
const { mintCredential } = require('../utils/credential-minter');

/**
 * GET /api/admin/verification-requests
 * Get all verification requests (admin only)
 */
router.get('/verification-requests', adminAuthWithRateLimit, async (req, res) => {
    try {
        const { status } = req.query;
        
        // Default to showing only pending requests (exclude auto-minted basic tier)
        const filter = status ? { status } : { status: 'pending' };

        const requests = await VerificationRequest.find(filter).sort({ created_at: -1 });

        res.json({
            count: requests.length,
            requests: requests.map(r => ({
                id: r._id,
                wallet: r.wallet,
                tier: r.tier,
                email: r.email,
                status: r.status,
                created_at: r.created_at,
                updated_at: r.updated_at,
                // Full Profile Data
                first_name: r.first_name,
                last_name: r.last_name,
                name: r.name,
                date_of_birth: r.date_of_birth,
                phone_number: r.phone_number,
                home_address: r.home_address,
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
                metadata: r.metadata // Contains liveness snapshots
            }))
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch verification requests' });
    }
});

/**
 * POST /api/admin/issue-credential
 * Issue credentials (approve verification)
 */
router.post('/issue-credential', adminAuthWithRateLimit, async (req, res) => {
    try {
        const { request_id, approve } = req.body;

        if (!request_id || approve === undefined) {
            return res.status(400).json({ error: 'request_id and approve are required' });
        }

        // Find verification request
        const request = await VerificationRequest.findById(request_id);

        if (!request) {
            return res.status(404).json({ error: 'Verification request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Handle rejection
        if (!approve) {
            request.status = 'rejected';
            await request.save();

            return res.json({
                message: 'Verification request rejected',
                request: {
                    id: request._id,
                    wallet: request.wallet,
                    status: request.status
                }
            });
        }

        // Use the shared credential minting utility
        const { credential } = await mintCredential(request);

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
        res.status(500).json({ error: 'Failed to issue credential' });
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
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        const credential = await Credential.findOne({ wallet });

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        if (credential.revoked) {
            return res.status(400).json({ error: 'Credential already revoked' });
        }

        // Mark as revoked
        credential.revoked = true;
        credential.revocation_reason = reason || 'No reason provided';
        await credential.save();

        // TODO: Update Casper contract to set verified = false

        res.json({
            message: 'Credential revoked successfully',
            wallet: credential.wallet,
            revoked: true,
            reason: credential.revocation_reason
        });
    } catch (error) {
        console.error('Revoke credential error:', error);
        res.status(500).json({ error: 'Failed to revoke credential' });
    }
});

/**
 * POST /api/admin/sync-verified-profiles
 * Manually sync all existing verified users' data to their profiles
 */
router.post('/sync-verified-profiles', adminAuthWithRateLimit, async (req, res) => {
    try {
        console.log('🔄 Starting manual sync of verified profiles...');
        
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
                console.log(`✅ Synced ${request.first_name} ${request.last_name} (${request.wallet.substring(0, 8)}...)`);
                
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
        res.status(500).json({ error: 'Failed to sync verified profiles' });
    }
});

module.exports = router;
