jest.mock('../database/models', () => ({
    Credential: { findOne: jest.fn() },
    UserProfile: { findOne: jest.fn() },
    VerificationRequest: { findOne: jest.fn() },
    UserAccount: {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        updateOne: jest.fn()
    }
}));

jest.mock('../services/casper', () => ({
    setVerification: jest.fn(),
    updateTier: jest.fn(),
    mintCidName: jest.fn()
}));

const { UserAccount } = require('../database/models');
const casperService = require('../services/casper');
const { mintCredential } = require('./credential-minter');

describe('credential minting safety', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        UserAccount.updateOne.mockResolvedValue({ acknowledged: true });
    });

    test('releases the mint claim when Casper execution fails', async () => {
        UserAccount.findOne.mockResolvedValue({
            wallet: 'wallet-1',
            tier: 'layer_1',
            did_minted: false
        });
        UserAccount.findOneAndUpdate.mockResolvedValue({ wallet: 'wallet-1' });
        casperService.setVerification.mockRejectedValue(new Error('execution failed'));

        await expect(mintCredential({ wallet: 'wallet-1', tier: 'layer_1' }))
            .rejects.toThrow('execution failed');

        expect(UserAccount.updateOne).toHaveBeenCalledWith(
            { wallet: 'wallet-1', did_mint_status: 'pending' },
            expect.objectContaining({
                $set: expect.objectContaining({
                    did_minted: false,
                    did_mint_status: 'failed',
                    did_mint_error: 'execution failed'
                })
            })
        );
        expect(UserAccount.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                did_minted: { $ne: true },
                $or: expect.arrayContaining([
                    { did_mint_status: { $ne: 'pending' } },
                    { did_mint_started_at: { $lt: expect.any(Date) } }
                ])
            }),
            expect.any(Object),
            { new: true }
        );
    });

    test('rejects a tier downgrade before submitting a Casper deploy', async () => {
        UserAccount.findOne.mockResolvedValue({
            wallet: 'wallet-2',
            tier: 'layer_3',
            did_minted: true
        });

        await expect(mintCredential({ wallet: 'wallet-2', tier: 'layer_2' }))
            .rejects.toThrow('Cannot downgrade identity');
        expect(casperService.updateTier).not.toHaveBeenCalled();
        expect(casperService.setVerification).not.toHaveBeenCalled();
    });
});
