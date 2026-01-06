#!/usr/bin/env node

/**
 * One-time migration script to sync all tier values
 * Run this after deploying the tier-sync utility
 * 
 * Usage:
 *   node sync-all-tiers.js              # Dry run (preview changes)
 *   node sync-all-tiers.js --apply      # Apply changes
 *   node sync-all-tiers.js --limit 100  # Test with 100 users
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { syncAllTiers } = require('../src/utils/tier-sync');

async function main() {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');
    const limitArg = args.find(arg => arg.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

    console.log('==========================================');
    console.log('   TIER SYNCHRONIZATION MIGRATION');
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

        // Run sync
        const stats = await syncAllTiers({
            limit,
            dryRun: !apply
        });

        console.log('\n==========================================');
        console.log('RESULTS:');
        console.log(`  Total users: ${stats.total}`);
        console.log(`  ✅ Synced: ${stats.synced}`);
        console.log(`  ⏭️  Skipped (already synced): ${stats.skipped}`);
        console.log(`  ❌ Errors: ${stats.errors}`);
        console.log('==========================================\n');

        if (!apply && stats.synced > 0) {
            console.log('💡 Run with --apply to save these changes');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

main();
