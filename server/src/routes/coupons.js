const express = require('express');
const router = express.Router();
const { Coupon } = require('../database/models');

// GET /api/coupons/validate/:code
// Validates a coupon code and returns the discount details
router.get('/validate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) return res.status(400).json({ error: 'Missing coupon code' });

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            active: true
        });

        if (!coupon) {
            return res.status(404).json({ valid: false, message: 'Invalid or inactive coupon code' });
        }

        // Check expiry
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return res.status(400).json({ valid: false, message: 'Coupon has expired' });
        }

        // Check usage limit
        if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
        }

        res.json({
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        });
    } catch (error) {
        console.error('[Coupons] Validation Error:', error);
        res.status(500).json({ error: 'Internal server error validating coupon' });
    }
});

module.exports = router;
