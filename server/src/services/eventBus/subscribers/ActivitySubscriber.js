/**
 * ActivitySubscriber - Logs events to the Notification model
 *
 * This creates activity records that show up in the user's activity feed.
 * It complements the existing ViewEvent, VerificationRequest, and Credential
 * models by adding explicit notification records for key events.
 */

const { EVENTS, ACTIVITY_EVENTS } = require('../events');

class ActivitySubscriber {
    constructor() {
        this.name = 'activity';
        this._handlers = new Map();
        this._Notification = null; // Lazy-loaded to avoid circular deps
        this._setupHandlers();
    }

    /**
     * Get Notification model (lazy load)
     */
    _getNotificationModel() {
        if (!this._Notification) {
            const { Notification } = require('../../../database/models');
            this._Notification = Notification;
        }
        return this._Notification;
    }

    /**
     * Subscribe to EventBus events
     * @param {EventBus} eventBus
     */
    subscribe(eventBus) {
        for (const [event, handler] of this._handlers) {
            eventBus.on(event, handler);
        }
        console.log(`[ActivitySubscriber] Subscribed to ${this._handlers.size} events`);
    }

    /**
     * Unsubscribe from EventBus
     * @param {EventBus} eventBus
     */
    unsubscribe(eventBus) {
        for (const [event, handler] of this._handlers) {
            eventBus.off(event, handler);
        }
    }

    /**
     * Setup event handlers
     */
    _setupHandlers() {
        // User lifecycle
        this._handlers.set(EVENTS.USER_REGISTERED, this._handleUserRegistered.bind(this));
        this._handlers.set(EVENTS.USER_LOGIN, this._handleUserLogin.bind(this));
        this._handlers.set(EVENTS.USER_APP_AUTH, this._handleUserAppAuth.bind(this));

        // Verification
        this._handlers.set(EVENTS.VERIFICATION_L2_COMPLETED, this._handleVerificationCompleted.bind(this));
        this._handlers.set(EVENTS.VERIFICATION_L3_COMPLETED, this._handleVerificationCompleted.bind(this));
        this._handlers.set(EVENTS.VERIFICATION_REJECTED, this._handleVerificationRejected.bind(this));

        // Payment
        this._handlers.set(EVENTS.PAYMENT_COMPLETED, this._handlePaymentCompleted.bind(this));

        // CNS
        this._handlers.set(EVENTS.CNS_REGISTERED, this._handleCnsRegistered.bind(this));

        // Security
        this._handlers.set(EVENTS.SECURITY_NEW_DEVICE, this._handleSecurityEvent.bind(this));
        this._handlers.set(EVENTS.SECURITY_PASSKEY_ADDED, this._handleSecurityEvent.bind(this));
        this._handlers.set(EVENTS.SECURITY_PASSKEY_REMOVED, this._handleSecurityEvent.bind(this));
    }

    /**
     * Create a notification record
     */
    async _createNotification(data) {
        try {
            const Notification = this._getNotificationModel();
            await Notification.create({
                user_id: data.userId,
                recipientWallet: data.wallet,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.metadata || {},
                read: false,
                createdAt: new Date()
            });
            console.log(`[ActivitySubscriber] Created notification: ${data.type} for ${data.userId || data.wallet}`);
        } catch (error) {
            console.error(`[ActivitySubscriber] Failed to create notification:`, error.message);
        }
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    async _handleUserRegistered(payload) {
        const { userId, wallet, email } = payload;

        await this._createNotification({
            userId,
            wallet,
            type: 'account_created',
            title: 'Welcome to CasperID',
            message: 'Your account has been created successfully. Complete your profile to get started.',
            metadata: { email, eventId: payload._meta?.eventId }
        });
    }

    async _handleUserLogin(payload) {
        const { userId, wallet, method, ip, isNewDevice } = payload;

        // Only log new device logins to avoid cluttering activity feed
        if (!isNewDevice) return;

        await this._createNotification({
            userId,
            wallet,
            type: 'new_login',
            title: 'New Login Detected',
            message: `Login via ${method} from a new device`,
            metadata: { method, ip, eventId: payload._meta?.eventId }
        });
    }

    async _handleUserAppAuth(payload) {
        const { userId, wallet, appId, appName, scopes } = payload;

        await this._createNotification({
            userId,
            wallet,
            type: 'app_authorized',
            title: 'App Authorization',
            message: `You authorized "${appName}" to access your identity`,
            metadata: { appId, appName, scopes, eventId: payload._meta?.eventId }
        });
    }

    async _handleVerificationCompleted(payload) {
        const { userId, wallet, tier } = payload;
        const tierLabel = tier === 'layer_3' ? 'Full KYC' : tier === 'layer_2' ? 'Liveness' : 'Basic';

        await this._createNotification({
            userId,
            wallet,
            type: 'verification_approved',
            title: 'Verification Complete',
            message: `Your ${tierLabel} verification has been approved`,
            metadata: { tier, eventId: payload._meta?.eventId }
        });
    }

    async _handleVerificationRejected(payload) {
        const { userId, wallet, tier, reason, requestId } = payload;

        await this._createNotification({
            userId,
            wallet,
            type: 'verification_rejected',
            title: 'Verification Update',
            message: reason || 'Your verification request was not approved',
            metadata: { tier, reason, requestId, eventId: payload._meta?.eventId }
        });
    }

    async _handlePaymentCompleted(payload) {
        const { userId, wallet, amount, currency, items, transactionId } = payload;

        await this._createNotification({
            userId,
            wallet,
            type: 'payment_completed',
            title: 'Payment Confirmed',
            message: `Payment of ${amount} ${currency} for ${items} completed successfully`,
            metadata: { amount, currency, items, transactionId, eventId: payload._meta?.eventId }
        });
    }

    async _handleCnsRegistered(payload) {
        const { userId, wallet, domainName } = payload;

        await this._createNotification({
            userId,
            wallet,
            type: 'cns_registered',
            title: 'Domain Registered',
            message: `${domainName}.cid has been registered to your account`,
            metadata: { domainName, eventId: payload._meta?.eventId }
        });
    }

    async _handleSecurityEvent(payload) {
        const { userId, wallet } = payload;
        const eventName = payload._meta?.eventName;

        const eventConfig = {
            [EVENTS.SECURITY_NEW_DEVICE]: {
                type: 'security_new_device',
                title: 'New Device Login',
                message: 'A new device was used to access your account'
            },
            [EVENTS.SECURITY_PASSKEY_ADDED]: {
                type: 'security_passkey_added',
                title: 'Passkey Added',
                message: `A new passkey "${payload.passkeyName || 'Unnamed'}" was added`
            },
            [EVENTS.SECURITY_PASSKEY_REMOVED]: {
                type: 'security_passkey_removed',
                title: 'Passkey Removed',
                message: `Passkey "${payload.passkeyName || 'Unnamed'}" was removed`
            }
        };

        const config = eventConfig[eventName];
        if (!config) return;

        await this._createNotification({
            userId,
            wallet,
            type: config.type,
            title: config.title,
            message: config.message,
            metadata: { ...payload, eventId: payload._meta?.eventId }
        });
    }
}

module.exports = new ActivitySubscriber();
module.exports.ActivitySubscriber = ActivitySubscriber;
