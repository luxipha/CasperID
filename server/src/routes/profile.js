const express = require('express');
const router = express.Router();
const cnsResolver = require('../services/cns-resolver');
const {
    UserProfile,
    Experience,
    Education,
    Certification,
    Skill,
    Project,
    Award,
    Language,
    Volunteer,
    Credential,
    UserAccount
} = require('../database/models');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureHumanIdInProfile, getHumanIdForWallet } = require('../utils/wallet-to-human');
const { logViewEvent } = require('../utils/view-logger');
const { requireAuth } = require('../middleware/auth');
const { eventBus, EVENTS } = require('../services/eventBus');

// ============================================
// PROFILE COMPLETENESS UTILITY
// ============================================

/**
 * Calculate profile completeness percentage
 * Returns a number between 0-100
 */
async function calculateProfileCompleteness(wallet) {
    const weights = {
        // Core profile fields (50% total)
        first_name: 5,
        last_name: 5,
        email: 5,
        headline: 5,
        about: 10,
        profile_image_url: 10,
        city: 5,
        country: 5,
        // Related data (50% total)
        has_experience: 15,
        has_education: 10,
        has_skills: 15,
        has_certifications: 5,
        has_projects: 5
    };

    const profile = await UserProfile.findOne({ wallet });
    if (!profile) return 0;

    let score = 0;
    const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);

    // Check core fields
    if (profile.first_name) score += weights.first_name;
    if (profile.last_name) score += weights.last_name;
    if (profile.email) score += weights.email;
    if (profile.headline) score += weights.headline;
    if (profile.about && profile.about.length > 50) score += weights.about;
    if (profile.profile_image_url) score += weights.profile_image_url;
    if (profile.city) score += weights.city;
    if (profile.country) score += weights.country;

    // Check related data
    const [expCount, eduCount, skillCount, certCount, projCount] = await Promise.all([
        Experience.countDocuments({ wallet }),
        Education.countDocuments({ wallet }),
        Skill.countDocuments({ wallet }),
        Certification.countDocuments({ wallet }),
        Project.countDocuments({ wallet })
    ]);

    if (expCount > 0) score += weights.has_experience;
    if (eduCount > 0) score += weights.has_education;
    if (skillCount > 0) score += weights.has_skills;
    if (certCount > 0) score += weights.has_certifications;
    if (projCount > 0) score += weights.has_projects;

    return Math.round((score / maxScore) * 100);
}

// Configure File Upload
// Configure File Upload - Use memory storage for ImageKit
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

const imagekit = require('../services/imagekit');

// ============================================
// PROFILE CATEGORY BATCH CLEAR (For Resume Overwrite)
// ============================================

/**
 * DELETE /api/profile/:wallet/batch-clear/:category
 * Remove all entries for a specific category for a wallet
 * Moved to top to avoid conflict with /:id individual delete routes
 */
router.delete('/profile/:wallet/batch-clear/:category', async (req, res) => {
    try {
        const { wallet, category } = req.params;

        const models = {
            experience: Experience,
            education: Education,
            certification: Certification,
            skill: Skill,
            project: Project,
            award: Award,
            language: Language,
            volunteer: Volunteer
        };

        const Model = models[category.toLowerCase()];
        if (!Model) {
            return res.status(400).json({ success: false, error: 'Invalid category' });
        }

        const deleteResult = await Model.deleteMany({ wallet });
        console.log(`[Clear] Removed ${deleteResult.deletedCount} items from ${category} for wallet ${wallet}`);

        res.json({
            success: true,
            message: `Cleared all entries for ${category}`,
            wallet,
            category,
            deletedCount: deleteResult.deletedCount
        });
    } catch (error) {
        console.error('Clear category error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to clear category' });
    }
});


// ============================================
// AUTHENTICATED USER PROFILE
// ============================================

/**
 * GET /api/user/profile
 * Get profile of the currently authenticated user
 */
router.get('/user/profile', requireAuth, async (req, res) => {
    try {
        const { wallet } = req.user;
        if (!wallet || wallet === 'pending_wallet' || wallet === 'undefined') {
            // Don't log as warning/error since this is expected for Layer 0 users
            return res.status(200).json({
                success: false,
                error: 'Wallet not created. Please complete onboarding.',
                code: 'NO_WALLET'
            });
        }

        console.log(`GET /user/profile for ${wallet}`);

        // Atomic Get-Or-Create to prevent race conditions
        let profile = await UserProfile.findOneAndUpdate(
            { wallet },
            {
                $setOnInsert: {
                    wallet: wallet,
                    email: req.user.email,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        // Ensure profile has human_id
        if (!profile.human_id) {
            try {
                const result = await ensureHumanIdInProfile(wallet, { UserProfile, Credential });
                profile = result.profile;
            } catch (error) {
                console.error('Error ensuring human_id:', error);
            }
        }

        // Fetch UserAccount to get DID and account metadata
        const { UserAccount, PasskeyCredential } = require('../database/models');
        const userAccount = await UserAccount.findOne({ user_id: req.user.userId });

        // Count active passkeys for this user
        const passkeyCount = await PasskeyCredential.countDocuments({
            user_id: req.user.userId,
            revoked: false
        });

        // Check for existence of data in other categories for disclosure validation
        // Using findOne with select is more efficient than countDocuments for existence checks
        const [
            hasExp, hasEdu, hasCert, hasSkill, hasProj, hasAward, hasLang, hasVol
        ] = await Promise.all([
            Experience.findOne({ wallet }).select('_id').lean(),
            Education.findOne({ wallet }).select('_id').lean(),
            Certification.findOne({ wallet }).select('_id').lean(),
            Skill.findOne({ wallet }).select('_id').lean(),
            Project.findOne({ wallet }).select('_id').lean(),
            Award.findOne({ wallet }).select('_id').lean(),
            Language.findOne({ wallet }).select('_id').lean(),
            Volunteer.findOne({ wallet }).select('_id').lean()
        ]);

        // Merge account-level data with profile
        const enrichedProfile = {
            ...profile.toObject(),
            did_address: userAccount?.did_address || null,
            tier: userAccount?.tier || 'layer_0',
            email_verified: userAccount?.email_verified || false,
            account_created_at: userAccount?.created_at || null,
            passkey_count: passkeyCount,
            context_dids: userAccount?.context_dids || [],
            cns_routing: userAccount?.cns_routing || [],
            linked_wallets: userAccount?.linked_wallets || [],
            data_availability: {
                experience: !!hasExp,
                education: !!hasEdu,
                certifications: !!hasCert,
                skills: !!hasSkill,
                projects: !!hasProj,
                awards: !!hasAward,
                languages: !!hasLang,
                volunteer: !!hasVol
            }
        };

        res.json(enrichedProfile);
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch user profile' });
    }
});

/**
 * PUT /api/user/profile
 * Update profile of the currently authenticated user
 */
router.put('/user/profile', requireAuth, async (req, res) => {
    try {
        const { wallet } = req.user;
        const updates = req.body;
        console.log(`PUT /user/profile for ${wallet}`, JSON.stringify(updates, null, 2));

        // Security: Remove wallet/id from updates to avoid overwriting
        delete updates.wallet;
        delete updates._id;
        delete updates.human_id; // Prevent manual human_id updates

        // Get previous completeness to detect 100% milestone
        const previousCompleteness = await calculateProfileCompleteness(wallet);

        // First ensure the profile has a human_id
        let profile;
        try {
            const result = await ensureHumanIdInProfile(wallet, { UserProfile, Credential });

            // Now update with the provided data
            profile = await UserProfile.findOneAndUpdate(
                { wallet },
                { $set: updates },
                { new: true, runValidators: true }
            );
        } catch (humanIdError) {
            console.error('Error ensuring human_id:', humanIdError);
            // Fallback: update without human_id generation
            profile = await UserProfile.findOneAndUpdate(
                { wallet },
                {
                    $set: updates,
                    $setOnInsert: { wallet }
                },
                { new: true, upsert: true, runValidators: true }
            );
        }

        // Check if profile just reached 100% completion
        const newCompleteness = await calculateProfileCompleteness(wallet);
        if (previousCompleteness < 100 && newCompleteness === 100) {
            const userAccount = await UserAccount.findOne({ wallet });
            if (userAccount) {
                const name = profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : null;
                const profileUrl = `${process.env.FRONTEND_URL || 'https://casperid.com'}/profile/${profile.human_id || wallet}`;

                eventBus.emit(EVENTS.PROFILE_COMPLETED, {
                    userId: userAccount.user_id,
                    email: userAccount.recovery_email,
                    name,
                    wallet,
                    profileUrl
                });
            }
        }

        // Update completeness on profile
        if (profile) {
            profile.profile_completeness = newCompleteness;
            await profile.save();
        }

        res.json(profile);
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update user profile' });
    }
});


// ============================================
// PUBLIC PROFILE BY HUMAN_ID OR WALLET
// ============================================

/**
 * GET /api/public-profile/:identifier
 * Get public profile by human_id or wallet address
 */
router.get('/public-profile/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        console.log(`GET /public-profile/${identifier}`);

        const trimmedIdentifier = identifier.trim();

        // ─── Context DID Resolution ───────────────────────────────────────
        // Handles did:casper:context:... identifiers which belong to personas.
        if (trimmedIdentifier.startsWith('did:casper:context:')) {
            const { UserAccount } = require('../database/models');
            const ownerAccount = await UserAccount.findOne({
                'context_dids.did': trimmedIdentifier
            });

            if (!ownerAccount) {
                return res.status(404).json({ success: false, error: 'Profile not found', message: 'No profile found for this persona.' });
            }

            const contextDid = ownerAccount.context_dids.find(c => c.did === trimmedIdentifier);
            if (!contextDid) {
                return res.status(404).json({ success: false, error: 'Profile not found' });
            }

            // Wallet-routing personas are payment pointers, not profile pages
            if (contextDid.routing_type === 'wallet') {
                return res.status(200).json({
                    is_wallet_routing: true,
                    target_wallet: contextDid.target_wallet,
                    alias: contextDid.alias,
                    context: contextDid.context
                });
            }

            const disclosures = contextDid.disclosures || {};
            const wallet = ownerAccount.wallet;

            const fullProfile = await UserProfile.findOne({ wallet });
            if (!fullProfile) {
                return res.status(404).json({ success: false, error: 'Profile not found' });
            }

            // Build filtered profile — only include what the user consented to share
            const contextProfile = {
                did: contextDid.did,
                alias: contextDid.alias,
                context: contextDid.context,
                is_context_profile: true,
                tier: ownerAccount.tier,
                profile_image_url: fullProfile.profile_image_url,
                first_name: disclosures.firstName ? fullProfile.first_name : undefined,
                last_name: disclosures.lastName ? fullProfile.last_name : undefined,
                date_of_birth: disclosures.dateOfBirth ? fullProfile.date_of_birth : undefined,
                email: disclosures.email ? fullProfile.email : undefined,
                phone_number: disclosures.phone ? fullProfile.phone_number : undefined,
                headline: disclosures.headline ? fullProfile.headline : undefined,
                about: disclosures.about ? fullProfile.about : undefined,
                city: disclosures.location ? fullProfile.city : undefined,
                country: disclosures.location ? fullProfile.country : undefined,
                socials: disclosures.socials ? fullProfile.socials : undefined,
            };

            // Conditionally fetch section data based on disclosures
            const fetchTasks = [];
            if (disclosures.experience) fetchTasks.push(Experience.find({ wallet }).sort({ 'start_date.year': -1 }).lean().then(r => { contextProfile.experiences = r; }));
            if (disclosures.education) fetchTasks.push(Education.find({ wallet }).sort({ 'start_date.year': -1 }).lean().then(r => { contextProfile.education = r; }));
            if (disclosures.certifications) fetchTasks.push(Certification.find({ wallet }).sort({ created_at: -1 }).lean().then(r => { contextProfile.certifications = r; }));
            if (disclosures.skills) fetchTasks.push(Skill.find({ wallet }).sort({ is_top_skill: -1 }).lean().then(r => { contextProfile.skills = r; }));
            if (disclosures.projects) fetchTasks.push(Project.find({ wallet }).sort({ created_at: -1 }).lean().then(r => { contextProfile.projects = r; }));
            if (disclosures.awards) fetchTasks.push(Award.find({ wallet }).sort({ created_at: -1 }).lean().then(r => { contextProfile.awards = r; }));
            if (disclosures.languages) fetchTasks.push(Language.find({ wallet }).lean().then(r => { contextProfile.languages = r; }));
            if (disclosures.volunteer) fetchTasks.push(Volunteer.find({ wallet }).lean().then(r => { contextProfile.volunteers = r; }));
            await Promise.all(fetchTasks);

            return res.json(contextProfile);
        }

        // ─── Standard Master Profile Resolution ───────────────────────────
        let profile;

        // ─── Subdomain-style Persona Resolution ──────────────────────────
        // Handles identifiers like "gig.vawa-bitu-sabo" or "gig.vawa-bitu-sabo.cid"
        // These are human-readable persona URLs that resolve via the CNS system.
        const isLikelySubdomain = trimmedIdentifier.includes('.') &&
            !trimmedIdentifier.startsWith('did:') &&
            !trimmedIdentifier.startsWith('account-hash-');

        if (isLikelySubdomain) {
            const nameToResolve = trimmedIdentifier.endsWith('.cid')
                ? trimmedIdentifier
                : `${trimmedIdentifier}.cid`;

            const resolved = await cnsResolver.resolve(nameToResolve);

            if (!resolved) {
                return res.status(404).json({
                    error: 'Profile not found',
                    message: `No profile found for: ${identifier}`
                });
            }

            // Wallet-only routing personas
            if (resolved.contextType === 'wallet_only') {
                return res.status(200).json({
                    is_wallet_routing: true,
                    target_wallet: resolved.profileData?.wallet,
                    alias: trimmedIdentifier,
                    context: resolved.contextType
                });
            }

            // Redirect responses (e.g. explicit cns routing rules)
            if (resolved.redirect) {
                return res.redirect(resolved.redirect);
            }

            // For context profiles, apply the persona's actual disclosures
            // (CNS resolver uses hardcoded context-type filtering — we override that here)
            const ownerWallet = resolved.profileData?.wallet || resolved.wallet;
            if (resolved.contextType && resolved.contextType !== 'master' && ownerWallet) {
                const { UserAccount } = require('../database/models');
                const ownerAccount = await UserAccount.findOne({ wallet: ownerWallet });

                if (ownerAccount) {
                    // Find the context DID matching the subdomain alias
                    const contextAlias = trimmedIdentifier.split('.')[0]; // 'game' from 'game.bika'
                    const contextDid = ownerAccount.context_dids?.find(c =>
                        c.alias === contextAlias || c.context === contextAlias
                    );

                    if (contextDid && contextDid.routing_type !== 'wallet') {
                        const disclosures = contextDid.disclosures || {};
                        const wallet = ownerAccount.wallet;

                        const fullProfile = await UserProfile.findOne({ wallet });
                        if (!fullProfile) {
                            return res.status(404).json({ success: false, error: 'Profile not found' });
                        }

                        // Build filtered profile from actual disclosures
                        const contextProfile = {
                            did: contextDid.did,
                            alias: contextDid.alias,
                            context: contextDid.context,
                            is_context_profile: true,
                            tier: ownerAccount.tier,
                            profile_image_url: fullProfile.profile_image_url,
                            first_name: disclosures.firstName ? fullProfile.first_name : undefined,
                            last_name: disclosures.lastName ? fullProfile.last_name : undefined,
                            date_of_birth: disclosures.dateOfBirth ? fullProfile.date_of_birth : undefined,
                            email: disclosures.email ? fullProfile.email : undefined,
                            phone_number: disclosures.phone ? fullProfile.phone_number : undefined,
                            headline: disclosures.headline ? fullProfile.headline : undefined,
                            about: disclosures.about ? fullProfile.about : undefined,
                            city: disclosures.location ? fullProfile.city : undefined,
                            country: disclosures.location ? fullProfile.country : undefined,
                            socials: disclosures.socials ? fullProfile.socials : undefined,
                        };

                        const fetchTasks = [];
                        if (disclosures.experience) fetchTasks.push(Experience.find({ wallet }).sort({ 'start_date.year': -1 }).lean().then(r => { contextProfile.experiences = r; }));
                        if (disclosures.education) fetchTasks.push(Education.find({ wallet }).sort({ 'start_date.year': -1 }).lean().then(r => { contextProfile.education = r; }));
                        if (disclosures.certifications) fetchTasks.push(Certification.find({ wallet }).sort({ created_at: -1 }).lean().then(r => { contextProfile.certifications = r; }));
                        if (disclosures.skills) fetchTasks.push(Skill.find({ wallet }).sort({ is_top_skill: -1 }).lean().then(r => { contextProfile.skills = r; }));
                        if (disclosures.projects) fetchTasks.push(Project.find({ wallet }).sort({ created_at: -1 }).lean().then(r => { contextProfile.projects = r; }));
                        if (disclosures.awards) fetchTasks.push(Award.find({ wallet }).sort({ created_at: -1 }).lean().then(r => { contextProfile.awards = r; }));
                        if (disclosures.languages) fetchTasks.push(Language.find({ wallet }).lean().then(r => { contextProfile.languages = r; }));
                        if (disclosures.volunteer) fetchTasks.push(Volunteer.find({ wallet }).lean().then(r => { contextProfile.volunteers = r; }));
                        await Promise.all(fetchTasks);

                        return res.json(contextProfile);
                    }
                }
            }

            // Fallback: master profile resolved via CNS (e.g. premium name like alice.cid)
            return res.json({
                ...resolved.profileData,
                is_context_profile: false,
            });
        }

        // ─── Standard Master Profile Resolution ───────────────────────────
        // Find by wallet OR human_id
        profile = await UserProfile.findOne({
            $or: [
                { wallet: trimmedIdentifier },
                { human_id: trimmedIdentifier }
            ]
        });

        // If still not found, check if user has credentials (verified user)
        if (!profile) {
            const credential = await Credential.findOne({
                $or: [
                    { wallet: trimmedIdentifier },
                    { human_id: trimmedIdentifier }
                ],
                revoked: false
            });

            if (credential) {
                // Found verified user, try to get their profile
                profile = await UserProfile.findOne({ wallet: credential.wallet });
            }
        }

        if (!profile) {
            return res.status(404).json({
                error: 'Profile not found',
                message: `No profile found for identifier: ${identifier}`
            });
        }

        // Ensure profile has human_id for SEO-friendly URLs
        try {
            const result = await ensureHumanIdInProfile(profile.wallet, { UserProfile, Credential });
            profile = result.profile;
            console.log(`Ensured human_id for public profile: ${result.humanId}`);
        } catch (error) {
            console.error('Error ensuring human_id for public profile:', error);
            // Continue with profile without human_id if generation fails
        }

        // Fetch related public-safe sections and verification status using the same wallet
        const wallet = profile.wallet;
        const [
            experiences,
            education,
            certifications,
            skills,
            projects,
            awards,
            languages,
            volunteers,
            credential
        ] = await Promise.all([
            Experience.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 }).lean(),
            Education.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 }).lean(),
            Certification.find({ wallet }).sort({ 'issue_date.year': -1, 'issue_date.month': -1, created_at: -1 }).lean(),
            Skill.find({ wallet }).sort({ is_top_skill: -1, display_order: 1, created_at: -1 }).lean(),
            Project.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 }).lean(),
            Award.find({ wallet }).sort({ 'issue_date.year': -1, 'issue_date.month': -1, created_at: -1 }).lean(),
            Language.find({ wallet }).sort({ display_order: 1, created_at: -1 }).lean(),
            Volunteer.find({ wallet }).sort({ 'start_date.year': -1, 'start_date.month': -1, created_at: -1 }).lean(),
            Credential.findOne({ wallet, revoked: false }).lean()
        ]);

        // Return public profile (include contact fields for public display)
        const publicProfile = {
            wallet: profile.wallet,
            human_id: profile.human_id, // Include human_id for SEO-friendly URLs
            cns_name: profile.cns_name,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            phone_number: profile.phone_number,
            headline: profile.headline,
            profile_image_url: profile.profile_image_url,
            cover_image_url: profile.cover_image_url,
            city: profile.city,
            country: profile.country,
            website: profile.website,
            portfolio_links: profile.portfolio_links,
            about: profile.about,
            socials: profile.socials,
            open_to_work: profile.open_to_work,
            industry: profile.industry,
            seniority_level: profile.seniority_level,
            profile_completeness: profile.profile_completeness,
            pronouns: profile.pronouns,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            // Verification status fields
            is_verified: !!credential,
            verification_tier: credential ? credential.tier : null,
            last_verification_date: credential ? new Date(credential.last_kyc_at * 1000).toISOString() : null,
            experiences,
            education,
            certifications,
            skills,
            projects,
            awards,
            languages,
            volunteers
            // Note: wallet address is NOT included for privacy
        };

        // Log view event for analytics (async, don't block response)
        logViewEvent(
            null, // viewer wallet (anonymous for public profiles)
            profile.wallet, // profile owner
            req.originalUrl, // endpoint accessed
            Object.keys(publicProfile), // accessed fields
            req
        ).catch(console.error);

        // Emit profile viewed event (subscribers handle email with rate limiting)
        const ownerAccount = await UserAccount.findOne({ wallet: profile.wallet });
        if (ownerAccount) {
            const viewerName = req.headers['x-viewer-name'] || 'Someone';
            const profileUrl = `${process.env.FRONTEND_URL || 'https://casperid.com'}/profile/${profile.human_id || profile.wallet}`;

            eventBus.emit(EVENTS.PROFILE_VIEWED, {
                ownerWallet: profile.wallet,
                ownerEmail: ownerAccount.recovery_email,
                ownerTier: ownerAccount.tier,
                viewerName,
                viewerIp: req.ip,
                profileUrl
            });
        }

        res.json(publicProfile);
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch public profile' });
    }
});

// ============================================
// USER PROFILE - Main Profile
// ============================================

/**
 * GET /api/profile/:wallet
 * Get complete user profile
 */
router.get('/profile/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        console.log(`GET /profile/${wallet}`);

        const trimmedWallet = wallet.trim();
        let profile = await UserProfile.findOne({
            $or: [
                { wallet: trimmedWallet },
                { human_id: trimmedWallet }
            ]
        });
        console.log(`Found profile:`, !!profile);

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        // Ensure profile has human_id
        if (!profile.human_id) {
            try {
                const result = await ensureHumanIdInProfile(trimmedWallet, { UserProfile, Credential });
                profile = result.profile;
                console.log(`Generated human_id for profile: ${result.humanId}`);
            } catch (error) {
                console.error('Error ensuring human_id:', error);
                // Continue with profile without human_id if generation fails
            }
        }

        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch profile' });
    }
});

/**
 * PUT /api/profile/:wallet
 * Update user profile
 */
router.put('/profile/:wallet', async (req, res) => {
    try {
        const { wallet } = req.params;
        const updates = req.body;

        console.log(`Updating profile for ${wallet}`, updates);

        // Security: Remove wallet/id from updates to avoid overwriting
        delete updates.wallet;
        delete updates._id;
        delete updates.human_id; // Prevent manual human_id updates

        // Get previous completeness to detect 100% milestone
        const previousCompleteness = await calculateProfileCompleteness(wallet);

        // First ensure the profile has a human_id
        let profile;
        try {
            const result = await ensureHumanIdInProfile(wallet, { UserProfile, Credential });
            console.log(`Ensured human_id: ${result.humanId}`);

            // Now update with the provided data
            profile = await UserProfile.findOneAndUpdate(
                { wallet },
                { $set: updates },
                { new: true, runValidators: true }
            );
        } catch (humanIdError) {
            console.error('Error ensuring human_id:', humanIdError);
            // Fallback: update without human_id generation
            profile = await UserProfile.findOneAndUpdate(
                { wallet },
                {
                    $set: updates,
                    $setOnInsert: { wallet }
                },
                { new: true, upsert: true, runValidators: true }
            );
        }

        // Check if profile just reached 100% completion
        const newCompleteness = await calculateProfileCompleteness(wallet);
        if (previousCompleteness < 100 && newCompleteness === 100) {
            const userAccount = await UserAccount.findOne({ wallet });
            if (userAccount) {
                const name = profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : null;
                const profileUrl = `${process.env.FRONTEND_URL || 'https://casperid.com'}/profile/${profile.human_id || wallet}`;

                eventBus.emit(EVENTS.PROFILE_COMPLETED, {
                    userId: userAccount.user_id,
                    email: userAccount.recovery_email,
                    name,
                    wallet,
                    profileUrl
                });
            }
        }

        // Update completeness on profile
        if (profile) {
            profile.profile_completeness = newCompleteness;
            await profile.save();
        }

        console.log('Profile updated/created:', profile ? profile._id : 'null');
        res.json(profile);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update profile' });
    }
});



/**
 * GET /api/profile/random-banner
 * Get a random banner image from Unsplash
 */
router.get('/random-banner', async (req, res) => {
    try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;

        // If no key, fallback to Picsum
        if (!accessKey) {
            console.warn('UNSPLASH_ACCESS_KEY not configured, falling back to Picsum');
            return res.json({ imageUrl: `https://picsum.photos/seed/${Date.now()}/1600/900` });
        }

        // Use standard fetch (Node 18+)
        const response = await fetch('https://api.unsplash.com/photos/random?orientation=landscape&query=technology,abstract,digital,blockchain', {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Unsplash API error:', response.status, errorText);
            // Fallback on error
            return res.json({ imageUrl: `https://picsum.photos/seed/${Date.now()}/1600/900` });
        }

        const data = await response.json();
        res.json({ imageUrl: data.urls.regular });
    } catch (error) {
        console.error('Random banner error:', error);
        // Fallback on exception
        res.json({ imageUrl: `https://picsum.photos/seed/${Date.now()}/1600/900` });
    }
});

/**
 * POST /api/profile/:wallet/upload-avatar
 * Upload profile picture to ImageKit
 */
router.post('/profile/:wallet/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { wallet } = req.params;

        console.log(`[Upload] ImageKit upload start for ${wallet}`);
        console.log(`[Upload] Buffer length: ${req.file.buffer ? req.file.buffer.length : 'UNDEFINED'}`);

        // Upload to ImageKit
        const uploadResponse = await imagekit.files.upload({
            file: req.file.buffer.toString('base64'), // Send as base64 string
            fileName: `avatar-${wallet}-${Date.now()}`, // required
            folder: '/avatars',
            useUniqueFileName: true
        });

        const imageUrl = uploadResponse.url;

        const profile = await UserProfile.findOneAndUpdate(
            { wallet },
            { $set: { profile_image_url: imageUrl } },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            profile,
            imageUrl,
            fileId: uploadResponse.fileId
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to upload image' });
    }
});

// ============================================
// EXPERIENCE - Work History
// ============================================

/**
 * GET /api/profile/:wallet/experience
 * Get all experiences for a user
 */
router.get('/profile/:wallet/experience', async (req, res) => {
    try {
        const { wallet } = req.params;
        const experiences = await Experience.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(experiences);
    } catch (error) {
        console.error('Get experiences error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch experiences' });
    }
});

/**
 * POST /api/profile/:wallet/experience
 * Add new experience
 */
router.post('/profile/:wallet/experience', async (req, res) => {
    try {
        const { wallet } = req.params;
        const experienceData = { ...req.body, wallet };

        const experience = new Experience(experienceData);
        await experience.save();

        res.status(201).json(experience);
    } catch (error) {
        console.error('Add experience error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add experience' });
    }
});

/**
 * PUT /api/profile/:wallet/experience/:id
 * Update experience
 */
router.put('/profile/:wallet/experience/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;
        console.log(`PUT /experience/${id} for wallet ${wallet}`);
        console.log('Update payload:', JSON.stringify(req.body, null, 2));

        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;

        const experience = await Experience.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!experience) {
            return res.status(404).json({ success: false, error: 'Experience not found' });
        }

        res.json(experience);
    } catch (error) {
        console.error('Update experience error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update experience' });
    }
});

/**
 * DELETE /api/profile/:wallet/experience/:id
 * Delete experience
 */
router.delete('/profile/:wallet/experience/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const experience = await Experience.findOneAndDelete({ _id: id, wallet });

        if (!experience) {
            return res.status(404).json({ success: false, error: 'Experience not found' });
        }

        res.json({ message: 'Experience deleted successfully' });
    } catch (error) {
        console.error('Delete experience error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete experience' });
    }
});

// ============================================
// EDUCATION
// ============================================

router.get('/profile/:wallet/education', async (req, res) => {
    try {
        const { wallet } = req.params;
        const education = await Education.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(education);
    } catch (error) {
        console.error('Get education error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch education' });
    }
});

router.post('/profile/:wallet/education', async (req, res) => {
    try {
        const { wallet } = req.params;
        const educationData = { ...req.body, wallet };

        const education = new Education(educationData);
        await education.save();

        res.status(201).json(education);
    } catch (error) {
        console.error('Add education error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add education' });
    }
});

router.put('/profile/:wallet/education/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;
        console.log(`PUT /education/${id} for wallet ${wallet}`);
        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;

        const education = await Education.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!education) {
            return res.status(404).json({ success: false, error: 'Education not found' });
        }

        res.json(education);
    } catch (error) {
        console.error('Update education error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update education' });
    }
});

router.delete('/profile/:wallet/education/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const education = await Education.findOneAndDelete({ _id: id, wallet });

        if (!education) {
            return res.status(404).json({ success: false, error: 'Education not found' });
        }

        res.json({ message: 'Education deleted successfully' });
    } catch (error) {
        console.error('Delete education error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete education' });
    }
});

// ============================================
// CERTIFICATIONS
// ============================================

router.get('/profile/:wallet/certifications', async (req, res) => {
    try {
        const { wallet } = req.params;
        const certifications = await Certification.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(certifications);
    } catch (error) {
        console.error('Get certifications error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch certifications' });
    }
});

router.post('/profile/:wallet/certifications', async (req, res) => {
    try {
        const { wallet } = req.params;
        const certData = { ...req.body, wallet };

        const certification = new Certification(certData);
        await certification.save();

        res.status(201).json(certification);
    } catch (error) {
        console.error('Add certification error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add certification' });
    }
});

router.put('/profile/:wallet/certifications/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;
        delete updates.wallet;

        const certification = await Certification.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!certification) {
            return res.status(404).json({ success: false, error: 'Certification not found' });
        }

        res.json(certification);
    } catch (error) {
        console.error('Update certification error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update certification' });
    }
});

router.delete('/profile/:wallet/certifications/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const certification = await Certification.findOneAndDelete({ _id: id, wallet });

        if (!certification) {
            return res.status(404).json({ success: false, error: 'Certification not found' });
        }

        res.json({ message: 'Certification deleted successfully' });
    } catch (error) {
        console.error('Delete certification error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete certification' });
    }
});

// ============================================
// SKILLS
// ============================================

router.get('/profile/:wallet/skills', async (req, res) => {
    try {
        const { wallet } = req.params;
        const skills = await Skill.find({ wallet }).sort({ is_top_skill: -1, display_order: 1 });
        res.json(skills);
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch skills' });
    }
});

router.post('/profile/:wallet/skills', async (req, res) => {
    try {
        console.log('🚀 POST /profile/:wallet/skills called');
        console.log('📍 Wallet param:', req.params.wallet);
        console.log('📦 Request body:', req.body);

        const { wallet } = req.params;
        const skillData = { ...req.body, wallet };

        console.log('💾 Final skill data to save:', skillData);

        const skill = new Skill(skillData);
        console.log('🔨 Skill instance created:', skill);

        await skill.save();
        console.log('✅ Skill saved to database successfully:', skill);

        res.status(201).json(skill);
        console.log('📤 Response sent with skill data');
    } catch (error) {
        console.error('❌ Add skill error:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ success: false, error: error.message || 'Failed to add skill' });
    }
});

router.put('/profile/:wallet/skills/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;
        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;

        const skill = await Skill.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!skill) {
            return res.status(404).json({ success: false, error: 'Skill not found' });
        }

        res.json(skill);
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update skill' });
    }
});

router.delete('/profile/:wallet/skills/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const skill = await Skill.findOneAndDelete({ _id: id, wallet });

        if (!skill) {
            return res.status(404).json({ success: false, error: 'Skill not found' });
        }

        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete skill' });
    }
});


// ============================================
// PROJECTS
// ============================================

router.get('/profile/:wallet/projects', async (req, res) => {
    try {
        const { wallet } = req.params;
        const projects = await Project.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch projects' });
    }
});

router.post('/profile/:wallet/projects', async (req, res) => {
    try {
        const { wallet } = req.params;
        const projectData = { ...req.body, wallet };

        const project = new Project(projectData);
        await project.save();

        res.status(201).json(project);
    } catch (error) {
        console.error('Add project error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add project' });
    }
});

router.put('/profile/:wallet/projects/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;
        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;

        const project = await Project.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update project' });
    }
});

router.delete('/profile/:wallet/projects/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const project = await Project.findOneAndDelete({ _id: id, wallet });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete project' });
    }
});

// ============================================
// AWARDS
// ============================================

router.get('/profile/:wallet/awards', async (req, res) => {
    try {
        const { wallet } = req.params;
        const awards = await Award.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(awards);
    } catch (error) {
        console.error('Get awards error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch awards' });
    }
});

router.post('/profile/:wallet/awards', async (req, res) => {
    try {
        const { wallet } = req.params;
        const awardData = { ...req.body, wallet };

        const award = new Award(awardData);
        await award.save();

        res.status(201).json(award);
    } catch (error) {
        console.error('Add award error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add award' });
    }
});

router.put('/profile/:wallet/awards/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;
        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;

        const award = await Award.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!award) {
            return res.status(404).json({ success: false, error: 'Award not found' });
        }

        res.json(award);
    } catch (error) {
        console.error('Update award error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update award' });
    }
});

router.delete('/profile/:wallet/awards/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const award = await Award.findOneAndDelete({ _id: id, wallet });

        if (!award) {
            return res.status(404).json({ success: false, error: 'Award not found' });
        }

        res.json({ message: 'Award deleted successfully' });
    } catch (error) {
        console.error('Delete award error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete award' });
    }
});

// ============================================
// LANGUAGES
// ============================================

router.get('/profile/:wallet/languages', async (req, res) => {
    try {
        const { wallet } = req.params;
        const languages = await Language.find({ wallet }).sort({ display_order: 1 });
        res.json(languages);
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch languages' });
    }
});

router.post('/profile/:wallet/languages', async (req, res) => {
    try {
        const { wallet } = req.params;
        const languageData = { ...req.body, wallet };

        const language = new Language(languageData);
        await language.save();

        res.status(201).json(language);
    } catch (error) {
        console.error('Add language error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add language' });
    }
});

router.put('/profile/:wallet/languages/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;
        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;

        const language = await Language.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!language) {
            return res.status(404).json({ success: false, error: 'Language not found' });
        }

        res.json(language);
    } catch (error) {
        console.error('Update language error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update language' });
    }
});

router.delete('/profile/:wallet/languages/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const language = await Language.findOneAndDelete({ _id: id, wallet });

        if (!language) {
            return res.status(404).json({ success: false, error: 'Language not found' });
        }

        res.json({ message: 'Language deleted successfully' });
    } catch (error) {
        console.error('Delete language error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete language' });
    }
});

// ============================================
// VOLUNTEER EXPERIENCE
// ============================================

router.get('/profile/:wallet/volunteer', async (req, res) => {
    try {
        const { wallet } = req.params;
        const volunteer = await Volunteer.find({ wallet }).sort({ display_order: 1, created_at: -1 });
        res.json(volunteer);
    } catch (error) {
        console.error('Get volunteer error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch volunteer experience' });
    }
});

router.post('/profile/:wallet/volunteer', async (req, res) => {
    try {
        const { wallet } = req.params;
        const volunteerData = { ...req.body, wallet };

        const volunteer = new Volunteer(volunteerData);
        await volunteer.save();

        res.status(201).json(volunteer);
    } catch (error) {
        console.error('Add volunteer error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to add volunteer experience' });
    }
});

router.put('/profile/:wallet/volunteer/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;
        const updates = { ...req.body };
        delete updates._id;
        delete updates.wallet;

        const volunteer = await Volunteer.findOneAndUpdate(
            { _id: id, wallet },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!volunteer) {
            return res.status(404).json({ success: false, error: 'Volunteer experience not found' });
        }

        res.json(volunteer);
    } catch (error) {
        console.error('Update volunteer error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update volunteer experience' });
    }
});

router.delete('/profile/:wallet/volunteer/:id', async (req, res) => {
    try {
        const { wallet, id } = req.params;

        const volunteer = await Volunteer.findOneAndDelete({ _id: id, wallet });

        if (!volunteer) {
            return res.status(404).json({ success: false, error: 'Volunteer experience not found' });
        }

        res.json({ message: 'Volunteer experience deleted successfully' });
    } catch (error) {
        console.error('Delete volunteer error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to delete volunteer experience' });
    }
});

// ============================================
// HUMAN ID GENERATION
// ============================================

/**
 * GET /api/profile/human-id/:walletAddress
 * Get human-readable ID for a wallet address
 */
router.get('/profile/human-id/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (!walletAddress || walletAddress === 'pending_wallet' || walletAddress === 'undefined') {
            return res.status(200).json({
                success: false,
                error: 'Wallet address is required',
                humanId: null
            });
        }

        console.log(`GET /human-id/${walletAddress}`);

        const humanId = await getHumanIdForWallet(walletAddress, { UserProfile, Credential });

        res.json({
            success: true,
            humanId,
            walletAddress
        });
    } catch (error) {
        console.error('Get human ID error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate human ID'
        });
    }
});

// ============================================
// DEBUG - TIER COMPARISON
// ============================================

/**
 * GET /api/debug/tier-status/:wallet
 * Compare tier status between UserAccount and IdentityCredentials
 * Useful for debugging tier synchronization issues
 */
router.get('/debug/tier-status/:wallet', async (req, res) => {
    try {
        const { getTierComparison } = require('../utils/tier-sync');
        const comparison = await getTierComparison(req.params.wallet);
        res.json(comparison);
    } catch (error) {
        console.error('Tier comparison error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
