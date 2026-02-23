const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// POST /api/careers/apply
router.post('/apply', async (req, res) => {
    try {
        const { jobTitle, applicantEmail, applicantName, applicantId } = req.body;

        if (!jobTitle || !applicantEmail || !applicantName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await emailService.sendJobApplication({
            jobTitle,
            applicantEmail,
            applicantName,
            applicantId
        });

        res.status(200).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

module.exports = router;
