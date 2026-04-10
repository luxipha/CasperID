/**
 * BaseEmailProvider - Abstract base class for email providers
 * All email providers must implement these methods
 */
class BaseEmailProvider {
    constructor(config = {}) {
        if (new.target === BaseEmailProvider) {
            throw new Error('BaseEmailProvider is an abstract class and cannot be instantiated directly');
        }
        this.config = config;
        this.name = 'base';
    }

    /**
     * Verify connection to the email service
     * @returns {Promise<boolean>}
     */
    async verifyConnection() {
        throw new Error('Method verifyConnection() must be implemented');
    }

    /**
     * Send an email
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.html - HTML content
     * @param {string} options.text - Plain text content
     * @param {string} options.from - Sender address (optional)
     * @param {string} options.replyTo - Reply-to address (optional)
     * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
     */
    async sendEmail(options) {
        throw new Error('Method sendEmail() must be implemented');
    }

    /**
     * Send a transactional email using a template
     * @param {string} templateId - Template identifier
     * @param {string} to - Recipient email
     * @param {Object} data - Template variables
     * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
     */
    async sendTransactionalEmail(templateId, to, data) {
        throw new Error('Method sendTransactionalEmail() must be implemented');
    }

    /**
     * Trigger an event for event-based email systems (like Loops.so)
     * @param {string} eventName - Event name
     * @param {string} email - User email
     * @param {Object} properties - Event properties
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async triggerEvent(eventName, email, properties = {}) {
        throw new Error('Method triggerEvent() must be implemented');
    }

    /**
     * Check if this provider supports event-based emails
     * @returns {boolean}
     */
    supportsEvents() {
        return false;
    }

    /**
     * Check if this provider supports templates
     * @returns {boolean}
     */
    supportsTemplates() {
        return false;
    }
}

module.exports = BaseEmailProvider;
