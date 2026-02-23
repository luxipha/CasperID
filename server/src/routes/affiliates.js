const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

router.post('/apply', async (req, res) => {
    try {
        const { applicantName, applicantEmail, applicantId, location } = req.body;

        if (!applicantEmail || !applicantName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await emailService.sendAffiliateApplication({
            applicantName,
            applicantEmail,
            applicantId,
            location
        });

        res.status(200).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting affiliate application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

module.exports = router;
