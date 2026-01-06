#!/usr/bin/env node

/**
 * Migration Script: Rename wallet_address to wallet in user_accounts collection
 * Run with: node server/scripts/migrate-wallet-field.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrateWalletField() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/casperid';
        console.log(`🔗 Connecting to MongoDB: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('user_accounts');

        // Count documents to migrate
        const count = await collection.countDocuments({ wallet_address: { $exists: true } });
        console.log(`📊 Found ${count} documents with wallet_address field`);

        if (count === 0) {
            console.log('✅ No migration needed - all documents already use wallet field');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Show sample document before migration
        const sampleBefore = await collection.findOne({ wallet_address: { $exists: true } });
        if (sampleBefore) {
            console.log('\n📄 Sample document before migration:');
            console.log(`   user_id: ${sampleBefore.user_id}`);
            console.log(`   wallet_address: ${sampleBefore.wallet_address}`);
            console.log(`   wallet: ${sampleBefore.wallet || 'undefined'}`);
        }

        // Perform the migration
        console.log('\n🔄 Starting migration...');
        const result = await collection.updateMany(
            { wallet_address: { $exists: true } },
            { $rename: { wallet_address: 'wallet' } }
        );

        console.log(`\n✅ Migration completed!`);
        console.log(`   - Matched: ${result.matchedCount} documents`);
        console.log(`   - Modified: ${result.modifiedCount} documents`);

        // Verify migration
        const remainingOldField = await collection.countDocuments({ wallet_address: { $exists: true } });
        const newFieldCount = await collection.countDocuments({ wallet: { $exists: true, $ne: null } });

        console.log('\n📊 Post-migration verification:');
        console.log(`   - Documents with wallet_address: ${remainingOldField}`);
        console.log(`   - Documents with wallet: ${newFieldCount}`);

        // Show sample document after migration
        const sampleAfter = await collection.findOne({ user_id: sampleBefore?.user_id });
        if (sampleAfter) {
            console.log('\n📄 Sample document after migration:');
            console.log(`   user_id: ${sampleAfter.user_id}`);
            console.log(`   wallet_address: ${sampleAfter.wallet_address || 'undefined'}`);
            console.log(`   wallet: ${sampleAfter.wallet}`);
        }

        if (remainingOldField === 0) {
            console.log('\n✅ Migration verified successfully!');
        } else {
            console.warn('\n⚠️  Warning: Some documents still have wallet_address field');
        }

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run migration
migrateWalletField();
