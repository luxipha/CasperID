const { UserAccount, TrustEvent, TrustScoreSnapshot, TrustPolicy, AdminSetting } = require('../database/models');
const { DEFAULT_TRUST_POLICY } = require('../constants/trust');

const MS_PER_MONTH = 30.4375 * 24 * 60 * 60 * 1000;

function clamp(value, minimum = 0, maximum = 1) {
    return Math.max(minimum, Math.min(maximum, value));
}

function mergePolicy(value = {}) {
    return {
        ...DEFAULT_TRUST_POLICY,
        ...value,
        providerWeights: { ...DEFAULT_TRUST_POLICY.providerWeights, ...(value.providerWeights || {}) },
        consumerWeights: { ...DEFAULT_TRUST_POLICY.consumerWeights, ...(value.consumerWeights || {}) }
    };
}

async function getTrustPolicy() {
    const versionedPolicy = await TrustPolicy.findOne({ service_category: 'mobility', active: true })
        .sort({ published_at: -1 })
        .lean();
    if (versionedPolicy?.policy) return mergePolicy(versionedPolicy.policy);

    // Compatibility fallback for deployments that stored the original policy
    // before immutable policy versions were introduced.
    const setting = await AdminSetting.findOne({ key: 'trust_policy.mobility' }).lean();
    return mergePolicy(setting?.value);
}

function bayesianMetric(positive, negative, prior, strength) {
    return clamp(((prior * strength) + positive) / (strength + positive + negative));
}

function monthsBetween(start, end) {
    if (!start) return 0;
    return Math.max(0, (end.getTime() - new Date(start).getTime()) / MS_PER_MONTH);
}

function latestByInteraction(events, prefix) {
    const latest = new Map();
    for (const event of events) {
        if (!event.event_type.startsWith(prefix)) continue;
        const key = event.interaction_reference_hash || event.event_id || `${prefix}:${latest.size}`;
        const existing = latest.get(key);
        const eventDate = new Date(event.occurred_at || event.created_at).getTime();
        const existingDate = existing ? new Date(existing.occurred_at || existing.created_at).getTime() : -Infinity;
        if (!existing || eventDate >= existingDate) latest.set(key, event);
    }
    return [...latest.values()];
}

function scoreEvents({ events, role, identityReady, policy = DEFAULT_TRUST_POLICY, now = new Date() }) {
    const activePolicy = mergePolicy(policy);
    const roleEvents = events.filter((event) => event.actor_role === role);
    const interactionEvents = latestByInteraction(roleEvents, 'interaction.');
    const obligationEvents = latestByInteraction(roleEvents, 'obligation.');
    const count = (type, source = roleEvents) => source.filter((event) => event.event_type === type).length;

    const completed = count('interaction.completed', interactionEvents);
    const cancellations = count(`interaction.cancelled_by_${role}`, interactionEvents);
    const noShows = count(`interaction.no_show_by_${role}`, interactionEvents);
    const serviceNegative = cancellations + (noShows * 1.5);
    const hasServiceEvidence = completed + cancellations + noShows > 0;
    const service = bayesianMetric(
        completed,
        serviceNegative,
        activePolicy.servicePrior,
        activePolicy.servicePriorStrength
    );

    const settledOnTime = count('obligation.settled_on_time', obligationEvents);
    const settledLate = count('obligation.settled_late', obligationEvents);
    const unpaid = count('obligation.unpaid', obligationEvents);
    const hasFinancialEvidence = settledOnTime + settledLate + unpaid > 0;
    const financial = bayesianMetric(
        settledOnTime,
        (settledLate * 0.5) + (unpaid * 2),
        activePolicy.financialPrior,
        activePolicy.financialPriorStrength
    );

    const ratings = roleEvents
        .filter((event) => event.event_type === 'rating.submitted' && Number.isFinite(event.rating))
        .map((event) => clamp((event.rating - 1) / 4));
    const ratingSum = ratings.reduce((total, rating) => total + rating, 0);
    const hasRatingEvidence = ratings.length > 0;
    const rating = clamp(
        ((activePolicy.ratingPrior * activePolicy.ratingPriorStrength) + ratingSum)
        / (activePolicy.ratingPriorStrength + ratings.length)
    );

    const configuredWeights = role === 'provider' ? activePolicy.providerWeights : activePolicy.consumerWeights;
    const ratingWeight = hasRatingEvidence ? Math.min(activePolicy.ratingWeight, configuredWeights.rating, 0.05) : 0;
    const nonRatingWeight = 1 - ratingWeight;
    const configuredNonRatingTotal = (hasServiceEvidence ? configuredWeights.service : 0)
        + (hasFinancialEvidence ? configuredWeights.financial : 0);
    const serviceWeight = configuredNonRatingTotal
        ? nonRatingWeight * (hasServiceEvidence ? configuredWeights.service / configuredNonRatingTotal : 0)
        : 0;
    const financialWeight = configuredNonRatingTotal
        ? nonRatingWeight * (hasFinancialEvidence ? configuredWeights.financial / configuredNonRatingTotal : 0)
        : 0;
    const evidence = clamp(
        (service * serviceWeight)
        + (financial * financialWeight)
        + (rating * ratingWeight)
    );

    const firstEventAt = roleEvents.reduce((earliest, event) => {
        const date = new Date(event.occurred_at || event.created_at);
        return !earliest || date < earliest ? date : earliest;
    }, null);
    const historyMonths = monthsBetween(firstEventAt, now);
    const confidenceEvents = [
        ...interactionEvents,
        ...obligationEvents,
        ...roleEvents.filter((event) => event.event_type === 'safety_violation.upheld')
    ];
    const usableEventCount = Math.min(confidenceEvents.length, activePolicy.maximumEvidenceEvents);
    const timeFactor = Math.min(1, historyMonths / 12);
    const qualityAdjustedHistory = usableEventCount * (0.25 + (0.75 * timeFactor));
    const confidence = 1 - Math.exp(-qualityAdjustedHistory / activePolicy.confidenceMaturityConstant);

    const upheldSafety = count('safety_violation.upheld');
    const penalty = clamp((unpaid * 0.04) + (upheldSafety * 0.08), 0, 0.60);
    const behaviourTrust = clamp((confidence * evidence) - penalty);

    let score = identityReady
        ? activePolicy.identityFoundation + ((activePolicy.maximumScore - activePolicy.identityFoundation) * behaviourTrust)
        : 0;

    let durationCap = activePolicy.identityFoundation;
    if (identityReady) {
        if (historyMonths < activePolicy.minimumMonthsTo800) {
            durationCap = activePolicy.identityFoundation
                + ((800 - activePolicy.identityFoundation) * Math.sqrt(historyMonths / activePolicy.minimumMonthsTo800));
        } else if (historyMonths < activePolicy.minimumMonthsTo850) {
            durationCap = 800
                + (50 * ((historyMonths - activePolicy.minimumMonthsTo800)
                    / (activePolicy.minimumMonthsTo850 - activePolicy.minimumMonthsTo800)));
        } else {
            durationCap = activePolicy.maximumScore;
        }
        score = Math.min(score, durationCap);
    }

    const reasons = [];
    if (!identityReady) reasons.push('Complete full identity verification to activate Trust Capacity.');
    if (completed) reasons.push(`${completed} verified completed interaction${completed === 1 ? '' : 's'}.`);
    if (cancellations || noShows) reasons.push(`${cancellations} attributable cancellation${cancellations === 1 ? '' : 's'} and ${noShows} no-show${noShows === 1 ? '' : 's'}.`);
    if (settledOnTime || settledLate || unpaid) reasons.push(`${settledOnTime} on-time, ${settledLate} late and ${unpaid} unpaid obligation outcome${settledOnTime + settledLate + unpaid === 1 ? '' : 's'}.`);
    if (ratings.length) reasons.push(`${ratings.length} verified rating${ratings.length === 1 ? '' : 's'} contributed no more than 5% of earned points.`);
    if (identityReady && score >= durationCap - 0.5 && durationCap < activePolicy.maximumScore) reasons.push(`Score is currently limited by the ${activePolicy.minimumMonthsTo800}/${activePolicy.minimumMonthsTo850}-month maturity policy.`);

    return {
        score: Math.round(score),
        identity_readiness: identityReady ? activePolicy.identityFoundation : 0,
        status: identityReady ? 'active' : 'identity_incomplete',
        role,
        service_category: 'mobility',
        components: {
            service_reliability: hasServiceEvidence ? Math.round(service * 100) : null,
            financial_reliability: hasFinancialEvidence ? Math.round(financial * 100) : null,
            rating_signal: hasRatingEvidence ? Math.round(rating * 100) : null
        },
        evidence_confidence: Number(confidence.toFixed(4)),
        evidence_count: confidenceEvents.length,
        history_months: Number(historyMonths.toFixed(1)),
        duration_cap: Math.round(durationCap),
        policy_version: activePolicy.version,
        reasons
    };
}

async function calculateTrustScore(userId, role = 'consumer', options = {}) {
    const [account, events, policy] = await Promise.all([
        UserAccount.findOne({ user_id: userId }).lean(),
        TrustEvent.find({
            user_id: userId,
            service_category: 'mobility',
            source_environment: 'production',
            score_eligible: true,
            status: 'verified',
            dispute_status: { $in: ['none', 'resolved_upheld'] }
        }).sort({ occurred_at: 1 }).lean(),
        getTrustPolicy()
    ]);
    if (!account) {
        const error = new Error('User account not found');
        error.status = 404;
        throw error;
    }
    const result = scoreEvents({
        events,
        role,
        identityReady: account.tier === 'layer_3',
        policy,
        now: options.now || new Date()
    });

    if (options.saveSnapshot) {
        await TrustScoreSnapshot.create({
            user_id: userId,
            service_category: result.service_category,
            role,
            score: result.score,
            identity_readiness: result.identity_readiness,
            components: result.components,
            evidence_confidence: result.evidence_confidence,
            evidence_count: result.evidence_count,
            history_months: result.history_months,
            duration_cap: result.duration_cap,
            policy_version: result.policy_version,
            reasons: result.reasons
        });
    }
    return result;
}

module.exports = {
    clamp,
    mergePolicy,
    scoreEvents,
    getTrustPolicy,
    calculateTrustScore
};
