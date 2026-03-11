const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        default: 100
    },
    isUsed: {
        type: Boolean,
        default: false,
        index: true
    },
    usedByWallet: {
        type: String,
        default: null
    },
    usedForCns: {
        type: String,
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
