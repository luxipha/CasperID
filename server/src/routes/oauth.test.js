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
        await expect(assessAuthorizationEligibility(app('L2'), { user_id: 'u1', tier: 'layer_2', wallet: 'account-hash-1' }))
            .resolves.toMatchObject({ eligible: true, authorizationStatus: 'complete' });
    });

    test('allows only genuine pending L3 requests as provisional', async () => {
        VerificationRequestV2.findOne.mockResolvedValue({ request_id: 'r1' });
        await expect(assessAuthorizationEligibility(app('L3'), { user_id: 'u1', tier: 'layer_2', wallet: 'account-hash-1' }))
            .resolves.toMatchObject({ eligible: true, authorizationStatus: 'provisional', verificationStatus: 'pending' });
        expect(VerificationRequestV2.findOne).toHaveBeenCalledWith(expect.objectContaining({
            'verification_data.submitted_at': { $exists: true, $nin: [null, ''] }
        }));

        VerificationRequestV2.findOne.mockResolvedValue(null);
        await expect(assessAuthorizationEligibility(app('L3'), { user_id: 'u1', tier: 'layer_2', wallet: 'account-hash-1' }))
            .resolves.toMatchObject({ eligible: false });
    });

    test('allows a submitted direct L1 to L3 request as provisional without changing the granted tier', async () => {
        VerificationRequestV2.findOne.mockResolvedValue({ request_id: 'r1' });
        await expect(assessAuthorizationEligibility(app('L3'), { user_id: 'u1', tier: 'layer_1', wallet: 'account-hash-1' }))
            .resolves.toMatchObject({
                eligible: true,
                grantedTier: 'layer_1',
                requiredTier: 'layer_3',
                authorizationStatus: 'provisional',
                verificationStatus: 'pending'
            });
    });

    test('does not grant provisional L3 access below L1', async () => {
        await expect(assessAuthorizationEligibility(app('L3'), { user_id: 'u1', tier: 'layer_0', wallet: 'account-hash-1' }))
            .resolves.toMatchObject({ eligible: false });
        expect(VerificationRequestV2.findOne).not.toHaveBeenCalled();
    });

    test('requires onboarding when the account has no provisioned wallet', async () => {
        await expect(assessAuthorizationEligibility(app('L2'), { user_id: 'u1', tier: 'layer_1' }))
            .resolves.toMatchObject({
                eligible: false,
                onboardingRequired: true,
                grantedTier: 'layer_1',
                requiredTier: 'layer_2'
            });
        expect(VerificationRequestV2.findOne).not.toHaveBeenCalled();
    });
});
