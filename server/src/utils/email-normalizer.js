/**
 * Email Normalization Utility
 *
 * Provides consistent email normalization across registration and login flows.
 * Handles Gmail-specific dot stripping to ensure emails like:
 *   - john.doe@gmail.com
 *   - johndoe@gmail.com
 *   - j.o.h.n.d.o.e@gmail.com
 * Are all treated as the same email address.
 */

/**
 * Normalize an email address for consistent storage and lookup
 * @param {string} email - The email address to normalize
 * @returns {string} - The normalized email address
 */
function normalizeEmail(email) {
    if (!email || typeof email !== 'string') {
        return email;
    }

    const trimmed = email.trim().toLowerCase();
    const atIndex = trimmed.lastIndexOf('@');

    if (atIndex === -1) {
        return trimmed;
    }

    const local = trimmed.substring(0, atIndex);
    const domain = trimmed.substring(atIndex + 1);

    // Gmail and Googlemail treat dots as non-significant in the local part
    // Also handle plus addressing (everything after + is ignored by Gmail)
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
        // Remove dots from local part
        let normalizedLocal = local.replace(/\./g, '');

        // Handle plus addressing (optional - remove everything after +)
        const plusIndex = normalizedLocal.indexOf('+');
        if (plusIndex !== -1) {
            normalizedLocal = normalizedLocal.substring(0, plusIndex);
        }

        // Googlemail.com is an alias for gmail.com
        return normalizedLocal + '@gmail.com';
    }

    return trimmed;
}

/**
 * Build a MongoDB query that matches both normalized and original email
 * Useful for finding users during login when we're unsure if the stored
 * email was normalized or not (backward compatibility)
 * @param {string} email - The email to search for
 * @returns {Object} - MongoDB query object
 */
function buildEmailQuery(email) {
    const normalized = normalizeEmail(email);
    const original = email.trim().toLowerCase();

    // If they're the same (non-Gmail), just do a simple match
    if (normalized === original) {
        return {
            recovery_email: { $regex: new RegExp(`^${escapeRegex(original)}$`, 'i') }
        };
    }

    // For Gmail addresses, match either the normalized or original form
    return {
        $or: [
            { recovery_email: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, 'i') } },
            { recovery_email: { $regex: new RegExp(`^${escapeRegex(original)}$`, 'i') } }
        ]
    };
}

/**
 * Escape special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for regex
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if two emails are equivalent (considering Gmail normalization)
 * @param {string} email1 - First email
 * @param {string} email2 - Second email
 * @returns {boolean} - True if emails are equivalent
 */
function emailsAreEqual(email1, email2) {
    if (!email1 || !email2) return false;
    return normalizeEmail(email1) === normalizeEmail(email2);
}

module.exports = {
    normalizeEmail,
    buildEmailQuery,
    escapeRegex,
    emailsAreEqual
};
