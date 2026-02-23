/**
 * Test script for CasperID Business Platform endpoints
 * Creates a real DeviceSession directly in MongoDB and uses it to test all /api/business/* routes
 */
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const API = 'http://localhost:3001';

async function run() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected\n');

    const { UserAccount, DeviceSession } = require('./server/src/database/models');

    // --- Step 1: Find or create a test user ---
    let user = await UserAccount.findOne({ recovery_email: 'biztest@casperid.test' });
    if (!user) {
        console.log('📝 Creating test user...');
        user = new UserAccount({
            user_id: `user_biztest_${Date.now()}`,
            recovery_email: 'biztest@casperid.test',
            email_verified: true,
            user_salt: crypto.randomBytes(16).toString('hex'),
            tier: 'layer_0'
        });
        await user.save();
        console.log(`   Created: ${user.user_id}`);
    } else {
        console.log(`   Using existing test user: ${user.user_id}`);
    }

    // --- Step 2: Create a valid DeviceSession ---
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session = new DeviceSession({
        session_id: `sess_test_${Date.now()}`,
        user_id: user.user_id,
        session_token: sessionToken,
        device_fingerprint: 'test_device',
        ip_address: '127.0.0.1',
        device_info: { type: 'test' },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revoked: false
    });
    await session.save();
    console.log(`   Session token: ${sessionToken.slice(0, 20)}...\n`);

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
    };

    let createdAppId = null;

    // --- Test 1: Create an app ---
    console.log('🧪 Test 1: POST /api/business/apps (create app)');
    const createRes = await fetch(`${API}/api/business/apps`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Test Restaurant App',
            allowed_origins: ['https://restaurant.com', 'http://localhost:3000'],
            environment: 'sandbox'
        })
    });
    const createData = await createRes.json();
    console.log(`   Status: ${createRes.status}`);
    console.log(`   Success: ${createData.success}`);
    if (createData.success) {
        console.log(`   App ID: ${createData.app.app_id}`);
        console.log(`   API Secret (first 30 chars): ${createData.api_secret?.slice(0, 30)}...`);
        createdAppId = createData.app.app_id;
        console.log('   ✅ PASS\n');
    } else {
        console.log(`   ❌ FAIL: ${createData.error}\n`);
    }

    // --- Test 2: List apps ---
    console.log('🧪 Test 2: GET /api/business/apps (list apps)');
    const listRes = await fetch(`${API}/api/business/apps`, { headers });
    const listData = await listRes.json();
    console.log(`   Status: ${listRes.status}`);
    console.log(`   Apps found: ${listData.apps?.length}`);
    if (listData.success && listData.apps?.length > 0) {
        console.log(`   First: ${listData.apps[0].app_id} — ${listData.apps[0].name}`);
        console.log('   ✅ PASS\n');
    } else {
        console.log(`   ❌ FAIL: ${JSON.stringify(listData)}\n`);
    }

    // --- Test 3: Get single app ---
    if (createdAppId) {
        console.log(`🧪 Test 3: GET /api/business/apps/${createdAppId}`);
        const getRes = await fetch(`${API}/api/business/apps/${createdAppId}`, { headers });
        const getData = await getRes.json();
        console.log(`   Status: ${getRes.status}`);
        console.log(`   Name: ${getData.app?.name}`);
        console.log(`   Environment: ${getData.app?.environment}`);
        console.log(`   api_secret_hash exposed? ${'api_secret_hash' in (getData.app || {})}`);
        if (getData.success && !getData.app?.api_secret_hash) {
            console.log('   ✅ PASS (hash not exposed)\n');
        } else {
            console.log(`   ❌ FAIL\n`);
        }
    }

    // --- Test 4: Rotate key ---
    if (createdAppId) {
        console.log(`🧪 Test 4: POST /api/business/apps/${createdAppId}/rotate-key`);
        const rotateRes = await fetch(`${API}/api/business/apps/${createdAppId}/rotate-key`, {
            method: 'POST',
            headers
        });
        const rotateData = await rotateRes.json();
        console.log(`   Status: ${rotateRes.status}`);
        console.log(`   New secret (first 20 chars): ${rotateData.api_secret?.slice(0, 20)}...`);
        if (rotateData.success && rotateData.api_secret) {
            console.log('   ✅ PASS\n');
        } else {
            console.log(`   ❌ FAIL: ${rotateData.error}\n`);
        }
    }

    // --- Test 5: Max apps guard (just verify it won't crash, not hitting limit) ---
    console.log('🧪 Test 5: Duplicate create works fine (under limit)');
    const dup = await fetch(`${API}/api/business/apps`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Second App', environment: 'production' })
    });
    const dupData = await dup.json();
    console.log(`   Status: ${dup.status}`);
    console.log(`   Second app_id: ${dupData.app?.app_id?.slice(0, 20)}...`);
    if (dupData.success) {
        console.log('   ✅ PASS\n');
        // cleanup second app
        await fetch(`${API}/api/business/apps/${dupData.app.app_id}`, { method: 'DELETE', headers });
    } else {
        console.log(`   ❌ FAIL: ${dupData.error}\n`);
    }

    // --- Test 6: Delete app ---
    if (createdAppId) {
        console.log(`🧪 Test 6: DELETE /api/business/apps/${createdAppId}`);
        const delRes = await fetch(`${API}/api/business/apps/${createdAppId}`, {
            method: 'DELETE',
            headers
        });
        const delData = await delRes.json();
        console.log(`   Status: ${delRes.status}`);
        if (delData.success) {
            console.log('   ✅ PASS\n');
        } else {
            console.log(`   ❌ FAIL: ${delData.error}\n`);
        }

        // Verify it's gone
        const checkRes = await fetch(`${API}/api/business/apps/${createdAppId}`, { headers });
        const checkData = await checkRes.json();
        console.log(`   Verify deleted — status: ${checkRes.status}, success: ${checkData.success}`);
        if (checkRes.status === 404) {
            console.log('   ✅ 404 confirmed after delete\n');
        }
    }

    // --- Cleanup: revoke session ---
    await DeviceSession.deleteOne({ session_token: sessionToken });
    console.log('🧹 Test session cleaned up');

    await mongoose.disconnect();
    console.log('\n🎉 All tests complete!');
}

run().catch(err => {
    console.error('Test failed:', err.message);
    process.exit(1);
});
