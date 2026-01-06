#!/usr/bin/env node

/**
 * Migration: Rename layer_status to tier in UserAccount schema
 * Run this ONCE to standardize the field name across the system
 * 
 * Usage:
 *   node rename-layer-status-to-tier.js         # Dry run
 *   node rename-layer-status-to-tier.js --apply # Apply changes
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function main() {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');

    console.log('==========================================');
    console.log('   RENAME layer_status → tier');
    console.log('==========================================\n');

    if (!apply) {
        console.log('🔍 DRY RUN MODE - No changes will be saved');
        console.log('   Run with --apply to make actual changes\n');
    } else {
        console.log('⚠️  LIVE MODE - Changes will be saved!');
        console.log('   Press Ctrl+C now to cancel\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/casperID');
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const userAccountsCollection = db.collection('useraccounts');

        // Count documents with layer_status field
        const docsWithLayerStatus = await userAccountsCollection.countDocuments({ layer_status: { $exists: true } });
        console.log(`Found ${docsWithLayerStatus} documents with 'layer_status' field\n`);

        if (docsWithLayerStatus === 0) {
            console.log('✅ No documents to migrate!');
            return;
        }

        if (!apply) {
            console.log('Preview of changes:');
            const samples = await userAccountsCollection.find({ layer_status: { $exists: true } }).limit(5).toArray();
            samples.forEach(doc => {
                console.log(`  ${doc.wallet}: layer_status='${doc.layer_status}' → tier='${doc.layer_status}'`);
            });
            console.log(`  ... and ${docsWithLayerStatus - samples.length} more\n`);
            console.log('💡 Run with --apply to execute the migration');
            return;
        }

        // Perform the rename
        console.log('🔄 Renaming field...');
        const result = await userAccountsCollection.updateMany(
            { layer_status: { $exists: true } },
            { $rename: { layer_status: 'tier' } }
        );

        console.log(`\n✅ Migration complete!`);
        console.log(`   Modified: ${result.modifiedCount} documents`);
        console.log(`   Matched: ${result.matchedCount} documents`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

main();
