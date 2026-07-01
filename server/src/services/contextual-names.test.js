jest.mock('../utils/wallet-to-human', () => ({
    walletToHuman: jest.fn(() => ({
        humanId: 'markov-user'
    }))
}));

const {
    stripCidSuffix,
    getRootNameForAccount,
    buildContextualName,
    findContextByAlias
} = require('./contextual-names');

describe('contextual-names', () => {
    test('stripCidSuffix removes the .cid suffix when present', () => {
        expect(stripCidSuffix('alice.cid')).toBe('alice');
        expect(stripCidSuffix('alice')).toBe('alice');
    });

    test('getRootNameForAccount prefers premium names and falls back to generated human ids', () => {
        expect(getRootNameForAccount({ cns_name: 'alice', wallet: 'wallet_1' })).toBe('alice');
        expect(getRootNameForAccount({ wallet: 'wallet_2' })).toBe('markov-user');
    });

    test('buildContextualName always uses alias as the hostname prefix', () => {
        expect(buildContextualName('pay', 'alice')).toBe('pay.alice.cid');
    });

    test('findContextByAlias matches the alias instead of the context category', () => {
        const contextDid = findContextByAlias([
            { alias: 'pay', context: 'professional' },
            { alias: 'game', context: 'gaming' }
        ], 'pay');

        expect(contextDid).toEqual({ alias: 'pay', context: 'professional' });
    });
});
