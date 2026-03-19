/**
 * Business Platform Webhook Event Types
 *
 * These constants define all webhook events that can be subscribed to
 * by business apps integrating with CasperID.
 */

const WEBHOOK_EVENTS = {
    // User lifecycle events
    USER_VERIFIED: 'user.verified',
    USER_REGISTERED: 'user.registered',
    USER_CREATED: 'user.created',

    // KYC events
    KYC_COMPLETED: 'kyc.completed',

    // Session events
    SESSION_REVOKED: 'session.revoked',

    // System events
    TEST_PING: 'test.ping'
};

// Array of all subscribable events (excluding test.ping for normal subscriptions)
const SUBSCRIBABLE_EVENTS = [
    WEBHOOK_EVENTS.USER_VERIFIED,
    WEBHOOK_EVENTS.USER_REGISTERED,
    WEBHOOK_EVENTS.KYC_COMPLETED,
    WEBHOOK_EVENTS.SESSION_REVOKED
];

// Array of all valid events (including system events)
const ALL_EVENTS = [
    ...SUBSCRIBABLE_EVENTS,
    WEBHOOK_EVENTS.USER_CREATED,
    WEBHOOK_EVENTS.TEST_PING
];

module.exports = {
    WEBHOOK_EVENTS,
    SUBSCRIBABLE_EVENTS,
    ALL_EVENTS
};
