/**
 * SmtpProvider - SMTP-based email provider using nodemailer
 * Compatible with Brevo, SendGrid, and standard SMTP servers
 */
const nodemailer = require('nodemailer');
const BaseEmailProvider = require('./BaseEmailProvider');

class SmtpProvider extends BaseEmailProvider {
    constructor(config = {}) {
        super(config);
        this.name = 'smtp';

        // SMTP Configuration (supports both SMTP_* and SUPPORT_EMAIL_* for backwards compatibility)
        this.smtpConfig = {
            host: config.host || process.env.SMTP_HOST || process.env.SUPPORT_EMAIL_HOST || 'mail.ile.africa',
            port: parseInt(config.port || process.env.SMTP_PORT || process.env.SUPPORT_EMAIL_PORT) || 587,
            secure: (parseInt(config.port || process.env.SMTP_PORT || process.env.SUPPORT_EMAIL_PORT) === 465),
            auth: {
                user: config.user || process.env.SMTP_USER || process.env.SUPPORT_EMAIL || 'support@ile.africa',
                pass: config.pass || process.env.SMTP_PASS || process.env.SUPPORT_EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production' || process.env.TLS_REJECT_UNAUTHORIZED !== 'false'
            }
        };

        this.defaultFrom = config.defaultFrom || process.env.EMAIL_FROM || `"CasperID" <no-reply@casperid.com>`;

        // Create reusable transporter
        this.transporter = nodemailer.createTransport(this.smtpConfig);
    }

    /**
     * Verify SMTP connection
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log(`[SmtpProvider] SMTP connection verified successfully`);
            return true;
        } catch (error) {
            console.error(`[SmtpProvider] SMTP connection failed:`, error.message);
            return false;
        }
    }

    /**
     * Send an email via SMTP
     */
    async sendEmail(options) {
        try {
            const { to, subject, html, text, from, replyTo } = options;

            // Staging bypass
            if (process.env.NODE_ENV === 'staging') {
                console.log(`[SmtpProvider][STAGING] Bypassing SMTP send to ${to}`);
                return { success: true, messageId: 'staging-bypass-' + Date.now() };
            }

            const mailOptions = {
                from: from || this.defaultFrom,
                to,
                subject,
                html,
                text: text || this._stripHtml(html)
            };

            if (replyTo) {
                mailOptions.replyTo = replyTo;
            }

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`[SmtpProvider] Email sent to ${to}: ${result.messageId}`);

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error(`[SmtpProvider] Failed to send email:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a transactional email
     * For SMTP, this just calls sendEmail since templates are handled in the manager
     */
    async sendTransactionalEmail(templateId, to, data) {
        // SMTP doesn't support server-side templates natively
        // Templates should be rendered before calling this method
        console.warn(`[SmtpProvider] sendTransactionalEmail called - templates should be pre-rendered`);
        return { success: false, error: 'SMTP does not support templates. Use sendEmail instead.' };
    }

    /**
     * SMTP doesn't support events
     */
    async triggerEvent(eventName, email, properties = {}) {
        console.warn(`[SmtpProvider] triggerEvent not supported for SMTP`);
        return { success: false, error: 'SMTP does not support event triggers' };
    }

    supportsEvents() {
        return false;
    }

    supportsTemplates() {
        return false;
    }

    /**
     * Strip HTML tags for plain text version
     */
    _stripHtml(html) {
        if (!html) return '';
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

module.exports = SmtpProvider;
