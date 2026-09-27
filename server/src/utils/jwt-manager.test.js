jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'signed-business-token') }));
jest.mock('./jwt-rotation-db', () => ({
    getCurrentSecret: jest.fn(() => 'test-secret'),
    verifyTokenWithRotation: jest.fn()
}));
jest.mock('./rsa-key-manager', () => ({
    getPrivateKey: jest.fn(() => 'test-private-key'),
    getKid: jest.fn(() => 'test-key-id'),
    verifyRsaToken: jest.fn()
}));

const jwt = require('jsonwebtoken');
const { generateBusinessToken } = require('./jwt-manager');

const trustCapacity = {
    service_category: 'mobility',
    calculated_at: '2026-09-27T12:00:00.000Z',
    provider: { score: 650, status: 'active', identity_readiness: 100, policy_version: 'mobility-v1' },
    consumer: { score: 500, status: 'active', identity_readiness: 100, policy_version: 'mobility-v1' }
};

describe('generateBusinessToken Trust Capacity claim', () => {
    beforeEach(() => jest.clearAllMocks());

    it('includes Trust Capacity only when its consented shared field is present', () => {
        generateBusinessToken({
            userId: 'user_heygo',
            verified: true,
            tier: 'layer_3',
            sharedData: ['trust_capacity'],
            trustCapacity
        }, 'app_heygo');

        expect(jwt.sign).toHaveBeenCalledWith(
            expect.objectContaining({ trust_capacity: trustCapacity }),
            'test-private-key',
            expect.objectContaining({ algorithm: 'RS256' })
        );
    });

    it('does not leak Trust Capacity when the app did not receive that consent', () => {
        generateBusinessToken({
            userId: 'user_heygo',
            verified: true,
            tier: 'layer_3',
            sharedData: [],
            trustCapacity
        }, 'app_heygo');

        const payload = jwt.sign.mock.calls[0][0];
        expect(payload).not.toHaveProperty('trust_capacity');
    });
});
