/**
 * Test script for CasperID Business Platform endpoints
 * Run from: /server directory
 */
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

const API = 'http://localhost:3001';

async function apiFetch(path, opts = {}) {
    const { default: fetch } = await import('node-fetch');
    return fetch(`${API}${path}`, opts);
}

async function run() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected\n');

    const { UserAccount, DeviceSession } = require('../src/database/models');

    // --- Create a test user ---
    let user = await UserAccount.findOne({ recovery_email: 'biztest@casperid.test' });
    if (!user) {
        user = new UserAccount({
            user_id: `user_biztest_${Date.now()}`,
            recovery_email: 'biztest@casperid.test',
            email_verified: true,
            user_salt: crypto.randomBytes(16).toString('hex'),
            tier: 'layer_0'
        });
        await user.save();
        console.log(`📝 Created test user: ${user.user_id}`);
    } else {
        console.log(`👤 Using test user: ${user.user_id}`);
    }

    // --- Mint a DeviceSession ---
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session = new DeviceSession({
        session_id: `sess_test_${Date.now()}`,
        user_id: user.user_id,
        credential_id: `cred_test_${Date.now()}`,
        session_token: sessionToken,
        device_fingerprint: 'test_device',
        ip_address: '127.0.0.1',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revoked: false
    });
    await session.save();
    console.log(`🔑 Session: ${sessionToken.slice(0, 20)}...\n`);

    const h = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
    };

    let pass = 0, fail = 0;
    let createdAppId = null;
    let secondAppId = null;

    async function test(label, fn) {
        process.stdout.write(`🧪 ${label} ... `);
        try {
            const result = await fn();
            if (result) { console.log('✅ PASS'); pass++; }
            else { console.log('❌ FAIL'); fail++; }
        } catch (e) {
            console.log(`❌ ERROR: ${e.message}`); fail++;
        }
    }

    // T1: Auth guard
    await test('GET /api/business/apps without token → 401', async () => {
        const r = await apiFetch('/api/business/apps');
        const d = await r.json();
        return r.status === 401 && d.error;
    });

    // T2: Create app
    await test('POST /api/business/apps → creates app with api_secret', async () => {
        const r = await apiFetch('/api/business/apps', {
            method: 'POST', headers: h,
            body: JSON.stringify({ name: 'Test Restaurant App', allowed_origins: ['https://restaurant.com'], environment: 'sandbox' })
        });
        const d = await r.json();
        createdAppId = d.app?.app_id;
        return r.status === 201 && d.success && d.api_secret && d.app.app_id.startsWith('app_') && !d.app.api_secret_hash;
    });

    // T3: List apps
    await test('GET /api/business/apps → returns apps array', async () => {
        const r = await apiFetch('/api/business/apps', { headers: h });
        const d = await r.json();
        return r.status === 200 && d.success && Array.isArray(d.apps) && d.apps.length > 0;
    });

    // T4: Get single app (no hash exposed)
    await test(`GET /api/business/apps/:id → no api_secret_hash exposed`, async () => {
        const r = await apiFetch(`/api/business/apps/${createdAppId}`, { headers: h });
        const d = await r.json();
        return r.status === 200 && d.success && d.app.name === 'Test Restaurant App' && !d.app.api_secret_hash;
    });

    // T5: Wrong owner can't access
    await test('GET /api/business/apps/fake_id → 404', async () => {
        const r = await apiFetch('/api/business/apps/app_nonexistent123456789', { headers: h });
        return r.status === 404;
    });

    // T6: Rotate key
    await test('POST /api/business/apps/:id/rotate-key → returns new secret', async () => {
        const r = await apiFetch(`/api/business/apps/${createdAppId}/rotate-key`, {
            method: 'POST', headers: h, body: '{}'
        });
        const d = await r.json();
        return r.status === 200 && d.success && d.api_secret?.startsWith('sk_');
    });

    // T7: Patch app
    await test('PATCH /api/business/apps/:id → updates name', async () => {
        const r = await apiFetch(`/api/business/apps/${createdAppId}`, {
            method: 'PATCH', headers: h,
            body: JSON.stringify({ name: 'Updated Name' })
        });
        const d = await r.json();
        return r.status === 200 && d.success && d.app.name === 'Updated Name';
    });

    // T8: Create second app
    await test('POST  second app → succeeds', async () => {
        const r = await apiFetch('/api/business/apps', {
            method: 'POST', headers: h,
            body: JSON.stringify({ name: 'Production App', environment: 'production' })
        });
        const d = await r.json();
        secondAppId = d.app?.app_id;
        return r.status === 201 && d.success;
    });

    // T9: Delete first app
    await test('DELETE /api/business/apps/:id → deactivates', async () => {
        const r = await apiFetch(`/api/business/apps/${createdAppId}`, { method: 'DELETE', headers: h });
        const d = await r.json();
        return r.status === 200 && d.success;
    });

    // T10: Deleted app no longer accessible
    await test('GET deleted app → 404', async () => {
        const r = await apiFetch(`/api/business/apps/${createdAppId}`, { headers: h });
        return r.status === 404;
    });

    // T11: Webhook create
    await test('POST /api/business/webhooks → creates subscription', async () => {
        const r = await apiFetch('/api/business/webhooks', {
            method: 'POST', headers: h,
            body: JSON.stringify({ app_id: secondAppId, url: 'https://restaurant.com/hooks', events: ['user.verified', 'kyc.completed'] })
        });
        const d = await r.json();
        return r.status === 201 && d.success && d.webhook.signing_secret?.startsWith('whsec_');
    });

    // T12: Webhook list
    await test('GET /api/business/webhooks?app_id=... → returns list', async () => {
        const r = await apiFetch(`/api/business/webhooks?app_id=${secondAppId}`, { headers: h });
        const d = await r.json();
        return r.status === 200 && d.success && d.webhooks.length > 0 && !d.webhooks[0].signing_secret;
    });

    // Cleanup
    await apiFetch(`/api/business/apps/${secondAppId}`, { method: 'DELETE', headers: h });
    await DeviceSession.deleteOne({ session_token: sessionToken });
    console.log('\n🧹 Cleaned up test session and apps');

    console.log(`\n📊 Results: ${pass} passed, ${fail} failed out of ${pass + fail} tests`);
    if (fail === 0) console.log('🎉 All tests passed!');

    await mongoose.disconnect();
    process.exit(fail > 0 ? 1 : 0);
}

run().catch(err => {
    console.error('\n💥 Script error:', err.message);
    process.exit(1);
});
