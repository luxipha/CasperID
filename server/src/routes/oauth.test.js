jest.mock('../database/models', () => ({
    AuthorizationCode: {},
    BusinessApp: {},
    UserAccount: {},
    UserProfile: {},
    VerificationRequestV2: { findOne: jest.fn() }
}));
jest.mock('../middleware/auth', () => ({ requireAuth: (_req, _res, next) => next() }));
jest.mock('../utils/rate-limiter', () => ({ rateLimitMiddleware: () => (_req, _res, next) => next() }));
jest.mock('../utils/jwt-manager', () => ({ generateBusinessToken: jest.fn() }));

const { VerificationRequestV2 } = require('../database/models');
const { assessAuthorizationEligibility } = require('./oauth');
const { normalizeRequiredTier } = require('../constants/tier-levels');

describe('OAuth tier eligibility', () => {
    const app = (requiredTier) => ({ sdk_config: { requiredTier } });

    beforeEach(() => VerificationRequestV2.findOne.mockReset());

    test('normalizes configured tiers', () => {
        expect(normalizeRequiredTier('L2')).toBe('layer_2');
        expect(normalizeRequiredTier('unknown')).toBe('layer_1');
    });

    test('allows a user who meets the required tier', async () => {
        await expect(assessAuthorizationEligibility(app('L2'), { user_id: 'u1', tier: 'layer_2' }))
            .resolves.toMatchObject({ eligible: true, authorizationStatus: 'complete' });
    });

    test('allows only genuine pending L3 requests as provisional', async () => {
        VerificationRequestV2.findOne.mockResolvedValue({ request_id: 'r1' });
        await expect(assessAuthorizationEligibility(app('L3'), { user_id: 'u1', tier: 'layer_2' }))
            .resolves.toMatchObject({ eligible: true, authorizationStatus: 'provisional', verificationStatus: 'pending' });

        VerificationRequestV2.findOne.mockResolvedValue(null);
        await expect(assessAuthorizationEligibility(app('L3'), { user_id: 'u1', tier: 'layer_2' }))
            .resolves.toMatchObject({ eligible: false });
    });

    test('does not grant provisional L3 access below L2', async () => {
        await expect(assessAuthorizationEligibility(app('L3'), { user_id: 'u1', tier: 'layer_1' }))
            .resolves.toMatchObject({ eligible: false });
        expect(VerificationRequestV2.findOne).not.toHaveBeenCalled();
    });
});
