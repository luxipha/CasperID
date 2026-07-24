const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const {
    ProfileReview,
    UserProfile,
    UserAccount,
    Credential,
    Experience,
    PasskeyCredential,
    EmailVerification,
    LoginSession
} = require('../database/models');
const { requireAuth, extractViewer } = require('../middleware/auth');
const { normalizeEmail, buildEmailQuery } = require('../utils/email-normalizer');
const emailService = require('../services/emailService');
const { generateToken } = require('../utils/jwt-manager');

const REVIEW_TEXT_MAX = 250;
const INVITE_EXPIRY_DAYS = 14;
const OTP_EXPIRY_MINUTES = 10;
const REVIEW_SESSION_HOURS = 24;
const MAX_DAILY_REVIEW_REQUESTS = 5;
const MAX_REVIEW_OTP_SENDS = 5;
const MAX_REVIEW_RESENDS = 4;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const REVIEW_ACCESS_LOCKOUT_MINUTES = 30;

function sanitizeWallet(wallet) {
    if (!wallet) return wallet;
    return wallet.trim().toLowerCase();
}

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function startOfUtcDay() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getRequestToken(req) {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.casperid_session;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return cookieToken || null;
}

function getAuditMeta(req, extra = {}) {
    return {
        ip: req.ip,
        user_agent: req.get('user-agent') || '',
        ...extra
    };
}

function appendReviewAudit(review, event, meta = {}) {
    review.access_audit = Array.isArray(review.access_audit) ? review.access_audit : [];
    review.access_audit.push({
        event,
        at: new Date(),
        ip: meta.ip,
        user_agent: meta.user_agent,
        email: meta.email,
        success: typeof meta.success === 'boolean' ? meta.success : true,
        detail: meta.detail,
        metadata: meta.metadata
    });
}

function getLockoutUntil() {
    return new Date(Date.now() + (REVIEW_ACCESS_LOCKOUT_MINUTES * 60 * 1000));
}

function getResendAvailableInMs(review) {
    if (!review?.last_otp_sent_at) {
        return 0;
    }

    const remaining = (new Date(review.last_otp_sent_at).getTime() + (OTP_RESEND_COOLDOWN_SECONDS * 1000)) - Date.now();
    return Math.max(0, remaining);
}

async function getActiveReviewSession(req) {
    const token = getRequestToken(req);
    if (!token) return null;

    return LoginSession.findOne({
        token,
        platform: 'review_invite',
        revoked: false,
        expiresAt: { $gt: new Date() }
    }).lean();
}

function setSessionCookie(req, res, token) {
    const isSecure = process.env.NODE_ENV === 'production' ||
        req.secure ||
        req.headers['x-forwarded-proto'] === 'https';

    res.cookie('casperid_session', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });
}

function buildProfileUrl(profile) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://casperid.com';
    const identifier = profile.profile_human_id || profile.profile_cns_name || profile.profile_wallet;
    return `${frontendUrl}/profile/${identifier}/reviews`;
}

function buildInviteUrl(rawToken) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://casperid.com';
    return `${frontendUrl}/reviews/invite/${rawToken}`;
}

function canManageReview(review) {
    return !['submitted', 'approved', 'archived'].includes(review.status);
}

function resetReviewInviteState(review, inviteTokenHash, expiresAt) {
    review.invite_token_hash = inviteTokenHash;
    review.status = 'request_sent';
    review.expires_at = expiresAt;
    review.invite_sent_at = new Date();
    review.opened_at = null;
    review.last_accessed_at = null;
    review.otp_sent_count = 0;
    review.access_start_count = 0;
    review.access_resend_count = 0;
    review.last_otp_sent_at = null;
    review.last_access_verified_at = null;
    review.access_lock_until = null;
    review.reviewer_session_expires_at = null;
}

async function getReviewOwnerName(wallet, fallback = 'The profile owner') {
    const requesterProfile = await UserProfile.findOne({ wallet }).lean();
    return requesterProfile
        ? [requesterProfile.first_name, requesterProfile.last_name].filter(Boolean).join(' ').trim() || requesterProfile.cns_name || requesterProfile.human_id
        : fallback;
}

async function resolveProfileTarget(identifier) {
    const trimmedIdentifier = (identifier || '').trim();
    const sanitizedIdentifier = sanitizeWallet(trimmedIdentifier);
    const cleanIdentifier = trimmedIdentifier.replace(/\.cid$/i, '');

    let profile = await UserProfile.findOne({
        $or: [
            { wallet: sanitizedIdentifier },
            { human_id: trimmedIdentifier },
            { human_id: cleanIdentifier },
            { cns_name: trimmedIdentifier },
            { cns_name: cleanIdentifier },
            { cns_name: `${cleanIdentifier}.cid` }
        ]
    }).lean();

    if (!profile) {
        const credential = await Credential.findOne({
            $or: [
                { wallet: sanitizedIdentifier },
                { human_id: trimmedIdentifier },
                { human_id: cleanIdentifier }
            ],
            revoked: false
        }).lean();

        if (credential) {
            profile = await UserProfile.findOne({ wallet: sanitizeWallet(credential.wallet) }).lean();
        }
    }

    if (!profile) return null;

    const headlineSource = profile.headline || null;
    const companySource = await Experience.findOne({ wallet: sanitizeWallet(profile.wallet) })
        .sort({ is_current: -1, 'start_date.year': -1, 'start_date.month': -1, created_at: -1 })
        .lean();

    return {
        wallet: sanitizeWallet(profile.wallet),
        human_id: profile.human_id || null,
        cns_name: profile.cns_name || null,
        full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || profile.cns_name || profile.human_id || 'CasperID User',
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        headline: headlineSource,
        profile_image_url: profile.profile_image_url || null,
        company_name: companySource?.company_name || null
    };
}

async function touchInviteStatus(review, nextStatus = null) {
    const now = new Date();
    if (review.expires_at && now > review.expires_at && !['approved', 'archived', 'revoked'].includes(review.status)) {
        review.status = 'expired';
    } else if (nextStatus) {
        review.status = nextStatus;
    }

    if (!review.opened_at) {
        review.opened_at = now;
    }
    review.last_accessed_at = now;
    await review.save();
    return review;
}

function canAccessReview(review, viewer) {
    if (!viewer) return false;
    const viewerEmail = viewer.email ? normalizeEmail(viewer.email) : null;
    return viewerEmail === review.reviewer_email_normalized ||
        (!!viewer.userId && viewer.userId === review.reviewer_user_id);
}

function serializeReview(review) {
    return {
        id: review.review_id,
        type: review.type,
        relationship: review.relationship,
        prompt_note: review.prompt_note || '',
        reviewer_email: review.reviewer_email,
        reviewer_name: review.reviewer_name || null,
        reviewer_title: review.reviewer_title || null,
        reviewer_company: review.reviewer_company || null,
        rating: review.rating || null,
        review_text: review.review_text || '',
        status: review.status,
        created_at: review.created_at,
        invite_sent_at: review.invite_sent_at,
        opened_at: review.opened_at,
        submitted_at: review.submitted_at,
        approved_at: review.approved_at,
        archived_at: review.archived_at,
        expires_at: review.expires_at,
        last_accessed_at: review.last_accessed_at,
        access_lock_until: review.access_lock_until,
        updated_at: review.updated_at
    };
}

router.get('/reviews/profile/:identifier', async (req, res) => {
    try {
        const target = await resolveProfileTarget(req.params.identifier);
        if (!target) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        const reviews = await ProfileReview.find({
            profile_wallet: target.wallet,
            status: 'approved'
        })
            .sort({ approved_at: -1, submitted_at: -1, created_at: -1 })
            .lean();

        const averageRating = reviews.length
            ? Number((reviews.reduce((sum, item) => sum + (item.rating || 0), 0) / reviews.length).toFixed(1))
            : null;

        res.json({
            success: true,
            profile: target,
            summary: {
                total_reviews: reviews.length,
                average_rating: averageRating
            },
            reviews: reviews.map(serializeReview)
        });
    } catch (error) {
        console.error('Get public reviews error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
    }
});

router.get('/reviews/my-profile', requireAuth, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.user.wallet);
        if (!wallet || wallet === 'pending_wallet') {
            return res.status(400).json({ success: false, error: 'Active profile required' });
        }

        const reviews = await ProfileReview.find({ profile_wallet: wallet })
            .sort({ created_at: -1 })
            .lean();

        const summary = reviews.reduce((acc, review) => {
            acc.total += 1;
            acc[review.status] = (acc[review.status] || 0) + 1;
            return acc;
        }, { total: 0, approved: 0, archived: 0, request_sent: 0, opened: 0, expired: 0 });

        res.json({
            success: true,
            summary,
            reviews: reviews.map(serializeReview)
        });
    } catch (error) {
        console.error('Get owner reviews error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile reviews' });
    }
});

router.post('/reviews/profile/:identifier/request', requireAuth, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.user.wallet);
        if (!wallet || wallet === 'pending_wallet') {
            return res.status(400).json({ success: false, error: 'Active profile required' });
        }

        const target = await resolveProfileTarget(req.params.identifier);
        if (!target) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        if (target.wallet !== wallet) {
            return res.status(403).json({ success: false, error: 'You can only request reviews for your own profile' });
        }

        const todayRequestCount = await ProfileReview.countDocuments({
            requested_by_wallet: wallet,
            created_at: { $gte: startOfUtcDay() }
        });

        if (todayRequestCount >= MAX_DAILY_REVIEW_REQUESTS) {
            return res.status(429).json({
                success: false,
                error: `You can send up to ${MAX_DAILY_REVIEW_REQUESTS} review requests per day`
            });
        }

        const {
            reviewerEmail,
            type,
            relationship,
            promptNote
        } = req.body || {};

        if (!reviewerEmail || !type || !relationship) {
            return res.status(400).json({ success: false, error: 'Reviewer email, type, and relationship are required' });
        }

        if (!['endorsement', 'recommendation', 'testimonial'].includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid review type' });
        }

        const normalizedReviewerEmail = normalizeEmail(reviewerEmail);
        const rawToken = crypto.randomBytes(24).toString('hex');
        const inviteTokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + (INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));

        const requesterName = await getReviewOwnerName(wallet, req.user.humanId || 'CasperID user');

        const review = await ProfileReview.create({
            review_id: uuidv4(),
            profile_wallet: target.wallet,
            target_type: 'profile',
            profile_human_id: target.human_id,
            profile_cns_name: target.cns_name,
            requested_by_wallet: wallet,
            type,
            relationship: relationship.trim(),
            prompt_note: (promptNote || '').trim(),
            reviewer_email: reviewerEmail.trim(),
            reviewer_email_normalized: normalizedReviewerEmail,
            invite_token_hash: inviteTokenHash,
            status: 'request_sent',
            expires_at: expiresAt,
            invite_sent_at: new Date(),
            access_audit: [{
                event: 'invite_created',
                at: new Date(),
                ip: req.ip,
                user_agent: req.get('user-agent') || '',
                email: reviewerEmail.trim(),
                success: true,
                detail: 'Review invitation created'
            }]
        });

        const inviteUrl = buildInviteUrl(rawToken);

        await emailService.sendReviewInvitationEmail(reviewerEmail.trim(), {
            requesterName: requesterName || 'A CasperID user',
            targetName: target.full_name,
            type,
            relationship: relationship.trim(),
            promptNote: (promptNote || '').trim(),
            inviteUrl
        });

        res.status(201).json({
            success: true,
            review: serializeReview(review),
            invite_url: inviteUrl
        });
    } catch (error) {
        console.error('Create review request error:', error);
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, error: 'This reviewer email has already been invited for this profile' });
        }
        res.status(500).json({ success: false, error: 'Failed to create review request' });
    }
});

router.post('/reviews/:reviewId/archive', requireAuth, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.user.wallet);
        const review = await ProfileReview.findOne({ review_id: req.params.reviewId });

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        if (review.profile_wallet !== wallet && review.requested_by_wallet !== wallet) {
            return res.status(403).json({ success: false, error: 'You cannot archive this review' });
        }

        if (review.status === 'archived') {
            return res.json({ success: true, review: serializeReview(review) });
        }

        review.status = 'archived';
        review.archived_at = new Date();
        review.archived_by_wallet = wallet;
        await review.save();

        const requesterName = await getReviewOwnerName(wallet);

        await emailService.sendReviewArchivedEmail(review.reviewer_email, {
            requesterName,
            type: review.type,
            profileUrl: buildProfileUrl(review)
        });

        res.json({ success: true, review: serializeReview(review) });
    } catch (error) {
        console.error('Archive review error:', error);
        res.status(500).json({ success: false, error: 'Failed to archive review' });
    }
});

router.post('/reviews/:reviewId/resend', requireAuth, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.user.wallet);
        const review = await ProfileReview.findOne({ review_id: req.params.reviewId });

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        if (review.profile_wallet !== wallet && review.requested_by_wallet !== wallet) {
            return res.status(403).json({ success: false, error: 'You cannot manage this review request' });
        }

        if (!canManageReview(review)) {
            return res.status(400).json({ success: false, error: 'This review request can no longer be resent' });
        }

        const rawToken = crypto.randomBytes(24).toString('hex');
        const inviteUrl = buildInviteUrl(rawToken);
        resetReviewInviteState(review, hashToken(rawToken), new Date(Date.now() + (INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)));
        appendReviewAudit(review, 'invite_resent', getAuditMeta(req, {
            email: review.reviewer_email,
            detail: 'Review invitation re-sent by owner'
        }));
        await review.save();

        const requesterName = await getReviewOwnerName(wallet);
        const target = await resolveProfileTarget(review.profile_human_id || review.profile_cns_name || review.profile_wallet);

        await emailService.sendReviewInvitationEmail(review.reviewer_email, {
            requesterName: requesterName || 'A CasperID user',
            targetName: target?.full_name || 'CasperID profile',
            type: review.type,
            relationship: review.relationship,
            promptNote: review.prompt_note || '',
            inviteUrl
        });

        await EmailVerification.deleteMany({
            email: review.reviewer_email,
            purpose: `review_invite:${review.review_id}`,
            verified: false
        });

        res.json({
            success: true,
            review: serializeReview(review),
            invite_url: inviteUrl
        });
    } catch (error) {
        console.error('Resend review request error:', error);
        res.status(500).json({ success: false, error: 'Failed to resend review invitation' });
    }
});

router.post('/reviews/:reviewId/link', requireAuth, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.user.wallet);
        const review = await ProfileReview.findOne({ review_id: req.params.reviewId });

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        if (review.profile_wallet !== wallet && review.requested_by_wallet !== wallet) {
            return res.status(403).json({ success: false, error: 'You cannot manage this review request' });
        }

        if (!canManageReview(review)) {
            return res.status(400).json({ success: false, error: 'This review request can no longer generate a new invite link' });
        }

        const rawToken = crypto.randomBytes(24).toString('hex');
        const inviteUrl = buildInviteUrl(rawToken);
        resetReviewInviteState(review, hashToken(rawToken), new Date(Date.now() + (INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)));
        appendReviewAudit(review, 'invite_link_regenerated', getAuditMeta(req, {
            email: review.reviewer_email,
            detail: 'Fresh invite link generated by owner'
        }));
        await review.save();

        await EmailVerification.deleteMany({
            email: review.reviewer_email,
            purpose: `review_invite:${review.review_id}`,
            verified: false
        });

        res.json({
            success: true,
            review: serializeReview(review),
            invite_url: inviteUrl
        });
    } catch (error) {
        console.error('Generate review invite link error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate invite link' });
    }
});

router.post('/reviews/:reviewId/revoke', requireAuth, async (req, res) => {
    try {
        const wallet = sanitizeWallet(req.user.wallet);
        const review = await ProfileReview.findOne({ review_id: req.params.reviewId });

        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }

        if (review.profile_wallet !== wallet && review.requested_by_wallet !== wallet) {
            return res.status(403).json({ success: false, error: 'You cannot manage this review request' });
        }

        if (!canManageReview(review)) {
            return res.status(400).json({ success: false, error: 'This review request can no longer be revoked' });
        }

        review.status = 'revoked';
        review.access_lock_until = null;
        review.reviewer_session_expires_at = null;
        appendReviewAudit(review, 'invite_revoked', getAuditMeta(req, {
            email: review.reviewer_email,
            detail: 'Review invitation revoked by owner'
        }));
        await review.save();

        await EmailVerification.deleteMany({
            email: review.reviewer_email,
            purpose: `review_invite:${review.review_id}`,
            verified: false
        });

        res.json({
            success: true,
            review: serializeReview(review)
        });
    } catch (error) {
        console.error('Revoke review request error:', error);
        res.status(500).json({ success: false, error: 'Failed to revoke review invitation' });
    }
});

router.get('/reviews/invitations/:token', extractViewer, async (req, res) => {
    try {
        const review = await ProfileReview.findOne({ invite_token_hash: hashToken(req.params.token) });
        if (!review) {
            return res.status(404).json({ success: false, error: 'Invitation not found' });
        }

        await touchInviteStatus(review, review.status === 'request_sent' ? 'opened' : null);
        const target = await resolveProfileTarget(review.profile_human_id || review.profile_cns_name || review.profile_wallet);
        const activeSession = await getActiveReviewSession(req);
        const sessionExpiresAt = activeSession?.expiresAt || review.reviewer_session_expires_at || null;

        res.json({
            success: true,
            invitation: {
                review_id: review.review_id,
                type: review.type,
                relationship: review.relationship,
                prompt_note: review.prompt_note || '',
                status: review.status,
                expires_at: review.expires_at,
                reviewer_email_hint: review.reviewer_email.replace(/^(.{2}).+(@.+)$/, '$1***$2')
            },
            target_profile: target,
            access: {
                granted: canAccessReview(review, req.user),
                authenticated: !!req.user,
                session_expires_at: sessionExpiresAt
            },
            already_submitted: ['submitted', 'approved', 'archived'].includes(review.status)
        });
    } catch (error) {
        console.error('Get invitation error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch invitation' });
    }
});

router.post('/reviews/invitations/:token/access/start', async (req, res) => {
    try {
        const review = await ProfileReview.findOne({ invite_token_hash: hashToken(req.params.token) });
        if (!review) {
            return res.status(404).json({ success: false, error: 'Invitation not found' });
        }

        await touchInviteStatus(review, review.status === 'request_sent' ? 'opened' : null);

        if (review.status === 'expired') {
            return res.status(400).json({ success: false, error: 'This invitation has expired' });
        }

        if (['submitted', 'approved', 'archived'].includes(review.status)) {
            return res.status(400).json({ success: false, error: 'This review has already been completed' });
        }

        if (review.access_lock_until && review.access_lock_until > new Date()) {
            return res.status(429).json({
                success: false,
                error: 'Reviewer access is temporarily locked. Try again later.',
                lockedUntil: review.access_lock_until
            });
        }

        const { email } = req.body || {};
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const normalizedEmail = normalizeEmail(email);
        if (normalizedEmail !== review.reviewer_email_normalized) {
            appendReviewAudit(review, 'access_start_email_mismatch', getAuditMeta(req, {
                email: email.trim(),
                success: false,
                detail: 'Attempted invite access with a different email'
            }));
            await review.save();
            return res.status(403).json({ success: false, error: 'This invitation is only valid for the invited reviewer email' });
        }

        const resendAvailableIn = getResendAvailableInMs(review);
        if (resendAvailableIn > 0) {
            appendReviewAudit(review, 'otp_send_cooldown_blocked', getAuditMeta(req, {
                email: review.reviewer_email,
                success: false,
                detail: 'OTP send blocked by resend cooldown',
                metadata: { resendAvailableIn }
            }));
            await review.save();
            return res.status(429).json({
                success: false,
                error: 'Please wait before requesting another code',
                resendAvailableIn
            });
        }

        if ((review.otp_sent_count || 0) >= MAX_REVIEW_OTP_SENDS) {
            review.access_lock_until = getLockoutUntil();
            appendReviewAudit(review, 'otp_send_limit_reached', getAuditMeta(req, {
                email: review.reviewer_email,
                success: false,
                detail: 'OTP send limit reached',
                metadata: { otpSentCount: review.otp_sent_count || 0 }
            }));
            await review.save();
            return res.status(429).json({
                success: false,
                error: 'Too many verification code requests. Try again later.',
                lockedUntil: review.access_lock_until
            });
        }

        const existingUser = await UserAccount.findOne(buildEmailQuery(email));
        const hasPasskey = existingUser
            ? (await PasskeyCredential.countDocuments({ user_id: existingUser.user_id, revoked: false })) > 0
            : false;

        if (hasPasskey) {
            return res.json({
                success: true,
                userExists: true,
                hasPasskey: true,
                email: review.reviewer_email
            });
        }

        const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
        const stagingOtp = (process.env.STAGING_DEFAULT_OTP || '').trim();
        const isStagingMode = nodeEnv === 'staging' && stagingOtp;
        const verificationId = uuidv4();
        const otp = isStagingMode ? stagingOtp : emailService.generateOTP();
        const expiresAt = new Date(Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000));

        await EmailVerification.deleteMany({
            email: review.reviewer_email,
            purpose: `review_invite:${review.review_id}`,
            verified: false
        });

        await EmailVerification.create({
            verification_id: verificationId,
            email: review.reviewer_email,
            user_id: existingUser?.user_id,
            verification_code: otp,
            type: 'verification_token',
            purpose: `review_invite:${review.review_id}`,
            verified: false,
            attempts: 0,
            max_attempts: 5,
            expires_at: expiresAt
        });

        if (!isStagingMode) {
            await emailService.sendOTP(review.reviewer_email, otp);
        }

        review.access_start_count = (review.access_start_count || 0) + 1;
        review.otp_sent_count = (review.otp_sent_count || 0) + 1;
        review.last_otp_sent_at = new Date();
        appendReviewAudit(review, 'otp_sent', getAuditMeta(req, {
            email: review.reviewer_email,
            detail: 'Review access OTP sent',
            metadata: {
                verificationId,
                otpSentCount: review.otp_sent_count
            }
        }));
        await review.save();

        res.json({
            success: true,
            userExists: !!existingUser,
            hasPasskey: false,
            verificationId,
            expiresIn: OTP_EXPIRY_MINUTES * 60 * 1000,
            resendAvailableIn: OTP_RESEND_COOLDOWN_SECONDS * 1000
        });
    } catch (error) {
        console.error('Review access start error:', error);
        res.status(500).json({ success: false, error: 'Failed to start review access' });
    }
});

router.post('/reviews/invitations/:token/access/resend', async (req, res) => {
    try {
        const review = await ProfileReview.findOne({ invite_token_hash: hashToken(req.params.token) });
        if (!review) {
            return res.status(404).json({ success: false, error: 'Invitation not found' });
        }

        await touchInviteStatus(review, review.status === 'request_sent' ? 'opened' : null);

        if (review.status === 'expired') {
            return res.status(400).json({ success: false, error: 'This invitation has expired' });
        }

        if (['submitted', 'approved', 'archived'].includes(review.status)) {
            return res.status(400).json({ success: false, error: 'This review has already been completed' });
        }

        if (review.access_lock_until && review.access_lock_until > new Date()) {
            return res.status(429).json({
                success: false,
                error: 'Reviewer access is temporarily locked. Try again later.',
                lockedUntil: review.access_lock_until
            });
        }

        const { verificationId } = req.body || {};
        if (!verificationId) {
            return res.status(400).json({ success: false, error: 'Verification ID is required' });
        }

        const verification = await EmailVerification.findOne({
            verification_id: verificationId,
            purpose: `review_invite:${review.review_id}`,
            email: review.reviewer_email
        });

        if (!verification || verification.verified) {
            return res.status(400).json({ success: false, error: 'Invalid or expired verification request' });
        }

        const resendAvailableIn = getResendAvailableInMs(review);
        if (resendAvailableIn > 0) {
            appendReviewAudit(review, 'otp_resend_cooldown_blocked', getAuditMeta(req, {
                email: review.reviewer_email,
                success: false,
                detail: 'OTP resend blocked by resend cooldown',
                metadata: { resendAvailableIn }
            }));
            await review.save();
            return res.status(429).json({
                success: false,
                error: 'Please wait before requesting another code',
                resendAvailableIn
            });
        }

        if ((review.access_resend_count || 0) >= MAX_REVIEW_RESENDS || (review.otp_sent_count || 0) >= MAX_REVIEW_OTP_SENDS) {
            review.access_lock_until = getLockoutUntil();
            appendReviewAudit(review, 'otp_resend_limit_reached', getAuditMeta(req, {
                email: review.reviewer_email,
                success: false,
                detail: 'OTP resend limit reached',
                metadata: {
                    otpSentCount: review.otp_sent_count || 0,
                    resendCount: review.access_resend_count || 0
                }
            }));
            await review.save();
            return res.status(429).json({
                success: false,
                error: 'Too many verification code requests. Try again later.',
                lockedUntil: review.access_lock_until
            });
        }

        const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
        const stagingOtp = (process.env.STAGING_DEFAULT_OTP || '').trim();
        const isStagingMode = nodeEnv === 'staging' && stagingOtp;
        const otp = isStagingMode ? stagingOtp : emailService.generateOTP();
        const expiresAt = new Date(Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000));

        verification.verification_code = otp;
        verification.attempts = 0;
        verification.max_attempts = 5;
        verification.verified = false;
        verification.verified_at = null;
        verification.expires_at = expiresAt;
        await verification.save();

        if (!isStagingMode) {
            await emailService.sendOTP(review.reviewer_email, otp);
        }

        review.access_resend_count = (review.access_resend_count || 0) + 1;
        review.otp_sent_count = (review.otp_sent_count || 0) + 1;
        review.last_otp_sent_at = new Date();
        appendReviewAudit(review, 'otp_resent', getAuditMeta(req, {
            email: review.reviewer_email,
            detail: 'Review access OTP resent',
            metadata: {
                verificationId,
                otpSentCount: review.otp_sent_count,
                resendCount: review.access_resend_count
            }
        }));
        await review.save();

        res.json({
            success: true,
            verificationId,
            expiresIn: OTP_EXPIRY_MINUTES * 60 * 1000,
            resendAvailableIn: OTP_RESEND_COOLDOWN_SECONDS * 1000
        });
    } catch (error) {
        console.error('Review access resend error:', error);
        res.status(500).json({ success: false, error: 'Failed to resend review access code' });
    }
});

router.post('/reviews/invitations/:token/access/verify', async (req, res) => {
    try {
        const review = await ProfileReview.findOne({ invite_token_hash: hashToken(req.params.token) });
        if (!review) {
            return res.status(404).json({ success: false, error: 'Invitation not found' });
        }

        if (review.access_lock_until && review.access_lock_until > new Date()) {
            return res.status(429).json({
                success: false,
                error: 'Reviewer access is temporarily locked. Try again later.',
                lockedUntil: review.access_lock_until
            });
        }

        const { verificationId, otp } = req.body || {};
        if (!verificationId || !otp) {
            return res.status(400).json({ success: false, error: 'Verification ID and OTP are required' });
        }

        const verification = await EmailVerification.findOne({ verification_id: verificationId });
        if (!verification || verification.purpose !== `review_invite:${review.review_id}`) {
            return res.status(400).json({ success: false, error: 'Invalid or expired verification request' });
        }

        const now = new Date();
        if (now > verification.expires_at) {
            appendReviewAudit(review, 'otp_expired', getAuditMeta(req, {
                email: verification.email,
                success: false,
                detail: 'Expired OTP submitted'
            }));
            await review.save();
            await EmailVerification.deleteOne({ verification_id: verificationId });
            return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
        }

        if (verification.verified) {
            return res.status(400).json({ success: false, error: 'OTP has already been used' });
        }

        verification.attempts += 1;
        await verification.save();
        if (verification.attempts > 5) {
            review.access_lock_until = getLockoutUntil();
            appendReviewAudit(review, 'otp_lockout', getAuditMeta(req, {
                email: verification.email,
                success: false,
                detail: 'Too many invalid OTP attempts',
                metadata: { attempts: verification.attempts }
            }));
            await review.save();
            await EmailVerification.deleteOne({ verification_id: verificationId });
            return res.status(429).json({
                success: false,
                error: 'Too many failed attempts. Reviewer access is temporarily locked.',
                lockedUntil: review.access_lock_until
            });
        }

        const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
        const stagingOtp = (process.env.STAGING_DEFAULT_OTP || '').trim();
        const isStagingBypass = nodeEnv === 'staging' && stagingOtp && otp.toString().trim() === stagingOtp;

        if (verification.verification_code !== otp.toString() && !isStagingBypass) {
            appendReviewAudit(review, 'otp_failed', getAuditMeta(req, {
                email: verification.email,
                success: false,
                detail: 'Invalid OTP submitted',
                metadata: { attempts: verification.attempts }
            }));
            await review.save();
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP. Please try again.',
                attemptsLeft: Math.max(0, 5 - verification.attempts)
            });
        }

        verification.verified = true;
        verification.verified_at = now;
        await verification.save();

        const userAccount = await UserAccount.findOne(buildEmailQuery(verification.email));
        if (userAccount?.user_id) {
            review.reviewer_user_id = userAccount.user_id;
        }
        await touchInviteStatus(review, review.status === 'request_sent' ? 'opened' : review.status);

        const userData = {
            wallet: userAccount?.wallet || 'pending_wallet',
            humanId: userAccount?.human_id || 'reviewer',
            verified: !!userAccount,
            tier: userAccount?.tier || 'layer_0',
            email: verification.email,
            userId: userAccount?.user_id
        };

        const sessionToken = generateToken(userData, 'review_invite');
        const expiresAt = new Date(Date.now() + (REVIEW_SESSION_HOURS * 60 * 60 * 1000));

        await LoginSession.create({
            wallet: userData.wallet,
            token: sessionToken,
            platform: 'review_invite',
            ip: req.ip,
            userAgent: req.get('user-agent'),
            expiresAt
        });

        review.last_access_verified_at = now;
        review.reviewer_session_expires_at = expiresAt;
        review.access_lock_until = null;
        appendReviewAudit(review, 'otp_verified', getAuditMeta(req, {
            email: verification.email,
            detail: 'Reviewer access granted',
            metadata: {
                userExists: !!userAccount,
                expiresAt: expiresAt.toISOString()
            }
        }));
        await review.save();

        setSessionCookie(req, res, sessionToken);

        res.json({
            success: true,
            email: verification.email,
            userExists: !!userAccount,
            hasPasskey: !!userAccount && (await PasskeyCredential.countDocuments({ user_id: userAccount.user_id, revoked: false })) > 0,
            sessionToken,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Review access verify error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify review access' });
    }
});

router.post('/reviews/invitations/:token/submit', requireAuth, async (req, res) => {
    try {
        const review = await ProfileReview.findOne({ invite_token_hash: hashToken(req.params.token) });
        if (!review) {
            return res.status(404).json({ success: false, error: 'Invitation not found' });
        }

        if (!canAccessReview(review, req.user)) {
            return res.status(403).json({ success: false, error: 'This session cannot submit the invited review' });
        }

        await touchInviteStatus(review, review.status === 'request_sent' ? 'opened' : review.status);
        if (review.status === 'expired') {
            return res.status(400).json({ success: false, error: 'This invitation has expired' });
        }

        if (['approved', 'archived', 'submitted'].includes(review.status)) {
            return res.status(400).json({ success: false, error: 'This review has already been submitted' });
        }

        const {
            reviewerName,
            reviewerTitle,
            reviewerCompany,
            rating,
            reviewText
        } = req.body || {};

        if (!reviewerName || !reviewerTitle || !reviewerCompany || !rating || !reviewText) {
            return res.status(400).json({ success: false, error: 'Name, title, company, star rating, and review text are required' });
        }

        const normalizedRating = Number(rating);
        if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        }

        if (reviewText.trim().length > REVIEW_TEXT_MAX) {
            return res.status(400).json({ success: false, error: `Review text must be ${REVIEW_TEXT_MAX} characters or fewer` });
        }

        review.reviewer_name = reviewerName.trim();
        review.reviewer_title = reviewerTitle.trim();
        review.reviewer_company = reviewerCompany.trim();
        review.rating = normalizedRating;
        review.review_text = reviewText.trim();
        review.status = 'approved';
        review.submitted_at = new Date();
        review.approved_at = new Date();
        if (req.user.userId) {
            review.reviewer_user_id = req.user.userId;
        }
        await review.save();

        res.json({
            success: true,
            review: serializeReview(review),
            public_url: buildProfileUrl(review)
        });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit review' });
    }
});

module.exports = router;
