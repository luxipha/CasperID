require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3001;

// Robust URL construction for Render
const getRenderUrl = (host, fallback) => {
    if (!host) return fallback;
    if (host.startsWith('http')) return host;
    // If it's a Render host without the domain, append it
    const domain = host.includes('.') ? host : `${host}.onrender.com`;
    return `https://${domain}`;
};

const API_BASE_URL = process.env.API_BASE_URL || getRenderUrl(process.env.RENDER_EXTERNAL_HOSTNAME || process.env.API_HOST, `http://localhost:${PORT}`);
const FRONTEND_URL = process.env.FRONTEND_URL || getRenderUrl(process.env.FRONTEND_HOST, 'http://localhost:3000');
const ACCOUNT_FRONTEND_URL = process.env.ACCOUNT_FRONTEND_URL || FRONTEND_URL;

console.log(`[${new Date().toISOString()}]  Bootstrap: Target port is ${PORT}`);
console.log(`[${new Date().toISOString()}]  API Base URL: ${API_BASE_URL}`);
console.log(`[${new Date().toISOString()}]  Frontend URL: ${FRONTEND_URL}`);

// ============================================
// CORS ORIGIN CACHE (Prevents DB query per request)
// ============================================
let cachedBusinessOrigins = new Set();
let lastOriginCacheRefresh = 0;
const ORIGIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refreshBusinessOrigins() {
    try {
        if (mongoose.connection.readyState !== 1) {
            return; // DB not connected yet
        }
        const { BusinessApp } = require('./database/models');
        const apps = await BusinessApp.find({ active: true }, { allowed_origins: 1 }).lean();
        const origins = new Set();
        for (const app of apps) {
            if (app.allowed_origins) {
                for (const origin of app.allowed_origins) {
                    origins.add(origin);
                }
            }
        }
        cachedBusinessOrigins = origins;
        lastOriginCacheRefresh = Date.now();
        console.log(`[${new Date().toISOString()}] CORS: Cached ${origins.size} business origins`);
    } catch (err) {
        console.warn(`[${new Date().toISOString()}] CORS: Failed to refresh origin cache:`, err.message);
    }
}

function isBusinessOriginCached(origin) {
    // Refresh cache if stale (but don't block - return current cache)
    if (Date.now() - lastOriginCacheRefresh > ORIGIN_CACHE_TTL) {
        refreshBusinessOrigins().catch(() => {}); // Fire and forget
    }
    return cachedBusinessOrigins.has(origin);
}

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.intercom.io", "https://*.walletconnect.org", "https://*.walletconnect.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "wss:", "https://*.onrender.com", "http://localhost:*", "https://*.devtunnels.ms"],
            frameSrc: ["'self'", "https://*.walletconnect.org", "https://*.walletconnect.com", "https://*.intercom.io", "https://*.devtunnels.ms"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// MongoDB injection prevention
app.use(mongoSanitize());

// Static whitelist for core CasperID domains
const coreOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:5173',
    'https://casper-id.netlify.app',
    'https://casperid.com',
    'https://www.casperid.com',
    FRONTEND_URL,
    ACCOUNT_FRONTEND_URL,
    process.env.FRONTEND_URL
].filter(Boolean));

// Core Middleware - Dynamic CORS with cached BusinessApp origins
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Allow chrome-extension URLs or ngrok URLs for development
        if (origin.startsWith('chrome-extension://') || origin.includes('ngrok') || origin.includes('ngrok-free.app') || origin.includes('.devtunnels.ms')) {
            return callback(null, true);
        }

        // Check core origins first (fast path)
        if (coreOrigins.has(origin)) {
            return callback(null, true);
        }

        // Allow any Render staging URL
        if (origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }

        // Check cached BusinessApp origins (NO database query)
        if (isBusinessOriginCached(origin)) {
            return callback(null, true);
        }

        // In development, allow localhost on any port
        if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }

        const error = new Error('Not allowed by CORS');
        error.status = 403;
        callback(error);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'ngrok-skip-browser-warning', 'x-app-id', 'X-App-Id', 'X-API-Key', 'X-Request-Id'],
    exposedHeaders: ['X-CSRF-Token']
}));
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        // Only validate non-empty bodies
        if (buf && buf.length > 0) {
            try {
                JSON.parse(buf);
            } catch (e) {
                // Throw error to let Express handle it properly
                const error = new Error('Invalid JSON');
                error.status = 400;
                throw error;
            }
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CSRF Protection
const { doubleCsrfProtection, csrfErrorHandler, getCsrfToken } = require('./middleware/csrf');

// CSRF token endpoint - frontend should call this on initialization
app.get('/api/csrf-token', getCsrfToken);

// Apply CSRF protection to all state-changing requests (POST, PUT, DELETE, PATCH)
// Skips GET, HEAD, OPTIONS automatically
app.use((req, res, next) => {
    // Exempt external webhooks, auth, passkey, verification, and business API from CSRF protection
    // These endpoints use Bearer tokens, App ID verification, or session tokens - not browser CSRF
    if (
        req.path.startsWith('/api/payment/revenuecat/webhook') ||
        req.path.startsWith('/api/payment/boomfi/webhook') ||
        req.path.startsWith('/api/business') ||
        req.path === '/api/oauth/token' ||
        req.path.startsWith('/api/auth') ||
        req.path.startsWith('/api/passkey') ||
        req.path.startsWith('/api/v2/verification') ||
        req.path.startsWith('/api/casperid') ||
        req.path.startsWith('/api/ai') ||
        // Profile upload uses requireAuth (session cookie), CSRF is redundant
        req.path.includes('/upload-avatar')
    ) {
        return next();
    }
    doubleCsrfProtection(req, res, next);
});

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads')));

// ============================================
// MongoDB Connection with Resilience
// ============================================
const MONGO_OPTIONS = {
    serverSelectionTimeoutMS: 10000, // Fail fast if can't connect (10s instead of 30s)
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true
};

let serverStarted = false;

function startServer() {
    if (serverStarted) return;
    serverStarted = true;

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`[${new Date().toISOString()}] 🛰️  Server: Bound to port ${PORT} (0.0.0.0)`);
        console.log(`[${new Date().toISOString()}] 📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
    console.log(`[${new Date().toISOString()}] ✅ MongoDB: Connected`);
});

mongoose.connection.on('disconnected', () => {
    console.warn(`[${new Date().toISOString()}] ⚠️ MongoDB: Disconnected - will attempt reconnect`);
});

mongoose.connection.on('reconnected', () => {
    console.log(`[${new Date().toISOString()}] ✅ MongoDB: Reconnected`);
    // Refresh CORS cache on reconnect
    refreshBusinessOrigins().catch(() => {});
});

mongoose.connection.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] ❌ MongoDB: Connection error:`, err.message);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS)
    .then(async () => {
        console.log(`[${new Date().toISOString()}] ✅ MongoDB: Connected successfully`);

        try {
            // Initialize admin system
            console.log(`[${new Date().toISOString()}] 🔧 Init: Setting up admin system...`);
            const { initializeDefaultAdmin } = require('./utils/admin-auth');
            await initializeDefaultAdmin();

            // Initialize JWT secret rotation with database backing
            console.log(`[${new Date().toISOString()}] 🔧 Init: Setting up JWT rotation...`);
            const { initializeJWTRotation } = require('./utils/jwt-rotation-db');
            await initializeJWTRotation();

            // Initialize RSA key pair for business-scoped RS256 tokens
            console.log(`[${new Date().toISOString()}] 🔧 Init: Setting up RSA keys...`);
            const { initializeRsaKeys } = require('./utils/rsa-key-manager');
            await initializeRsaKeys();

            // Schedule rate limit cleanup
            const { cleanupOldRecords } = require('./utils/rate-limiter');
            setInterval(cleanupOldRecords, 60 * 60 * 1000); // Cleanup every hour

            // Initialize EventBus for centralized event handling
            console.log(`[${new Date().toISOString()}] 🔧 Init: Setting up EventBus...`);
            const { initializeEventBus } = require('./services/eventBus');
            initializeEventBus();

            // Initialize CORS origin cache
            console.log(`[${new Date().toISOString()}] 🔧 Init: Caching business origins...`);
            await refreshBusinessOrigins();
            // Refresh cache periodically
            setInterval(() => refreshBusinessOrigins().catch(() => {}), ORIGIN_CACHE_TTL);

            console.log(`[${new Date().toISOString()}] ✨ Init: All systems ready`);
        } catch (initErr) {
            console.error(`[${new Date().toISOString()}] ⚠️ Init: Non-fatal initialization error:`, initErr);
        }

        // Start server AFTER MongoDB is connected and initialized
        startServer();
    })
    .catch((err) => {
        console.error(`[${new Date().toISOString()}] ❌ MongoDB: FATAL connection error:`, err.message);
        console.error('📋 Connection details:', {
            uri: process.env.MONGODB_URI ? 'REDACTED (Present)' : 'MISSING',
            node_version: process.version,
            platform: process.platform
        });
        // Start server anyway for health check visibility, but it will report degraded
        startServer();
    });

// Routes
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const isOk = dbStatus === 1;

    res.status(isOk ? 200 : 503).json({
        status: isOk ? 'ok' : 'degraded',
        database: {
            state: dbStatus,
            connected: isOk
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Import routes
const verificationRoutes = require('./routes/verification');
const verificationV2Routes = require('./routes/verification-v2');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/admin-auth');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const casperidAuthRoutes = require('./routes/casperid-auth');
const passkeyAuthRoutes = require('./routes/passkey-auth');
const metamaskPermissionsRoutes = require('./routes/metamask-permissions');
const indexerRoutes = require('./routes/indexer');
const profileRoutes = require('./routes/profile');
const activityRoutes = require('./routes/activity');
const verifiedProfilesRoutes = require('./routes/verified-profiles');

// Use routes
app.use('/api', verificationRoutes);
app.use('/api/v2/verification', verificationV2Routes); // Updated verification flows (Layer 2/3)
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api', require('./routes/zk')); // ZK Proof Submission (Starknet)
app.use('/api/zk-claims', require('./routes/zk-claims')); // ZK Claim Proofs (Privacy-Preserving Claims)
app.use('/api/casperid', casperidAuthRoutes);
app.use('/api/passkey', passkeyAuthRoutes); // Passkey authentication (Layer 0/1)
app.use('/api/passkey/pairing/otp', require('./routes/otp-pairing')); // OTP Pairing (Extension-to-Web)
app.use('/api/passkey/context-did', require('./routes/context-did')); // Context DID Management (Layer 2+)
app.use('/api/metamask', metamaskPermissionsRoutes); // MetaMask Advanced Permissions (ERC-7715)
app.use('/api/indexer', indexerRoutes); // Blockchain event indexing
app.use('/api', profileRoutes); // Profile routes (GET /api/profile/:wallet, etc.)
app.use('/api', activityRoutes); // Activity log routes
app.use('/api', verifiedProfilesRoutes); // Verified profiles for sitemap
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', require('./routes/cns')); // CNS Name Resolution & Registration
app.use('/api/payment', require('./routes/payment')); // Premium CID Payments (RevenueCat & Boomfi)
app.use('/api/coupon', require('./routes/coupon')); // Coupon validation and claiming
app.use('/api/pending-session', require('./routes/pending-session')); // Mobile Passkey Handoff
app.use('/api/business', require('./routes/business')); // Business Platform (Identity-as-a-Service)
app.use('/api/oauth', require('./routes/oauth')); // Hosted authorization code flow
app.use('/.well-known', require('./routes/well-known')); // JWKS + OpenID Connect Discovery
app.use('/api/careers', require('./routes/careers')); // Career applications
app.use('/api/affiliates', require('./routes/affiliates')); // Affiliate applications
app.use('/api/quest', require('./routes/quest')); // Gamified Quest System
app.use('/api', require('./routes/reviews')); // Profile reviews / endorsements

// CSRF error handler (must be before general error handler)
app.use(csrfErrorHandler);

// Error handling middleware
app.use((err, req, res, next) => {
    // Don't log stack for expected errors like invalid JSON
    if (err.status && err.status < 500) {
        console.warn(`[${new Date().toISOString()}] Client error:`, err.message);
    } else {
        console.error(err.stack);
    }

    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode < 500 ? err.message : 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

module.exports = app;
