const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { UserProfile, UserAccount, Skill } = require('../database/models');

// POST /api/careers/apply
router.post('/apply', async (req, res) => {
    try {
        const { jobTitle, applicantEmail, applicantName, applicantId } = req.body;

        if (!jobTitle || !applicantEmail || !applicantName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Enrich with profile data if applicantId (markovId) is provided
        let profile = null;
        let account = null;
        let skills = [];

        if (applicantId) {
            profile = await UserProfile.findOne({ human_id: applicantId });
            if (profile) {
                [account, skills] = await Promise.all([
                    UserAccount.findOne({ wallet: profile.wallet }),
                    Skill.find({ wallet: profile.wallet }).limit(5)
                ]);
            }
        }

        await emailService.sendJobApplication({
            jobTitle,
            applicantEmail,
            applicantName,
            applicantId,
            profileData: profile,
            tier: account?.tier || 'layer_0',
            topSkills: skills.map(s => s.skill_name)
        });

        res.status(200).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

module.exports = router;
