/**
 * EmailSubscriber - Listens to EventBus and sends appropriate emails
 *
 * This subscriber handles all email notifications by listening to events
 * and delegating to the EmailManager for actual email delivery.
 */

const { EVENTS, EMAIL_EVENTS } = require('../events');
const EmailManager = require('../../email/EmailManager');

// Rate limiting for profile views (in-memory, consider Redis for multi-instance)
const profileViewCache = new Map();
const PROFILE_VIEW_COOLDOWN = 60 * 60 * 1000; // 1 hour

// Rate limiting for login notifications (don't spam on frequent logins)
const loginNotificationCache = new Map();
const LOGIN_NOTIFICATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours for same device

class EmailSubscriber {
    constructor() {
        this.name = 'email';
        this._handlers = new Map();
        this._setupHandlers();
    }

    /**
     * Subscribe to EventBus events
     * @param {EventBus} eventBus
     */
    subscribe(eventBus) {
        for (const [event, handler] of this._handlers) {
            eventBus.on(event, handler);
        }
        console.log(`[EmailSubscriber] Subscribed to ${this._handlers.size} events`);
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

        // Profile
        this._handlers.set(EVENTS.PROFILE_VIEWED, this._handleProfileViewed.bind(this));
        this._handlers.set(EVENTS.PROFILE_COMPLETED, this._handleProfileCompleted.bind(this));

        // Payment
        this._handlers.set(EVENTS.PAYMENT_COMPLETED, this._handlePaymentCompleted.bind(this));

        // CNS
        this._handlers.set(EVENTS.CNS_REGISTERED, this._handleCnsRegistered.bind(this));

        // Security
        this._handlers.set(EVENTS.SECURITY_NEW_DEVICE, this._handleSecurityNewDevice.bind(this));
        this._handlers.set(EVENTS.SECURITY_PASSKEY_ADDED, this._handleSecurityPasskeyAdded.bind(this));
        this._handlers.set(EVENTS.SECURITY_PASSKEY_REMOVED, this._handleSecurityPasskeyRemoved.bind(this));
        this._handlers.set(EVENTS.SECURITY_SUSPICIOUS, this._handleSecuritySuspicious.bind(this));
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    async _handleUserRegistered(payload) {
        const { email, name } = payload;
        if (!email) return;

        try {
            await EmailManager.sendWelcomeEmail(email, name);
            console.log(`[EmailSubscriber] Welcome email sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Welcome email failed:`, error.message);
        }
    }

    async _handleUserLogin(payload) {
        const { email, wallet, method, ip, userAgent, isNewDevice } = payload;
        if (!email) return;

        // Only send login notification for new devices or suspicious logins
        if (!isNewDevice) {
            // Check rate limit for this device
            const cacheKey = `login_${wallet}_${this._hashDevice(userAgent)}`;
            const lastNotification = loginNotificationCache.get(cacheKey);
            if (lastNotification && (Date.now() - lastNotification) < LOGIN_NOTIFICATION_COOLDOWN) {
                return; // Skip, already notified recently for this device
            }
        }

        // For new devices, always send
        if (isNewDevice) {
            try {
                await EmailManager.sendSecurityAlertEmail(email, 'new_device', {
                    description: `New ${method} login detected`,
                    ipAddress: ip,
                    device: this._parseUserAgent(userAgent)
                });
                console.log(`[EmailSubscriber] New device login alert sent to ${email}`);
            } catch (error) {
                console.error(`[EmailSubscriber] Login alert failed:`, error.message);
            }
        }
    }

    async _handleUserAppAuth(payload) {
        const { email, appName, scopes, ip, userAgent } = payload;
        if (!email) return;

        try {
            await EmailManager.sendSecurityAlertEmail(email, 'app_authorization', {
                description: `You authorized "${appName}" to access your CasperID`,
                ipAddress: ip,
                device: this._parseUserAgent(userAgent),
                scopes: scopes?.join(', ') || 'Basic profile'
            });
            console.log(`[EmailSubscriber] App auth notification sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] App auth notification failed:`, error.message);
        }
    }

    async _handleVerificationCompleted(payload) {
        const { email, name, tier } = payload;
        if (!email) return;

        try {
            await EmailManager.sendVerificationSuccessEmail(email, tier, name);
            console.log(`[EmailSubscriber] Verification success email sent to ${email} (${tier})`);
        } catch (error) {
            console.error(`[EmailSubscriber] Verification email failed:`, error.message);
        }
    }

    async _handleVerificationRejected(payload) {
        const { email, reason, requestId } = payload;
        if (!email) return;

        try {
            // Use the existing rejection email method from emailService
            const emailService = require('../../emailService');
            await emailService.sendVerificationRejectionEmail(email, { reason, requestId });
            console.log(`[EmailSubscriber] Verification rejection email sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Rejection email failed:`, error.message);
        }
    }

    async _handleProfileViewed(payload) {
        const { ownerEmail, ownerWallet, ownerTier, viewerName, profileUrl } = payload;
        if (!ownerEmail) return;

        // Only notify L2+ users (to avoid spamming unverified accounts)
        if (ownerTier === 'layer_1' || ownerTier === 'layer_0') return;

        // Rate limit: max 1 email per hour per profile
        const cacheKey = `profile_view_${ownerWallet}`;
        const lastNotification = profileViewCache.get(cacheKey);
        if (lastNotification && (Date.now() - lastNotification) < PROFILE_VIEW_COOLDOWN) {
            return;
        }

        try {
            await EmailManager.sendProfileViewedEmail(ownerEmail, viewerName, profileUrl);
            profileViewCache.set(cacheKey, Date.now());
            console.log(`[EmailSubscriber] Profile viewed email sent to ${ownerEmail}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Profile viewed email failed:`, error.message);
        }
    }

    async _handleProfileCompleted(payload) {
        const { email, name, profileUrl } = payload;
        if (!email) return;

        try {
            await EmailManager.sendProfileCompletedEmail(email, name, profileUrl);
            console.log(`[EmailSubscriber] Profile completed email sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Profile completed email failed:`, error.message);
        }
    }

    async _handlePaymentCompleted(payload) {
        const { email, amount, currency, items, transactionId } = payload;
        if (!email) return;

        try {
            await EmailManager.sendPaymentConfirmationEmail(email, {
                amount,
                currency,
                items,
                transactionId
            });
            console.log(`[EmailSubscriber] Payment confirmation sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Payment email failed:`, error.message);
        }
    }

    async _handleCnsRegistered(payload) {
        const { email, domainName, years, transactionId } = payload;
        if (!email) return;

        try {
            await EmailManager.sendPaymentConfirmationEmail(email, {
                amount: 0, // Price shown separately
                currency: 'USD',
                items: `${domainName}.cid Domain Registration (${years || 1} year${(years || 1) > 1 ? 's' : ''})`,
                transactionId
            });
            console.log(`[EmailSubscriber] CNS registration email sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] CNS email failed:`, error.message);
        }
    }

    async _handleSecurityNewDevice(payload) {
        const { email, device, ip, location } = payload;
        if (!email) return;

        try {
            await EmailManager.sendSecurityAlertEmail(email, 'new_device', {
                description: 'A new device was used to access your account',
                device,
                ipAddress: ip,
                location
            });
            console.log(`[EmailSubscriber] New device alert sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Security alert failed:`, error.message);
        }
    }

    async _handleSecurityPasskeyAdded(payload) {
        const { email, passkeyName, device } = payload;
        if (!email) return;

        try {
            await EmailManager.sendSecurityAlertEmail(email, 'passkey_added', {
                description: `A new passkey "${passkeyName || 'Unnamed'}" was added to your account`,
                device
            });
            console.log(`[EmailSubscriber] Passkey added alert sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Passkey alert failed:`, error.message);
        }
    }

    async _handleSecurityPasskeyRemoved(payload) {
        const { email, passkeyName } = payload;
        if (!email) return;

        try {
            await EmailManager.sendSecurityAlertEmail(email, 'passkey_removed', {
                description: `A passkey "${passkeyName || 'Unnamed'}" was removed from your account`
            });
            console.log(`[EmailSubscriber] Passkey removed alert sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Passkey alert failed:`, error.message);
        }
    }

    async _handleSecuritySuspicious(payload) {
        const { email, activityType, details } = payload;
        if (!email) return;

        try {
            await EmailManager.sendSecurityAlertEmail(email, 'suspicious_activity', {
                description: details?.description || `Suspicious activity detected: ${activityType}`,
                ...details
            });
            console.log(`[EmailSubscriber] Suspicious activity alert sent to ${email}`);
        } catch (error) {
            console.error(`[EmailSubscriber] Security alert failed:`, error.message);
        }
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    _parseUserAgent(ua) {
        if (!ua) return 'Unknown device';
        // Simple parsing - could use ua-parser-js for more detail
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('Android')) return 'Android device';
        if (ua.includes('Windows')) return 'Windows PC';
        if (ua.includes('Mac')) return 'Mac';
        if (ua.includes('Linux')) return 'Linux';
        return 'Unknown device';
    }

    _hashDevice(ua) {
        if (!ua) return 'unknown';
        // Simple hash for device identification
        return Buffer.from(ua).toString('base64').substring(0, 16);
    }
}

module.exports = new EmailSubscriber();
module.exports.EmailSubscriber = EmailSubscriber;
