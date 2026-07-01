jest.mock('../database/models', () => ({
    Payment: {
        findOne: jest.fn()
    },
    UserAccount: {
        findOne: jest.fn()
    }
}));

jest.mock('./cns-resolver', () => ({
    parseCidName: jest.fn((name) => {
        const normalized = String(name).replace(/\.cid$/i, '');
        return { root: normalized, fullName: `${normalized}.cid` };
    }),
    registerPremiumName: jest.fn()
}));

jest.mock('./eventBus', () => ({
    EVENTS: {
        CNS_REGISTERED: 'cns.registered'
    },
    eventBus: {
        emit: jest.fn()
    }
}));

const { Payment, UserAccount } = require('../database/models');
const cnsResolver = require('./cns-resolver');
const { eventBus, EVENTS } = require('./eventBus');
const {
    finalizeCompletedPayment,
    findCompletedPaymentForUser
} = require('./payment-fulfillment');

describe('payment-fulfillment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('finalizeCompletedPayment mints and emits when payment has not been fulfilled yet', async () => {
        const payment = {
            reference: 'bf_ref_123',
            orderId: 'boomfi_tx_1',
            status: 'completed',
            metadata: {
                domainName: 'alice',
                years: 3,
                userId: 'user_1'
            },
            save: jest.fn().mockResolvedValue(undefined)
        };
        const user = {
            user_id: 'user_1',
            wallet: 'wallet_1',
            cns_name: null,
            onchain_name_tx: null,
            recovery_email: 'user@example.com'
        };

        UserAccount.findOne.mockResolvedValue(user);
        cnsResolver.registerPremiumName.mockResolvedValue({
            name: 'alice.cid',
            txHash: 'tx_123'
        });

        const result = await finalizeCompletedPayment(payment, { transactionId: 'boomfi_tx_1' });

        expect(cnsResolver.registerPremiumName).toHaveBeenCalledWith('wallet_1', 'alice');
        expect(payment.txHash).toBe('tx_123');
        expect(payment.save).toHaveBeenCalled();
        expect(eventBus.emit).toHaveBeenCalledWith(EVENTS.CNS_REGISTERED, expect.objectContaining({
            userId: 'user_1',
            domainName: 'alice',
            transactionId: 'boomfi_tx_1'
        }));
        expect(result).toEqual(expect.objectContaining({
            minted: true,
            alreadyMinted: false,
            name: 'alice.cid',
            txHash: 'tx_123'
        }));
    });

    test('finalizeCompletedPayment is idempotent when the user already owns the paid name', async () => {
        const payment = {
            reference: 'rc_ref_123',
            status: 'completed',
            txHash: null,
            metadata: {
                domainName: 'alice',
                userId: 'user_1'
            },
            save: jest.fn().mockResolvedValue(undefined)
        };
        const user = {
            user_id: 'user_1',
            wallet: 'wallet_1',
            cns_name: 'alice',
            onchain_name_tx: 'tx_existing',
            recovery_email: 'user@example.com'
        };

        UserAccount.findOne.mockResolvedValue(user);

        const result = await finalizeCompletedPayment(payment, { transactionId: 'rc_tx_1' });

        expect(cnsResolver.registerPremiumName).not.toHaveBeenCalled();
        expect(eventBus.emit).not.toHaveBeenCalled();
        expect(payment.txHash).toBe('tx_existing');
        expect(payment.save).toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining({
            minted: true,
            alreadyMinted: true,
            name: 'alice.cid',
            txHash: 'tx_existing'
        }));
    });

    test('findCompletedPaymentForUser matches only completed payments for the same user and root name', async () => {
        Payment.findOne.mockResolvedValue({ reference: 'rc_ref_123' });

        const payment = await findCompletedPaymentForUser({
            reference: 'rc_ref_123',
            userId: 'user_1',
            wallet: 'wallet_1',
            domainName: 'alice.cid'
        });

        expect(Payment.findOne).toHaveBeenCalledWith({
            reference: 'rc_ref_123',
            status: 'completed',
            'metadata.domainName': 'alice',
            $or: [
                { 'metadata.userId': 'user_1' },
                { 'metadata.userWallet': 'wallet_1' }
            ]
        });
        expect(payment).toEqual({ reference: 'rc_ref_123' });
    });
});
