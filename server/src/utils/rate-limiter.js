/**
 * Rate limiting utilities
 * Implements rate limiting for admin endpoints and other sensitive operations
 */

const { RateLimit } = require('../database/models');

/**
 * Rate limiter configuration for different endpoints
 */
const RATE_LIMITS = {
    admin_login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    },
    admin_endpoints: {
        windowMs: 60 * 1000, // 1 minute
        max: 30, // 30 requests per minute
        blockDurationMs: 5 * 60 * 1000 // 5 minutes block
    },
    verification_requests: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 verification requests per hour
        blockDurationMs: 60 * 60 * 1000 // 1 hour block
    },
    credential_minting: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 3, // 3 minting attempts per 5 minutes
        blockDurationMs: 15 * 60 * 1000 // 15 minutes block
    }
};

/**
 * Check if an IP is rate limited for a specific endpoint
 * @param {string} ip - Client IP address
 * @param {string} endpoint - Endpoint identifier
 * @returns {Promise<Object>} Rate limit status
 */
async function checkRateLimit(ip, endpoint) {
    const config = RATE_LIMITS[endpoint];
    if (!config) {
        return { allowed: true, resetTime: null };
    }

    const now = new Date();
    
    // Check for existing rate limit record
    let rateLimitRecord = await RateLimit.findOne({ ip, endpoint });
    
    if (!rateLimitRecord) {
        // First request - create new record
        rateLimitRecord = new RateLimit({
            ip,
            endpoint,
            requests: 1,
            windowStart: now
        });
        await rateLimitRecord.save();
        return { allowed: true, resetTime: new Date(now.getTime() + config.windowMs) };
    }

    // Check if currently blocked
    if (rateLimitRecord.blocked_until && rateLimitRecord.blocked_until > now) {
        return {
            allowed: false,
            blocked: true,
            resetTime: rateLimitRecord.blocked_until,
            message: `Rate limit exceeded. Try again after ${rateLimitRecord.blocked_until.toISOString()}`
        };
    }

    // Check if window has expired
    const windowExpired = (now - rateLimitRecord.windowStart) > config.windowMs;
    
    if (windowExpired) {
        // Reset window
        rateLimitRecord.requests = 1;
        rateLimitRecord.windowStart = now;
        rateLimitRecord.blocked_until = null;
        await rateLimitRecord.save();
        return { allowed: true, resetTime: new Date(now.getTime() + config.windowMs) };
    }

    // Increment request count
    rateLimitRecord.requests += 1;

    if (rateLimitRecord.requests > config.max) {
        // Rate limit exceeded - block the IP
        rateLimitRecord.blocked_until = new Date(now.getTime() + config.blockDurationMs);
        await rateLimitRecord.save();
        
        return {
            allowed: false,
            blocked: true,
            resetTime: rateLimitRecord.blocked_until,
            message: `Rate limit exceeded. Blocked until ${rateLimitRecord.blocked_until.toISOString()}`
        };
    }

    await rateLimitRecord.save();
    
    const resetTime = new Date(rateLimitRecord.windowStart.getTime() + config.windowMs);
    return {
        allowed: true,
        resetTime,
        remaining: config.max - rateLimitRecord.requests
    };
}

/**
 * Express middleware for rate limiting
 * @param {string} endpoint - Endpoint identifier
 * @returns {Function} Express middleware function
 */
function rateLimitMiddleware(endpoint) {
    return async (req, res, next) => {
        try {
            const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            
            const result = await checkRateLimit(ip, endpoint);
            
            if (!result.allowed) {
                return res.status(429).json({
                    error: 'Too many requests',
                    message: result.message,
                    resetTime: result.resetTime
                });
            }

            // Add rate limit headers
            if (result.resetTime) {
                res.set({
                    'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000),
                    'X-RateLimit-Remaining': result.remaining || 0
                });
            }

            next();
        } catch (error) {
            console.error('Rate limiting error:', error);
            // Don't block requests if rate limiting fails
            next();
        }
    };
}

/**
 * Reset rate limit for an IP and endpoint
 * @param {string} ip - Client IP address
 * @param {string} endpoint - Endpoint identifier
 */
async function resetRateLimit(ip, endpoint) {
    await RateLimit.deleteOne({ ip, endpoint });
}

/**
 * Clean up old rate limit records
 */
async function cleanupOldRecords() {
    try {
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        const result = await RateLimit.deleteMany({
            windowStart: { $lt: cutoffTime },
            blocked_until: { $lt: new Date() }
        });
        
        if (result.deletedCount > 0) {
            console.log(`🧹 Cleaned up ${result.deletedCount} old rate limit records`);
        }
    } catch (error) {
        console.error('Failed to cleanup rate limit records:', error);
    }
}

/**
 * Get current rate limit status for an IP and endpoint
 * @param {string} ip - Client IP address
 * @param {string} endpoint - Endpoint identifier
 * @returns {Promise<Object>} Current status
 */
async function getRateLimitStatus(ip, endpoint) {
    const record = await RateLimit.findOne({ ip, endpoint });
    const config = RATE_LIMITS[endpoint];
    
    if (!record || !config) {
        return { requests: 0, max: config?.max || 0, blocked: false };
    }

    const now = new Date();
    const blocked = record.blocked_until && record.blocked_until > now;
    
    return {
        requests: record.requests,
        max: config.max,
        blocked,
        blockedUntil: record.blocked_until,
        windowStart: record.windowStart
    };
}

module.exports = {
    checkRateLimit,
    rateLimitMiddleware,
    resetRateLimit,
    cleanupOldRecords,
    getRateLimitStatus,
    RATE_LIMITS
};