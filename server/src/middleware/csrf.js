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
    // __Host- prefix requires secure cookies (HTTPS), use simple name in dev
    cookieName: isProduction ? '__Host-csrf' : 'csrf-token',
    cookieOptions: {
        httpOnly: true,
        // When using ngrok subdomains, we need SameSite=None and Secure=true
        sameSite: (isProduction || process.env.FRONTEND_URL?.includes('ngrok')) ? 'none' : 'lax',
        secure: isProduction || process.env.FRONTEND_URL?.includes('ngrok'),
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
