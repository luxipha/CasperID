/**
 * Business Platform Webhook Event Types
 *
 * These constants define all webhook events that can be subscribed to
 * by business apps integrating with CasperID.
 */

export const WEBHOOK_EVENTS = {
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
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];

// Array of events available for subscription in the UI
export const SUBSCRIBABLE_EVENTS: WebhookEventType[] = [
    WEBHOOK_EVENTS.USER_VERIFIED,
    WEBHOOK_EVENTS.USER_REGISTERED,
    WEBHOOK_EVENTS.KYC_COMPLETED,
    WEBHOOK_EVENTS.SESSION_REVOKED
];

// Human-readable labels for events
export const EVENT_LABELS: Record<WebhookEventType, string> = {
    [WEBHOOK_EVENTS.USER_VERIFIED]: 'User Verified',
    [WEBHOOK_EVENTS.USER_REGISTERED]: 'User Registered',
    [WEBHOOK_EVENTS.USER_CREATED]: 'User Created',
    [WEBHOOK_EVENTS.KYC_COMPLETED]: 'KYC Completed',
    [WEBHOOK_EVENTS.SESSION_REVOKED]: 'Session Revoked',
    [WEBHOOK_EVENTS.TEST_PING]: 'Test Ping'
};

// Event descriptions for UI
export const EVENT_DESCRIPTIONS: Record<WebhookEventType, string> = {
    [WEBHOOK_EVENTS.USER_VERIFIED]: 'Triggered when a user completes identity verification',
    [WEBHOOK_EVENTS.USER_REGISTERED]: 'Triggered when a new user registers via your app',
    [WEBHOOK_EVENTS.USER_CREATED]: 'Triggered when a user account is created',
    [WEBHOOK_EVENTS.KYC_COMPLETED]: 'Triggered when KYC verification is completed',
    [WEBHOOK_EVENTS.SESSION_REVOKED]: 'Triggered when a user session is revoked',
    [WEBHOOK_EVENTS.TEST_PING]: 'Test event for verifying webhook connectivity'
};
