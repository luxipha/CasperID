jest.mock('./trust-score', () => ({
    calculateTrustScore: jest.fn()
}));

const { calculateTrustScore } = require('./trust-score');
const { buildTrustCapacityDisclosure } = require('./business-trust-disclosure');

const enabledMobilityApp = {
    service_category: 'mobility',
    supported_roles: ['consumer', 'provider'],
    trust_capacity_enabled: true,
    requested_scopes: ['verify:identity', 'read:trust_capacity']
};

const providerResult = {
    score: 648,
    status: 'active',
    identity_readiness: 100,
    policy_version: 'mobility-v1',
    reasons: ['not for disclosure'],
    evidence_count: 12
};

const consumerResult = {
    score: 503,
    status: 'active',
    identity_readiness: 100,
    policy_version: 'mobility-v1'
};

describe('buildTrustCapacityDisclosure', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns only the consented role-aware score contract', async () => {
        calculateTrustScore
            .mockResolvedValueOnce(providerResult)
            .mockResolvedValueOnce(consumerResult);

        const result = await buildTrustCapacityDisclosure(
            'user_heygo',
            enabledMobilityApp,
            new Date('2026-09-27T12:00:00.000Z')
        );

        expect(calculateTrustScore).toHaveBeenNthCalledWith(1, 'user_heygo', 'provider');
        expect(calculateTrustScore).toHaveBeenNthCalledWith(2, 'user_heygo', 'consumer');
        expect(result).toEqual({
            service_category: 'mobility',
            calculated_at: '2026-09-27T12:00:00.000Z',
            provider: {
                score: 648,
                status: 'active',
                identity_readiness: 100,
                policy_version: 'mobility-v1'
            },
            consumer: {
                score: 503,
                status: 'active',
                identity_readiness: 100,
                policy_version: 'mobility-v1'
            }
        });
        expect(JSON.stringify(result)).not.toContain('not for disclosure');
        expect(JSON.stringify(result)).not.toContain('evidence_count');
    });

    it('does not calculate or disclose a score when the app did not request consent', async () => {
        const result = await buildTrustCapacityDisclosure('user_heygo', {
            ...enabledMobilityApp,
            trust_capacity_enabled: false
        });

        expect(result).toBeNull();
        expect(calculateTrustScore).not.toHaveBeenCalled();
    });

    it('returns an explicit unavailable state rather than inventing a score', async () => {
        calculateTrustScore.mockRejectedValueOnce(new Error('database unavailable'));

        await expect(buildTrustCapacityDisclosure(
            'user_heygo',
            enabledMobilityApp,
            new Date('2026-09-27T12:00:00.000Z')
        )).resolves.toEqual({
            service_category: 'mobility',
            calculated_at: '2026-09-27T12:00:00.000Z',
            status: 'unavailable',
            provider: null,
            consumer: null
        });
    });
});
