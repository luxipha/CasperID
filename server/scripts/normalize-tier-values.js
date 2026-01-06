#!/usr/bin/env node

/**
 * Migration: Normalize tier values in database
 * Converts legacy 'basic' and 'full_kyc' to standard 'layer_1' and 'layer_3'
 * 
 * Usage:
 *   node normalize-tier-values.js         # Dry run
 *   node normalize-tier-values.js --apply # Apply changes
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function main() {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');

    console.log('==========================================');
    console.log('   NORMALIZE TIER VALUES');
    console.log('   basic → layer_1');
    console.log('   full_kyc → layer_3');
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

        // Migrate UserAccount collection
        console.log('🔄 Checking UserAccount collection...');
        const userAccountsCollection = db.collection('useraccounts');

        const userBasicCount = await userAccountsCollection.countDocuments({ tier: 'basic' });
        const userFullKycCount = await userAccountsCollection.countDocuments({ tier: 'full_kyc' });

        console.log(`  Found ${userBasicCount} 'basic' tier users`);
        console.log(`  Found ${userFullKycCount} 'full_kyc' tier users`);

        if (apply && (userBasicCount > 0 || userFullKycCount > 0)) {
            console.log('  Updating...');
            const basicResult = await userAccountsCollection.updateMany(
                { tier: 'basic' },
                { $set: { tier: 'layer_1' } }
            );
            const fullKycResult = await userAccountsCollection.updateMany(
                { tier: 'full_kyc' },
                { $set: { tier: 'layer_3' } }
            );
            console.log(`  ✅ Updated ${basicResult.modifiedCount} basic → layer_1`);
            console.log(`  ✅ Updated ${fullKycResult.modifiedCount} full_kyc → layer_3\n`);
        } else if (!apply) {
            console.log('  (Dry run - no changes made)\n');
        } else {
            console.log('  ✅ No updates needed\n');
        }

        // Migrate IdentityCredential collection
        console.log('🔄 Checking IdentityCredential collection...');
        const credentialsCollection = db.collection('identitycredentials');

        const credBasicCount = await credentialsCollection.countDocuments({ tier: 'basic' });
        const credFullKycCount = await credentialsCollection.countDocuments({ tier: 'full_kyc' });

        console.log(`  Found ${credBasicCount} 'basic' tier credentials`);
        console.log(`  Found ${credFullKycCount} 'full_kyc' tier credentials`);

        if (apply && (credBasicCount > 0 || credFullKycCount > 0)) {
            console.log('  Updating...');
            const basicResult = await credentialsCollection.updateMany(
                { tier: 'basic' },
                { $set: { tier: 'layer_1' } }
            );
            const fullKycResult = await credentialsCollection.updateMany(
                { tier: 'full_kyc' },
                { $set: { tier: 'layer_3' } }
            );
            console.log(`  ✅ Updated ${basicResult.modifiedCount} basic → layer_1`);
            console.log(`  ✅ Updated ${fullKycResult.modifiedCount} full_kyc → layer_3\n`);
        } else if (!apply) {
            console.log('  (Dry run - no changes made)\n');
        } else {
            console.log('  ✅ No updates needed\n');
        }

        // Also check VerificationRequest collection
        console.log('🔄 Checking VerificationRequest collection...');
        const requestsCollection = db.collection('verificationrequests');

        const reqBasicCount = await requestsCollection.countDocuments({ tier: 'basic' });
        const reqFullKycCount = await requestsCollection.countDocuments({ tier: 'full_kyc' });

        console.log(`  Found ${reqBasicCount} 'basic' tier requests`);
        console.log(`  Found ${reqFullKycCount} 'full_kyc' tier requests`);

        if (apply && (reqBasicCount > 0 || reqFullKycCount > 0)) {
            console.log('  Updating...');
            const basicResult = await requestsCollection.updateMany(
                { tier: 'basic' },
                { $set: { tier: 'layer_1' } }
            );
            const fullKycResult = await requestsCollection.updateMany(
                { tier: 'full_kyc' },
                { $set: { tier: 'layer_3' } }
            );
            console.log(`  ✅ Updated ${basicResult.modifiedCount} basic → layer_1`);
            console.log(`  ✅ Updated ${fullKycResult.modifiedCount} full_kyc → layer_3\n`);
        } else if (!apply) {
            console.log('  (Dry run - no changes made)\n');
        } else {
            console.log('  ✅ No updates needed\n');
        }

        console.log('==========================================');
        console.log('MIGRATION COMPLETE!');
        console.log('==========================================');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

main();
