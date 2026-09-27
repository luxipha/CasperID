const CORE_SCOPES = ['verify:identity', 'read:profile', 'read:kyc_level'];
const TRUST_CAPACITY_SCOPE = 'read:trust_capacity';

const MANAGED_PROOF_SCOPES = {
    email: ['read:email'],
    liveness: ['verify:liveness'],
    age: ['verify:age']
};

const ALL_SCOPES = new Set([
    ...CORE_SCOPES,
    'read:email',
    'read:wallet',
    'verify:age',
    'verify:liveness',
    'verify:kyc',
    TRUST_CAPACITY_SCOPE
]);

function unique(values = []) {
    return [...new Set(values.filter(Boolean))];
}

function normalizeRequestedScopes(scopes = []) {
    return unique(Array.isArray(scopes) ? scopes : []).filter(scope => ALL_SCOPES.has(scope));
}

function deriveRequestedScopesFromProofs(proofs = []) {
    const requestedScopes = [...CORE_SCOPES];
    const selectedProofs = Array.isArray(proofs) ? proofs : [];

    for (const proof of selectedProofs) {
        const mappedScopes = MANAGED_PROOF_SCOPES[proof] || [];
        requestedScopes.push(...mappedScopes);
    }

    return normalizeRequestedScopes(requestedScopes);
}

function resolveRequestedScopes(app) {
    const requestedScopes = normalizeRequestedScopes(app?.requested_scopes || []);
    const baseScopes = requestedScopes.length > 0
        ? requestedScopes
        : deriveRequestedScopesFromProofs(app?.sdk_config?.proofs || []);

    const trustCapacityEligible = app?.service_category === 'mobility' &&
        Array.isArray(app?.supported_roles) && app.supported_roles.length > 0;
    if (app?.trust_capacity_enabled && trustCapacityEligible) {
        return unique([...baseScopes, TRUST_CAPACITY_SCOPE]);
    }
    return baseScopes.filter(scope => scope !== TRUST_CAPACITY_SCOPE);
}

function deriveProofsFromScopes(scopes = []) {
    const requestedScopes = normalizeRequestedScopes(scopes);
    const proofs = [];

    for (const [proof, mappedScopes] of Object.entries(MANAGED_PROOF_SCOPES)) {
        if (proof === 'age') {
            if (requestedScopes.includes('verify:age') || requestedScopes.includes('verify:kyc')) {
                proofs.push(proof);
            }
            continue;
        }

        if (mappedScopes.every(scope => requestedScopes.includes(scope))) {
            proofs.push(proof);
        }
    }

    return proofs;
}

module.exports = {
    CORE_SCOPES,
    TRUST_CAPACITY_SCOPE,
    deriveProofsFromScopes,
    deriveRequestedScopesFromProofs,
    normalizeRequestedScopes,
    resolveRequestedScopes
};
