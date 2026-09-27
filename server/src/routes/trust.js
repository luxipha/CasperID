const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const {
    UserAccount,
    TrustEvent,
    TrustDispute,
    TrustScoreSnapshot,
    TrustPolicy,
    BusinessApp
} = require('../database/models');
const { requireAuth, adminAuthWithRateLimit } = require('../middleware/auth');
const { requireApp } = require('../middleware/app-auth');
const { rateLimitMiddleware } = require('../utils/rate-limiter');
const { TRUST_EVENT_TYPES, TRUST_ROLES, MOBILITY_EVENT_TYPES } = require('../constants/trust');
const { calculateTrustScore, getTrustPolicy, mergePolicy } = require('../services/trust-score');

const DISPUTE_REASONS = ['not_me', 'incorrect_outcome', 'duplicate', 'retaliatory_rating', 'other'];
const POLICY_FIELDS = new Set([
    'version',
    'ratingWeight',
    'providerWeights',
    'consumerWeights',
    'confidenceMaturityConstant',
    'maximumEvidenceEvents',
    'minimumMonthsTo800',
    'minimumMonthsTo850',
    'servicePrior',
    'servicePriorStrength',
    'financialPrior',
    'financialPriorStrength',
    'ratingPrior',
    'ratingPriorStrength'
]);
const EVENT_FIELDS = new Set([
    'user_id',
    'actor_role',
    'event_type',
    'external_event_id',
    'interaction_reference',
    'rating',
    'occurred_at'
]);

function id(prefix) {
    return `${prefix}_${crypto.randomBytes(16).toString('hex')}`;
}

function hashReference(appId, value) {
    const configuredPepper = process.env.TRUST_REFERENCE_PEPPER || process.env.JWT_SECRET;
    if (!configuredPepper && process.env.NODE_ENV === 'production') {
        const error = new Error('Trust reference hashing is not configured');
        error.status = 503;
        throw error;
    }
    const pepper = configuredPepper || 'casperid-trust-local';
    return crypto.createHmac('sha256', pepper).update(`${appId}:${value}`).digest('hex');
}

async function currentUserId(req) {
    const directId = req.user?.userId || req.user?.user_id;
    if (directId) return directId;
    if (!req.user?.wallet) return null;
    const account = await UserAccount.findOne({ wallet: req.user.wallet }).select('user_id').lean();
    return account?.user_id || null;
}

function publicEvent(event) {
    return {
        event_id: event.event_id,
        app_id: event.app_id,
        service_category: event.service_category,
        source_environment: event.source_environment,
        affects_score: Boolean(event.score_eligible),
        actor_role: event.actor_role,
        event_type: event.event_type,
        rating: event.rating,
        status: event.status,
        dispute_status: event.dispute_status,
        occurred_at: event.occurred_at,
        created_at: event.created_at,
        policy_version: event.policy_version
    };
}

function validateEventForApp(app, body) {
    if (!app.trust_events_enabled) return 'Trust events are not enabled for this app';
    if (!TRUST_EVENT_TYPES.includes(body.event_type)) return 'Invalid trust event type';
    if (app.service_category === 'mobility' && !MOBILITY_EVENT_TYPES.includes(body.event_type)) return 'Event type is not supported by the mobility policy';
    if (!TRUST_ROLES.includes(body.actor_role)) return 'Invalid actor role';
    if (!(app.supported_roles || []).includes(body.actor_role)) return 'Actor role is not enabled for this app';
    if (!(app.trust_event_types || []).includes(body.event_type)) return 'Event type is not enabled for this app';
    if (body.event_type === 'rating.submitted' && !app.ratings_enabled) return 'Ratings are not enabled for this app';
    if (body.event_type === 'rating.submitted' && (!Number.isFinite(Number(body.rating)) || Number(body.rating) < 1 || Number(body.rating) > 5)) {
        return 'Rating must be a number from 1 to 5';
    }
    if (body.event_type !== 'rating.submitted' && body.rating !== undefined) return 'Rating is only accepted for rating.submitted events';
    if (body.event_type.endsWith('_by_consumer') && body.actor_role !== 'consumer') return 'Actor role must match the attributed event';
    if (body.event_type.endsWith('_by_provider') && body.actor_role !== 'provider') return 'Actor role must match the attributed event';
    return null;
}

router.post('/events', rateLimitMiddleware('business_api'), requireApp, async (req, res) => {
    try {
        const app = req.businessApp;
        const {
            user_id: userId,
            actor_role: actorRole,
            event_type: eventType,
            external_event_id: externalEventId,
            interaction_reference: interactionReference,
            rating,
            occurred_at: occurredAt
        } = req.body || {};

        const unsupportedFields = Object.keys(req.body || {}).filter(field => !EVENT_FIELDS.has(field));
        if (unsupportedFields.length) {
            return res.status(400).json({
                success: false,
                error: `Unsupported trust-event fields: ${unsupportedFields.join(', ')}`
            });
        }
        const validationError = validateEventForApp(app, req.body || {});
        if (validationError) return res.status(400).json({ success: false, error: validationError });
        if (!userId || typeof userId !== 'string') return res.status(400).json({ success: false, error: 'user_id is required' });
        if (!externalEventId || typeof externalEventId !== 'string' || externalEventId.length > 200) {
            return res.status(400).json({ success: false, error: 'external_event_id is required and must be 200 characters or fewer' });
        }
        if (!interactionReference || typeof interactionReference !== 'string' || interactionReference.length > 500) {
            return res.status(400).json({ success: false, error: 'interaction_reference is required and must be 500 characters or fewer' });
        }
        const eventDate = new Date(occurredAt);
        if (!occurredAt || Number.isNaN(eventDate.getTime()) || eventDate > new Date(Date.now() + 5 * 60 * 1000)) {
            return res.status(400).json({ success: false, error: 'occurred_at must be a valid date that is not in the future' });
        }
        const account = await UserAccount.findOne({ user_id: userId }).select('user_id').lean();
        if (!account) return res.status(404).json({ success: false, error: 'CasperID user not found' });

        const interactionHash = hashReference(app.app_id, interactionReference);
        if (eventType === 'rating.submitted') {
            const completed = await TrustEvent.exists({
                app_id: app.app_id,
                user_id: userId,
                actor_role: actorRole,
                event_type: 'interaction.completed',
                interaction_reference_hash: interactionHash,
                status: 'verified'
            });
            if (!completed) {
                return res.status(409).json({ success: false, error: 'A verified completed interaction is required before rating this user' });
            }
        }

        const policy = await getTrustPolicy();
        const event = await TrustEvent.create({
            event_id: id('te'),
            app_id: app.app_id,
            user_id: userId,
            service_category: app.service_category,
            source_environment: app.environment,
            score_eligible: app.environment === 'production' && app.trust_production_approved,
            actor_role: actorRole,
            event_type: eventType,
            source_event_id: hashReference(app.app_id, externalEventId),
            interaction_reference_hash: interactionHash,
            rating: eventType === 'rating.submitted' ? Number(rating) : undefined,
            policy_version: policy.version,
            occurred_at: eventDate
        });

        const affectsScore = event.score_eligible;
        let score = null;
        let scoreRecalculationPending = false;
        if (affectsScore) {
            try {
                score = await calculateTrustScore(userId, actorRole, { saveSnapshot: true });
            } catch (scoreError) {
                scoreRecalculationPending = true;
                console.error('[Trust] Event stored but score snapshot failed:', scoreError);
            }
        }
        return res.status(201).json({
            success: true,
            event: publicEvent(event),
            affects_score: affectsScore,
            score_recalculation_pending: scoreRecalculationPending,
            score
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ success: false, error: 'This trust event has already been submitted' });
        }
        console.error('[Trust] Event submission failed:', error);
        return res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Failed to submit trust event' });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    try {
        const userId = await currentUserId(req);
        if (!userId) return res.status(404).json({ success: false, error: 'CasperID user not found' });
        const role = TRUST_ROLES.includes(req.query.role) ? req.query.role : 'consumer';
        const score = await calculateTrustScore(userId, role);
        return res.json({ success: true, score });
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Failed to calculate trust score' });
    }
});

router.get('/me/events', requireAuth, async (req, res) => {
    try {
        const userId = await currentUserId(req);
        if (!userId) return res.status(404).json({ success: false, error: 'CasperID user not found' });
        const role = TRUST_ROLES.includes(req.query.role) ? req.query.role : null;
        const query = { user_id: userId };
        if (role) query.actor_role = role;
        const events = await TrustEvent.find(query).sort({ occurred_at: -1 }).limit(100).lean();
        return res.json({ success: true, events: events.map(publicEvent) });
    } catch (error) {
        console.error('[Trust] Event history failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to load trust events' });
    }
});

router.get('/me/history', requireAuth, async (req, res) => {
    try {
        const userId = await currentUserId(req);
        if (!userId) return res.status(404).json({ success: false, error: 'CasperID user not found' });
        const role = TRUST_ROLES.includes(req.query.role) ? req.query.role : 'consumer';
        const history = await TrustScoreSnapshot.find({ user_id: userId, role })
            .sort({ created_at: -1 })
            .limit(50)
            .lean();
        return res.json({ success: true, history });
    } catch (error) {
        console.error('[Trust] Score history failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to load score history' });
    }
});

router.post('/events/:eventId/disputes', requireAuth, async (req, res) => {
    try {
        const userId = await currentUserId(req);
        if (!userId) return res.status(404).json({ success: false, error: 'CasperID user not found' });
        const { reason, detail = '' } = req.body || {};
        if (!DISPUTE_REASONS.includes(reason)) {
            return res.status(400).json({ success: false, error: 'Invalid dispute reason' });
        }
        const event = await TrustEvent.findOne({ event_id: req.params.eventId, user_id: userId });
        if (!event) return res.status(404).json({ success: false, error: 'Trust event not found' });
        if (event.dispute_status !== 'none') return res.status(409).json({ success: false, error: 'This event already has a dispute' });

        const dispute = await TrustDispute.create({
            dispute_id: id('td'),
            event_id: event.event_id,
            user_id: userId,
            reason,
            detail: String(detail).trim().slice(0, 500)
        });
        event.dispute_status = 'pending';
        await event.save();
        let score = null;
        try {
            score = await calculateTrustScore(userId, event.actor_role, { saveSnapshot: true });
        } catch (scoreError) {
            console.error('[Trust] Dispute stored but score snapshot failed:', scoreError);
        }
        return res.status(201).json({ success: true, dispute, score });
    } catch (error) {
        console.error('[Trust] Dispute creation failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to create dispute' });
    }
});

router.get('/policy', requireAuth, async (req, res) => {
    try {
        const policy = await getTrustPolicy();
        return res.json({ success: true, policy });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to load trust policy' });
    }
});

router.get('/admin/policy', adminAuthWithRateLimit, async (req, res) => {
    try {
        const policy = await getTrustPolicy();
        return res.json({ success: true, policy });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to load trust policy' });
    }
});

router.get('/admin/policies', adminAuthWithRateLimit, async (req, res) => {
    try {
        const policies = await TrustPolicy.find({ service_category: 'mobility' })
            .sort({ published_at: -1 })
            .limit(50)
            .lean();
        return res.json({ success: true, policies });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to load trust policy history' });
    }
});

router.get('/admin/apps', adminAuthWithRateLimit, async (req, res) => {
    try {
        const apps = await BusinessApp.find({ service_category: 'mobility', active: true })
            .select('app_id name environment supported_roles trust_events_enabled ratings_enabled trust_production_approved updated_at')
            .sort({ updated_at: -1 })
            .lean();
        return res.json({ success: true, apps });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to load mobility apps' });
    }
});

router.get('/admin/disputes', adminAuthWithRateLimit, async (req, res) => {
    try {
        const status = ['pending', 'upheld', 'reversed'].includes(req.query.status) ? req.query.status : 'pending';
        const disputes = await TrustDispute.find({ status }).sort({ created_at: -1 }).limit(100).lean();
        const eventIds = disputes.map(dispute => dispute.event_id);
        const events = await TrustEvent.find({ event_id: { $in: eventIds } }).lean();
        const eventsById = new Map(events.map(event => [event.event_id, publicEvent(event)]));
        return res.json({
            success: true,
            disputes: disputes.map(dispute => ({ ...dispute, event: eventsById.get(dispute.event_id) || null }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to load trust disputes' });
    }
});

router.patch('/admin/policy', adminAuthWithRateLimit, async (req, res) => {
    try {
        const proposed = {};
        for (const [key, value] of Object.entries(req.body || {})) {
            if (POLICY_FIELDS.has(key)) proposed[key] = value;
        }
        const currentPolicy = await getTrustPolicy();
        if (!proposed.version || proposed.version === currentPolicy.version) {
            throw new Error('Publish changes with a new policy version');
        }
        const policy = mergePolicy({
            ...currentPolicy,
            ...proposed,
            providerWeights: { ...currentPolicy.providerWeights, ...(proposed.providerWeights || {}) },
            consumerWeights: { ...currentPolicy.consumerWeights, ...(proposed.consumerWeights || {}) }
        });
        if (!policy.version || typeof policy.version !== 'string') throw new Error('A policy version is required');
        const numericFields = [
            'ratingWeight', 'confidenceMaturityConstant', 'maximumEvidenceEvents',
            'minimumMonthsTo800', 'minimumMonthsTo850', 'servicePrior',
            'servicePriorStrength', 'financialPrior', 'financialPriorStrength',
            'ratingPrior', 'ratingPriorStrength'
        ];
        if (numericFields.some(field => !Number.isFinite(Number(policy[field])))) throw new Error('Trust policy values must be numeric');
        for (const field of numericFields) policy[field] = Number(policy[field]);
        if (Number(policy.ratingWeight) < 0 || Number(policy.ratingWeight) > 0.05) throw new Error('Rating weight cannot exceed 5%');
        if (policy.minimumMonthsTo800 < 1 || policy.minimumMonthsTo850 <= policy.minimumMonthsTo800) {
            throw new Error('The 850 maturity gate must be later than the 800 gate');
        }
        for (const weights of [policy.providerWeights, policy.consumerWeights]) {
            if ([weights.service, weights.financial, weights.rating].some(value => !Number.isFinite(Number(value)))) {
                throw new Error('Role weights must be numeric');
            }
            weights.service = Number(weights.service);
            weights.financial = Number(weights.financial);
            weights.rating = Number(weights.rating);
            const total = Number(weights.service) + Number(weights.financial) + Number(weights.rating);
            if (Math.abs(total - 1) > 0.0001) throw new Error('Each role weight set must add up to 1.0');
            if (Number(weights.rating) > 0.05) throw new Error('Rating weight cannot exceed 5%');
            if ([weights.service, weights.financial, weights.rating].some(value => Number(value) < 0 || Number(value) > 1)) {
                throw new Error('Role weights must stay between 0 and 1');
            }
        }
        const published = await TrustPolicy.create({
            service_category: 'mobility',
            version: policy.version,
            policy,
            active: true,
            published_by: req.admin.id,
            published_at: new Date()
        });
        await TrustPolicy.updateMany(
            { service_category: 'mobility', _id: { $ne: published._id }, active: true },
            { $set: { active: false } }
        );
        return res.json({ success: true, policy });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message || 'Invalid trust policy' });
    }
});

router.patch('/admin/disputes/:disputeId', adminAuthWithRateLimit, async (req, res) => {
    try {
        const { resolution, resolution_note: resolutionNote = '' } = req.body || {};
        if (!['upheld', 'reversed'].includes(resolution)) {
            return res.status(400).json({ success: false, error: 'Resolution must be upheld or reversed' });
        }
        const dispute = await TrustDispute.findOne({ dispute_id: req.params.disputeId, status: 'pending' });
        if (!dispute) return res.status(404).json({ success: false, error: 'Pending dispute not found' });
        const event = await TrustEvent.findOne({ event_id: dispute.event_id });
        if (!event) return res.status(404).json({ success: false, error: 'Trust event not found' });

        dispute.status = resolution;
        dispute.resolution_note = String(resolutionNote).trim().slice(0, 500);
        dispute.resolved_by = req.admin.id;
        dispute.resolved_at = new Date();
        event.dispute_status = resolution === 'upheld' ? 'resolved_upheld' : 'resolved_reversed';
        if (resolution === 'reversed') event.status = 'reversed';
        await Promise.all([dispute.save(), event.save()]);
        let score = null;
        try {
            score = await calculateTrustScore(event.user_id, event.actor_role, { saveSnapshot: true });
        } catch (scoreError) {
            console.error('[Trust] Dispute resolved but score snapshot failed:', scoreError);
        }
        return res.json({ success: true, dispute, score });
    } catch (error) {
        console.error('[Trust] Dispute resolution failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to resolve dispute' });
    }
});

router.patch('/admin/apps/:appId/production-approval', adminAuthWithRateLimit, async (req, res) => {
    try {
        const approved = req.body?.approved;
        if (typeof approved !== 'boolean') {
            return res.status(400).json({ success: false, error: 'approved must be true or false' });
        }
        const app = await BusinessApp.findOne({
            app_id: req.params.appId,
            active: true,
            service_category: 'mobility'
        }).select('-api_secret_hash');
        if (!app) return res.status(404).json({ success: false, error: 'Mobility business app not found' });
        if (approved && (app.environment !== 'production' || !app.trust_events_enabled || !app.supported_roles?.length)) {
            return res.status(400).json({
                success: false,
                error: 'Only production mobility apps with trust events and at least one role can be approved'
            });
        }
        app.trust_production_approved = approved;
        app.updated_at = new Date();
        await app.save();
        return res.json({
            success: true,
            app,
            note: approved
                ? 'Only new eligible production events can affect scores; earlier sandbox or unapproved events remain excluded.'
                : 'New events from this app will not affect production scores.'
        });
    } catch (error) {
        console.error('[Trust] Production approval failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to update production approval' });
    }
});

module.exports = router;
