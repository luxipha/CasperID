function normalizeDateOfBirth(dateOfBirth) {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return null;

    return dob;
}

function calculateAge(dateOfBirth) {
    const dob = normalizeDateOfBirth(dateOfBirth);
    if (!dob) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDelta = today.getMonth() - dob.getMonth();

    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }

    return age >= 0 ? age : null;
}

function isOverAge(dateOfBirth, threshold) {
    const age = calculateAge(dateOfBirth);
    return age === null ? null : age >= threshold;
}

function isDateOfBirthVerified(profile) {
    return !!(profile?.date_of_birth && profile?.date_of_birth_verified);
}

function buildAgeClaims(profile) {
    const age = calculateAge(profile?.date_of_birth);
    const dobVerified = isDateOfBirthVerified(profile);

    return {
        dateOfBirth: profile?.date_of_birth || null,
        dateOfBirthVerified: dobVerified,
        age: dobVerified ? age : null,
        over18: dobVerified ? isOverAge(profile?.date_of_birth, 18) : null,
        over21: dobVerified ? isOverAge(profile?.date_of_birth, 21) : null
    };
}

module.exports = {
    buildAgeClaims,
    calculateAge,
    isDateOfBirthVerified,
    isOverAge,
    normalizeDateOfBirth
};
