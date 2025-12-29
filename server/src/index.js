// Datadog APM - Must be imported and initialized FIRST
const tracer = require('dd-trace').init({
    service: 'casperid-api',
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    logInjection: true,
    analytics: true,
    runtimeMetrics: false, // Disabled - requires agent
    profiling: false // Disabled - requires agent
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
        
        // Schedule rate limit cleanup
        const { cleanupOldRecords } = require('./utils/rate-limiter');
        setInterval(cleanupOldRecords, 60 * 60 * 1000); // Cleanup every hour
    })
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CasperID API is running',
        timestamp: new Date().toISOString()
    });
});

// Import routes
const verificationRoutes = require('./routes/verification');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/admin-auth');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const casperidAuthRoutes = require('./routes/casperid-auth');
const profileRoutes = require('./routes/profile');
const verifiedProfilesRoutes = require('./routes/verified-profiles');

// Use routes
app.use('/api', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api/casperid', casperidAuthRoutes);
app.use('/api', profileRoutes); // Profile routes (GET /api/profile/:wallet, etc.)
app.use('/api', verifiedProfilesRoutes); // Verified profiles for sitemap
app.use('/api/notifications', require('./routes/notifications'));

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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CasperID API server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
