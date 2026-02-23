/**
 * Day 5 Test: Webhook System
 * 1. Starts a temporary HTTP server to receive webhooks.
 * 2. Creates a WebhookSubscription pointing to that server.
 * 3. Triggers the 'test.ping' event via the API.
 * 4. Verifies the received payload and HMAC signature.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const crypto = require('crypto');
const axios = require('axios'); // Use axios instead of node-fetch for easier CommonJS

(async () => {
    // -------------------------------------------------------
    // 1. Start Receiver Server
    // -------------------------------------------------------
    let receivedEvents = [];
    const PORT = 9999;
    const server = http.createServer((req, res) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            receivedEvents.push({
                headers: req.headers,
                body: JSON.parse(body || '{}')
            });
            res.writeHead(200);
            res.end('OK');
        });
    });
    server.listen(PORT);
    console.log(`📡 Receiver listening on ${PORT}`);

    try {
        // -------------------------------------------------------
        // Setup DB & Models
        // -------------------------------------------------------
        await mongoose.connect(process.env.MONGODB_URI);
        const { UserAccount, BusinessApp, WebhookSubscription, DeviceSession } = require('./src/database/models');
        const bcrypt = require('bcrypt');

        // Create test user/app
        const testUser = await UserAccount.findOne({ recovery_email: 'biztest@casperid.test' }) || await new UserAccount({
            recovery_email: 'biztest@casperid.test',
            email_verified: true,
            user_id: 'user_wh_test_' + Date.now(),
            tier: 'layer_1'
        }).save();

        const app_id = 'app_wh_' + Date.now();
        const app = await new BusinessApp({
            app_id,
            name: 'Webhook Test App',
            owner_user_id: testUser.user_id,
            active: true,
            environment: 'sandbox',
            api_secret_hash: await bcrypt.hash('secret', 10)
        }).save();

        // Create Session for Auth
        const sessionToken = crypto.randomBytes(32).toString('hex');
        await new DeviceSession({
            session_id: 'sess_wh_' + Date.now(),
            user_id: testUser.user_id,
            credential_id: 'cred_wh_' + Date.now(),
            session_token: sessionToken,
            expires_at: new Date(Date.now() + 3600000),
            revoked: false
        }).save();

        // -------------------------------------------------------
        // 2. Create Webhook Subscription
        // -------------------------------------------------------
        const webhookUrl = `http://localhost:${PORT}/webhook`;
        const res = await axios.post('http://localhost:3001/api/business/webhooks', {
            app_id,
            url: webhookUrl,
            events: ['user.verified', 'test.ping']
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            }
        });

        const data = res.data;
        if (!data.success) throw new Error('Failed to create webhook');

        const webhookId = data.webhook._id;
        const signingSecret = data.webhook.signing_secret;
        console.log(`✅ Webhook created: ${webhookId}`);

        // -------------------------------------------------------
        // 3. Trigger Test Event
        // -------------------------------------------------------
        console.log('🔫 Triggering test event...');
        const testRes = await axios.post(`http://localhost:3001/api/business/webhooks/${webhookId}/test`, {}, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });

        if (!testRes.data.success) throw new Error('Test trigger failed');
        console.log('✅ Test event triggered API response OK');

        // -------------------------------------------------------
        // 4. Verify Receipt & Signature
        // -------------------------------------------------------
        // Wait for async delivery
        await new Promise(r => setTimeout(r, 2000));

        if (receivedEvents.length === 0) {
            throw new Error('No event received by local server');
        }

        const event = receivedEvents[0];
        const signatureHeader = event.headers['x-casperid-signature'];

        // Parse signature header: t=123,v1=hex
        const parts = signatureHeader.split(',');
        const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1];
        const v1 = parts.find(p => p.startsWith('v1=')).split('=')[1];

        // Reconstruct signature
        const payloadString = JSON.stringify(event.body);
        const expectedSignature = crypto
            .createHmac('sha256', signingSecret)
            .update(`${timestamp}.${payloadString}`)
            .digest('hex');

        if (v1 === expectedSignature) {
            console.log('✅ HMAC Signature Verified!');
        } else {
            console.error('❌ Signature Mismatch!');
            console.error('Expected:', expectedSignature);
            console.error('Received:', v1);
            process.exit(1);
        }

        // Cleanup
        await WebhookSubscription.deleteOne({ _id: webhookId });
        await BusinessApp.deleteOne({ app_id });
        await DeviceSession.deleteOne({ session_token: sessionToken });

        console.log('🎉 Day 5 Webhook Test Passed');
        process.exit(0);

    } catch (err) {
        console.error('💥 Error:', err.message);
        if (err.response) console.error('Response:', err.response.data);
        process.exit(1);
    }
})();
