const SCOPE_TO_FIELDS = {
    'read:profile': ['name', 'human_id'],
    'read:email': ['email'],
    'read:wallet': ['wallet'],
    'read:kyc_level': ['tier'],
    'verify:age': ['over_18'],
    'verify:identity': ['verified'],
    'verify:kyc': ['verified', 'tier'],
    'verify:liveness': []
};

function unique(values = []) {
    return [...new Set(values.filter(Boolean))];
}

function expandScopesToSharedFields(scopes = []) {
    const fields = [];
    for (const scope of scopes) {
        const mappedFields = SCOPE_TO_FIELDS[scope] || [];
        fields.push(...mappedFields);
    }
    return unique(fields);
}

function shouldShareField(sharedData = [], field) {
    return Array.isArray(sharedData) && sharedData.includes(field);
}

module.exports = {
    SCOPE_TO_FIELDS,
    expandScopesToSharedFields,
    shouldShareField
};
