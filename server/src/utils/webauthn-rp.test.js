const { originCanUseRpId } = require('./webauthn-rp');

describe('originCanUseRpId', () => {
    test('allows the RP domain and its HTTPS subdomains', () => {
        expect(originCanUseRpId('https://casperid.com', 'casperid.com')).toBe(true);
        expect(originCanUseRpId('https://account.casperid.com', 'casperid.com')).toBe(true);
    });

    test('rejects unrelated and lookalike domains', () => {
        expect(originCanUseRpId('https://affiliate.anra.rest', 'casperid.com')).toBe(false);
        expect(originCanUseRpId('https://casperid.com.evil.test', 'casperid.com')).toBe(false);
    });

    test('requires HTTPS except for localhost development', () => {
        expect(originCanUseRpId('http://casperid.com', 'casperid.com')).toBe(false);
        expect(originCanUseRpId('http://localhost:5173', 'localhost')).toBe(true);
    });

    test('rejects missing or malformed values', () => {
        expect(originCanUseRpId(null, 'casperid.com')).toBe(false);
        expect(originCanUseRpId('not-a-url', 'casperid.com')).toBe(false);
        expect(originCanUseRpId('https://casperid.com', '')).toBe(false);
    });
});
