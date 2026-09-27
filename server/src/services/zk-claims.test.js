jest.mock('../database/models', () => ({
    UserAccount: {},
    UserProfile: { findOne: jest.fn() },
    Credential: {}
}));

const jwt = require('jsonwebtoken');
const { UserProfile } = require('../database/models');
const claimsService = require('./zk-claims');

describe('private claims', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'private-claims-test-secret';
        claimsService.validateUserSession = jest.fn().mockResolvedValue({
            userAccount: {
                user_id: 'user-1',
                wallet: 'wallet-secret',
                tier: 'layer_2'
            }
        });
        UserProfile.findOne.mockResolvedValue({ human_id: 'human-secret' });
    });

    test('does not disclose wallet or human ID in the signed public payload', async () => {
        const generated = await claimsService.generateClaimProof('session', ['tier_2']);
        const decoded = jwt.verify(generated.proof, process.env.JWT_SECRET);

        expect(decoded.issuer).toEqual({ id: 'CasperID' });
        expect(JSON.stringify(decoded)).not.toContain('wallet-secret');
        expect(JSON.stringify(decoded)).not.toContain('human-secret');
        expect(generated._storageOwner).toEqual({
            user_id: 'user-1',
            wallet: 'wallet-secret',
            human_id: 'human-secret'
        });
    });

    test('derives displayed claims from the verified signature', async () => {
        const generated = await claimsService.generateClaimProof('session', ['tier_2']);
        const result = await claimsService.verifyClaimProof(generated.proof);

        expect(result).toMatchObject({
            valid: true,
            claims: [{ id: 'tier_2', valid: true, verified: true }]
        });
    });
});
