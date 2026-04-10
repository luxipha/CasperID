/**
 * Internal Event Constants
 * These events are emitted by various services and consumed by subscribers
 * (Email, Activity Logger, Webhook Dispatcher)
 */

const EVENTS = {
    // ==========================================
    // USER LIFECYCLE EVENTS
    // ==========================================

    /**
     * Emitted when a new user registers (passkey created)
     * Payload: { userId, email, name, wallet, tier }
     */
    USER_REGISTERED: 'user.registered',

    /**
     * Emitted when user logs in via any method
     * Payload: { userId, email, wallet, method: 'passkey'|'otp'|'oauth', ip, userAgent, isNewDevice }
     */
    USER_LOGIN: 'user.login',

    /**
     * Emitted when user authenticates to a third-party app
     * Payload: { userId, email, wallet, appId, appName, scopes, ip, userAgent }
     */
    USER_APP_AUTH: 'user.app_auth',

    // ==========================================
    // VERIFICATION EVENTS
    // ==========================================

    /**
     * Emitted when Layer 2 (liveness) verification completes
     * Payload: { userId, email, name, wallet, tier: 'layer_2' }
     */
    VERIFICATION_L2_COMPLETED: 'verification.l2_completed',

    /**
     * Emitted when Layer 3 (KYC) verification is approved
     * Payload: { userId, email, name, wallet, tier: 'layer_3', dappId? }
     */
    VERIFICATION_L3_COMPLETED: 'verification.l3_completed',

    /**
     * Emitted when verification is rejected
     * Payload: { userId, email, name, wallet, tier, reason, requestId }
     */
    VERIFICATION_REJECTED: 'verification.rejected',

    // ==========================================
    // PROFILE EVENTS
    // ==========================================

    /**
     * Emitted when someone views a public profile
     * Payload: { ownerWallet, ownerEmail, ownerTier, viewerName, viewerIp, profileUrl }
     */
    PROFILE_VIEWED: 'profile.viewed',

    /**
     * Emitted when profile reaches 100% completion
     * Payload: { userId, email, name, wallet, profileUrl }
     */
    PROFILE_COMPLETED: 'profile.completed',

    /**
     * Emitted when profile is updated
     * Payload: { userId, wallet, updatedFields, completeness }
     */
    PROFILE_UPDATED: 'profile.updated',

    // ==========================================
    // PAYMENT EVENTS
    // ==========================================

    /**
     * Emitted when a payment is completed successfully
     * Payload: { userId, email, wallet, amount, currency, items, transactionId, provider }
     */
    PAYMENT_COMPLETED: 'payment.completed',

    /**
     * Emitted when a payment fails
     * Payload: { userId, email, wallet, amount, currency, reason, transactionId }
     */
    PAYMENT_FAILED: 'payment.failed',

    // ==========================================
    // CNS (NAME SERVICE) EVENTS
    // ==========================================

    /**
     * Emitted when a .cid name is registered
     * Payload: { userId, email, wallet, domainName, years, transactionId }
     */
    CNS_REGISTERED: 'cns.registered',

    // ==========================================
    // SECURITY EVENTS
    // ==========================================

    /**
     * Emitted on new device login
     * Payload: { userId, email, wallet, device, ip, location }
     */
    SECURITY_NEW_DEVICE: 'security.new_device',

    /**
     * Emitted when passkey is added
     * Payload: { userId, email, wallet, passkeyName, device }
     */
    SECURITY_PASSKEY_ADDED: 'security.passkey_added',

    /**
     * Emitted when passkey is removed
     * Payload: { userId, email, wallet, passkeyName }
     */
    SECURITY_PASSKEY_REMOVED: 'security.passkey_removed',

    /**
     * Emitted on suspicious activity detection
     * Payload: { userId, email, wallet, activityType, details }
     */
    SECURITY_SUSPICIOUS: 'security.suspicious',

    // ==========================================
    // SESSION EVENTS
    // ==========================================

    /**
     * Emitted when a session is revoked
     * Payload: { userId, wallet, sessionId, revokedBy }
     */
    SESSION_REVOKED: 'session.revoked'
};

/**
 * Event categories for filtering/routing
 */
const EVENT_CATEGORIES = {
    USER: ['user.registered', 'user.login', 'user.app_auth'],
    VERIFICATION: ['verification.l2_completed', 'verification.l3_completed', 'verification.rejected'],
    PROFILE: ['profile.viewed', 'profile.completed', 'profile.updated'],
    PAYMENT: ['payment.completed', 'payment.failed'],
    CNS: ['cns.registered'],
    SECURITY: ['security.new_device', 'security.passkey_added', 'security.passkey_removed', 'security.suspicious'],
    SESSION: ['session.revoked']
};

/**
 * Events that should trigger emails
 */
const EMAIL_EVENTS = [
    EVENTS.USER_REGISTERED,
    EVENTS.USER_LOGIN,
    EVENTS.USER_APP_AUTH,
    EVENTS.VERIFICATION_L2_COMPLETED,
    EVENTS.VERIFICATION_L3_COMPLETED,
    EVENTS.VERIFICATION_REJECTED,
    EVENTS.PROFILE_VIEWED,
    EVENTS.PROFILE_COMPLETED,
    EVENTS.PAYMENT_COMPLETED,
    EVENTS.CNS_REGISTERED,
    EVENTS.SECURITY_NEW_DEVICE,
    EVENTS.SECURITY_PASSKEY_ADDED,
    EVENTS.SECURITY_PASSKEY_REMOVED,
    EVENTS.SECURITY_SUSPICIOUS
];

/**
 * Events that should trigger external webhooks
 */
const WEBHOOK_EVENTS = [
    EVENTS.USER_REGISTERED,
    EVENTS.VERIFICATION_L2_COMPLETED,
    EVENTS.VERIFICATION_L3_COMPLETED,
    EVENTS.SESSION_REVOKED
];

/**
 * Events that should be logged to activity
 */
const ACTIVITY_EVENTS = [
    EVENTS.USER_REGISTERED,
    EVENTS.USER_LOGIN,
    EVENTS.USER_APP_AUTH,
    EVENTS.VERIFICATION_L2_COMPLETED,
    EVENTS.VERIFICATION_L3_COMPLETED,
    EVENTS.VERIFICATION_REJECTED,
    EVENTS.PROFILE_VIEWED,
    EVENTS.PAYMENT_COMPLETED,
    EVENTS.CNS_REGISTERED,
    EVENTS.SECURITY_NEW_DEVICE,
    EVENTS.SECURITY_PASSKEY_ADDED,
    EVENTS.SECURITY_PASSKEY_REMOVED
];

module.exports = {
    EVENTS,
    EVENT_CATEGORIES,
    EMAIL_EVENTS,
    WEBHOOK_EVENTS,
    ACTIVITY_EVENTS
};
