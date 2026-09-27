const SERVICE_CATEGORIES = [
    'mobility',
    'commerce',
    'delivery',
    'appointments',
    'rentals',
    'finance',
    'other'
];

const TRUST_ROLES = ['consumer', 'provider'];

const TRUST_EVENT_TYPES = [
    'interaction.completed',
    'interaction.cancelled_by_consumer',
    'interaction.cancelled_by_provider',
    'interaction.no_show_by_consumer',
    'interaction.no_show_by_provider',
    'obligation.settled_on_time',
    'obligation.settled_late',
    'obligation.unpaid',
    'safety_violation.upheld',
    'rating.submitted'
];

const MOBILITY_EVENT_TYPES = [...TRUST_EVENT_TYPES];

const DEFAULT_TRUST_POLICY = {
    version: 'mobility-v1',
    identityFoundation: 100,
    maximumScore: 850,
    ratingWeight: 0.05,
    providerWeights: {
        service: 0.55,
        financial: 0.40,
        rating: 0.05
    },
    consumerWeights: {
        service: 0.95,
        financial: 0,
        rating: 0.05
    },
    confidenceMaturityConstant: 30,
    maximumEvidenceEvents: 250,
    minimumMonthsTo800: 24,
    minimumMonthsTo850: 36,
    servicePrior: 0.70,
    servicePriorStrength: 10,
    financialPrior: 0.75,
    financialPriorStrength: 5,
    ratingPrior: 0.625,
    ratingPriorStrength: 10
};

module.exports = {
    SERVICE_CATEGORIES,
    TRUST_ROLES,
    TRUST_EVENT_TYPES,
    MOBILITY_EVENT_TYPES,
    DEFAULT_TRUST_POLICY
};
