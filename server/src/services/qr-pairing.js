const QRCode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const {
    DevicePairing,
    UserAccount,
    PasskeyCredential,
    DeviceSession
} = require('../database/models');

/**
 * QR Code Device Pairing Service
 * Handles cross-device authentication via QR codes
 * Allows users to add their account to new devices securely
 */
class QRPairingService {
    constructor() {
        this.PAIRING_EXPIRY_MINUTES = 5;
        this.QR_CODE_VERSION = 1;

        // Temporary storage for pairing sessions
        this.pairingStorage = new Map();
    }

    /**
     * Generate QR code for device pairing
     * Called from authenticated device to allow new device access
     */
    async generatePairingQR(sessionToken, deviceInfo = {}) {
        try {
            // Validate current session
            const sessionData = await this.validateCurrentSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid or expired session');
            }

            const { userAccount, deviceSession } = sessionData;

            // Generate pairing identifiers
            const pairingId = uuidv4();
            const pairingToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + (this.PAIRING_EXPIRY_MINUTES * 60 * 1000));

            // Create QR code payload
            const qrPayload = {
                version: this.QR_CODE_VERSION,
                type: 'casperid_pairing',
                pairingId,
                pairingToken,
                serverUrl: process.env.API_BASE_URL || 'https://api.casperid.com',
                expiresAt: expiresAt.getTime(),
                userHint: userAccount.recovery_email.split('@')[0] + '@***' // Privacy-safe hint
            };

            // Store pairing request
            const devicePairing = new DevicePairing({
                pairing_id: pairingId,
                user_id: userAccount.user_id,
                qr_code_data: JSON.stringify(qrPayload),
                initiating_device_id: deviceSession.session_id,
                pairing_token: pairingToken,
                expires_at: expiresAt
            });

            await devicePairing.save();

            // Generate QR code image
            const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrPayload), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#1A1A2E',  // Brand dark color
                    light: '#FFFFFF'
                }
            });

            // Store in memory for quick validation
            this.pairingStorage.set(pairingId, {
                userId: userAccount.user_id,
                pairingToken,
                timestamp: Date.now()
            });

            // Cleanup old pairings
            this.cleanupExpiredPairings();

            return {
                pairingId,
                qrCodeDataURL,
                qrCodePayload: qrPayload,
                expiresAt,
                expiresIn: this.PAIRING_EXPIRY_MINUTES * 60 * 1000
            };

        } catch (error) {
            console.error('QR pairing generation failed:', error);
            throw new Error(`QR pairing generation failed: ${error.message}`);
        }
    }

    /**
     * Scan and validate QR code on new device
     * Returns pairing information for new device registration
     */
    async scanPairingQR(qrCodeData) {
        try {
            let payload;

            // Parse QR code data
            try {
                payload = JSON.parse(qrCodeData);
            } catch (parseError) {
                throw new Error('Invalid QR code format');
            }

            // Validate QR code structure
            if (!payload || payload.type !== 'casperid_pairing' || !payload.pairingId) {
                throw new Error('Invalid CasperID pairing QR code');
            }

            // Check expiration
            if (Date.now() > payload.expiresAt) {
                throw new Error('QR code has expired');
            }

            // Verify pairing exists and is valid
            const devicePairing = await DevicePairing.findOne({
                pairing_id: payload.pairingId,
                status: 'pending',
                expires_at: { $gt: new Date() }
            });

            if (!devicePairing) {
                throw new Error('Pairing request not found or expired');
            }

            // Validate pairing token
            if (devicePairing.pairing_token !== payload.pairingToken) {
                throw new Error('Invalid pairing token');
            }

            // Get user account information
            const userAccount = await UserAccount.findOne({
                user_id: devicePairing.user_id
            });

            if (!userAccount) {
                throw new Error('User account not found');
            }

            return {
                pairingId: payload.pairingId,
                userId: userAccount.user_id,
                userEmail: userAccount.recovery_email,
                userHint: payload.userHint,
                layerStatus: userAccount.layer_status,
                walletAddress: userAccount.wallet,
                emailVerified: userAccount.email_verified,
                expiresAt: new Date(payload.expiresAt)
            };

        } catch (error) {
            console.error('QR code scanning failed:', error);
            throw new Error(`QR code scanning failed: ${error.message}`);
        }
    }

    /**
     * Complete device pairing by creating new passkey on new device
     * Links new passkey to existing user account
     */
    async completePairing(pairingId, newPasskeyData, deviceInfo = {}) {
        try {
            // Validate pairing
            const devicePairing = await DevicePairing.findOne({
                pairing_id: pairingId,
                status: 'pending',
                expires_at: { $gt: new Date() }
            });

            if (!devicePairing) {
                throw new Error('Pairing request not found or expired');
            }

            // Get user account
            const userAccount = await UserAccount.findOne({
                user_id: devicePairing.user_id
            });

            if (!userAccount) {
                throw new Error('User account not found');
            }

            // Verify new passkey registration (this would come from WebAuthn flow)
            if (!newPasskeyData.credentialId || !newPasskeyData.publicKey) {
                throw new Error('Invalid passkey data');
            }

            // Create new passkey credential for this device
            const passkeyCredential = new PasskeyCredential({
                user_id: userAccount.user_id,
                credential_id: newPasskeyData.credentialId,
                credential_public_key: Buffer.from(newPasskeyData.publicKey, 'base64'),
                counter: newPasskeyData.counter || 0,
                device_type: deviceInfo.deviceType || 'unknown',
                device_name: deviceInfo.deviceName || 'New Device',
                transports: newPasskeyData.transports || [],
                backup_eligible: newPasskeyData.backupEligible || false,
                backup_state: newPasskeyData.backupState || false,
                is_primary: false, // This is an additional device
            });

            await passkeyCredential.save();

            // Add to user's backup passkeys
            userAccount.backup_passkeys.push({
                credential_id: newPasskeyData.credentialId,
                device_name: deviceInfo.deviceName || 'New Device',
                created_at: new Date(),
                revoked: false
            });

            await userAccount.save();

            // Update pairing status
            devicePairing.status = 'completed';
            devicePairing.completed_at = new Date();
            devicePairing.target_device_info = {
                device_name: deviceInfo.deviceName,
                device_type: deviceInfo.deviceType,
                user_agent: deviceInfo.userAgent
            };

            await devicePairing.save();

            // Create session for new device
            const sessionId = uuidv4();
            const sessionToken = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

            const deviceSession = new DeviceSession({
                session_id: sessionId,
                user_id: userAccount.user_id,
                credential_id: newPasskeyData.credentialId,
                session_token: sessionToken,
                device_fingerprint: this.generateDeviceFingerprint(deviceInfo),
                ip_address: deviceInfo.ipAddress,
                user_agent: deviceInfo.userAgent,
                expires_at: expiresAt,
            });

            await deviceSession.save();

            // Clean up memory storage
            this.pairingStorage.delete(pairingId);

            return {
                success: true,
                pairingId,
                sessionId,
                sessionToken,
                expiresAt,
                userAccount: {
                    user_id: userAccount.user_id,
                    recovery_email: userAccount.recovery_email,
                    layer_status: userAccount.layer_status,
                    email_verified: userAccount.email_verified,
                    wallet: userAccount.wallet,
                    metamask_connected: userAccount.metamask_connected,
                },
                deviceCredential: {
                    credential_id: newPasskeyData.credentialId,
                    device_name: deviceInfo.deviceName,
                    is_primary: false
                }
            };

        } catch (error) {
            console.error('Device pairing completion failed:', error);
            throw new Error(`Device pairing failed: ${error.message}`);
        }
    }

    /**
     * Get pairing status and details
     */
    async getPairingStatus(pairingId) {
        try {
            const devicePairing = await DevicePairing.findOne({
                pairing_id: pairingId
            });

            if (!devicePairing) {
                return { found: false };
            }

            const isExpired = devicePairing.expires_at < new Date();

            return {
                found: true,
                pairingId: devicePairing.pairing_id,
                status: isExpired ? 'expired' : devicePairing.status,
                createdAt: devicePairing.created_at,
                expiresAt: devicePairing.expires_at,
                completedAt: devicePairing.completed_at,
                targetDeviceInfo: devicePairing.target_device_info,
                isExpired
            };

        } catch (error) {
            console.error('Pairing status check failed:', error);
            throw new Error(`Failed to check pairing status: ${error.message}`);
        }
    }

    /**
     * Cancel active pairing request
     */
    async cancelPairing(pairingId, sessionToken) {
        try {
            // Validate session has permission to cancel this pairing
            const sessionData = await this.validateCurrentSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid session');
            }

            const devicePairing = await DevicePairing.findOne({
                pairing_id: pairingId,
                user_id: sessionData.userAccount.user_id
            });

            if (!devicePairing) {
                throw new Error('Pairing request not found');
            }

            devicePairing.status = 'cancelled';
            await devicePairing.save();

            // Clean up memory storage
            this.pairingStorage.delete(pairingId);

            return { success: true, cancelled: true };

        } catch (error) {
            console.error('Pairing cancellation failed:', error);
            throw new Error(`Pairing cancellation failed: ${error.message}`);
        }
    }

    /**
     * List user's devices and their pairing history
     */
    async getUserDevices(sessionToken) {
        try {
            const sessionData = await this.validateCurrentSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid session');
            }

            const { userAccount } = sessionData;

            // Get all passkey credentials for user
            const credentials = await PasskeyCredential.find({
                user_id: userAccount.user_id,
                revoked: false
            }).sort({ created_at: -1 });

            // Get active sessions
            const activeSessions = await DeviceSession.find({
                user_id: userAccount.user_id,
                revoked: false,
                expires_at: { $gt: new Date() }
            }).sort({ last_activity: -1 });

            // Get recent pairings
            const recentPairings = await DevicePairing.find({
                user_id: userAccount.user_id
            }).sort({ created_at: -1 }).limit(10);

            return {
                devices: credentials.map(cred => ({
                    credential_id: cred.credential_id,
                    device_name: cred.device_name,
                    device_type: cred.device_type,
                    is_primary: cred.is_primary,
                    created_at: cred.created_at,
                    last_used: cred.last_used,
                    backup_eligible: cred.backup_eligible
                })),
                activeSessions: activeSessions.map(session => ({
                    session_id: session.session_id,
                    credential_id: session.credential_id,
                    device_fingerprint: session.device_fingerprint.slice(0, 8) + '...',
                    ip_address: session.ip_address,
                    created_at: session.created_at,
                    last_activity: session.last_activity
                })),
                recentPairings: recentPairings.map(pairing => ({
                    pairing_id: pairing.pairing_id,
                    status: pairing.status,
                    created_at: pairing.created_at,
                    completed_at: pairing.completed_at,
                    target_device_info: pairing.target_device_info
                }))
            };

        } catch (error) {
            console.error('Device listing failed:', error);
            throw new Error(`Failed to list devices: ${error.message}`);
        }
    }

    /**
     * Revoke device access
     */
    async revokeDevice(sessionToken, credentialIdToRevoke) {
        try {
            const sessionData = await this.validateCurrentSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid session');
            }

            // Don't allow revoking the current session's credential
            if (credentialIdToRevoke === sessionData.deviceSession.credential_id) {
                throw new Error('Cannot revoke current session device');
            }

            // Revoke the credential
            await PasskeyCredential.updateOne(
                {
                    user_id: sessionData.userAccount.user_id,
                    credential_id: credentialIdToRevoke
                },
                {
                    revoked: true,
                    revoked_reason: 'User revoked'
                }
            );

            // Revoke all sessions for this credential
            await DeviceSession.updateMany(
                {
                    user_id: sessionData.userAccount.user_id,
                    credential_id: credentialIdToRevoke
                },
                { revoked: true }
            );

            // Update backup passkeys list
            await UserAccount.updateOne(
                { user_id: sessionData.userAccount.user_id },
                {
                    $set: {
                        'backup_passkeys.$[elem].revoked': true
                    }
                },
                {
                    arrayFilters: [{ 'elem.credential_id': credentialIdToRevoke }]
                }
            );

            return { success: true, revoked: true };

        } catch (error) {
            console.error('Device revocation failed:', error);
            throw new Error(`Device revocation failed: ${error.message}`);
        }
    }

    /**
     * Validate current session (helper method)
     */
    async validateCurrentSession(sessionToken) {
        try {
            const deviceSession = await DeviceSession.findOne({
                session_token: sessionToken,
                revoked: false,
                expires_at: { $gt: new Date() }
            });

            if (!deviceSession) {
                return null;
            }

            const userAccount = await UserAccount.findOne({
                user_id: deviceSession.user_id
            });

            if (!userAccount) {
                return null;
            }

            return {
                deviceSession,
                userAccount
            };

        } catch (error) {
            console.error('Session validation failed:', error);
            return null;
        }
    }

    /**
     * Generate device fingerprint
     */
    generateDeviceFingerprint(deviceInfo) {
        const components = [
            deviceInfo.userAgent || '',
            deviceInfo.screenResolution || '',
            deviceInfo.timezone || '',
            deviceInfo.language || '',
            deviceInfo.platform || ''
        ].join('|');

        return crypto.createHash('sha256').update(components).digest('hex');
    }

    /**
     * Clean up expired pairings from memory and database
     */
    async cleanupExpiredPairings() {
        try {
            // Clean up memory storage
            const now = Date.now();
            const expiredTime = this.PAIRING_EXPIRY_MINUTES * 60 * 1000;

            for (const [key, value] of this.pairingStorage.entries()) {
                if (now - value.timestamp > expiredTime) {
                    this.pairingStorage.delete(key);
                }
            }

            // Clean up database (older than 1 hour)
            const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
            await DevicePairing.deleteMany({
                expires_at: { $lt: oneHourAgo },
                status: { $in: ['pending', 'expired'] }
            });

        } catch (error) {
            console.error('Pairing cleanup failed:', error);
        }
    }
}

module.exports = new QRPairingService();