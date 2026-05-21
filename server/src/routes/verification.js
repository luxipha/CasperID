const express = require('express');
const router = express.Router();
const {
    VerificationRequest, VerificationRequestV2, Credential, UserProfile, UserAccount,
    Experience, Education, Certification, Skill, Project, Award, Language, Volunteer
} = require('../database/models');
const { walletToHuman, findWalletByHumanId, isFullWallet, isAccountHash, isHumanId, getHumanIdForWallet } = require('../utils/wallet-to-human');
const { mintCredential, canAutoMint } = require('../utils/credential-minter');
const { rateLimitMiddleware } = require('../utils/rate-limiter');
const geoip = require('geoip-lite');

/**
 * POST /api/request-verification
 * User requests identity verification
 */
router.post('/request-verification', rateLimitMiddleware('verification_requests'), async (req, res) => {
    try {
        const {
            wallet, tier, email,
            name, age, location: providedLocation, // user provided
            first_name, last_name, date_of_birth, phone_number, home_address,
            metadata
        } = req.body;

        // Validation
        if (!wallet || !tier) {
            return res.status(400).json({ success: false, error: 'Wallet address and tier are required' });
        }

        if (!['layer_1', 'layer_3'].includes(tier)) {
            return res.status(400).json({ success: false, error: 'Invalid tier. Must be basic or full_kyc' });
        }

        // Check if there's already a pending request for this wallet
        const existingRequest = await VerificationRequest.findOne({
            wallet,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                error: 'You already have a pending verification request',
                request: existingRequest
            });
        }

        // Check if this is a basic tier request that can be auto-minted BEFORE creating the request
        const canMint = await canAutoMint(wallet, tier);

        // Resolve Location and IP
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        let location = providedLocation;
        let coordinates = null;

        if (ip) {
            const geo = geoip.lookup(ip);
            if (geo) {
                // If user didn't provide location, or we want to augment it, use GeoIP
                // Prefer GeoIP for consistency in activity log map
                location = location || `${geo.city}, ${geo.country}`;
                coordinates = { lat: geo.ll[0], long: geo.ll[1] };
            }
        }

        // Create verification request
        const request = new VerificationRequest({
            wallet,
            tier,
            email,
            name,
            age,
            location, // Captured or resolved
            coordinates,
            ip,
            userAgent,
            first_name,
            last_name,
            date_of_birth,
            phone_number,
            home_address,
            metadata: metadata || {},
            status: 'pending'
        });

        await request.save();

        if (canMint) {
            try {

                // Automatically mint the credential for basic tier
                const { credential } = await mintCredential(request);


                res.status(201).json({
                    message: 'Basic verification completed automatically',
                    auto_minted: true,
                    request: {
                        id: request._id,
                        wallet: request.wallet,
                        tier: request.tier,
                        status: 'approved',
                        created_at: request.created_at
                    },
                    credential: {
                        wallet: credential.wallet,
                        human_id: credential.human_id,
                        tier: credential.tier,
                        credential_hash: credential.credential_hash,
                        onchain_tx_hash: credential.onchain_tx_hash
                    }
                });

                return;
            } catch (autoMintError) {
                console.error('Auto-minting failed, falling back to manual process:', autoMintError);
                // Fall through to manual process if auto-minting fails
            }
        }

        // For full_kyc tier or if auto-minting failed, return pending status
        res.status(201).json({
            message: tier === 'layer_3'
                ? 'Full KYC verification request submitted - admin review required'
                : 'Verification request submitted successfully',
            auto_minted: false,
            request: {
                id: request._id,
                wallet: request.wallet,
                tier: request.tier,
                status: request.status,
                created_at: request.created_at
            }
        });
    } catch (error) {
        console.error('Request verification error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to create verification request' });
    }
});

/**
 * POST /api/mint-basic-id
 * Directly mint a basic tier credential (automatic approval)
 */
router.post('/mint-basic-id', rateLimitMiddleware('credential_minting'), async (req, res) => {
    try {
        const {
            wallet, email, name, age, location: providedLocation,
            first_name, last_name, date_of_birth, phone_number, home_address,
            metadata
        } = req.body;

        // Validation
        if (!wallet) {
            return res.status(400).json({ success: false, error: 'Wallet address is required' });
        }

        // Check if automatic minting is allowed
        if (!(await canAutoMint(wallet, 'layer_1'))) {
            return res.status(400).json({
                error: 'Automatic minting not available - wallet may already have a credential or pending request'
            });
        }

        // Resolve Location and IP
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        let location = providedLocation;
        let coordinates = null;

        if (ip) {
            const geo = geoip.lookup(ip);
            if (geo) {
                location = location || `${geo.city}, ${geo.country}`;
                coordinates = { lat: geo.ll[0], long: geo.ll[1] };
            }
        }

        // Create verification request for basic tier
        const request = new VerificationRequest({
            wallet,
            tier: 'layer_1',
            email,
            name,
            age,
            location,
            coordinates,
            ip,
            userAgent,
            first_name,
            last_name,
            date_of_birth,
            phone_number,
            home_address,
            metadata: metadata || {},
            status: 'pending'
        });

        await request.save();

        // Automatically mint the credential
        const { credential } = await mintCredential(request);


        res.status(201).json({
            message: 'Basic ID minted successfully',
            credential: {
                wallet: credential.wallet,
                human_id: credential.human_id,
                tier: credential.tier,
                last_kyc_at: credential.last_kyc_at,
                credential_hash: credential.credential_hash,
                onchain_tx_hash: credential.onchain_tx_hash,
                created_at: credential.created_at
            }
        });

    } catch (error) {
        console.error('Mint basic ID error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to mint basic ID' });
    }
});

/**
 * GET /api/identity-status?wallet=<address>
 * Get verification status for a wallet
 */
router.get('/identity-status', async (req, res) => {
    try {
        const { wallet } = req.query;

        if (!wallet) {
            return res.status(400).json({ success: false, error: 'Wallet address is required' });
        }

        // Handle multiple wallet formats: full public key, account-hash, human ID
        let credential = null;
        let searchWallet = wallet;

        // Try direct lookup first
        credential = await Credential.findOne({ wallet, revoked: false });

        if (!credential) {
            if (isFullWallet(wallet)) {
                // Try account-hash format (legacy compatibility for unmigrated records)
                const truncatedWallet = `account-hash-${wallet.substring(0, 16)}`;
                credential = await Credential.findOne({ wallet: truncatedWallet, revoked: false });
                if (credential) {
                    // Migrate this record on-the-fly to full wallet format
                    const { humanId } = walletToHuman(wallet);
                    await Credential.updateOne(
                        { _id: credential._id },
                        { wallet: wallet, human_id: humanId }
                    );
                    searchWallet = wallet;
                    // Also migrate any verification requests for this wallet
                    await VerificationRequest.updateMany(
                        { wallet: truncatedWallet },
                        { wallet: wallet }
                    );
                }
            } else if (isHumanId(wallet)) {
                // Human ID lookup - direct database query (much faster)
                credential = await Credential.findOne({ human_id: wallet, revoked: false });
                if (credential) {
                    searchWallet = credential.wallet;
                }
            }
        }

        // Check for pending verification requests (for both new users and upgrades)
        // Check V1 (legacy) requests
        const pendingRequestV1 = await VerificationRequest.findOne({
            wallet: searchWallet,
            status: 'pending'
        }).sort({ created_at: -1 });

        // Check V2 requests - need to find user_id from UserAccount first
        let pendingRequestV2 = null;
        const userAccount = await UserAccount.findOne({ wallet: searchWallet });
        if (userAccount) {
            pendingRequestV2 = await VerificationRequestV2.findOne({
                user_id: userAccount.user_id,
                status: { $in: ['pending', 'in_progress'] }
            }).sort({ created_at: -1 });
        }

        // Use whichever pending request exists (V2 takes priority as it's newer)
        const pendingRequest = pendingRequestV2 || pendingRequestV1;

        // Normalize tier field (V2 uses verification_tier, V1 uses tier)
        const pendingTier = pendingRequestV2
            ? pendingRequestV2.verification_tier
            : (pendingRequestV1 ? pendingRequestV1.tier : null);

        if (!credential) {
            // Even unverified users should get human_id
            let humanId;
            try {
                humanId = await getHumanIdForWallet(wallet, { Credential, UserProfile });
            } catch (error) {
                console.error('Error getting human ID for unverified user:', error);
                const result = walletToHuman(wallet);
                humanId = result.humanId;
            }

            return res.json({
                wallet,
                human_id: humanId,
                verified: false,
                tier: pendingTier,
                status: pendingRequest ? pendingRequest.status : null,
                last_kyc_at: null,
                last_liveness_at: null,
                liveness_completed_at: pendingRequest && (pendingRequest.metadata?.liveness_completed_at || pendingRequest.verification_data?.liveness_completed_at) ? (pendingRequest.metadata?.liveness_completed_at || pendingRequest.verification_data?.liveness_completed_at) : null,
                issuer: null,
                pending_request: !!pendingRequest,
                request_status: pendingRequest ? pendingRequest.status : null
            });
        }

        // Fetch associated profile data
        const userProfile = await UserProfile.findOne({ wallet: searchWallet });

        // Retrieve latest request for name fallback
        const latestRequest = await VerificationRequest.findOne({ wallet: searchWallet }).sort({ created_at: -1 });

        // Generate human-friendly ID for the wallet (universal system)
        const originalWallet = credential ? credential.wallet : wallet;
        let humanId;

        try {
            // Use universal human ID system that works for all users
            humanId = await getHumanIdForWallet(originalWallet, { Credential, UserProfile });
        } catch (error) {
            console.error('Error getting human ID:', error);
            // Fallback to direct generation
            const result = walletToHuman(originalWallet);
            humanId = result.humanId;
        }

        // Combine Identity data (Verified) with Profile data (Mutable)
        // If we want detailed profile, use /api/profile endpoint.
        // For identity status, we return the basics.

        // Initialize extended profile data
        let extendedProfile = null;

        if (userProfile) {
            const [experiences, education, certifications, skills, projects, awards, languages, volunteering] = await Promise.all([
                Experience.find({ wallet: searchWallet }).sort({ is_current: -1, start_date: -1 }),
                Education.find({ wallet: searchWallet }).sort({ start_date: -1 }),
                Certification.find({ wallet: searchWallet }).sort({ date_issued: -1 }),
                Skill.find({ wallet: searchWallet }).sort({ display_order: 1 }),
                Project.find({ wallet: searchWallet }).sort({ start_date: -1 }),
                Award.find({ wallet: searchWallet }).sort({ date: -1 }),
                Language.find({ wallet: searchWallet }),
                Volunteer.find({ wallet: searchWallet }).sort({ start_date: -1 })
            ]);

            extendedProfile = {
                basic: userProfile,
                experiences,
                education,
                certifications,
                skills,
                projects,
                awards,
                languages,
                volunteering
            };
        }

        res.json({
            wallet: originalWallet,
            human_id: humanId,
            verified: !!credential,
            tier: credential ? credential.tier : null,
            status: pendingRequest ? pendingRequest.status : (credential ? 'approved' : null),
            pending_upgrade_tier: pendingTier,
            last_kyc_at: credential ? credential.last_kyc_at : null,
            last_liveness_at: credential ? credential.last_liveness_at : null,
            liveness_completed_at: pendingRequest && (pendingRequest.metadata?.liveness_completed_at || pendingRequest.verification_data?.liveness_completed_at) ? (pendingRequest.metadata?.liveness_completed_at || pendingRequest.verification_data?.liveness_completed_at) : null,
            issuer: credential ? credential.issuer_id : null,
            pending_request: !!pendingRequest,
            request_status: pendingRequest ? pendingRequest.status : null,
            // Profile Preview
            profile: {
                name: latestRequest ? latestRequest.name : null,
                hasProfile: !!userProfile
            },
            // Full data for extension sync
            extended_profile: extendedProfile
        });
    } catch (error) {
        console.error('Identity status error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch identity status' });
    }
});

/**
 * GET /api/cns-profile/:username
 * Get public profile by CNS name (e.g. john.cid)
 */
router.get('/cns-profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // Strip .cid or .casper suffix if present for search, or search exactly
        // For now, assuming cns_name is stored exactly as "john" or "john.cid"
        // Let's search for partial match or exact

        const cleanName = username.replace(/\.(cid|casper)$/i, '');

        // Find verified request with this name
        const request = await VerificationRequest.findOne({
            cns_name: cleanName, // Assuming we store just "john"
            status: 'approved'   // Only show approved profiles
        }).sort({ created_at: -1 });

        if (!request) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        // Return public profile data
        res.json({
            username: request.cns_name,
            wallet: request.wallet,
            basicInfo: {
                firstName: request.first_name,
                lastName: request.last_name,
                email: request.email, // TODO: Check visibility
                homeAddress: request.home_address,
                dateOfBirth: request.date_of_birth,
                phoneNumber: request.phone_number
            },
            professionalInfo: {
                education: request.education,
                workHistory: request.work_history,
                jobTitle: request.job_title,
                info: request.info,
                skills: request.skills,
                imageURL: request.image_url
            },
            socialLinks: request.socials || {},
            visibility: {
                // Default visibility for now
                education: true,
                workHistory: true,
                phoneNumber: false,
                homeAddress: false,
                dateOfBirth: false
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

/**
 * POST /api/verify-credential
 * Verify a credential JWT/JSON
 */
router.post('/verify-credential', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, error: 'Credential is required' });
        }

        // TODO: Implement JWT verification
        // For now, just return a placeholder
        res.json({
            valid: false,
            message: 'Credential verification not yet implemented'
        });
    } catch (error) {
        console.error('Verify credential error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify credential' });
    }
});

/**
 * POST /api/evaluate-requirements (Optional/Advanced)
 * Check if wallet meets certain verification requirements
 */
router.post('/evaluate-requirements', async (req, res) => {
    try {
        const { wallet, requirements } = req.body;

        if (!wallet || !requirements) {
            return res.status(400).json({ success: false, error: 'Wallet and requirements are required' });
        }

        // Find credential
        const credential = await Credential.findOne({ wallet, revoked: false });

        if (!credential) {
            return res.json({
                meets_requirements: false,
                needs_liveness_refresh: true,
                reason: 'No verification found'
            });
        }

        // Check requirements
        const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
        let meetsRequirements = true;
        let needsLivenessRefresh = false;

        // Check if KYC is required and if tier matches
        if (requirements.kyc_full && credential.tier !== 'layer_3') {
            meetsRequirements = false;
        }

        // Check liveness max age
        if (requirements.liveness_max_age_days) {
            const maxAgeSeconds = requirements.liveness_max_age_days * 24 * 60 * 60;
            const livenessAge = now - credential.last_liveness_at;

            if (livenessAge > maxAgeSeconds) {
                meetsRequirements = false;
                needsLivenessRefresh = true;
            }
        }

        res.json({
            meets_requirements: meetsRequirements,
            needs_liveness_refresh: needsLivenessRefresh,
            credential: {
                tier: credential.tier,
                last_kyc_at: credential.last_kyc_at,
                last_liveness_at: credential.last_liveness_at
            }
        });
    } catch (error) {
        console.error('Evaluate requirements error:', error);
        res.status(500).json({ success: false, error: 'Failed to evaluate requirements' });
    }
});

/**
 * GET /api/verify/:credentialHash
 * PUBLIC endpoint - Verify a credential by its hash
 * Returns credential status without revealing user identity
 */
router.get('/verify/:credentialHash', async (req, res) => {
    try {
        const { credentialHash } = req.params;

        if (!credentialHash) {
            return res.status(400).json({
                success: false,
                error: 'Credential hash is required'
            });
        }

        // Find credential by hash
        const credential = await Credential.findOne({
            credential_hash: credentialHash
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                verified: false,
                error: 'Credential not found'
            });
        }

        // Map tier to human-readable type
        const getTierDisplay = (tier) => {
            switch (tier) {
                case 'layer_1': return { type: 'Basic ID', title: 'CasperID Basic Verified' };
                case 'layer_2': return { type: 'Verified ID', title: 'Identity Verified (Liveness)' };
                case 'layer_3': return { type: 'Full KYC', title: 'Full KYC Verified' };
                default: return { type: 'Unknown', title: 'Verification' };
            }
        };

        const tierInfo = getTierDisplay(credential.tier);

        // Return verification result (privacy-preserving - no user identity)
        res.json({
            success: true,
            verified: !credential.revoked,
            credential: {
                type: tierInfo.type,
                title: tierInfo.title,
                tier: credential.tier,
                issuer: 'CasperID',
                status: credential.revoked ? 'Revoked' : 'Active',
                issuedAt: credential.created_at,
                expiresAt: credential.expires_at || null,
                credentialHash: credential.credential_hash
            }
        });

    } catch (error) {
        console.error('Credential verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify credential'
        });
    }
});

module.exports = router;
