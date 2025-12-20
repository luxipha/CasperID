const { verifyToken } = require('../utils/jwt-manager');
const { LoginSession, AdminUser } = require('../database/models');
const { authenticateAdmin } = require('../utils/admin-auth');
const { rateLimitMiddleware } = require('../utils/rate-limiter');

/**
 * Admin authentication middleware
 * Validates admin JWT tokens with rate limiting
 */
const adminAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Admin token required' });
        }

        // Extract token from "Bearer <token>" format
        const token = authorization.replace('Bearer ', '');

        // Verify JWT token
        const decoded = verifyToken(token);
        if (!decoded || !decoded.isAdmin) {
            return res.status(401).json({ error: 'Invalid admin token' });
        }

        // Verify admin still exists and is active
        const admin = await AdminUser.findById(decoded.adminId);
        if (!admin || !admin.active) {
            return res.status(401).json({ error: 'Admin account not found or disabled' });
        }

        // Check if admin account is locked
        if (admin.locked_until && admin.locked_until > new Date()) {
            return res.status(423).json({ 
                error: 'Admin account temporarily locked',
                lockedUntil: admin.locked_until
            });
        }

        // Attach admin to request
        req.admin = {
            id: admin._id,
            username: admin.username,
            role: admin.role
        };

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};

/**
 * Middleware to require a valid JWT token
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Check if session is revoked in DB
        const session = await LoginSession.findOne({ token, revoked: false });
        if (!session) {
            return res.status(401).json({ error: 'Session revoked or expired' });
        }

        // Attach user to request
        req.user = decoded;
        req.token = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Middleware to extract viewer if present, but not require it
 */
const extractViewer = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            if (decoded) {
                // We don't enforce DB session check for passive view logging to save perf,
                // but we could if we want strictness.
                req.user = decoded;
            }
        }
        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
};

/**
 * Rate limited admin authentication middleware
 * Combines admin auth with rate limiting
 */
const adminAuthWithRateLimit = [
    rateLimitMiddleware('admin_endpoints'),
    adminAuth
];

/**
 * Admin login rate limiting middleware
 * For admin login endpoints
 */
const adminLoginRateLimit = rateLimitMiddleware('admin_login');

module.exports = {
    adminAuth,
    adminAuthWithRateLimit,
    adminLoginRateLimit,
    requireAuth,
    extractViewer,
    jwtAuth: requireAuth // Alias for backward compatibility if needed
};
