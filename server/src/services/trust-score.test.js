const { scoreEvents } = require('./trust-score');
const { DEFAULT_TRUST_POLICY } = require('../constants/trust');

function event(eventType, monthsAgo, extra = {}) {
    const occurredAt = new Date(Date.UTC(2026, 8, 1));
    occurredAt.setUTCDate(occurredAt.getUTCDate() - Math.round(monthsAgo * 30.4375));
    return {
        actor_role: 'provider',
        event_type: eventType,
        occurred_at: occurredAt,
        ...extra
    };
}

const now = new Date(Date.UTC(2026, 8, 1));

describe('mobility Trust Capacity scoring', () => {
    test('a fully verified identity with no behaviour starts at 100', () => {
        const result = scoreEvents({
            events: [],
            role: 'provider',
            identityReady: true,
            policy: DEFAULT_TRUST_POLICY,
            now
        });

        expect(result.identity_readiness).toBe(100);
        expect(result.score).toBe(100);
    });

    test('behaviour does not activate before full identity verification', () => {
        const events = Array.from({ length: 100 }, () => event('interaction.completed', 36));
        const result = scoreEvents({ events, role: 'provider', identityReady: false, now });

        expect(result.status).toBe('identity_incomplete');
        expect(result.score).toBe(0);
    });

    test('rating quality changes no more than five percent of earned points', () => {
        const common = [
            ...Array.from({ length: 120 }, () => event('interaction.completed', 36)),
            ...Array.from({ length: 80 }, () => event('obligation.settled_on_time', 36))
        ];
        const lowRatings = Array.from({ length: 30 }, () => event('rating.submitted', 36, { rating: 1 }));
        const highRatings = Array.from({ length: 30 }, () => event('rating.submitted', 36, { rating: 5 }));

        const low = scoreEvents({ events: [...common, ...lowRatings], role: 'provider', identityReady: true, now });
        const high = scoreEvents({ events: [...common, ...highRatings], role: 'provider', identityReady: true, now });

        expect(high.score - low.score).toBeLessThanOrEqual(38);
        expect(high.components.financial_reliability).toBe(low.components.financial_reliability);
    });

    test('a driver with no obligation history has no fabricated financial score', () => {
        const events = Array.from({ length: 40 }, () => event('interaction.completed', 18));
        const result = scoreEvents({ events, role: 'provider', identityReady: true, now });

        expect(result.components.financial_reliability).toBeNull();
        expect(result.components.service_reliability).toBeGreaterThan(70);
    });

    test('maturity policy prevents 800 before 24 months and 850 before 36 months', () => {
        const perfectAt = (monthsAgo) => [
            ...Array.from({ length: 150 }, () => event('interaction.completed', monthsAgo)),
            ...Array.from({ length: 70 }, () => event('obligation.settled_on_time', monthsAgo)),
            ...Array.from({ length: 30 }, () => event('rating.submitted', monthsAgo, { rating: 5 }))
        ];

        const yearOne = scoreEvents({ events: perfectAt(12), role: 'provider', identityReady: true, now });
        const yearTwo = scoreEvents({ events: perfectAt(24), role: 'provider', identityReady: true, now });
        const yearThree = scoreEvents({ events: perfectAt(36), role: 'provider', identityReady: true, now });

        expect(yearOne.score).toBeLessThan(800);
        expect(yearTwo.score).toBeLessThanOrEqual(800);
        expect(yearThree.score).toBeLessThanOrEqual(850);
        expect(yearThree.score).toBeGreaterThan(yearTwo.score);
    });
});
