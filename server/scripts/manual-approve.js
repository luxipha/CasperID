
const mongoose = require('mongoose');
require('dotenv').config();
const { VerificationRequest } = require('../src/database/models');
const { mintCredential } = require('../src/utils/credential-minter');

async function approveRequest(walletAddress) {
    try {
        console.log(`🚀 Starting manual approval for: ${walletAddress}`);

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const request = await VerificationRequest.findOne({
            wallet: walletAddress,
            status: 'pending'
        });

        if (!request) {
            console.error('❌ No pending verification request found for this wallet.');
            process.exit(1);
        }

        console.log(`📄 Found request: ${request._id} (Tier: ${request.tier})`);

        // Call the system minter logic
        const result = await mintCredential(request);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS: Manual Approval Complete');
        console.log(`   Wallet: ${result.credential.wallet}`);
        console.log(`   Tier: ${result.credential.tier}`);
        console.log(`   Final Status: ${request.status}`);
        console.log(`   Tx Hash: ${result.tx_hash}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Approval failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

// Get wallet address from command line argument
const wallet = process.argv[2];
if (!wallet) {
    console.error('Usage: node scripts/manual-approve.js <wallet_address>');
    process.exit(1);
}

approveRequest(wallet);
