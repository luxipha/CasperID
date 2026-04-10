/**
 * LoopsProvider - Event-based email provider using Loops.so
 * Handles transactional emails via event triggers and transactional API
 */
const BaseEmailProvider = require('./BaseEmailProvider');

class LoopsProvider extends BaseEmailProvider {
    constructor(config = {}) {
        super(config);
        this.name = 'loops';
        this.apiKey = config.apiKey || process.env.LOOPS_API_KEY;
        this.baseUrl = 'https://app.loops.so/api/v1';
    }

    /**
     * Verify connection to Loops.so
     */
    async verifyConnection() {
        if (!this.apiKey) {
            console.error(`[LoopsProvider] No API key configured`);
            return false;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api-key`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (response.ok) {
                console.log(`[LoopsProvider] Connection verified successfully`);
                return true;
            }

            console.error(`[LoopsProvider] Connection verification failed: ${response.status}`);
            return false;
        } catch (error) {
            console.error(`[LoopsProvider] Connection error:`, error.message);
            return false;
        }
    }

    /**
     * Send an email directly (for simple transactional emails)
     * Uses Loops transactional email endpoint
     */
    async sendEmail(options) {
        const { to, subject, html, text, from } = options;

        // For direct emails, we need a transactionalId
        // If not using templates, fall back to logging
        console.warn(`[LoopsProvider] Direct sendEmail called - use sendTransactionalEmail for Loops`);
        return {
            success: false,
            error: 'Loops.so requires transactional templates. Use sendTransactionalEmail instead.'
        };
    }

    /**
     * Send a transactional email using a Loops template
     * @param {string} transactionalId - The Loops transactional email ID
     * @param {string} to - Recipient email
     * @param {Object} dataVariables - Template variables
     */
    async sendTransactionalEmail(transactionalId, to, dataVariables = {}) {
        if (!this.apiKey) {
            console.error(`[LoopsProvider] No API key configured`);
            return { success: false, error: 'Loops API key not configured' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/transactional`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transactionalId,
                    email: to,
                    dataVariables
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log(`[LoopsProvider] Transactional email sent to ${to} (template: ${transactionalId})`);
                return { success: true, messageId: data.id };
            }

            console.error(`[LoopsProvider] Transactional email failed:`, data);
            return { success: false, error: data.message || 'Failed to send transactional email' };
        } catch (error) {
            console.error(`[LoopsProvider] Transactional email error:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger an event in Loops.so
     * Events can trigger automated email sequences
     */
    async triggerEvent(eventName, email, properties = {}) {
        if (!this.apiKey) {
            console.error(`[LoopsProvider] No API key configured`);
            return { success: false, error: 'Loops API key not configured' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/events/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    eventName,
                    eventProperties: properties
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log(`[LoopsProvider] Event "${eventName}" triggered for ${email}`);
                return { success: true };
            }

            console.error(`[LoopsProvider] Event trigger failed:`, data);
            return { success: false, error: data.message || 'Failed to trigger event' };
        } catch (error) {
            console.error(`[LoopsProvider] Event trigger error:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create or update a contact in Loops
     */
    async upsertContact(email, properties = {}) {
        if (!this.apiKey) {
            return { success: false, error: 'Loops API key not configured' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/contacts/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    ...properties
                })
            });

            const data = await response.json();

            if (response.ok && (data.success || data.id)) {
                console.log(`[LoopsProvider] Contact upserted: ${email}`);
                return { success: true, contactId: data.id };
            }

            return { success: false, error: data.message || 'Failed to upsert contact' };
        } catch (error) {
            console.error(`[LoopsProvider] Contact upsert error:`, error.message);
            return { success: false, error: error.message };
        }
    }

    supportsEvents() {
        return true;
    }

    supportsTemplates() {
        return true;
    }
}

module.exports = LoopsProvider;
