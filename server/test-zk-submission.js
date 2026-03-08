/**
 * ZK Proof Submission Test
 *
 * This script tests the backend's /api/zk/submit-proof endpoint by:
 * 1. Creating a temporary test user and session directly in MongoDB.
 * 2. Generating a mock ZK proof payload.
 * 3. Submitting the proof to the backend.
 *
 * Run from project root: node server/test-zk-submission.js
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');

// Dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const API_URL = 'http://localhost:3001';

async function runTest() {
    console.log('🔌 Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Models are defined in server/src/database/models.js
    const models = require('./src/database/models');
    const { UserAccount, DeviceSession } = models;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Create Test User & Session
    // ═══════════════════════════════════════════════════════════════
    const testEmail = `zktest_${Date.now()}@casperid.test`;
    const testWallet = '0x' + crypto.randomBytes(32).toString('hex');

    console.log('👤 Creating temporary test user...');
    const user = new UserAccount({
        user_id: `user_zk_${Date.now()}`,
        recovery_email: testEmail,
        email_verified: true,
        wallet: testWallet,
        user_salt: crypto.randomBytes(16).toString('hex'),
        tier: 'layer_0'
    });
    await user.save();
    console.log(`   User created: ${user.user_id}`);

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session = new DeviceSession({
        session_id: `sess_zk_${Date.now()}`,
        user_id: user.user_id,
        credential_id: `cred_test_${Date.now()}`,
        session_token: sessionToken,
        device_fingerprint: 'test_device',
        ip_address: '127.0.0.1',
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        revoked: false
    });
    await session.save();
    console.log(`   Session created: ${sessionToken.slice(0, 10)}...`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Prepare Mock ZK Payload
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📦 Preparing mock ZK proof payload...');

    // This is a minimal mock payload since we are testing the RELAY, not the MATH
    // In a real environment, the circuit logic would have been verified by e2e_zk_test.js
    const payload = {
        proof: Buffer.from('mock-proof-data').toString('base64'),
        proofHash: '0x' + crypto.randomBytes(32).toString('hex').slice(0, 62),
        publicInputs: {
            nullifier: '0x' + crypto.randomBytes(32).toString('hex'),
            walletAddress: testWallet,
            sessionNonce: '0x' + crypto.randomBytes(16).toString('hex'),
            timestamp: Date.now()
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Submit to Backend
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🚀 Submitting to backend /api/zk/submit-proof...');

    try {
        // First, get CSRF token
        const csrfResponse = await fetch(`${API_URL}/api/csrf-token`);
        const { csrfToken } = await csrfResponse.json();
        const cookies = csrfResponse.headers.get('set-cookie');

        const response = await fetch(`${API_URL}/api/zk/submit-proof`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                'X-CSRF-Token': csrfToken,
                'Cookie': cookies
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('✅ Proof submission accepted!');
            console.log(`   Transaction Hash: ${result.transactionHash}`);
            console.log(`   Explorer URL: ${result.explorerUrl}`);
        } else {
            console.log('❌ Submission failed!');
            console.log(`   Status: ${response.status}`);
            console.log('   Full Response:', JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error('💥 Request failed:', err.message);
    }

    // ═══════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🧹 Cleaning up...');
    await UserAccount.deleteOne({ user_id: user.user_id });
    await DeviceSession.deleteOne({ session_id: session.session_id });
    await mongoose.disconnect();
    console.log('Done.');
}

runTest().catch(console.error);
