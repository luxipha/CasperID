const mongoose = require('mongoose');

// ============================================
// VERIFICATION & CREDENTIALS (Existing)
// ============================================

const verificationRequestSchema = new mongoose.Schema({
    wallet: {
        type: String,
        required: true,
        index: true
    },
    email: { type: String, required: true },
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
        enum: ['basic', 'full_kyc'],
        default: 'basic',
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
        unique: true,
        index: true
    },
    human_id: {
        type: String,
        index: true,
        unique: true,
        sparse: true
    },
    tier: {
        type: String,
        enum: ['basic', 'full_kyc'],
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
    }
});

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
    pronouns: { type: String },
    headline: { type: String, maxlength: 220 },
    profile_image_url: { type: String },
    cover_image_url: { type: String },

    // === LOCATION ===
    city: { type: String },
    country: { type: String },

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

// ============================================
// SKILLS
// ============================================d

const skillSchema = new mongoose.Schema({
    wallet: { type: String, required: true, index: true },

    skill_name: { type: String, required: true },
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
    recipientWallet: { type: String, required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Object },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
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
// MODEL EXPORTS
// ============================================

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
const Credential = mongoose.model('Credential', credentialSchema);
const Issuer = mongoose.model('Issuer', issuerSchema);
const LoginSession = mongoose.model('LoginSession', loginSessionSchema);

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

module.exports = {
    // Verification & Credentials
    VerificationRequest,
    Credential,
    Issuer,
    LoginSession,

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
    Notification
};
