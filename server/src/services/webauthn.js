// Polyfill Web Crypto API for @simplewebauthn/server in Node.js 18+
if (!globalThis.crypto) {
    const nodeCrypto = require('crypto');
    globalThis.crypto = nodeCrypto.webcrypto;
}

const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const {
    UserAccount,
    PasskeyCredential,
    DeviceSession,
    EmailVerification,
    UserProfile
} = require('../database/models');
const { normalizeEmail, buildEmailQuery } = require('../utils/email-normalizer');
const { originCanUseRpId } = require('../utils/webauthn-rp');
const { eventBus, EVENTS } = require('./eventBus');

/**
 * WebAuthn Service for Passkey Authentication
 * Handles registration, authentication, and device management
 */
class WebAuthnService {
    constructor() {
        this.rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
        this.rpName = process.env.WEBAUTHN_RP_NAME || 'CasperID';

        // Support multiple origins (comma-separated or single)
        const baseOrigin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';
        this.origins = baseOrigin.split(',').map(o => o.trim());

        // Automatically add 'www' counterpart if it's a production domain and not already present
        if (this.origins.some(o => o.includes('casperid.com')) && !this.origins.some(o => o.includes('www.casperid.com'))) {
            this.origins.push('https://www.casperid.com');
        }
        if (this.origins.some(o => o.includes('www.casperid.com')) && !this.origins.some(o => o === 'https://casperid.com')) {
            this.origins.push('https://casperid.com');
        }

        this.timeout = parseInt(process.env.WEBAUTHN_CHALLENGE_TIMEOUT) || 60000;

        // Temporary storage for registration/authentication challenges
        this.challengeStorage = new Map();
    }

    /**
     * Reject web origins that cannot legally exercise credentials for this RP ID.
     * Native applications do not send a web Origin header and are validated
     * separately through their platform-specific origin during verification.
     */
    assertOriginCanUseRpID(origin) {
        if (!origin) return;

        if (originCanUseRpId(origin, this.rpID)) return;

        // VS Code Dev Tunnels can rewrite the browser Origin header to the
        // local forwarded address before Vite proxies the request. Allow that
        // development-only transport detail when the configured WebAuthn
        // origin itself is valid for the RP ID. Verification still checks the
        // browser-signed clientDataJSON origin against this.origins.
        let receivedHostname = '';
        try {
            receivedHostname = new URL(origin).hostname;
        } catch {
            // The mismatch error below handles malformed origins.
        }
        const isLocalDevelopmentProxy =
            process.env.NODE_ENV !== 'production' &&
            (receivedHostname === 'localhost' || receivedHostname === '127.0.0.1') &&
            this.origins.some(configuredOrigin => originCanUseRpId(configuredOrigin, this.rpID));

        if (isLocalDevelopmentProxy) {
            console.warn('[WebAuthn] Accepting localhost Origin rewritten by development proxy:', {
                receivedOrigin: origin,
                expectedRpId: this.rpID,
                allowedOrigins: this.origins,
            });
            return;
        }

        console.warn('[WebAuthn] RP origin mismatch:', {
            receivedOrigin: origin,
            expectedRpId: this.rpID,
            allowedOrigins: this.origins,
        });
        throw new Error(
            `WebAuthn must be completed on a ${this.rpID} origin; received ${origin}`
        );
    }

    /**
     * Generate registration options for new passkey creation
     */
    async generateRegistrationOptions(userEmail, userName = null, isEmailVerified = false) {
        try {
            const userId = uuidv4();
            // Normalize email for consistent storage (handles Gmail dot-stripping)
            const normalizedUserEmail = normalizeEmail(userEmail);
            const userDisplayName = userName || normalizedUserEmail.split('@')[0];

            // Check if user already exists (using normalized email query for Gmail compatibility)
            const existingUser = await UserAccount.findOne(buildEmailQuery(userEmail));

            if (existingUser && existingUser.email_verified) {
                throw new Error('User with this email already exists');
            }

            // Get existing credentials if user exists but not verified
            const existingCredentials = existingUser ?
                await PasskeyCredential.find({ user_id: existingUser.user_id }) : [];

            const options = await generateRegistrationOptions({
                rpName: this.rpName,
                rpID: this.rpID,
                userID: Buffer.from(userId),
                userName: userEmail,
                userDisplayName: userDisplayName,
                timeout: this.timeout,
                attestationType: 'none',
                excludeCredentials: existingCredentials.map(cred => ({
                    id: Buffer.from(cred.credential_id, 'base64url'),
                    type: 'public-key',
                    transports: cred.transports,
                })),
                authenticatorSelection: {
                    residentKey: 'preferred',
                    userVerification: 'preferred',
                    // Removed authenticatorAttachment: 'platform' to support legacy devices (USB keys, etc.)
                },
                supportedAlgorithmIDs: [-7, -257],
            });

            // Store challenge temporarily (5 minutes) - store ORIGINAL email for display/storage
            // Normalization is only used for lookups, not storage
            this.challengeStorage.set(userId, {
                challenge: options.challenge,
                userEmail: userEmail.trim().toLowerCase(),  // Original email (just lowercased)
                isEmailVerified,
                rpId: this.rpID,
                timestamp: Date.now(),
            });

            // Cleanup expired challenges
            this.cleanupExpiredChallenges();

            return {
                userId,
                options,
                expiresIn: this.timeout,
            };

        } catch (error) {
            console.error('Registration options generation failed:', error);
            throw new Error(`Registration setup failed: ${error.message}`);
        }
    }

    /**
     * Verify registration response and create user account
     * @param {string} userId
     * @param {object} registrationResponse
     * @param {object} deviceInfo
     * @param {string[]} overrideOrigins - Optional origins from BusinessApp.allowed_origins
     */
    async verifyRegistration(userId, registrationResponse, deviceInfo = {}, overrideOrigins = null) {
        try {
            const storedChallenge = this.challengeStorage.get(userId);
            if (!storedChallenge) {
                throw new Error('Registration challenge not found or expired');
            }

            // Use override origins if provided (from BusinessApp), otherwise use default
            const expectedOrigins = overrideOrigins && overrideOrigins.length > 0
                ? [...this.origins, ...overrideOrigins]
                : this.origins;
            // Use the rpId that was stored during generateRegistrationOptions
            const expectedRPID = storedChallenge.rpId || this.rpID;

            // Verify the registration
            const verification = await verifyRegistrationResponse({
                response: registrationResponse,
                expectedChallenge: storedChallenge.challenge,
                expectedOrigin: expectedOrigins,
                expectedRPID: expectedRPID,
                requireUserVerification: true,
            });


            if (!verification.verified || !verification.registrationInfo) {
                console.error('❌ Registration verification failed:', {
                    verified: verification.verified,
                    hasRegistrationInfo: !!verification.registrationInfo
                });
                throw new Error('Registration verification failed');
            }

            // Extract credential data from SimpleWebAuthn v13 structure
            const { credential, attestationObject } = verification.registrationInfo;
            const credentialID = credential.id;
            const credentialPublicKey = credential.publicKey;
            const counter = credential.counter;


            // Generate user salt for key derivation
            const userSalt = crypto.randomBytes(32).toString('hex');

            // Create or update user account (use normalized email query for Gmail compatibility)
            let userAccount = await UserAccount.findOne(buildEmailQuery(storedChallenge.userEmail));

            if (!userAccount) {
                // New users must have verified OTP before reaching passkey creation
                // The UI flow enforces OTP verification first, so email is verified
                userAccount = new UserAccount({
                    user_id: userId,
                    recovery_email: storedChallenge.userEmail,
                    email_verified: true,
                    user_salt: userSalt,
                    active_passkey_id: Buffer.from(credentialID).toString('base64url'),
                    tier: 'layer_1',
                });
            } else {
                userAccount.active_passkey_id = Buffer.from(credentialID).toString('base64url');
                userAccount.user_salt = userSalt;
                // Existing users completing passkey registration have verified email
                userAccount.email_verified = true;
                userAccount.tier = userAccount.tier || 'layer_1';
            }

            await userAccount.save();

            // Store passkey credential
            const passkeyCredential = new PasskeyCredential({
                user_id: userId,
                credential_id: Buffer.from(credentialID).toString('base64url'),
                rp_id: expectedRPID,
                credential_public_key: Buffer.from(credentialPublicKey),
                counter: counter,
                device_type: deviceInfo.deviceType || 'desktop',
                device_name: deviceInfo.deviceName || 'Unknown Device',
                transports: registrationResponse.response.transports || [],
                backup_eligible: verification.registrationInfo.backupEligible || false,
                backup_state: verification.registrationInfo.backupState || false,
                attestation_object: Buffer.from(attestationObject),
                client_data_json: Buffer.from(registrationResponse.response.clientDataJSON, 'base64url'),
                is_primary: true,
            });

            await passkeyCredential.save();

            // Clean up challenge
            this.challengeStorage.delete(userId);

            // Create device session immediately after registration (user is logged in)
            const sessionId = uuidv4();
            const sessionToken = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

            const deviceSession = new DeviceSession({
                session_id: sessionId,
                user_id: userId,
                credential_id: Buffer.from(credentialID).toString('base64url'),
                session_token: sessionToken,
                device_fingerprint: this.generateDeviceFingerprint(deviceInfo),
                ip_address: deviceInfo.ipAddress,
                user_agent: deviceInfo.userAgent,
                expires_at: expiresAt,
            });

            await deviceSession.save();

            // Skip automatic email verification - users already verify via OTP before passkey creation
            // The OTP flow in auth.js handles email verification for registration
            const emailVerificationId = null;

            // Fetch UserProfile for identity claims (human_id, name) if exists
            let profileData = { human_id: null, name: null };
            if (userAccount.wallet) {
                const profile = await UserProfile.findOne({ wallet: userAccount.wallet });
                if (profile) {
                    profileData.human_id = profile.human_id || null;
                    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
                    profileData.name = fullName || null;
                }
            }

            // Emit user registered event (subscribers handle email, activity, etc.)
            eventBus.emit(EVENTS.USER_REGISTERED, {
                userId: userAccount.user_id,
                email: storedChallenge.userEmail,
                name: profileData.name || storedChallenge.userEmail?.split('@')[0],
                wallet: userAccount.wallet,
                tier: userAccount.tier
            });

            return {
                success: true,
                userId,
                credentialId: Buffer.from(credentialID).toString('base64url'),
                sessionId,
                sessionToken,
                expiresAt,
                emailVerificationId, // For optional recovery setup
                userAccount: {
                    user_id: userAccount.user_id,
                    recovery_email: userAccount.recovery_email,
                    tier: userAccount.tier,
                    email_verified: userAccount.email_verified,
                    wallet: userAccount.wallet,
                    human_id: profileData.human_id,
                    name: profileData.name,
                }
            };

        } catch (error) {
            console.error('Registration verification failed:', error);
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    /**
     * Generate authentication options for passkey login
     */
    async generateAuthenticationOptions(userIdentifier = null) {
        try {
            let allowCredentials = [];
            let deviceTypeHint = 'desktop';
            let passkeyTransports = [];

            // If user identifier provided (email), get their credentials (using normalized email query)
            if (userIdentifier) {
                const userAccount = await UserAccount.findOne(buildEmailQuery(userIdentifier));

                if (userAccount) {
                    // Get device type hint for the primary passkey
                    const primaryPasskey = await PasskeyCredential.findOne({
                        user_id: userAccount.user_id,
                        revoked: false,
                        is_primary: true
                    });

                    if (primaryPasskey) {
                        deviceTypeHint = primaryPasskey.device_type;
                        // Store transports to help frontend decide on cross-device flow
                        // 'hybrid' transport indicates passkey was registered via QR code scan
                        passkeyTransports = primaryPasskey.transports || [];
                    }

                    // For email-based auth, DON'T send allowCredentials to avoid conditional UI
                    // This forces the browser to use modal UI and directly prompt Touch ID
                    allowCredentials = [];
                }
            }

            const finalAllowCredentials = allowCredentials.length > 0 ? allowCredentials : undefined;

            const options = await generateAuthenticationOptions({
                timeout: this.timeout,
                allowCredentials: finalAllowCredentials,
                userVerification: 'preferred',
                rpID: this.rpID,
            });

            // Store challenge temporarily
            const challengeId = uuidv4();
            this.challengeStorage.set(challengeId, {
                challenge: options.challenge,
                userIdentifier,
                rpId: this.rpID,
                timestamp: Date.now(),
            });

            this.cleanupExpiredChallenges();

            return {
                challengeId,
                options,
                deviceType: deviceTypeHint,
                transports: passkeyTransports,
                expiresIn: this.timeout,
            };

        } catch (error) {
            console.error('Authentication options generation failed:', error);
            throw new Error(`Authentication setup failed: ${error.message}`);
        }
    }

    /**
     * Verify authentication response and create session
     * @param {string} challengeId
     * @param {object} authenticationResponse
     * @param {object} deviceInfo
     * @param {string[]} overrideOrigins - Optional origins from BusinessApp.allowed_origins
     */
    async verifyAuthentication(challengeId, authenticationResponse, deviceInfo = {}, overrideOrigins = null) {
        try {
            const storedChallenge = this.challengeStorage.get(challengeId);
            if (!storedChallenge) {
                throw new Error('Authentication challenge not found or expired');
            }


            // Convert credential ID to match database format
            // The database stores credential IDs as base64url encoded from the original base64url
            // So we need to convert browser's rawId (base64url) to base64 then back to base64url to match DB
            const searchCredentialId = authenticationResponse.rawId;


            // Try to find credential with the original format first
            let credential = await PasskeyCredential.findOne({
                credential_id: searchCredentialId,
                revoked: false
            });

            // If not found, try base64 encoding the rawId (to match double encoding from registration)
            if (!credential) {
                const doubleEncodedId = Buffer.from(searchCredentialId).toString('base64url');

                credential = await PasskeyCredential.findOne({
                    credential_id: doubleEncodedId,
                    revoked: false
                });
            }

            if (!credential) {
                // Debug: List all credentials to see what we have
                const allCredentials = await PasskeyCredential.find({ revoked: false });
                throw new Error('Credential not found');
            }

            if (credential.rp_id && credential.rp_id !== storedChallenge.rpId) {
                throw new Error('Credential belongs to a different relying party');
            }


            // Find user account
            const userAccount = await UserAccount.findOne({
                user_id: credential.user_id
            });

            if (!userAccount) {
                throw new Error('User account not found');
            }


            // Ensure counter is a valid number
            const counter = credential.counter || 0;
            console.log('🔍 Using counter value:', counter);

            // Verify the authentication
            // Need to use the original credential ID (searchCredentialId) for verification, not the double-encoded one
            const actualCredentialId = searchCredentialId;
            console.log('🔍 Using credential ID for verification:', actualCredentialId);

            // Debug the authenticator object
            const credentialIdBuffer = Buffer.from(actualCredentialId, 'base64url');

            // Ensure credentialPublicKey is a clean Buffer (not Mongoose Buffer)
            const cleanPublicKey = Buffer.from(credential.credential_public_key);

            const authenticatorObj = {
                credentialID: credentialIdBuffer,
                credentialPublicKey: cleanPublicKey,
                counter: counter,
            };

            console.log('🔍 Clean public key conversion:', {
                originalType: credential.credential_public_key.constructor.name,
                isMongooseBuffer: credential.credential_public_key.isMongooseBuffer,
                cleanType: cleanPublicKey.constructor.name,
                isBuffer: Buffer.isBuffer(cleanPublicKey),
                sameLength: credential.credential_public_key.length === cleanPublicKey.length
            });

            console.log('🔍 Authenticator object details:', {
                credentialID: {
                    type: typeof authenticatorObj.credentialID,
                    isBuffer: Buffer.isBuffer(authenticatorObj.credentialID),
                    length: authenticatorObj.credentialID?.length
                },
                credentialPublicKey: {
                    type: typeof authenticatorObj.credentialPublicKey,
                    isBuffer: Buffer.isBuffer(authenticatorObj.credentialPublicKey),
                    length: authenticatorObj.credentialPublicKey?.length
                },
                counter: {
                    value: authenticatorObj.counter,
                    type: typeof authenticatorObj.counter
                }
            });

            console.log('🔍 Authentication request details:', {
                responseType: typeof authenticationResponse,
                responseKeys: Object.keys(authenticationResponse),
                challengeType: typeof storedChallenge.challenge,
                origins: this.origins,
                rpID: this.rpID
            });

            console.log('🔍 Authentication response content:', {
                id: authenticationResponse.id,
                rawId: {
                    type: typeof authenticationResponse.rawId,
                    length: authenticationResponse.rawId?.length
                },
                type: authenticationResponse.type,
                response: {
                    authenticatorData: {
                        type: typeof authenticationResponse.response?.authenticatorData,
                        length: authenticationResponse.response?.authenticatorData?.length
                    },
                    clientDataJSON: {
                        type: typeof authenticationResponse.response?.clientDataJSON,
                        length: authenticationResponse.response?.clientDataJSON?.length
                    },
                    signature: {
                        type: typeof authenticationResponse.response?.signature,
                        length: authenticationResponse.response?.signature?.length
                    },
                    userHandle: {
                        type: typeof authenticationResponse.response?.userHandle,
                        value: authenticationResponse.response?.userHandle
                    }
                }
            });

            // Convert the authenticationResponse to the format expected by SimpleWebAuthn
            // The library expects specific formats for different fields
            const convertedResponse = {
                id: authenticationResponse.id, // Keep as base64url string
                rawId: authenticationResponse.rawId, // Keep as base64url string  
                type: authenticationResponse.type,
                clientExtensionResults: authenticationResponse.clientExtensionResults || {},
                response: {
                    authenticatorData: authenticationResponse.response.authenticatorData, // Keep as base64url string
                    clientDataJSON: authenticationResponse.response.clientDataJSON, // Keep as base64url string
                    signature: authenticationResponse.response.signature, // Keep as base64url string
                    userHandle: authenticationResponse.response.userHandle // Keep as base64url string or null
                }
            };

            console.log('🔍 Converted response for verification (all base64url strings):', {
                id: {
                    type: typeof convertedResponse.id,
                    length: convertedResponse.id?.length,
                    value: convertedResponse.id
                },
                rawId: {
                    type: typeof convertedResponse.rawId,
                    length: convertedResponse.rawId?.length,
                    value: convertedResponse.rawId
                },
                type: convertedResponse.type,
                response: {
                    authenticatorData: {
                        type: typeof convertedResponse.response.authenticatorData,
                        length: convertedResponse.response.authenticatorData?.length
                    },
                    clientDataJSON: {
                        type: typeof convertedResponse.response.clientDataJSON,
                        length: convertedResponse.response.clientDataJSON?.length
                    },
                    signature: {
                        type: typeof convertedResponse.response.signature,
                        length: convertedResponse.response.signature?.length
                    },
                    userHandle: {
                        type: typeof convertedResponse.response.userHandle,
                        value: convertedResponse.response.userHandle
                    }
                }
            });

            // Use override origins if provided (from BusinessApp), otherwise use default
            const expectedOrigins = overrideOrigins && overrideOrigins.length > 0
                ? [...this.origins, ...overrideOrigins]
                : this.origins;
            // Use the rpId that was stored during generateAuthenticationOptions
            const expectedRPID = storedChallenge.rpId || this.rpID;

            console.log('🔍 About to call verifyAuthenticationResponse with:');
            console.log('   expectedChallenge:', storedChallenge.challenge);
            console.log('   expectedOrigins:', expectedOrigins);
            console.log('   expectedRPID:', expectedRPID);
            console.log('   authenticator:', {
                credentialID: authenticatorObj.credentialID,
                credentialPublicKey: authenticatorObj.credentialPublicKey,
                counter: authenticatorObj.counter
            });

            let verification;
            try {
                // Use standard v13 API format
                // The library expects 'credential' object with id, publicKey, and counter
                const verificationOptions = {
                    response: convertedResponse,
                    expectedChallenge: storedChallenge.challenge,
                    expectedOrigin: expectedOrigins,
                    expectedRPID: expectedRPID,
                    credential: {
                        id: authenticatorObj.credentialID,
                        publicKey: authenticatorObj.credentialPublicKey,
                        counter: authenticatorObj.counter,
                    },
                    requireUserVerification: true,
                };

                console.log('🔍 Verifying with options:', {
                    credentialId: verificationOptions.credential.id,
                    publicKeyLength: verificationOptions.credential.publicKey?.length,
                    counter: verificationOptions.credential.counter
                });

                verification = await verifyAuthenticationResponse(verificationOptions);
                console.log('✅ Authentication verification successful!');
            } catch (verificationError) {
                console.error('❌ Authentication verification failed:', verificationError);
                throw verificationError;
            }

            if (!verification.verified) {
                throw new Error('Authentication verification failed');
            }

            // Update counter
            credential.counter = verification.authenticationInfo.newCounter;
            credential.last_used = new Date();
            // Credentials created before rp_id tracking are safe to backfill only
            // after the authenticator proves they belong to the configured RP ID.
            if (!credential.rp_id) {
                credential.rp_id = expectedRPID;
            }
            await credential.save();

            // Create device session
            const sessionId = uuidv4();
            const sessionToken = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

            const deviceSession = new DeviceSession({
                session_id: sessionId,
                user_id: userAccount.user_id,
                credential_id: credential.credential_id,
                session_token: sessionToken,
                device_fingerprint: this.generateDeviceFingerprint(deviceInfo),
                ip_address: deviceInfo.ipAddress,
                user_agent: deviceInfo.userAgent,
                expires_at: expiresAt,
            });

            await deviceSession.save();

            // Clean up challenge
            this.challengeStorage.delete(challengeId);

            // Fetch UserProfile for identity claims (human_id, name)
            let profileData = { human_id: null, name: null };
            if (userAccount.wallet) {
                const profile = await UserProfile.findOne({ wallet: userAccount.wallet });
                if (profile) {
                    profileData.human_id = profile.human_id || null;
                    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
                    profileData.name = fullName || null;
                }
            }

            return {
                success: true,
                sessionId,
                sessionToken,
                expiresAt,
                userAccount: {
                    user_id: userAccount.user_id,
                    recovery_email: userAccount.recovery_email,
                    tier: userAccount.tier,
                    email_verified: userAccount.email_verified,
                    wallet: userAccount.wallet,
                    metamask_connected: userAccount.metamask_connected,
                    human_id: profileData.human_id,
                    name: profileData.name,
                }
            };

        } catch (error) {
            console.error('Authentication verification failed:', error);
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    /**
     * Generate device fingerprint for session binding
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
     * Validate session token and return user info
     */
    async validateSession(sessionToken) {
        try {
            const session = await DeviceSession.findOne({
                session_token: sessionToken,
                revoked: false,
                expires_at: { $gt: new Date() }
            });

            if (!session) {
                return null;
            }

            // Update last activity
            session.last_activity = new Date();
            await session.save();

            const userAccount = await UserAccount.findOne({
                user_id: session.user_id
            });

            return {
                session,
                userAccount
            };

        } catch (error) {
            console.error('Session validation failed:', error);
            return null;
        }
    }

    /**
     * Revoke session
     */
    async revokeSession(sessionToken) {
        try {
            await DeviceSession.updateOne(
                { session_token: sessionToken },
                { revoked: true }
            );
            return true;
        } catch (error) {
            console.error('Session revocation failed:', error);
            return false;
        }
    }

    /**
     * Clean up expired challenges from memory
     */
    cleanupExpiredChallenges() {
        const now = Date.now();
        const expiredTime = 5 * 60 * 1000; // 5 minutes

        for (const [key, value] of this.challengeStorage.entries()) {
            if (now - value.timestamp > expiredTime) {
                this.challengeStorage.delete(key);
            }
        }
    }
}

module.exports = new WebAuthnService();
