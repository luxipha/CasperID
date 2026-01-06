const express = require('express');
const router = express.Router();
const envioIndexer = require('../services/envio-indexer');
const { securityHeaders } = require('../middleware/validation');

/**
 * Envio Indexer API Routes
 * Provides endpoints for blockchain event indexing and querying
 */

// Apply security headers
router.use(securityHeaders);

// ============================================
// INDEXER CONTROL
// ============================================

/**
 * Start the blockchain event indexer
 * POST /api/indexer/start
 */
router.post('/start', async (req, res) => {
    try {
        await envioIndexer.startIndexing();
        
        res.json({
            success: true,
            message: 'Indexer started successfully',
            status: envioIndexer.getIndexerStatus()
        });
        
    } catch (error) {
        console.error('Failed to start indexer:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Stop the blockchain event indexer
 * POST /api/indexer/stop
 */
router.post('/stop', async (req, res) => {
    try {
        envioIndexer.stopIndexing();
        
        res.json({
            success: true,
            message: 'Indexer stopped successfully'
        });
        
    } catch (error) {
        console.error('Failed to stop indexer:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get indexer status and metrics
 * GET /api/indexer/status
 */
router.get('/status', async (req, res) => {
    try {
        const status = envioIndexer.getIndexerStatus();
        const stats = await envioIndexer.getNetworkStatistics();
        
        res.json({
            success: true,
            indexer: status,
            statistics: stats
        });
        
    } catch (error) {
        console.error('Failed to get indexer status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// EVENT QUERIES
// ============================================

/**
 * Get verification events for a user
 * GET /api/indexer/user/:address/events
 */
router.get('/user/:address/events', async (req, res) => {
    try {
        const { address } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({
                success: false,
                error: 'Valid Ethereum address required'
            });
        }
        
        const events = await envioIndexer.getUserVerificationEvents(address);
        
        // Apply pagination
        const paginatedEvents = events.slice(offset, offset + parseInt(limit));
        
        res.json({
            success: true,
            events: paginatedEvents,
            total: events.length,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: events.length > offset + parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Failed to get user events:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get events for a specific transaction
 * GET /api/indexer/transaction/:hash/events
 */
router.get('/transaction/:hash/events', async (req, res) => {
    try {
        const { hash } = req.params;
        
        if (!hash || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
            return res.status(400).json({
                success: false,
                error: 'Valid transaction hash required'
            });
        }
        
        const events = await envioIndexer.getTransactionEvents(hash);
        
        res.json({
            success: true,
            events,
            total: events.length
        });
        
    } catch (error) {
        console.error('Failed to get transaction events:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get network statistics and analytics
 * GET /api/indexer/analytics
 */
router.get('/analytics', async (req, res) => {
    try {
        const stats = await envioIndexer.getNetworkStatistics();
        
        if (!stats) {
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve analytics'
            });
        }
        
        res.json({
            success: true,
            analytics: stats
        });
        
    } catch (error) {
        console.error('Failed to get analytics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Search events by criteria
 * POST /api/indexer/search
 */
router.post('/search', async (req, res) => {
    try {
        const {
            networks = [],
            eventTypes = [],
            userAddress,
            fromBlock,
            toBlock,
            startDate,
            endDate,
            limit = 100,
            offset = 0
        } = req.body;
        
        const { VerificationEvent } = require('../database/models');
        
        // Build query
        const query = {};
        
        if (networks.length > 0) {
            query.network_name = { $in: networks };
        }
        
        if (eventTypes.length > 0) {
            query.event_type = { $in: eventTypes };
        }
        
        if (userAddress) {
            if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid Ethereum address required'
                });
            }
            query.user_address = userAddress.toLowerCase();
        }
        
        if (fromBlock || toBlock) {
            query.block_number = {};
            if (fromBlock) query.block_number.$gte = parseInt(fromBlock);
            if (toBlock) query.block_number.$lte = parseInt(toBlock);
        }
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        
        // Execute search
        const totalCount = await VerificationEvent.countDocuments(query);
        const events = await VerificationEvent.find(query)
            .sort({ timestamp: -1, block_number: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            events,
            total: totalCount,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: totalCount > offset + parseInt(limit)
            },
            query: query
        });
        
    } catch (error) {
        console.error('Search failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get real-time event stream (SSE)
 * GET /api/indexer/stream
 */
router.get('/stream', async (req, res) => {
    try {
        const { networks, eventTypes, userAddress } = req.query;
        
        // Set up Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });
        
        // Build filter criteria
        const filter = {};
        if (networks) filter.network_name = { $in: networks.split(',') };
        if (eventTypes) filter.event_type = { $in: eventTypes.split(',') };
        if (userAddress) filter.user_address = userAddress.toLowerCase();
        
        // Send initial status
        res.write(`data: ${JSON.stringify({
            type: 'status',
            message: 'Connected to event stream',
            timestamp: new Date().toISOString()
        })}\n\n`);
        
        // Set up MongoDB change stream (if supported)
        const { VerificationEvent } = require('../database/models');
        
        try {
            const changeStream = VerificationEvent.watch([
                { $match: { 'fullDocument.operationType': 'insert' } }
            ]);
            
            changeStream.on('change', (change) => {
                const event = change.fullDocument;
                
                // Apply filters
                if (filter.network_name && !filter.network_name.$in.includes(event.network_name)) {
                    return;
                }
                if (filter.event_type && !filter.event_type.$in.includes(event.event_type)) {
                    return;
                }
                if (filter.user_address && event.user_address !== filter.user_address) {
                    return;
                }
                
                // Send event to client
                res.write(`data: ${JSON.stringify({
                    type: 'event',
                    event: event,
                    timestamp: new Date().toISOString()
                })}\n\n`);
            });
            
            // Handle client disconnect
            req.on('close', () => {
                changeStream.close();
            });
            
        } catch (streamError) {
            // Fallback to polling if change streams not supported
            console.log('Change streams not available, using polling fallback');
            
            let lastEventTime = new Date();
            
            const pollInterval = setInterval(async () => {
                try {
                    const newEvents = await VerificationEvent.find({
                        ...filter,
                        timestamp: { $gt: lastEventTime }
                    }).sort({ timestamp: 1 });
                    
                    for (const event of newEvents) {
                        res.write(`data: ${JSON.stringify({
                            type: 'event',
                            event: event,
                            timestamp: new Date().toISOString()
                        })}\n\n`);
                        
                        lastEventTime = event.timestamp;
                    }
                    
                } catch (pollError) {
                    console.error('Polling error:', pollError);
                }
            }, 5000); // Poll every 5 seconds
            
            req.on('close', () => {
                clearInterval(pollInterval);
            });
        }
        
        // Send heartbeat every 30 seconds
        const heartbeat = setInterval(() => {
            res.write(`data: ${JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
            })}\n\n`);
        }, 30000);
        
        req.on('close', () => {
            clearInterval(heartbeat);
        });
        
    } catch (error) {
        console.error('Stream setup failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;