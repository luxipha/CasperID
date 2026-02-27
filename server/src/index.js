require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 8080;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// MongoDB injection prevention
app.use(mongoSanitize());

// Core Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3002',
            'http://localhost:5173',
            'https://casper-id.netlify.app',
            'https://casperid.com',
            'https://www.casperid.com',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Allow chrome-extension URLs or ngrok URLs for development
        if (origin.startsWith('chrome-extension://') || origin.includes('ngrok') || origin.includes('ngrok-free.app')) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ error: 'Invalid JSON' });
            return;
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('✅ MongoDB connected successfully');

        // Initialize admin system
        const { initializeDefaultAdmin } = require('./utils/admin-auth');
        await initializeDefaultAdmin();

        // Initialize JWT secret rotation with database backing
        const { initializeJWTRotation } = require('./utils/jwt-rotation-db');
        await initializeJWTRotation();

        // Initialize RSA key pair for business-scoped RS256 tokens
        const { initializeRsaKeys } = require('./utils/rsa-key-manager');
        await initializeRsaKeys();

        // Schedule rate limit cleanup
        const { cleanupOldRecords } = require('./utils/rate-limiter');
        setInterval(cleanupOldRecords, 60 * 60 * 1000); // Cleanup every hour

        // Start server only AFTER database is ready
        app.listen(PORT, () => {
            console.log(`🚀 CasperID API server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection FATAL error:', err.message);
        console.error('📋 Connection details:', {
            uri: process.env.MONGODB_URI ? 'REDACTED (Present)' : 'MISSING',
            node_version: process.version,
            platform: process.platform
        });
        process.exit(1); // Exit if we can't connect to DB
    });

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
        db_state: mongoose.connection.readyState,
        message: 'CasperID API is running',
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
app.use('/api/pending-session', require('./routes/pending-session')); // Mobile Passkey Handoff
app.use('/api/business', require('./routes/business')); // Business Platform (Identity-as-a-Service)
app.use('/.well-known', require('./routes/well-known')); // JWKS + OpenID Connect Discovery
app.use('/api/careers', require('./routes/careers')); // Career applications
app.use('/api/affiliates', require('./routes/affiliates')); // Affiliate applications

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
