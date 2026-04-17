/**
 * WebhookSubscriber - Dispatches events to external app webhooks
 *
 * This bridges internal events to the external webhook system,
 * translating internal event names to external webhook event names.
 */

const { EVENTS, WEBHOOK_EVENTS } = require('../events');
const { WEBHOOK_EVENTS: EXTERNAL_WEBHOOK_EVENTS } = require('../../../constants/webhook-events');

class WebhookSubscriber {
    constructor() {
        this.name = 'webhook';
        this._handlers = new Map();
        this._dispatchEvent = null; // Lazy-loaded to avoid circular deps
        this._setupHandlers();
    }

    /**
     * Get dispatchEvent function (lazy load)
     */
    _getDispatcher() {
        if (!this._dispatchEvent) {
            const { dispatchEvent } = require('../../../utils/webhook-dispatcher');
            this._dispatchEvent = dispatchEvent;
        }
        return this._dispatchEvent;
    }

    /**
     * Subscribe to EventBus events
     * @param {EventBus} eventBus
     */
    subscribe(eventBus) {
        for (const [event, handler] of this._handlers) {
            eventBus.on(event, handler);
        }
        console.log(`[WebhookSubscriber] Subscribed to ${this._handlers.size} events`);
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
        // User registered -> user.registered webhook
        this._handlers.set(EVENTS.USER_REGISTERED, this._handleUserRegistered.bind(this));

        // Verification completed -> kyc.completed webhook
        this._handlers.set(EVENTS.VERIFICATION_L2_COMPLETED, this._handleVerificationCompleted.bind(this));
        this._handlers.set(EVENTS.VERIFICATION_L3_COMPLETED, this._handleVerificationCompleted.bind(this));

        // Session revoked -> session.revoked webhook
        this._handlers.set(EVENTS.SESSION_REVOKED, this._handleSessionRevoked.bind(this));
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    async _handleUserRegistered(payload) {
        const { userId, wallet, dappId } = payload;

        // Only dispatch if this registration is for an external app
        if (!dappId || dappId === 'casperid-internal') return;

        try {
            const dispatchEvent = this._getDispatcher();
            await dispatchEvent(dappId, EXTERNAL_WEBHOOK_EVENTS.USER_REGISTERED, {
                user_id: userId,
                wallet: wallet,
                registered_at: new Date().toISOString()
            });
            console.log(`[WebhookSubscriber] Dispatched user.registered to ${dappId}`);
        } catch (error) {
            console.error(`[WebhookSubscriber] user.registered dispatch failed:`, error.message);
        }
    }

    async _handleVerificationCompleted(payload) {
        const { userId, wallet, tier, dappId } = payload;

        // Only dispatch if this verification is for an external app
        if (!dappId || dappId === 'casperid-internal') return;

        try {
            const dispatchEvent = this._getDispatcher();
            await dispatchEvent(dappId, EXTERNAL_WEBHOOK_EVENTS.KYC_COMPLETED, {
                user_id: userId,
                wallet: wallet,
                tier: tier,
                completed_at: new Date().toISOString(),
                verification_type: tier === 'layer_3' ? 'kyc' : 'liveness'
            });
            console.log(`[WebhookSubscriber] Dispatched kyc.completed to ${dappId}`);
        } catch (error) {
            console.error(`[WebhookSubscriber] kyc.completed dispatch failed:`, error.message);
        }
    }

    async _handleSessionRevoked(payload) {
        const { userId, wallet, sessionId, dappId, revokedBy } = payload;

        // Only dispatch if session belongs to an external app
        if (!dappId || dappId === 'casperid-internal') return;

        try {
            const dispatchEvent = this._getDispatcher();
            await dispatchEvent(dappId, EXTERNAL_WEBHOOK_EVENTS.SESSION_REVOKED, {
                user_id: userId,
                wallet: wallet,
                session_id: sessionId,
                revoked_by: revokedBy,
                revoked_at: new Date().toISOString()
            });
            console.log(`[WebhookSubscriber] Dispatched session.revoked to ${dappId}`);
        } catch (error) {
            console.error(`[WebhookSubscriber] session.revoked dispatch failed:`, error.message);
        }
    }
}

module.exports = new WebhookSubscriber();
module.exports.WebhookSubscriber = WebhookSubscriber;
