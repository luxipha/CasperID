const axios = require('axios');
const crypto = require('crypto');
const { WebhookSubscription, WebhookLog } = require('../database/models');
const { WEBHOOK_EVENTS } = require('../constants/webhook-events');

// Retry configuration
const RETRY_CONFIG = {
    maxRetries: 5,
    // Exponential backoff delays in milliseconds: 1s, 5s, 30s, 2min, 5min
    delays: [1000, 5000, 30000, 120000, 300000]
};

// In-memory retry queue (for simplicity; consider Bull/BullMQ for production scale)
const retryQueue = new Map();

/**
 * Dispatch an event to all subscribed webhooks for a specific app.
 * Fire-and-forget: does not block the main thread, but handling guarantees are best-effort.
 *
 * @param {string} appId - The app_id owning the event
 * @param {string} eventType - Event type from WEBHOOK_EVENTS constant
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
 * Send a single webhook with HMAC signature headers and log the delivery.
 * Supports automatic retries with exponential backoff.
 * @param {Object} subscription - Webhook subscription
 * @param {string} eventType - Event type
 * @param {Object} payload - Payload to send
 * @param {number} attempt - Current attempt number (0-based)
 * @param {string} deliveryId - Delivery ID (reused across retries)
 */
async function sendWebhook(subscription, eventType, payload, attempt = 0, deliveryId = null) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);
    deliveryId = deliveryId || crypto.randomUUID();
    const startTime = Date.now();

    // Construct signed content: timestamp + "." + json_payload
    const signaturePayload = `${timestamp}.${payloadString}`;

    // Sign using the subscription's secret
    const signature = crypto
        .createHmac('sha256', subscription.signing_secret)
        .update(signaturePayload)
        .digest('hex');

    // Create log entry (only on first attempt)
    let logEntry;
    if (attempt === 0) {
        logEntry = new WebhookLog({
            webhook_id: subscription._id,
            app_id: subscription.app_id,
            event_type: eventType,
            url: subscription.url,
            delivery_id: deliveryId,
            status: 'pending',
            request_payload: payload,
            retry_count: 0
        });
    }

    try {
        const response = await axios.post(subscription.url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CasperID-Webhook/1.0',
                'X-CasperID-Event': eventType,
                'X-CasperID-Signature': `t=${timestamp},v1=${signature}`,
                'X-CasperID-Delivery': deliveryId,
                'X-CasperID-Retry': attempt.toString()
            },
            timeout: 5000 // 5s timeout to avoid hanging
        });

        // Success - update log
        if (attempt === 0) {
            logEntry.status = 'success';
            logEntry.status_code = response.status;
            logEntry.duration_ms = Date.now() - startTime;
            logEntry.response_body = typeof response.data === 'string'
                ? response.data.substring(0, 2000)
                : JSON.stringify(response.data).substring(0, 2000);
            logEntry.save().catch(err => console.error('[Webhooks] Failed to save log:', err.message));
        } else {
            // Update existing log on retry success
            await WebhookLog.updateOne(
                { delivery_id: deliveryId },
                {
                    status: 'success',
                    status_code: response.status,
                    duration_ms: Date.now() - startTime,
                    retry_count: attempt,
                    error_message: null
                }
            );
            // Clear retry from queue
            retryQueue.delete(deliveryId);
            console.log(`[Webhooks] Retry ${attempt} succeeded for ${deliveryId}`);
        }

        // Update subscription stats
        WebhookSubscription.updateOne(
            { _id: subscription._id },
            { last_delivered_at: new Date(), failure_count: 0 }
        ).exec();

    } catch (error) {
        const statusCode = error.response?.status;
        const errorMessage = error.message || 'Unknown error';

        if (attempt === 0) {
            logEntry.status = 'failed';
            logEntry.status_code = statusCode;
            logEntry.error_message = errorMessage;
            logEntry.duration_ms = Date.now() - startTime;
            logEntry.response_body = error.response?.data
                ? JSON.stringify(error.response.data).substring(0, 2000)
                : null;
            logEntry.retry_count = 0;
            await logEntry.save().catch(err => console.error('[Webhooks] Failed to save log:', err.message));
        } else {
            // Update retry count on existing log
            await WebhookLog.updateOne(
                { delivery_id: deliveryId },
                {
                    status: 'failed',
                    status_code: statusCode,
                    error_message: errorMessage,
                    retry_count: attempt
                }
            );
        }

        console.error(`[Webhooks] Delivery failed to ${subscription.url} (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}):`, errorMessage);

        // Schedule retry if we haven't exhausted attempts
        if (attempt < RETRY_CONFIG.maxRetries) {
            const delay = RETRY_CONFIG.delays[attempt];
            console.log(`[Webhooks] Scheduling retry ${attempt + 1} for ${deliveryId} in ${delay}ms`);

            const timeoutId = setTimeout(() => {
                sendWebhook(subscription, eventType, payload, attempt + 1, deliveryId);
            }, delay);

            retryQueue.set(deliveryId, { timeoutId, attempt: attempt + 1 });
        } else {
            // All retries exhausted
            console.error(`[Webhooks] All retries exhausted for ${deliveryId}`);
            retryQueue.delete(deliveryId);

            // Mark as permanently failed
            await WebhookLog.updateOne(
                { delivery_id: deliveryId },
                { status: 'failed', error_message: `${errorMessage} (all ${RETRY_CONFIG.maxRetries} retries exhausted)` }
            );
        }

        // Increment failure count
        WebhookSubscription.updateOne(
            { _id: subscription._id },
            { $inc: { failure_count: 1 } }
        ).exec();
    }
}

/**
 * Send a test webhook (used by the test endpoint)
 * @param {Object} subscription - The webhook subscription
 * @param {Object} testPayload - The test payload to send
 * @returns {Promise<Object>} - Result with success status and details
 */
async function sendTestWebhook(subscription, testPayload) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(testPayload);
    const deliveryId = crypto.randomUUID();
    const startTime = Date.now();

    const signaturePayload = `${timestamp}.${payloadString}`;
    const signature = crypto
        .createHmac('sha256', subscription.signing_secret)
        .update(signaturePayload)
        .digest('hex');

    // Create log entry for test
    const logEntry = new WebhookLog({
        webhook_id: subscription._id,
        app_id: subscription.app_id,
        event_type: WEBHOOK_EVENTS.TEST_PING,
        url: subscription.url,
        delivery_id: deliveryId,
        status: 'pending',
        request_payload: testPayload
    });

    try {
        const response = await axios.post(subscription.url, testPayload, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CasperID-Webhook-Test/1.0',
                'X-CasperID-Event': WEBHOOK_EVENTS.TEST_PING,
                'X-CasperID-Signature': `t=${timestamp},v1=${signature}`,
                'X-CasperID-Delivery': deliveryId
            },
            timeout: 5000
        });

        logEntry.status = 'success';
        logEntry.status_code = response.status;
        logEntry.duration_ms = Date.now() - startTime;
        await logEntry.save();

        return {
            success: true,
            status_code: response.status,
            duration_ms: logEntry.duration_ms,
            delivery_id: deliveryId
        };
    } catch (error) {
        logEntry.status = 'failed';
        logEntry.status_code = error.response?.status;
        logEntry.error_message = error.message;
        logEntry.duration_ms = Date.now() - startTime;
        await logEntry.save();

        return {
            success: false,
            status_code: error.response?.status,
            error: error.message,
            duration_ms: logEntry.duration_ms,
            delivery_id: deliveryId
        };
    }
}

module.exports = { dispatchEvent, sendWebhook, sendTestWebhook };
