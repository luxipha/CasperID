/**
 * EventBus Module
 *
 * Central event system for CasperID. Import this module to emit events
 * or to access the EventBus for custom subscriptions.
 *
 * Usage:
 *   const { eventBus, EVENTS } = require('./services/eventBus');
 *   eventBus.emit(EVENTS.USER_REGISTERED, { userId, email, ... });
 */

const eventBus = require('./EventBus');
const { EVENTS, EVENT_CATEGORIES, EMAIL_EVENTS, WEBHOOK_EVENTS, ACTIVITY_EVENTS } = require('./events');
const EmailSubscriber = require('./subscribers/EmailSubscriber');
const ActivitySubscriber = require('./subscribers/ActivitySubscriber');
const WebhookSubscriber = require('./subscribers/WebhookSubscriber');

/**
 * Initialize the EventBus with all subscribers
 * Call this once during server startup
 */
function initializeEventBus() {
    console.log('[EventBus] Initializing...');

    // Register all subscribers
    eventBus.registerSubscriber('email', EmailSubscriber);
    eventBus.registerSubscriber('activity', ActivitySubscriber);
    eventBus.registerSubscriber('webhook', WebhookSubscriber);

    console.log('[EventBus] Initialization complete');
    console.log('[EventBus] Stats:', eventBus.getStats());

    return eventBus;
}

/**
 * Graceful shutdown - clean up subscribers
 */
function shutdownEventBus() {
    console.log('[EventBus] Shutting down...');
    eventBus.unregisterSubscriber('email');
    eventBus.unregisterSubscriber('activity');
    eventBus.unregisterSubscriber('webhook');
    eventBus.removeAllListeners();
}

module.exports = {
    // Core
    eventBus,
    EVENTS,
    EVENT_CATEGORIES,

    // Event lists for reference
    EMAIL_EVENTS,
    WEBHOOK_EVENTS,
    ACTIVITY_EVENTS,

    // Lifecycle
    initializeEventBus,
    shutdownEventBus,

    // Subscribers (for testing/custom use)
    EmailSubscriber,
    ActivitySubscriber,
    WebhookSubscriber
};
