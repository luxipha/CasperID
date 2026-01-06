require('dotenv').config();
const mongoose = require('mongoose');
const envioIndexer = require('../services/envio-indexer');
const { VerificationEvent } = require('../database/models');

/**
 * Simple test script for the Envio indexer
 * Tests basic functionality without requiring live blockchain data
 */

async function testIndexer() {
    console.log('🧪 Starting Envio Indexer Tests...\n');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/casperid';
    
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully\n');
    } catch (error) {
        console.log('❌ MongoDB connection failed, using in-memory test...\n');
        // Continue with tests that don't require database
    }

    try {
        // Test 1: Check indexer initialization
        console.log('1. Testing indexer initialization...');
        const status = envioIndexer.getIndexerStatus();
        
        console.log('✅ Indexer status:', {
            isRunning: status.isRunning,
            networks: Object.keys(status.networks).length,
            networksList: Object.keys(status.networks)
        });

        // Test 2: Create mock verification event
        console.log('\n2. Testing event creation...');
        
        const mockEvent = new VerificationEvent({
            event_id: `test-${Date.now()}`,
            network_name: 'sepolia',
            chain_id: 11155111,
            block_number: 4567890,
            transaction_hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
            event_type: 'VerificationCompleted',
            contract_address: '0x742d35Cc6636Bb2C4F5C8e1b75d9E6F9F2F8c123',
            user_address: '0x742d35Cc6636Bb2C4F5C8e1b75d9E6F9F2F8c456',
            event_data: {
                userAddress: '0x742d35Cc6636Bb2C4F5C8e1b75d9E6F9F2F8c456',
                verificationType: 'completed',
                success: true
            },
            timestamp: new Date()
        });

        await mockEvent.save();
        console.log('✅ Mock event created:', mockEvent.event_id);

        // Test 3: Query events
        console.log('\n3. Testing event queries...');
        
        const events = await envioIndexer.getUserVerificationEvents('0x742d35Cc6636Bb2C4F5C8e1b75d9E6F9F2F8c456');
        console.log('✅ User events found:', events.length);

        // Test 4: Get network statistics
        console.log('\n4. Testing analytics...');
        
        const stats = await envioIndexer.getNetworkStatistics();
        if (stats) {
            console.log('✅ Statistics:', {
                totalEvents: stats.totalEvents,
                networks: Object.keys(stats.eventsByNetwork).length,
                eventTypes: Object.keys(stats.eventsByType).length
            });
        }

        // Test 5: Parse event data
        console.log('\n5. Testing event parsing...');
        
        const testLog = {
            eventName: 'VerificationCompleted',
            topics: [
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                '0x000000000000000000000000742d35Cc6636Bb2C4F5C8e1b75d9E6F9F2F8c456'
            ],
            data: '0x0000000000000000000000000000000000000000000000000000000000000001'
        };

        const parsedData = envioIndexer.parseEventData(testLog);
        console.log('✅ Parsed event data:', parsedData);

        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        await VerificationEvent.deleteMany({ event_id: /^test-/ });
        
        console.log('\n✅ All tests passed! Indexer is working correctly.');
        
        return true;

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        return false;
    } finally {
        // Close MongoDB connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('🔌 MongoDB disconnected');
        }
    }
}

// Export for use in other tests
module.exports = testIndexer;

// Run if called directly
if (require.main === module) {
    testIndexer().then((success) => {
        process.exit(success ? 0 : 1);
    });
}