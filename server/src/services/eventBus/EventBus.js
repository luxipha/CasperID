/**
 * EventBus - Central event emitter for CasperID
 *
 * All services emit events here, and subscribers (Email, Activity, Webhook)
 * listen and react accordingly. This decouples event producers from consumers.
 */

const EventEmitter = require('events');
const { EVENTS } = require('./events');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50); // Allow many subscribers
        this._subscribers = new Map();
        this._eventHistory = []; // Recent events for debugging
        this._maxHistorySize = 100;
    }

    /**
     * Emit an event with payload
     * @param {string} eventName - Event name from EVENTS constants
     * @param {object} payload - Event data
     */
    emit(eventName, payload = {}) {
        // Validate event name
        const validEvents = Object.values(EVENTS);
        if (!validEvents.includes(eventName)) {
            console.warn(`[EventBus] Unknown event: ${eventName}`);
        }

        // Add metadata
        const enrichedPayload = {
            ...payload,
            _meta: {
                eventName,
                timestamp: new Date().toISOString(),
                eventId: this._generateEventId()
            }
        };

        // Store in history for debugging
        this._addToHistory(eventName, enrichedPayload);

        // Log event emission
        console.log(`[EventBus] Emitting: ${eventName}`, {
            userId: payload.userId,
            email: payload.email ? '***@***' : undefined,
            wallet: payload.wallet ? payload.wallet.substring(0, 10) + '...' : undefined
        });

        // Emit to all listeners
        try {
            super.emit(eventName, enrichedPayload);
        } catch (error) {
            console.error(`[EventBus] Error emitting ${eventName}:`, error);
        }

        return this;
    }

    /**
     * Register a named subscriber
     * @param {string} name - Subscriber name (e.g., 'email', 'activity')
     * @param {object} subscriber - Subscriber instance with subscribe() method
     */
    registerSubscriber(name, subscriber) {
        if (this._subscribers.has(name)) {
            console.warn(`[EventBus] Subscriber ${name} already registered, replacing`);
        }

        this._subscribers.set(name, subscriber);

        // Call subscriber's subscribe method if it exists
        if (typeof subscriber.subscribe === 'function') {
            subscriber.subscribe(this);
            console.log(`[EventBus] Registered subscriber: ${name}`);
        } else {
            console.warn(`[EventBus] Subscriber ${name} has no subscribe() method`);
        }

        return this;
    }

    /**
     * Unregister a subscriber
     * @param {string} name - Subscriber name
     */
    unregisterSubscriber(name) {
        const subscriber = this._subscribers.get(name);
        if (subscriber && typeof subscriber.unsubscribe === 'function') {
            subscriber.unsubscribe(this);
        }
        this._subscribers.delete(name);
        console.log(`[EventBus] Unregistered subscriber: ${name}`);
        return this;
    }

    /**
     * Get recent event history (for debugging)
     */
    getHistory(limit = 20) {
        return this._eventHistory.slice(-limit);
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this._eventHistory = [];
    }

    /**
     * Get subscriber stats
     */
    getStats() {
        return {
            subscribers: Array.from(this._subscribers.keys()),
            listenerCounts: Object.values(EVENTS).reduce((acc, event) => {
                acc[event] = this.listenerCount(event);
                return acc;
            }, {}),
            historySize: this._eventHistory.length
        };
    }

    // Private methods

    _generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _addToHistory(eventName, payload) {
        this._eventHistory.push({
            event: eventName,
            timestamp: payload._meta.timestamp,
            eventId: payload._meta.eventId,
            // Store minimal info for privacy
            summary: {
                userId: payload.userId,
                hasEmail: !!payload.email,
                hasWallet: !!payload.wallet
            }
        });

        // Trim history if too large
        if (this._eventHistory.length > this._maxHistorySize) {
            this._eventHistory = this._eventHistory.slice(-this._maxHistorySize);
        }
    }
}

// Export singleton instance
const eventBus = new EventBus();

module.exports = eventBus;
module.exports.EventBus = EventBus;
