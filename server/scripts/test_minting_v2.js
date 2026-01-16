require('dotenv').config();
const { Keys, CasperClient, Contracts, CLValueBuilder, RuntimeArgs, CLPublicKey } = require('casper-js-sdk');
const { getVerificationStatus, mintDID } = require('../src/services/casper');

/**
 * Test script for IdentityRegistry V2 Delegated Minting
 */
async function testMintingFlow() {
    console.log('🚀 Starting IdentityRegistry V2 Test...');
    console.log('📍 Contract:', process.env.CONTRACT_HASH);

    try {
        // 1. Generate a fresh user wallet
        const userKeys = Keys.Ed25519.new();
        const userAddress = userKeys.publicKey.toHex();
        console.log(`👤 New User Address: ${userAddress}`);

        // 2. Check initial status (should be null/0)
        console.log('🔍 Checking initial on-chain status...');
        const initialStatus = await getVerificationStatus(userAddress);
        console.log('📊 Initial Status:', initialStatus);

        // 3. Mint DID via Backend (Issuer)
        console.log('💎 Minting DID for user (Backend paying gas)...');
        const deployHash = await mintDID(userAddress, 'layer_1');
        console.log(`✅ Mint request sent! Deploy Hash: ${deployHash}`);
        console.log(`🔗 Link: https://testnet.cspr.live/transaction/${deployHash}`);

        console.log('\n⏳ Waiting for block confirmation (30-60s)...');
        console.log('Once confirmed, run this script again or check the explorer to verify the tier changed to 1.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
    }
}

testMintingFlow();
