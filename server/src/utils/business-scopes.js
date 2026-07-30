const CORE_SCOPES = ['verify:identity', 'read:profile', 'read:kyc_level'];

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
    'verify:kyc'
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
    if (requestedScopes.length > 0) {
        return requestedScopes;
    }

    return deriveRequestedScopesFromProofs(app?.sdk_config?.proofs || []);
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
    deriveProofsFromScopes,
    deriveRequestedScopesFromProofs,
    normalizeRequestedScopes,
    resolveRequestedScopes
};
