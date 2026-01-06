#!/usr/bin/env node

/**
 * Rollback Script: Rename wallet back to wallet_address in user_accounts collection
 * Run with: node server/scripts/rollback-wallet-field.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function rollbackWalletField() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/casperid';
        console.log(`🔗 Connecting to MongoDB: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('user_accounts');

        // Count documents to rollback
        const count = await collection.countDocuments({ wallet: { $exists: true } });
        console.log(`📊 Found ${count} documents with wallet field`);

        if (count === 0) {
            console.log('⚠️  No documents with wallet field found - nothing to rollback');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Show sample document before rollback
        const sampleBefore = await collection.findOne({ wallet: { $exists: true } });
        if (sampleBefore) {
            console.log('\n📄 Sample document before rollback:');
            console.log(`   user_id: ${sampleBefore.user_id}`);
            console.log(`   wallet: ${sampleBefore.wallet}`);
            console.log(`   wallet_address: ${sampleBefore.wallet_address || 'undefined'}`);
        }

        // Perform the rollback
        console.log('\n🔄 Starting rollback...');
        const result = await collection.updateMany(
            { wallet: { $exists: true } },
            { $rename: { wallet: 'wallet_address' } }
        );

        console.log(`\n✅ Rollback completed!`);
        console.log(`   - Matched: ${result.matchedCount} documents`);
        console.log(`   - Modified: ${result.modifiedCount} documents`);

        // Verify rollback
        const remainingNewField = await collection.countDocuments({ wallet: { $exists: true } });
        const oldFieldCount = await collection.countDocuments({ wallet_address: { $exists: true, $ne: null } });

        console.log('\n📊 Post-rollback verification:');
        console.log(`   - Documents with wallet: ${remainingNewField}`);
        console.log(`   - Documents with wallet_address: ${oldFieldCount}`);

        // Show sample document after rollback
        const sampleAfter = await collection.findOne({ user_id: sampleBefore?.user_id });
        if (sampleAfter) {
            console.log('\n📄 Sample document after rollback:');
            console.log(`   user_id: ${sampleAfter.user_id}`);
            console.log(`   wallet: ${sampleAfter.wallet || 'undefined'}`);
            console.log(`   wallet_address: ${sampleAfter.wallet_address}`);
        }

        if (remainingNewField === 0) {
            console.log('\n✅ Rollback verified successfully!');
        } else {
            console.warn('\n⚠️  Warning: Some documents still have wallet field');
        }

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Rollback failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run rollback
rollbackWalletField();
