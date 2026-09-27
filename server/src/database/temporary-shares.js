const mongoose = require('mongoose');

// ============================================
// TEMPORARY SHARES (TTL Collections)
// ============================================

/**
 * Private Claim Share - Stores short-lived selective-disclosure claims
 * TTL: 1 hour (auto-deleted by MongoDB)
 */
const zkProofShareSchema = new mongoose.Schema({
    proof_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user_id: {
        type: String,
        required: true,
        index: true
    },
    wallet: String,
    human_id: String,
    // The signed JWT proof
    proof: {
        type: String,
        required: true
    },
    proof_hash: String,
    // Cached claim metadata for owner-side history. Public verification must
    // display claims decoded from the verified JWT instead of this copy.
    claims: [{
        id: String,
        label: String,
        icon: String,
        valid: Boolean,
        verified: Boolean,
        verificationSource: String
    }],
    issuer: {
        id: String,
        wallet: String,
        human_id: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true,
        index: true
    },
    view_count: {
        type: Number,
        default: 0
    }
});

// TTL index - MongoDB auto-deletes when expires_at is reached
zkProofShareSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

/**
 * Data Share - Stores selective disclosure packages temporarily
 * TTL: 24 hours (auto-deleted by MongoDB)
 */
const dataShareSchema = new mongoose.Schema({
    share_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user_id: {
        type: String,
        required: true,
        index: true
    },
    wallet: String,
    human_id: String,
    // The complete signed share package
    package_data: {
        type: Object,
        required: true
    },
    // Fields that were shared (for quick reference)
    shared_fields: [{
        type: String
    }],
    // Signature info
    signature: String,
    public_key: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true,
        index: true
    },
    view_count: {
        type: Number,
        default: 0
    }
});

// TTL index - MongoDB auto-deletes when expires_at is reached
dataShareSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const ZKProofShare = mongoose.model('ZKProofShare', zkProofShareSchema);
const DataShare = mongoose.model('DataShare', dataShareSchema);

module.exports = {
    ZKProofShare,
    DataShare
};
