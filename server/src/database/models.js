const mongoose = require('mongoose');
const { encryptionPlugin } = require('../utils/field-encryption');
const { ALL_EVENTS } = require('../constants/webhook-events');

// ============================================
// VERIFICATION & CREDENTIALS (Existing)
// ============================================

const verificationRequestSchema = new mongoose.Schema({
    wallet: {
        type: String,
        required: true,
        index: true
    },
    email: { type: String }, // Optional for WebAuthn users
    // Extended Basic
    first_name: { type: String },
    last_name: { type: String },
    name: { type: String }, // Legacy
    date_of_birth: { type: String },
    age: { type: Number }, // Legacy
    phone_number: { type: String },
    home_address: { type: Object }, // Structure: { street, city, state, postal_code, country }
    location: { type: String }, // Legacy

    // CNS
    cns_name: { type: String },
    tier: {
        type: String,
        enum: ['layer_1', 'layer_2', 'layer_3'],
        default: 'layer_1',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    metadata: {
        type: Object,
        default: {}
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    coordinates: {
        lat: Number,
        long: Number
    },
    ip: String,
    userAgent: String,
    updated_at: {
        type: Date,
        default: Date.now
    }
});

verificationRequestSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const credentialSchema = new mongoose.Schema({
    wallet: {
        type: String,
        required: true,
        distinct: true,
        index: true
    },
    human_id: {
        type: String,
        index: true,
        sparse: true
    },
    tier: {
        type: String,
        enum: require('../constants/tier-levels').TIER_ENUM,
        required: true
    },
    last_kyc_at: {
        type: Number,
        required: true
    },
    last_liveness_at: {
        type: Number,
        required: false,
        default: null
    },
    issuer_id: {
        type: String,
        required: true
    },
    credential_json: {
        type: String,
        required: true
    },
    credential_hash: {
        type: String,
        required: true
    },
    onchain_tx_hash: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    revoked: {
        type: Boolean,
        default: false
    },
    revocation_reason: {
        type: String
    },
    coordinates: {
        lat: Number,
        long: Number
    },
    ip: String,
    userAgent: String,
    location: String
});

// Apply field-level encryption for sensitive credential data
credentialSchema.plugin(encryptionPlugin, {
    encryptedFields: ['credential_json']
});

// Add compound index for common query patterns
credentialSchema.index({ wallet: 1, revoked: 1 });

const issuerSchema = new mongoose.Schema({
    public_key: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// ============================================
// USER PROFILE (LinkedIn-Style - Enhanced)
// ============================================

const userProfileSchema = new mongoose.Schema({
    // === IDENTITY ===
    wallet: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    human_id: {
        type: String,
        index: true,
        unique: true,
        sparse: true // Allows null values but enforces uniqueness when present
    },
    cns_name: { type: String, index: true },

    // === HEADER INFO ===
    first_name: { type: String },
    last_name: { type: String },
    date_of_birth: { type: Date },
    pronouns: { type: String },
    headline: { type: String, maxlength: 220 },
    profile_image_url: { type: String },
    cover_image_url: { type: String },

    // === LOCATION ===
    city: { type: String },
    country: { type: String },
    address: { type: String }, // Full home address from KYC

    // === CONTACT INFO ===
    email: { type: String },
    phone_number: { type: String },
    website: { type: String },
    portfolio_links: [{ type: String }],

    // === ABOUT SECTION ===
    about: {
        type: String,
        maxlength: 2600
    },

    // === SOCIAL LINKS ===
    socials: {
        linkedin: { type: String },
        twitter: { type: String },
        github: { type: String },
        instagram: { type: String },
        youtube: { type: String },
        tiktok: { type: String },
        website: { type: String }
    },

    // === OPEN TO WORK ===
    open_to_work: {
        enabled: { type: Boolean, default: false },
        job_titles: [{ type: String }],
        employment_types: [{
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
        }],
        locations: [{ type: String }],
        remote_preference: {
            type: String,
            enum: ['on-site', 'hybrid', 'remote', 'any']
        },
        salary_range: {
            min: { type: Number },
            max: { type: Number },
            currency: { type: String, default: 'USD' }
        },
        availability: { type: String }
    },

    // === PRIVACY SETTINGS ===
    privacy_settings: {
        allow_email: { type: Boolean, default: false },
        allow_phone: { type: Boolean, default: false },
        allow_address: { type: Boolean, default: false },
        allow_birth_date: { type: Boolean, default: false },
        alert_on_view: { type: Boolean, default: true },
        show_open_to_work: { type: Boolean, default: false }
    },

    // === METADATA ===
    profile_completeness: { type: Number, default: 0 },
    industry: { type: String },
    seniority_level: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'executive', 'director']
    },

    // === VERIFICATION TRACKING ===
    verified_at: { type: Date },
    verification_source: {
        type: String,
        enum: ['kyc_approval', 'manual_sync', 'migration']
    },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

userProfileSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

// ============================================
// EXPERIENCE (Work History)
// ============================================

const experienceSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    company_name: { type: String, required: true },
    company_linkedin_url: { type: String },

    job_title: { type: String, required: true },

    employment_type: {
        type: String,
        enum: ['full-time', 'part-time', 'self-employed', 'freelance', 'contract', 'internship', 'seasonal'],
        required: true
    },

    location: { type: String },
    location_type: {
        type: String,
        enum: ['on-site', 'hybrid', 'remote']
    },

    start_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number }
    },

    end_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number },
        is_current: { type: Boolean, default: false }
    },

    description: { type: String, maxlength: 2000 },

    media_attachments: [{
        type: { type: String, enum: ['image', 'video', 'document', 'link'] },
        url: { type: String },
        title: { type: String }
    }],

    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
experienceSchema.index({ wallet: 1, created_at: -1 });
experienceSchema.index({ wallet: 1, 'start_date.year': -1, 'start_date.month': -1 });

// ============================================
// EDUCATION
// ============================================

const educationSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    school_name: { type: String, required: true },
    school_linkedin_url: { type: String },

    degree: { type: String },
    field_of_study: { type: String },

    start_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number }
    },

    end_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number }
    },

    grade: { type: String },
    activities: { type: String },
    description: { type: String, maxlength: 1000 },

    media_attachments: [{
        type: { type: String, enum: ['image', 'document', 'link'] },
        url: { type: String },
        title: { type: String }
    }],

    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
educationSchema.index({ wallet: 1, created_at: -1 });
educationSchema.index({ wallet: 1, 'start_date.year': -1, 'start_date.month': -1 });

// ============================================
// CERTIFICATIONS
// ============================================

const certificationSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    name: { type: String, required: true },
    issuing_organization: { type: String, required: true },

    issue_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number }
    },

    expiration_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number },
        does_not_expire: { type: Boolean, default: false }
    },

    credential_id: { type: String },
    credential_url: { type: String },

    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
certificationSchema.index({ wallet: 1, created_at: -1 });

// ============================================
// SKILLS
// ============================================

const skillSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    skill_name: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
    },
    endorsements_count: { type: Number, default: 0 },

    endorsed_by: [{
        wallet: { type: String },
        cns_name: { type: String },
        date: { type: Date }
    }],

    display_order: { type: Number, default: 0 },
    is_top_skill: { type: Boolean, default: false },

    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
skillSchema.index({ wallet: 1, created_at: -1 });

// ============================================
// PROJECTS
// ============================================

const projectSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    project_name: { type: String, required: true },

    associated_with: {
        type: { type: String, enum: ['job', 'education', 'standalone'] },
        reference_id: { type: mongoose.Schema.Types.ObjectId }
    },

    start_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number }
    },

    end_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number },
        is_ongoing: { type: Boolean, default: false }
    },

    description: { type: String, maxlength: 2000 },
    project_url: { type: String },

    media_attachments: [{
        type: { type: String, enum: ['image', 'video', 'document', 'link'] },
        url: { type: String },
        title: { type: String }
    }],

    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
projectSchema.index({ wallet: 1, created_at: -1 });

// ============================================
// AWARDS
// ============================================

const awardSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    title: { type: String, required: true },
    issuing_organization: { type: String },

    issue_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number }
    },

    description: { type: String, maxlength: 1000 },

    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
awardSchema.index({ wallet: 1, created_at: -1 });

// ============================================
// LANGUAGES
// ============================================

const languageSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    language_name: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ['elementary', 'limited-working', 'professional-working', 'full-professional', 'native'],
        required: true
    },

    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
languageSchema.index({ wallet: 1, created_at: -1 });

// ============================================
// VOLUNTEER EXPERIENCE
// ============================================

const volunteerSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    organization: { type: String, required: true },
    role: { type: String, required: true },
    cause: { type: String },

    start_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number }
    },

    end_date: {
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number },
        is_current: { type: Boolean, default: false }
    },

    description: { type: String, maxlength: 1000 },

    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Compound index for efficient queries sorted by date
volunteerSchema.index({ wallet: 1, created_at: -1 });

// ============================================
// SYSTEM SCHEMAS (Existing)
// ============================================

const viewEventSchema = new mongoose.Schema({
    viewerWallet: { type: String },
    ownerWallet: { type: String, required: true, index: true },
    endpoint: { type: String },
    accessedFields: [{ type: String }],
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
    recipientWallet: { type: String, index: true },
    user_id: { type: String, index: true }, // Alternative to recipientWallet
    type: { type: String, required: true },
    title: { type: String },
    message: { type: String, required: true },
    metadata: { type: Object },
    data: { type: Object }, // Additional structured data
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now } // Alias for consistency
});

const loginSessionSchema = new mongoose.Schema({
    wallet: {
        type: String,
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    platform: {
        type: String,
        required: true
    },
    sharedData: [{
        type: String
    }],
    ip: String,
    userAgent: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    revoked: {
        type: Boolean,
        default: false
    }
});

// ============================================
// ADMIN AUTHENTICATION
// ============================================

const adminUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 50
    },
    password_hash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    },
    last_login: {
        type: Date
    },
    failed_login_attempts: {
        type: Number,
        default: 0
    },
    locked_until: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
});

// ============================================
// PASSKEY AUTHENTICATION SYSTEM
// ============================================

const userAccountSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    recovery_email: {
        type: String,
        required: true,
        index: true
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    wallet: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },

    // Master DID (Root Identity)
    did_address: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    // Track if DID has been minted on-chain (prevents duplicate mint attempts)
    did_minted: {
        type: Boolean,
        default: false
    },
    onchain_did_tx: String, // Transaction hash of the DID minting
    // Premium .cid name (e.g., "alice" for alice.cid)
    cns_name: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    onchain_name_tx: String,
    // Context DIDs (Domain-specific pseudonyms)
    context_dids: [{
        did: { type: String, required: true },
        alias: { type: String, required: true }, // User-defined name (e.g., 'pay', 'work')
        context: { type: String, required: true }, // Type: 'professional', 'gaming', 'social', 'financial'
        routing_type: { type: String, enum: ['identity', 'wallet'], default: 'identity' },
        target_wallet: { type: String }, // Only for wallet routing
        disclosures: {
            // Basic Profile
            firstName: { type: Boolean, default: false },
            lastName: { type: Boolean, default: false },
            dateOfBirth: { type: Boolean, default: false },
            ageVerification: { type: Boolean, default: false },
            email: { type: Boolean, default: false },
            phone: { type: Boolean, default: false },
            headline: { type: Boolean, default: false },
            about: { type: Boolean, default: false },
            location: { type: Boolean, default: false },

            // Categories
            experience: { type: Boolean, default: false },
            education: { type: Boolean, default: false },
            skills: { type: Boolean, default: false },
            certifications: { type: Boolean, default: false },
            projects: { type: Boolean, default: false },
            awards: { type: Boolean, default: false },
            languages: { type: Boolean, default: false },
            volunteer: { type: Boolean, default: false },
            socials: { type: Boolean, default: false }
        },
        tier_required: { type: String, default: 'layer_2' },
        created_at: { type: Date, default: Date.now }
    }],
    // CNS Routing (Programmable Pointers)
    cns_routing: [{
        name: { type: String, required: true }, // e.g. 'alice.cid' or 'work.alice.cid'
        target_type: {
            type: String,
            enum: ['master_profile', 'context_did', 'wallet_only', 'redirect'],
            default: 'master_profile'
        },
        target_id: String, // Context name or DID
        redirect_url: String, // External URL
        active: { type: Boolean, default: true }
    }],
    // Linked Wallets (Cross-chain)
    linked_wallets: [{
        chain: { type: String, enum: ['casper', 'ethereum', 'solana', 'bitcoin'], required: true },
        address: { type: String, required: true },
        verified: { type: Boolean, default: false },
        verified_at: Date
    }],
    user_salt: {
        type: String,
        required: true
    },
    active_passkey_id: {
        type: String,
        index: true
    },
    backup_passkeys: [{
        credential_id: String,
        device_name: String,
        created_at: Date,
        revoked: { type: Boolean, default: false }
    }],
    // Verification tier (single source of truth)
    tier: {
        type: String,
        enum: require('../constants/tier-levels').TIER_ENUM,
        default: 'layer_0',
        required: true
    },
    metamask_connected: {
        type: Boolean,
        default: false
    },
    metamask_address: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    notification_preferences: {
        security_alerts: { type: Boolean, default: true },
        kyc_updates: { type: Boolean, default: true },
        marketing_news: { type: Boolean, default: false }
    },
    // ZK Verification (Starknet)
    zk_verified: {
        type: Boolean,
        default: false
    },
    zk_transaction_hash: {
        type: String
    },
    zk_verified_at: {
        type: Date
    },
    zk_nullifier: {
        type: String,
        index: true,
        sparse: true
    },
    // Quest & Gamification
    points: { type: Number, default: 0 },
    completed_quests: [{ type: String }],
    tour_completed: { type: Boolean, default: false },
    tour_completed_at: { type: Date },
    // Quest tracking flags
    viewed_data_controls: { type: Boolean, default: false },
    viewed_activity_logs: { type: Boolean, default: false },
    extension_installed: { type: Boolean, default: false },
    extension_installed_at: { type: Date },
    profile_shares_count: { type: Number, default: 0 },
    app_logins_count: { type: Number, default: 0 },
    x_shared: { type: Boolean, default: false },
    community_joined: { type: Boolean, default: false },
    casperid_connect_used: { type: Boolean, default: false }
});

const passkeyCredentialSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        index: true
    },
    credential_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    rp_id: {
        type: String,
        index: true
    },
    credential_public_key: {
        type: Buffer,
        required: true
    },
    counter: {
        type: Number,
        default: 0
    },
    device_type: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet']
    },
    device_name: String,
    transports: [{
        type: String,
        enum: ['internal', 'hybrid', 'usb', 'nfc', 'ble']
    }],
    backup_eligible: Boolean,
    backup_state: Boolean,
    attestation_object: Buffer,
    client_data_json: Buffer,
    is_primary: {
        type: Boolean,
        default: false
    },
    revoked: {
        type: Boolean,
        default: false
    },
    revoked_reason: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    last_used: {
        type: Date,
        default: Date.now
    }
});

const deviceSessionSchema = new mongoose.Schema({
    session_id: {
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
    credential_id: {
        type: String,
        required: true,
        index: true
    },
    session_token: {
        type: String,
        required: true,
        unique: true
    },
    device_fingerprint: String,
    ip_address: String,
    user_agent: String,
    bound_to_device: {
        type: Boolean,
        default: true
    },
    requires_biometric: {
        type: Boolean,
        default: true
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
    last_activity: {
        type: Date,
        default: Date.now
    },
    revoked: {
        type: Boolean,
        default: false
    }
});

const devicePairingSchema = new mongoose.Schema({
    pairing_id: {
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
    qr_code_data: {
        type: String,
        required: true
    },
    initiating_device_id: String,
    pairing_token: {
        type: String,
        required: true
    },
    verification_request_id: {
        type: String,
        index: true
    },
    verification_tier: {
        type: String,
        enum: ['layer_2', 'layer_3']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'expired', 'cancelled'],
        default: 'pending'
    },
    target_device_info: {
        device_name: String,
        device_type: String,
        user_agent: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true
    },
    completed_at: Date
});

// TTL index for auto-cleanup of expired pairings
devicePairingSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const emailVerificationSchema = new mongoose.Schema({
    verification_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    user_id: String,
    verification_code: {
        type: String,
        required: true
    },
    verification_token: String,
    type: {
        type: String,
        enum: ['registration', 'recovery', 'change_email', 'otp_auth', 'export-did', 'delete-account', 'verification_token'],
        required: true
    },
    purpose: {
        type: String  // For verification tokens (e.g., 'export-did-verified')
    },
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    max_attempts: {
        type: Number,
        default: 5
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true
    },
    verified_at: Date
});

// TTL index for auto-cleanup of expired OTPs
emailVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const recoveryRequestSchema = new mongoose.Schema({
    recovery_id: {
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
    recovery_email: {
        type: String,
        required: true
    },
    recovery_method: {
        type: String,
        enum: ['email_verification', 'backup_passkey', 'admin_override'],
        required: true
    },
    status: {
        type: String,
        enum: ['initiated', 'email_verified', 'completed', 'failed', 'expired'],
        default: 'initiated'
    },
    verification_steps_completed: [{
        step: String,
        completed_at: Date,
        metadata: Object
    }],
    new_passkey_credential_id: String,
    admin_approval_required: {
        type: Boolean,
        default: false
    },
    admin_notes: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true,
        index: true
    },
    completed_at: Date
});

// ============================================
// METAMASK ADVANCED PERMISSIONS (ERC-7715)
// ============================================

const permissionGrantSchema = new mongoose.Schema({
    grant_id: {
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
    metamask_address: {
        type: String,
        required: true,
        index: true
    },
    dapp_origin: {
        type: String,
        required: true
    },
    permissions: [{
        action: {
            type: String,
            enum: ['verify:identity', 'verify:liveness', 'verify:kyc', 'spend:verification_fee'],
            required: true
        },
        scope: {
            tier: {
                type: String,
                enum: ['layer_1', 'layer_2', 'layer_3']
            },
            frequency: {
                type: String,
                enum: ['once', 'daily', 'weekly', 'monthly', 'unlimited']
            },
            spend_limit: {
                amount: Number,
                currency: String,
                period: String
            }
        },
        granted_at: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'revoked', 'expired'],
        default: 'active'
    },
    expires_at: {
        type: Date,
        required: true,
        index: true
    },
    usage_count: {
        type: Number,
        default: 0
    },
    last_used: Date,
    revoked_reason: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const permissionUsageSchema = new mongoose.Schema({
    usage_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    grant_id: {
        type: String,
        required: true,
        index: true
    },
    user_id: {
        type: String,
        required: true,
        index: true
    },
    dapp_origin: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    verification_type: {
        type: String,
        enum: ['layer_2', 'layer_3']
    },
    amount_spent: {
        amount: Number,
        currency: String
    },
    verification_result: {
        type: String,
        enum: ['success', 'failed', 'pending']
    },
    transaction_hash: String,
    metadata: Object,
    created_at: {
        type: Date,
        default: Date.now
    }
});

const dappIntegrationSchema = new mongoose.Schema({
    dapp_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    dapp_name: {
        type: String,
        required: true
    },
    dapp_origin: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    developer_email: String,
    api_key: {
        type: String,
        required: true,
        unique: true
    },
    webhook_url: String,
    supported_networks: [{
        chain_id: Number,
        network_name: String
    }],
    verification_requirements: [{
        tier: String,
        required_fields: [String],
        max_spend_per_verification: {
            amount: Number,
            currency: String
        }
    }],
    active: {
        type: Boolean,
        default: true
    },
    total_verifications: {
        type: Number,
        default: 0
    },
    total_users: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const verificationRequestV2Schema = new mongoose.Schema({
    request_id: {
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
    dapp_id: {
        type: String,
        required: true,
        index: true
    },
    grant_id: String,
    verification_tier: {
        type: String,
        enum: ['layer_1', 'layer_2', 'layer_3'],
        required: true
    },
    requested_fields: [String],
    purpose: String,
    consent_granted: {
        type: Boolean,
        default: false
    },
    consent_granted_at: Date,
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    verification_data: {
        // Liveness
        liveness_score: Number,
        liveness_verified: Boolean,
        liveness_processed_at: Number,
        liveness_completed_at: String,
        liveness_frame_urls: [String], // ImageKit URLs of liveness check frames
        liveness_confidence: Number,
        // Document
        kyc_status: String,
        document_verified: Boolean,
        document_type: String,
        document_number: String,
        nin: String,
        identity_data_hash: String,
        // Personal fields from OCR
        first_name: String,
        last_name: String,
        date_of_birth: String,
        gender: String,
        nationality: String,
        home_address: String,
        // ImageKit document image references
        front_image_url: String,
        front_image_file_id: String,
        back_image_url: String,
        back_image_file_id: String,
        // Tracking
        upload_id: String,
        submitted_at: String,
        document_processed_at: Number
    },
    proof_generated: {
        type: Boolean,
        default: false
    },
    proof_data: {
        credential_hash: String,
        signature: String,
        public_key: String,
        verification_timestamp: Number
    },
    redirect_url: String,
    webhook_notified: {
        type: Boolean,
        default: false
    },
    error_message: String,
    rejection_reason: String,
    rejected_at: Date,
    rejected_by: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    completed_at: Date,
    expires_at: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
});

// ============================================
// RATE LIMITING
// ============================================

const rateLimitSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        index: true
    },
    endpoint: {
        type: String,
        required: true
    },
    requests: {
        type: Number,
        default: 1
    },
    windowStart: {
        type: Date,
        default: Date.now,
        index: true
    },
    blocked_until: {
        type: Date
    }
});

// ============================================
// BLOCKCHAIN EVENT INDEXING
// ============================================

const verificationEventSchema = new mongoose.Schema({
    event_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    network_name: {
        type: String,
        required: true,
        index: true
    },
    chain_id: {
        type: Number,
        required: true,
        index: true
    },
    block_number: {
        type: Number,
        required: true,
        index: true
    },
    transaction_hash: {
        type: String,
        required: true,
        index: true
    },
    event_type: {
        type: String,
        required: true,
        enum: ['VerificationRequested', 'VerificationCompleted', 'PermissionGranted', 'PermissionRevoked'],
        index: true
    },
    contract_address: {
        type: String,
        required: true
    },
    user_address: {
        type: String,
        index: true
    },
    event_data: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        required: true,
        index: true
    },
    indexed_at: {
        type: Date,
        default: Date.now
    }
});

// Compound indexes for efficient querying
verificationEventSchema.index({ user_address: 1, timestamp: -1 });
verificationEventSchema.index({ network_name: 1, block_number: 1 });
verificationEventSchema.index({ event_type: 1, timestamp: -1 });


// ============================================
// MODEL EXPORTS
// ============================================

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
const Credential = mongoose.model('Credential', credentialSchema);
const Issuer = mongoose.model('Issuer', issuerSchema);
const LoginSession = mongoose.model('LoginSession', loginSessionSchema);

// Passkey Authentication Models
const UserAccount = mongoose.model('UserAccount', userAccountSchema);
const PasskeyCredential = mongoose.model('PasskeyCredential', passkeyCredentialSchema);
const DeviceSession = mongoose.model('DeviceSession', deviceSessionSchema);
const DevicePairing = mongoose.model('DevicePairing', devicePairingSchema);
const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);
const RecoveryRequest = mongoose.model('RecoveryRequest', recoveryRequestSchema);

// MetaMask Advanced Permissions Models
const PermissionGrant = mongoose.model('PermissionGrant', permissionGrantSchema);
const PermissionUsage = mongoose.model('PermissionUsage', permissionUsageSchema);
const DappIntegration = mongoose.model('DappIntegration', dappIntegrationSchema);
const VerificationRequestV2 = mongoose.model('VerificationRequestV2', verificationRequestV2Schema);

const AdminUser = mongoose.model('AdminUser', adminUserSchema);
const RateLimit = mongoose.model('RateLimit', rateLimitSchema);

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const Experience = mongoose.model('Experience', experienceSchema);
const Education = mongoose.model('Education', educationSchema);
const Certification = mongoose.model('Certification', certificationSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Project = mongoose.model('Project', projectSchema);
const Award = mongoose.model('Award', awardSchema);
const Language = mongoose.model('Language', languageSchema);
const Volunteer = mongoose.model('Volunteer', volunteerSchema);

const ViewEvent = mongoose.model('ViewEvent', viewEventSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const VerificationEvent = mongoose.model('VerificationEvent', verificationEventSchema);

// ============================================
// BUSINESS PLATFORM (Identity-as-a-Service)
// ============================================

const businessAppSchema = new mongoose.Schema({
    app_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    }, // e.g. "app_xxxxxxxxxxxxxxxxxxxxxxxx"
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    owner_user_id: {
        type: String,
        required: true,
        index: true
    }, // links to UserAccount.user_id
    api_secret_hash: {
        type: String,
        required: true
    }, // bcrypt hash — plaintext is never stored
    allowed_origins: [{ type: String }], // CORS allowlist
    redirect_uris: [{ type: String }], // Exact hosted-authorization callback URLs
    android_digital_assets: [{
        package_name: { type: String, required: true },
        sha256_fingerprints: [{ type: String }], // Array of SHA256 cert fingerprints
        created_at: { type: Date, default: Date.now }
    }], // Android Digital Asset Links for passkey support
    environment: {
        type: String,
        enum: ['sandbox', 'production'],
        default: 'sandbox'
    },
    active: {
        type: Boolean,
        default: true
    },
    request_count: {
        type: Number,
        default: 0
    },
    last_used_at: {
        type: Date
    },
    sdk_config: {
        primary_color: { type: String, default: '#8651e1' },
        border_radius: { type: String, default: '12' },
        font_family: { type: String, default: 'Inter' },
        logo_url: { type: String, default: '' },
        mode: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
        layout: { type: String, enum: ['auto', 'modal', 'fullscreen'], default: 'auto' },
        platform: { type: String, enum: ['desktop', 'mobile'], default: 'desktop' },
        language: { type: String, default: 'EN' },
        requiredTier: { type: String, enum: ['L1', 'L2', 'L3'], default: 'L1' },
        proofs: [{ type: String }],
        updated_at: { type: Date, default: Date.now }
    },
    website_url: {
        type: String,
        default: '',
        maxlength: 500
    },
    description: {
        type: String,
        default: '',
        maxlength: 300
    },
    listing_status: {
        type: String,
        enum: ['unlisted', 'listed'],
        default: 'unlisted'
    },
    requested_scopes: [{
        type: String,
        enum: ['verify:identity', 'read:profile', 'read:kyc_level', 'read:email', 'read:wallet'],
        default: []
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

businessAppSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const authorizationCodeSchema = new mongoose.Schema({
    code_hash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    app_id: {
        type: String,
        required: true,
        index: true
    },
    user_id: {
        type: String,
        required: true,
        index: true
    },
    redirect_uri: {
        type: String,
        required: true
    },
    code_challenge: {
        type: String,
        required: true
    },
    code_challenge_method: {
        type: String,
        enum: ['S256'],
        default: 'S256'
    },
    granted_tier: {
        type: String,
        enum: ['layer_0', 'layer_1', 'layer_2', 'layer_3'],
        required: true
    },
    required_tier: {
        type: String,
        enum: ['layer_1', 'layer_2', 'layer_3'],
        required: true
    },
    requested_scopes: [{ type: String }],
    authorization_status: {
        type: String,
        enum: ['complete', 'provisional'],
        default: 'complete'
    },
    verification_status: {
        type: String,
        enum: ['approved', 'pending'],
        default: 'approved'
    },
    consumed_at: Date,
    expires_at: {
        type: Date,
        required: true,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

authorizationCodeSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const webhookSubscriptionSchema = new mongoose.Schema({
    app_id: {
        type: String,
        required: true,
        index: true
    },
    url: {
        type: String,
        required: true
    },
    events: [{
        type: String,
        enum: ALL_EVENTS
    }],
    signing_secret: {
        type: String,
        required: true
    }, // HMAC-SHA256 secret for payload signing
    active: {
        type: Boolean,
        default: true
    },
    failure_count: {
        type: Number,
        default: 0
    },
    last_delivered_at: { type: Date },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Webhook Delivery Log - tracks each webhook delivery attempt
const webhookLogSchema = new mongoose.Schema({
    webhook_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebhookSubscription',
        required: true,
        index: true
    },
    app_id: {
        type: String,
        required: true,
        index: true
    },
    event_type: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    delivery_id: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    status_code: {
        type: Number
    },
    error_message: {
        type: String
    },
    request_payload: {
        type: mongoose.Schema.Types.Mixed
    },
    response_body: {
        type: String,
        maxlength: 2000 // Limit response storage
    },
    duration_ms: {
        type: Number
    },
    retry_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Auto-expire logs after 30 days
webhookLogSchema.index({ created_at: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const BusinessApp = mongoose.model('BusinessApp', businessAppSchema);
const WebhookSubscription = mongoose.model('WebhookSubscription', webhookSubscriptionSchema);
const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);

// ============================================
// QUESTS & GAMIFICATION
// ============================================

const questSchema = new mongoose.Schema({
    quest_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    points: {
        type: Number,
        required: true,
        default: 100
    },
    icon: {
        type: String,
        default: 'star'
    },
    category: {
        type: String,
        enum: ['onboarding', 'verification', 'engagement', 'social', 'advanced'],
        default: 'engagement'
    },
    active: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Quest = mongoose.model('Quest', questSchema);

// ============================================
// PAYMENTS
// ============================================
const paymentSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    orderId: String,
    type: {
        type: String,
        enum: ['fiat', 'crypto'],
        required: true
    },
    provider: {
        type: String,
        enum: ['revenuecat', 'boomfi', 'direct'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    payCurrency: String,
    payAmount: String,
    payAddress: String,
    status: {
        type: String,
        enum: ['pending', 'confirming', 'completed', 'failed', 'expired', 'refunded'],
        default: 'pending'
    },
    txHash: String,
    metadata: {
        domainName: String,
        years: Number,
        userId: String,
        userWallet: String,
        userEmail: String
    },
    created_at: { type: Date, default: Date.now },
    completed_at: Date,
    expires_at: Date
});

paymentSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const Payment = mongoose.model('Payment', paymentSchema);
const AuthorizationCode = mongoose.model('AuthorizationCode', authorizationCodeSchema);

module.exports = {
    // Payments
    Payment,

    // Verification & Credentials
    VerificationRequest,
    Credential,
    Issuer,
    LoginSession,

    // Passkey Authentication System
    UserAccount,
    PasskeyCredential,
    DeviceSession,
    DevicePairing,
    EmailVerification,
    RecoveryRequest,

    // MetaMask Advanced Permissions
    PermissionGrant,
    PermissionUsage,
    DappIntegration,
    VerificationRequestV2,

    // Admin & Security
    AdminUser,
    RateLimit,

    // Profile & Professional Data
    UserProfile,
    Experience,
    Education,
    Certification,
    Skill,
    Project,
    Award,
    Language,
    Volunteer,

    // System
    ViewEvent,
    Notification,

    // Blockchain Event Indexing
    VerificationEvent,

    // Business Platform (Identity-as-a-Service)
    BusinessApp,
    AuthorizationCode,
    WebhookSubscription,
    WebhookLog,
    Quest
};
