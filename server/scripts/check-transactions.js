/**
 * Script to check transaction status on Casper testnet
 * Run: node scripts/check-transactions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { CasperClient } = require('casper-js-sdk');

const MONGODB_URI = process.env.MONGODB_URI;
const RPC_API = process.env.CASPER_NODE_URL || 'https://rpc.testnet.casperlabs.io/rpc';

// Simple Credential schema for query
const credentialSchema = new mongoose.Schema({
    wallet: String,
    tier: String,
    onchain_tx_hash: String,
    created_at: Date
});

async function checkTransactions() {
    console.log('=== Casper Transaction Status Checker ===\n');
    console.log('RPC:', RPC_API);

    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const Credential = mongoose.model('Credential', credentialSchema);

        // Find all credentials with onchain_tx_hash
        const credentials = await Credential.find({
            onchain_tx_hash: { $exists: true, $ne: null, $ne: '' }
        }).sort({ created_at: -1 }).limit(20);

        console.log(`Found ${credentials.length} credentials with transaction hashes\n`);

        if (credentials.length === 0) {
            console.log('No credentials with transaction hashes found.');
            await mongoose.disconnect();
            return;
        }

        // Initialize Casper client
        const client = new CasperClient(RPC_API);

        console.log('Checking transaction status on Casper testnet...\n');
        console.log('=' .repeat(100));

        for (const cred of credentials) {
            const txHash = cred.onchain_tx_hash;
            const wallet = cred.wallet?.substring(0, 30) + '...';
            const tier = cred.tier;
            const date = cred.created_at?.toISOString().split('T')[0] || 'N/A';

            console.log(`\nWallet: ${wallet}`);
            console.log(`Tier: ${tier}`);
            console.log(`Date: ${date}`);
            console.log(`TX Hash: ${txHash}`);

            try {
                // Query deploy info from Casper
                const deployInfo = await client.getDeploy(txHash);

                if (deployInfo && deployInfo[1]) {
                    const executionResults = deployInfo[1].execution_results;

                    if (executionResults && executionResults.length > 0) {
                        const result = executionResults[0].result;

                        if (result.Success) {
                            console.log(`Status: ✅ SUCCESS`);
                            console.log(`Explorer: https://testnet.cspr.live/deploy/${txHash}`);
                        } else if (result.Failure) {
                            console.log(`Status: ❌ FAILED`);
                            console.log(`Error: ${result.Failure.error_message || JSON.stringify(result.Failure)}`);
                            console.log(`Explorer: https://testnet.cspr.live/deploy/${txHash}`);
                        }
                    } else {
                        console.log(`Status: ⏳ PENDING (no execution results yet)`);
                        console.log(`Explorer: https://testnet.cspr.live/deploy/${txHash}`);
                    }
                } else {
                    console.log(`Status: ❓ UNKNOWN (deploy info not available)`);
                }
            } catch (error) {
                if (error.message?.includes('deploy not known') || error.message?.includes('not found')) {
                    console.log(`Status: ⚠️  NOT FOUND ON CHAIN`);
                    console.log(`Reason: Deploy hash not found - transaction may not have been submitted successfully`);
                } else {
                    console.log(`Status: ⚠️  ERROR checking: ${error.message}`);
                }
            }

            console.log('-'.repeat(100));
        }

        console.log('\n=== Summary ===');
        console.log(`Checked ${credentials.length} transactions`);
        console.log('\nIf transactions show FAILED or NOT FOUND:');
        console.log('1. The issuer may not be authorized in the contract');
        console.log('2. Run: node scripts/diagnose-issuer.js to check issuer status');
        console.log('3. Run: node scripts/add-issuer.js to add the issuer (requires deployer keys)');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkTransactions();
