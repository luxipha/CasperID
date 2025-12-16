const { verifyToken } = require('../utils/jwt-manager');
const { LoginSession } = require('../database/models');

/**
 * Simple admin authentication middleware
 * Checks for admin password in request headers
 */
const adminAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        // Extract password from "Bearer <password>" format
        const password = authorization.replace('Bearer ', '');

        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ error: 'Invalid admin credentials' });
        }

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

module.exports = {
    adminAuth,
    requireAuth,
    extractViewer,
    jwtAuth: requireAuth // Alias for backward compatibility if needed
};
