const {
    CORE_SCOPES,
    TRUST_CAPACITY_SCOPE,
    resolveRequestedScopes
} = require('./business-scopes');

describe('resolveRequestedScopes', () => {
    it('adds Trust Capacity only for an enabled mobility app with roles', () => {
        expect(resolveRequestedScopes({
            service_category: 'mobility',
            supported_roles: ['consumer', 'provider'],
            trust_capacity_enabled: true,
            requested_scopes: CORE_SCOPES
        })).toEqual([...CORE_SCOPES, TRUST_CAPACITY_SCOPE]);
    });

    it('removes a stale Trust Capacity scope if the app is no longer eligible', () => {
        expect(resolveRequestedScopes({
            service_category: 'commerce',
            supported_roles: ['consumer'],
            trust_capacity_enabled: true,
            requested_scopes: [...CORE_SCOPES, TRUST_CAPACITY_SCOPE]
        })).toEqual(CORE_SCOPES);
    });
});
