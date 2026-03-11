const { doubleCsrf } = require('csrf-csrf');
const crypto = require('crypto');

/**
 * CSRF Protection Middleware
 * Uses double-submit cookie pattern for SPA compatibility
 */

// Generate a secure secret for CSRF token generation
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

// Determine if we're in production (HTTPS required for __Host- prefix)
const isProduction = process.env.NODE_ENV === 'production';

// Check if we're in a cross-origin staging environment (e.g., Render with separate frontend/backend subdomains)
// Render sets RENDER=true and RENDER_EXTERNAL_HOSTNAME when running on their platform
const isOnRender = process.env.RENDER === 'true' || !!process.env.RENDER_EXTERNAL_HOSTNAME;
const frontendUrl = process.env.FRONTEND_URL || '';
const apiUrl = process.env.API_BASE_URL || '';
const isNgrok = frontendUrl.includes('ngrok') || apiUrl.includes('ngrok');
// On Render, frontend and backend are on different subdomains, requiring cross-origin cookie settings
const isCrossOriginStaging = isOnRender || isNgrok;

// For cross-origin staging (Render, ngrok), we can't use __Host- prefix because:
// 1. __Host- cookies can't have a domain attribute
// 2. Different subdomains (frontend vs API) need to share the cookie
// 3. We need sameSite=none for cross-origin requests, which requires secure=true
const cookieName = (isProduction && !isCrossOriginStaging) ? '__Host-csrf' : 'csrf-token';

const {
    generateCsrfToken,
    doubleCsrfProtection,
    invalidCsrfTokenError
} = doubleCsrf({
    getSecret: () => CSRF_SECRET,
    // Session identifier - use auth cookie or fallback to a constant for anonymous users
    getSessionIdentifier: (req) => {
        // Use the session token from cookie if available, otherwise use IP + User-Agent hash
        const sessionCookie = req.cookies?.['casperid_session'];
        if (sessionCookie) return sessionCookie;
        // For anonymous users, use a hash of IP and user agent as identifier
        const identifier = `${req.ip || 'unknown'}-${req.headers['user-agent'] || 'unknown'}`;
        return crypto.createHash('sha256').update(identifier).digest('hex').slice(0, 32);
    },
    cookieName,
    cookieOptions: {
        httpOnly: true,
        // Cross-origin staging requires SameSite=None and Secure=true
        sameSite: (isProduction || isCrossOriginStaging) ? 'none' : 'lax',
        secure: isProduction || isCrossOriginStaging,
        path: '/'
    },
    size: 64, // Token size in bytes
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Don't validate these methods
    getTokenFromRequest: (req) => {
        // Check header first (preferred for SPAs)
        return req.headers['x-csrf-token'] || req.body?._csrf;
    }
});

/**
 * Middleware to generate and attach CSRF token to response
 * Call this on routes that render forms or initialize the SPA
 */
const csrfTokenGenerator = (req, res, next) => {
    const token = generateCsrfToken(req, res);
    // Attach token to response locals for template rendering
    res.locals.csrfToken = token;
    // Also send as response header for SPA to capture
    res.setHeader('X-CSRF-Token', token);
    next();
};

/**
 * Error handler for CSRF validation failures
 */
const csrfErrorHandler = (err, req, res, next) => {
    if (err === invalidCsrfTokenError) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or missing CSRF token'
        });
    }
    next(err);
};

/**
 * Endpoint to get a fresh CSRF token
 * Frontend should call this on app initialization
 */
const getCsrfToken = (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ csrfToken: token });
};

module.exports = {
    doubleCsrfProtection,
    csrfTokenGenerator,
    csrfErrorHandler,
    getCsrfToken,
    generateCsrfToken
};
