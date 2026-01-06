const router = require('express').Router();
const { ViewEvent, VerificationRequest, Credential } = require('../database/models');
const { requireAuth } = require('../middleware/auth');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * GET /api/activity-log
 * Fetch user's activity log from multiple sources
 */
router.get('/activity-log', requireAuth, async (req, res) => {
    try {
        const { wallet } = req.user;
        const { page = 1, limit = 10, type, search } = req.query;
        const skip = (page - 1) * limit;

        // Fetch from all sources
        const [views, verifications, credentials] = await Promise.all([
            ViewEvent.find({ ownerWallet: wallet }).sort({ timestamp: -1 }).limit(100).lean(),
            VerificationRequest.find({ wallet }).sort({ created_at: -1 }).limit(100).lean(),
            Credential.find({ wallet }).sort({ created_at: -1 }).limit(100).lean()
        ]);

        let activities = [];

        // 1. Process Profile Views
        activities.push(...views.map(view => {
            let parsedUA = null;
            if (view.userAgent) {
                const ua = new UAParser(view.userAgent);
                parsedUA = {
                    browser: ua.getBrowser(),
                    os: ua.getOS(),
                    device: ua.getDevice()
                };
            }

            // Resolve Location
            let location = view.location;
            let coordinates = view.coordinates;
            if (view.ip && !location) {
                const geo = geoip.lookup(view.ip);
                if (geo) {
                    location = `${geo.city}, ${geo.country}`;
                    coordinates = { lat: geo.ll[0], long: geo.ll[1] };
                }
            }

            return {
                id: view._id.toString(),
                type: 'visibility',
                typeColor: 'bg-blue-50 text-blue-600',
                action: 'Profile View',
                subText: view.endpoint || 'Public Profile',
                entity: view.viewerWallet === 'anonymous' ? 'Anonymous Visitor' : `${view.viewerWallet.substring(0, 12)}...`,
                entitySub: view.ip ? `IP: ${view.ip}` : null,
                date: new Date(view.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                time: new Date(view.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: 'Success',
                statusClass: 'bg-green-100 text-green-800',
                timestamp: view.timestamp, // for sorting
                // Enriched Metadata
                ip: view.ip,
                userAgent: view.userAgent,
                parsedUA,
                location,
                coordinates,
                accessFields: view.accessedFields
            };
        }));

        // 2. Process Verifications
        activities.push(...verifications.map(ver => {
            const tierLabels = {
                'layer_1': 'Basic Verification',
                'layer_3': 'Full KYC',
                'layer_1': 'Basic Verification',
                'layer_2': 'Liveness Check',
                'layer_3': 'Full KYC'
            };

            const statusMap = {
                'pending': { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
                'approved': { label: 'Success', class: 'bg-green-100 text-green-800' },
                'rejected': { label: 'Failed', class: 'bg-red-100 text-red-800' }
            };

            const statusInfo = statusMap[ver.status] || statusMap.pending;

            // Resolve Location if not present
            let location = ver.location;
            let coordinates = ver.coordinates;
            if (ver.ip && !location) {
                const geo = geoip.lookup(ver.ip);
                if (geo) {
                    location = `${geo.city}, ${geo.country}`;
                    coordinates = { lat: geo.ll[0], long: geo.ll[1] };
                }
            }

            // Parse UA
            let parsedUA = null;
            if (ver.userAgent) {
                const ua = new UAParser(ver.userAgent);
                parsedUA = { browser: ua.getBrowser(), os: ua.getOS(), device: ua.getDevice() };
            }

            return {
                id: ver._id.toString(),
                type: 'verified_user',
                typeColor: 'bg-primary/10 text-primary',
                action: 'KYC Verification',
                subText: tierLabels[ver.tier] || ver.tier,
                entity: 'CasperID Core',
                entitySub: location || (ver.ip ? `IP: ${ver.ip}` : null),
                date: new Date(ver.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                time: new Date(ver.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: statusInfo.label,
                statusClass: statusInfo.class,
                timestamp: ver.created_at,
                // Enriched
                ip: ver.ip,
                userAgent: ver.userAgent,
                parsedUA,
                location,
                coordinates,
                tier: ver.tier
            };
        }));

        // 3. Process Credentials
        activities.push(...credentials.map(cred => {
            // Resolve Location
            let location = cred.location;
            let coordinates = cred.coordinates;
            if (cred.ip && !location) {
                const geo = geoip.lookup(cred.ip);
                if (geo) {
                    location = `${geo.city}, ${geo.country}`;
                    coordinates = { lat: geo.ll[0], long: geo.ll[1] };
                }
            }

            // Parse UA
            let parsedUA = null;
            if (cred.userAgent) {
                const ua = new UAParser(cred.userAgent);
                parsedUA = { browser: ua.getBrowser(), os: ua.getOS(), device: ua.getDevice() };
            }

            return {
                id: cred._id.toString(),
                type: 'card_membership',
                typeColor: 'bg-indigo-50 text-indigo-600',
                action: 'Credential Issued',
                subText: 'Added to Wallet',
                entity: cred.issuer_id || 'CasperID',
                entitySub: location || (cred.ip ? `IP: ${cred.ip}` : null),
                date: new Date(cred.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                time: new Date(cred.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: 'Success',
                statusClass: 'bg-green-100 text-green-800',
                timestamp: cred.created_at,
                // Enriched
                ip: cred.ip,
                userAgent: cred.userAgent,
                parsedUA,
                location,
                coordinates,
                tier: cred.tier,
                credentialHash: cred.credential_hash
            };
        }));

        // Sort by date (descending)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Apply filters
        if (type && type !== 'all') {
            const typeMap = {
                'views': 'visibility',
                'verifications': 'verified_user',
                'credentials': 'card_membership'
            };
            const mappedType = typeMap[type] || type;
            activities = activities.filter(a => a.type === mappedType);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            activities = activities.filter(a =>
                a.action.toLowerCase().includes(searchLower) ||
                a.entity.toLowerCase().includes(searchLower)
            );
        }

        // Apply pagination
        const total = activities.length;
        const totalPages = Math.ceil(total / parseInt(limit));
        const paginatedActivities = activities.slice(skip, skip + parseInt(limit));

        res.json({
            activities: paginatedActivities,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: totalPages
            }
        });

    } catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({ error: 'Failed to fetch activity log' });
    }
});

/**
 * GET /api/activity-log/:id
 * Get detailed activity by ID (Already updated, but rewriting for safety/consistency)
 */
router.get('/activity-log/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { wallet } = req.user;

        let activity = null;
        let source = null;

        // Try ViewEvents
        const viewEvent = await ViewEvent.findById(id).lean();
        if (viewEvent && viewEvent.ownerWallet === wallet) {
            activity = viewEvent;
            source = 'view';
        }

        // Try Verifications
        if (!activity) {
            const verification = await VerificationRequest.findById(id).lean();
            if (verification && verification.wallet === wallet) {
                activity = verification;
                source = 'verification';
            }
        }

        // Try Credentials
        if (!activity) {
            const credential = await Credential.findById(id).lean();
            if (credential && credential.wallet === wallet) {
                activity = credential;
                source = 'credential';
            }
        }

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Enrich
        if (activity.userAgent) {
            const ua = new UAParser(activity.userAgent);
            activity.parsedUA = {
                browser: ua.getBrowser(),
                os: ua.getOS(),
                device: ua.getDevice()
            };
        }

        if (activity.ip && !activity.location) {
            const geo = geoip.lookup(activity.ip);
            if (geo) {
                activity.location = `${geo.city}, ${geo.country}`;
                activity.coordinates = { lat: geo.ll[0], long: geo.ll[1] };
            }
        }

        res.json(activity);

    } catch (error) {
        console.error('Activity detail error:', error);
        res.status(500).json({ error: 'Failed to fetch activity details' });
    }
});

module.exports = router;
