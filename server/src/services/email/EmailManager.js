/**
 * EmailManager - Central hub for all email operations
 * Routes emails to appropriate providers based on configuration
 * Provides high-level methods for all CasperID email types
 */
const SmtpProvider = require('./SmtpProvider');
const LoopsProvider = require('./LoopsProvider');

// Email template definitions for SMTP fallback
const EMAIL_TEMPLATES = {
    WELCOME: 'welcome',
    VERIFICATION_SUCCESS: 'verification_success',
    PROFILE_VIEWED: 'profile_viewed',
    PROFILE_COMPLETED: 'profile_completed',
    PAYMENT_CONFIRMATION: 'payment_confirmation',
    SECURITY_ALERT: 'security_alert',
    OTP: 'otp'
};

// Loops.so transactional email IDs (configure in env)
const LOOPS_TRANSACTIONAL_IDS = {
    WELCOME: process.env.LOOPS_WELCOME_ID,
    VERIFICATION_SUCCESS: process.env.LOOPS_VERIFICATION_SUCCESS_ID,
    PROFILE_VIEWED: process.env.LOOPS_PROFILE_VIEWED_ID,
    PROFILE_COMPLETED: process.env.LOOPS_PROFILE_COMPLETED_ID,
    PAYMENT_CONFIRMATION: process.env.LOOPS_PAYMENT_CONFIRMATION_ID,
    SECURITY_ALERT: process.env.LOOPS_SECURITY_ALERT_ID
};

class EmailManager {
    constructor() {
        // Initialize providers based on configuration
        this.providers = {};
        this._initializeProviders();

        // Determine primary provider
        this.primaryProvider = process.env.EMAIL_PROVIDER || 'smtp';
        this.frontendUrl = process.env.FRONTEND_URL || 'https://casperid.com';
    }

    _initializeProviders() {
        // Always initialize SMTP as fallback
        this.providers.smtp = new SmtpProvider();

        // Initialize Loops if API key is provided
        if (process.env.LOOPS_API_KEY) {
            this.providers.loops = new LoopsProvider();
            console.log('[EmailManager] Loops.so provider initialized');
        }

        console.log(`[EmailManager] Providers initialized: ${Object.keys(this.providers).join(', ')}`);
    }

    /**
     * Get the primary provider or fall back to SMTP
     */
    _getProvider(preferredProvider = null) {
        const providerName = preferredProvider || this.primaryProvider;
        return this.providers[providerName] || this.providers.smtp;
    }

    /**
     * Verify all provider connections
     */
    async verifyConnections() {
        const results = {};
        for (const [name, provider] of Object.entries(this.providers)) {
            results[name] = await provider.verifyConnection();
        }
        return results;
    }

    // ========================================
    // HIGH-LEVEL EMAIL METHODS
    // ========================================

    /**
     * Send welcome email after account creation
     */
    async sendWelcomeEmail(email, name) {
        console.log(`[EmailManager] Sending welcome email to ${email}`);

        const provider = this._getProvider();

        // Try Loops transactional if available
        if (provider.name === 'loops' && LOOPS_TRANSACTIONAL_IDS.WELCOME) {
            return await provider.sendTransactionalEmail(
                LOOPS_TRANSACTIONAL_IDS.WELCOME,
                email,
                { recipientName: name || 'there', frontendUrl: this.frontendUrl, recipientEmail: email }
            );
        }

        // Fall back to SMTP with HTML template
        const html = this._renderWelcomeTemplate(name);
        return await this.providers.smtp.sendEmail({
            to: email,
            subject: 'Welcome to CasperID - Your Digital Identity Awaits',
            html,
            from: `"CasperID" <${(process.env.SMTP_USER || process.env.SUPPORT_EMAIL)}>`
        });
    }

    /**
     * Send verification success email (L2 or L3)
     */
    async sendVerificationSuccessEmail(email, tier, name = null) {
        console.log(`[EmailManager] Sending verification success email to ${email} (tier: ${tier})`);

        const provider = this._getProvider();
        const tierLabel = tier === 'layer_3' ? 'Full KYC' : tier === 'layer_2' ? 'Liveness' : 'Email';

        if (provider.name === 'loops' && LOOPS_TRANSACTIONAL_IDS.VERIFICATION_SUCCESS) {
            return await provider.sendTransactionalEmail(
                LOOPS_TRANSACTIONAL_IDS.VERIFICATION_SUCCESS,
                email,
                { tier, tierLabel, recipientName: name || 'there', frontendUrl: this.frontendUrl, recipientEmail: email }
            );
        }

        const html = this._renderVerificationSuccessTemplate(tier, tierLabel, name);
        return await this.providers.smtp.sendEmail({
            to: email,
            subject: `CasperID: ${tierLabel} Verification Complete`,
            html,
            from: `"CasperID Verification" <${(process.env.SMTP_USER || process.env.SUPPORT_EMAIL)}>`
        });
    }

    /**
     * Send email when someone views a user's profile
     */
    async sendProfileViewedEmail(email, viewerName, profileUrl, recipientName = 'there') {
        console.log(`[EmailManager] Sending profile viewed email to ${email}`);

        const provider = this._getProvider();

        if (provider.name === 'loops' && LOOPS_TRANSACTIONAL_IDS.PROFILE_VIEWED) {
            return await provider.sendTransactionalEmail(
                LOOPS_TRANSACTIONAL_IDS.PROFILE_VIEWED,
                email,
                { recipientName, viewerName: viewerName || 'someone', profileUrl, frontendUrl: this.frontendUrl, recipientEmail: email }
            );
        }

        const html = this._renderProfileViewedTemplate(viewerName, profileUrl);
        return await this.providers.smtp.sendEmail({
            to: email,
            subject: 'Someone Viewed Your CasperID Profile',
            html,
            from: `"CasperID" <${(process.env.SMTP_USER || process.env.SUPPORT_EMAIL)}>`
        });
    }

    /**
     * Send email when profile reaches 100% completion
     */
    async sendProfileCompletedEmail(email, name, profileUrl) {
        console.log(`[EmailManager] Sending profile completed email to ${email}`);

        const provider = this._getProvider();

        if (provider.name === 'loops' && LOOPS_TRANSACTIONAL_IDS.PROFILE_COMPLETED) {
            return await provider.sendTransactionalEmail(
                LOOPS_TRANSACTIONAL_IDS.PROFILE_COMPLETED,
                email,
                { recipientName: name || 'there', profileUrl, frontendUrl: this.frontendUrl, recipientEmail: email }
            );
        }

        const html = this._renderProfileCompletedTemplate(name, profileUrl);
        return await this.providers.smtp.sendEmail({
            to: email,
            subject: 'Your CasperID Profile is Complete!',
            html,
            from: `"CasperID" <${(process.env.SMTP_USER || process.env.SUPPORT_EMAIL)}>`
        });
    }

    /**
     * Send payment confirmation email
     */
    async sendPaymentConfirmationEmail(email, { amount, currency, items, transactionId, recipientName = 'there' }) {
        console.log(`[EmailManager] Sending payment confirmation email to ${email}`);

        const provider = this._getProvider();

        if (provider.name === 'loops' && LOOPS_TRANSACTIONAL_IDS.PAYMENT_CONFIRMATION) {
            return await provider.sendTransactionalEmail(
                LOOPS_TRANSACTIONAL_IDS.PAYMENT_CONFIRMATION,
                email,
                { recipientName, amount, currency, items, transactionId, frontendUrl: this.frontendUrl, recipientEmail: email }
            );
        }

        const html = this._renderPaymentConfirmationTemplate(amount, currency, items, transactionId);
        return await this.providers.smtp.sendEmail({
            to: email,
            subject: 'CasperID Payment Confirmation',
            html,
            from: `"CasperID Payments" <${(process.env.SMTP_USER || process.env.SUPPORT_EMAIL)}>`
        });
    }

    /**
     * Send security alert email
     */
    async sendSecurityAlertEmail(email, eventType, details = {}) {
        console.log(`[EmailManager] Sending security alert to ${email} (event: ${eventType})`);

        const provider = this._getProvider();
        const recipientName = details.recipientName || 'there';

        if (provider.name === 'loops' && LOOPS_TRANSACTIONAL_IDS.SECURITY_ALERT) {
            return await provider.sendTransactionalEmail(
                LOOPS_TRANSACTIONAL_IDS.SECURITY_ALERT,
                email,
                { recipientName, eventType, ...details, frontendUrl: this.frontendUrl, recipientEmail: email }
            );
        }

        const html = this._renderSecurityAlertTemplate(eventType, details);
        return await this.providers.smtp.sendEmail({
            to: email,
            subject: `CasperID Security Alert: ${eventType}`,
            html,
            from: `"CasperID Security" <${(process.env.SMTP_USER || process.env.SUPPORT_EMAIL)}>`
        });
    }

    /**
     * Send 6-digit OTP for security verification
     */
    async sendOTP(email, otp) {
        console.log(`[EmailManager] Sending OTP to ${email}`);

        // Always use SMTP for OTPs as they are utilitarian/security-critical
        const html = this._renderOTPTemplate(otp);
        return await this.providers.smtp.sendEmail({
            to: email,
            subject: 'Your CasperID Verification Code',
            html,
            from: `"CasperID Security" <${(process.env.SMTP_USER || process.env.SUPPORT_EMAIL)}>`
        });
    }

    // ========================================
    // HTML TEMPLATE RENDERERS (SMTP Fallback)
    // ========================================

    _getBaseStyles() {
        return `
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9ff;
        `;
    }

    _getCardStyles() {
        return `
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            border: 1px solid #e5e7eb;
        `;
    }

    _getButtonStyles() {
        return `
            background-color: #8652e2;
            color: white;
            padding: 14px 28px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            display: inline-block;
            margin: 24px 0;
        `;
    }

    _renderWelcomeTemplate(name) {
        return `
            <div style="${this._getBaseStyles()}">
                <div style="${this._getCardStyles()}">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #8652e2 0%, #6366f1 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 28px;">🎉</span>
                    </div>

                    <h1 style="color: #1f2937; margin: 0 0 16px 0; font-size: 28px; font-weight: 800;">Welcome to CasperID!</h1>

                    <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                        Hey ${name || 'there'}, your digital identity journey begins now. CasperID gives you control over your verified identity across the web.
                    </p>

                    <a href="${this.frontendUrl}/profile" style="${this._getButtonStyles()}">
                        Complete Your Profile
                    </a>

                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                            <strong>What's next?</strong><br>
                            Complete your profile and upgrade to Layer 2 or Layer 3 verification for full identity features.
                        </p>
                    </div>

                    <div style="margin-top: 24px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            Powered by CasperID Protocol<br>
                            © ${new Date().getFullYear()} CasperID. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    _renderVerificationSuccessTemplate(tier, tierLabel, name) {
        const tierColors = {
            layer_3: '#059669',
            layer_2: '#2563eb',
            layer_1: '#ca8a04'
        };
        const color = tierColors[tier] || '#8652e2';

        return `
            <div style="${this._getBaseStyles()}">
                <div style="${this._getCardStyles()}">
                    <div style="width: 64px; height: 64px; background: ${color}; border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 28px;">✓</span>
                    </div>

                    <h1 style="color: #1f2937; margin: 0 0 16px 0; font-size: 28px; font-weight: 800;">${tierLabel} Verification Complete!</h1>

                    <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                        Congratulations ${name || 'there'}! Your identity has been verified at <strong style="color: ${color};">${tier.replace('_', ' ').toUpperCase()}</strong>.
                    </p>

                    <div style="background: ${color}15; padding: 16px; border-radius: 12px; margin: 24px 0;">
                        <p style="color: ${color}; margin: 0; font-weight: 600;">
                            ${tier === 'layer_3' ? 'You now have full KYC verification with document-backed identity.' :
                              tier === 'layer_2' ? 'Your liveness has been verified. You can create context personas.' :
                              'Your email has been verified.'}
                        </p>
                    </div>

                    <a href="${this.frontendUrl}/profile" style="${this._getButtonStyles()}">
                        View Your Profile
                    </a>

                    <div style="margin-top: 24px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            Powered by CasperID Protocol<br>
                            © ${new Date().getFullYear()} CasperID. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    _renderProfileViewedTemplate(viewerName, profileUrl) {
        return `
            <div style="${this._getBaseStyles()}">
                <div style="${this._getCardStyles()}">
                    <div style="width: 64px; height: 64px; background: #3b82f6; border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 28px;">👀</span>
                    </div>

                    <h1 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 800;">Someone Viewed Your Profile</h1>

                    <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                        <strong>${viewerName || 'Someone'}</strong> just viewed your CasperID profile. Keep your profile updated to make a great impression!
                    </p>

                    <a href="${profileUrl || this.frontendUrl + '/profile'}" style="${this._getButtonStyles()}">
                        View Your Profile
                    </a>

                    <div style="margin-top: 24px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} CasperID. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    _renderProfileCompletedTemplate(name, profileUrl) {
        return `
            <div style="${this._getBaseStyles()}">
                <div style="${this._getCardStyles()}">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 28px;">🏆</span>
                    </div>

                    <h1 style="color: #1f2937; margin: 0 0 16px 0; font-size: 28px; font-weight: 800;">Profile 100% Complete!</h1>

                    <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                        Amazing work, ${name || 'there'}! Your CasperID profile is now fully complete. You're ready to share your verified identity anywhere.
                    </p>

                    <a href="${profileUrl || this.frontendUrl + '/profile'}" style="${this._getButtonStyles()}">
                        Share Your Profile
                    </a>

                    <div style="margin-top: 24px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} CasperID. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    _renderPaymentConfirmationTemplate(amount, currency, items, transactionId) {
        const itemsList = Array.isArray(items) ? items.join(', ') : items || 'CasperID Service';

        return `
            <div style="${this._getBaseStyles()}">
                <div style="${this._getCardStyles()}">
                    <div style="width: 64px; height: 64px; background: #10b981; border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 28px;">✓</span>
                    </div>

                    <h1 style="color: #1f2937; margin: 0 0 16px 0; font-size: 28px; font-weight: 800;">Payment Confirmed</h1>

                    <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: left;">
                        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Amount</p>
                        <p style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 800;">${amount} ${currency || 'USD'}</p>

                        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Items</p>
                        <p style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">${itemsList}</p>

                        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Transaction ID</p>
                        <p style="color: #1f2937; margin: 0; font-size: 14px; font-family: monospace;">${transactionId || 'N/A'}</p>
                    </div>

                    <a href="${this.frontendUrl}/profile" style="${this._getButtonStyles()}">
                        View Your Account
                    </a>

                    <div style="margin-top: 24px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} CasperID. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    _renderSecurityAlertTemplate(eventType, details) {
        const eventLabels = {
            'new_device': 'New Device Login',
            'password_change': 'Password Changed',
            'passkey_added': 'New Passkey Added',
            'passkey_removed': 'Passkey Removed',
            'suspicious_activity': 'Suspicious Activity Detected'
        };

        return `
            <div style="${this._getBaseStyles()}">
                <div style="${this._getCardStyles()}">
                    <div style="width: 64px; height: 64px; background: #ef4444; border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 28px;">⚠️</span>
                    </div>

                    <h1 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 800;">Security Alert</h1>

                    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0; text-align: left;">
                        <p style="color: #991b1b; margin: 0; font-weight: 600;">
                            ${eventLabels[eventType] || eventType}
                        </p>
                        ${details.description ? `<p style="color: #7f1d1d; margin: 8px 0 0 0; font-size: 14px;">${details.description}</p>` : ''}
                    </div>

                    ${details.ipAddress ? `<p style="color: #6b7280; font-size: 14px;">IP Address: ${details.ipAddress}</p>` : ''}
                    ${details.device ? `<p style="color: #6b7280; font-size: 14px;">Device: ${details.device}</p>` : ''}
                    ${details.location ? `<p style="color: #6b7280; font-size: 14px;">Location: ${details.location}</p>` : ''}

                    <p style="color: #6b7280; margin: 24px 0; font-size: 14px;">
                        If this wasn't you, please secure your account immediately.
                    </p>

                    <a href="${this.frontendUrl}/settings/security" style="${this._getButtonStyles()}">
                        Review Security Settings
                    </a>

                    <div style="margin-top: 24px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} CasperID. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    _renderOTPTemplate(otp) {
        return `
            <div style="${this._getBaseStyles()}">
                <!-- Header -->
                <div style="text-align: center; padding: 40px 20px 30px;">
                    <img src="https://www.casperid.com/logos/logo.png" width="48" style="margin-bottom: 12px;" />
                    <div>
                        <span style="font-weight: 800; font-size: 24px; color: #1A1A2E;">Casper<span style="color: #9333EA;">ID</span></span><br />
                        <span style="font-size: 12px; color: #626D85; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Verify once. Reuse everywhere.</span>
                    </div>
                </div>

                <!-- Main Card -->
                <div style="${this._getCardStyles()}; border-radius: 24px; padding: 50px 40px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>

                    <h1 style="color: #1A1A2E; margin: 0 0 20px 0; font-size: 28px; font-weight: 800;">Here's your code</h1>

                    <p style="color: #626D85; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                        Enter this code to verify it's you. It expires in 10 minutes.
                    </p>

                    <div style="background: #F8F9FF; border-radius: 16px; padding: 24px; margin: 0 0 30px 0;">
                        <div style="font-size: 12px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Verification Code</div>
                        <div style="font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 36px; font-weight: 800; color: #8652E2; letter-spacing: 8px;">${otp}</div>
                    </div>

                    <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 30px 0;">
                        If you didn't request this code, just ignore this email. Someone may have typed your email by mistake.
                    </p>

                    <div style="border-top: 1px solid #F3F4F6; padding-top: 24px;">
                        <p style="color: #EF4444; font-size: 14px; margin: 0;">
                            Never share this code with anyone — we'll never ask for it.
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding: 20px; margin-top: 20px;">
                    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                        This is an automated security email from CasperID.<br/>
                        © ${new Date().getFullYear()} CasperID Protocol. Secure. Private. Yours.
                    </p>
                </div>
            </div>
        `;
    }
}

// Export singleton instance
module.exports = new EmailManager();
module.exports.EmailManager = EmailManager;
module.exports.EMAIL_TEMPLATES = EMAIL_TEMPLATES;
