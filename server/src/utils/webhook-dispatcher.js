const axios = require('axios');
const crypto = require('crypto');
const { WebhookSubscription } = require('../database/models');

/**
 * Dispatch an event to all subscribed webhooks for a specific app.
 * Fire-and-forget: does not block the main thread, but handling guarantees are best-effort.
 *
 * @param {string} appId - The app_id owning the event
 * @param {string} eventType - e.g. 'user.verified', 'user.registered'
 * @param {object} payload - The data to send
 */
async function dispatchEvent(appId, eventType, payload) {
    try {
        if (!appId) return;

        // Find active subscriptions that listen to this event
        const subscriptions = await WebhookSubscription.find({
            app_id: appId,
            active: true,
            events: eventType
        });

        if (!subscriptions.length) return;

        console.log(`[Webhooks] Dispatching ${eventType} for ${appId} to ${subscriptions.length} subscribers`);

        // Send to all subscribers in parallel
        await Promise.allSettled(subscriptions.map(sub => sendWebhook(sub, eventType, payload)));

    } catch (error) {
        console.error('[Webhooks] Dispatch error:', error);
    }
}

/**
 * Send a single webhook with HMAC signature headers.
 */
async function sendWebhook(subscription, eventType, payload) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);

    // Construct signed content: timestamp + "." + json_payload
    const signaturePayload = `${timestamp}.${payloadString}`;

    // Sign using the subscription's secret
    const signature = crypto
        .createHmac('sha256', subscription.signing_secret)
        .update(signaturePayload)
        .digest('hex');

    try {
        await axios.post(subscription.url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CasperID-Webhook/1.0',
                'X-CasperID-Event': eventType,
                'X-CasperID-Signature': `t=${timestamp},v1=${signature}`,
                'X-CasperID-Delivery': crypto.randomUUID()
            },
            timeout: 5000 // 5s timeout to avoid hanging
        });
        // Success - typically we'd log delivery status to DB here
    } catch (error) {
        const status = error.response ? error.response.status : 'Network Error';
        console.error(`[Webhooks] Delivery failed to ${subscription.url} (${status}):`, error.message);
    }
}

module.exports = { dispatchEvent };
