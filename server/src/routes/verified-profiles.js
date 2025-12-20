/**
 * Verified profiles API endpoint for sitemap generation
 */

const express = require('express');
const router = express.Router();
const { UserProfile } = require('../database/models');

/**
 * GET /api/verified-profiles
 * Get list of verified profiles for sitemap generation
 */
router.get('/verified-profiles', async (req, res) => {
    try {
        // Get all verified profiles with public information
        const verifiedProfiles = await UserProfile.find({
            verification_status: 'verified',
            // Only include profiles that have opted into public listing
            'privacy_settings.allow_public_profile': { $ne: false }
        }, {
            // Only return necessary fields for sitemap
            human_id: 1,
            first_name: 1,
            last_name: 1,
            verification_status: 1,
            verified_at: 1,
            updated_at: 1,
            created_at: 1
        })
        .sort({ verified_at: -1 }) // Most recently verified first
        .limit(1000); // Limit to 1000 for performance

        // Filter out profiles without human_id
        const validProfiles = verifiedProfiles.filter(profile => profile.human_id);

        res.json(validProfiles);

    } catch (error) {
        console.error('Failed to fetch verified profiles:', error);
        res.status(500).json({ error: 'Failed to fetch verified profiles' });
    }
});

module.exports = router;