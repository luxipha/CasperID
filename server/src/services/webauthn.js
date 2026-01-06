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
    EmailVerification
} = require('../database/models');

/**
 * WebAuthn Service for Passkey Authentication
 * Handles registration, authentication, and device management
 */
class WebAuthnService {
    constructor() {
        this.rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
        this.rpName = process.env.WEBAUTHN_RP_NAME || 'CasperID';
        this.origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';
        this.timeout = parseInt(process.env.WEBAUTHN_CHALLENGE_TIMEOUT) || 60000;

        // Temporary storage for registration/authentication challenges
        this.challengeStorage = new Map();
    }

    /**
     * Generate registration options for new passkey creation
     */
    async generateRegistrationOptions(userEmail, userName = null) {
        try {
            const userId = uuidv4();
            const userDisplayName = userName || userEmail.split('@')[0];

            // Check if user already exists
            const existingUser = await UserAccount.findOne({
                recovery_email: userEmail
            });

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
                    authenticatorAttachment: 'platform',
                },
                supportedAlgorithmIDs: [-7, -257],
            });

            // Store challenge temporarily (5 minutes)
            this.challengeStorage.set(userId, {
                challenge: options.challenge,
                userEmail,
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
     */
    async verifyRegistration(userId, registrationResponse, deviceInfo = {}) {
        try {
            const storedChallenge = this.challengeStorage.get(userId);
            if (!storedChallenge) {
                throw new Error('Registration challenge not found or expired');
            }

            console.log('🔍 About to verify registration with:', {
                registrationResponse,
                expectedChallenge: storedChallenge.challenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID
            });

            // Verify the registration
            const verification = await verifyRegistrationResponse({
                response: registrationResponse,
                expectedChallenge: storedChallenge.challenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
                requireUserVerification: true,
            });

            console.log('📋 Verification result:', verification);
            console.log('📋 Registration info:', verification.registrationInfo);

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

            console.log('🔑 Extracted credential data:', {
                credentialID: credentialID ? `[${typeof credentialID}] ${credentialID}` : 'UNDEFINED',
                credentialPublicKey: credentialPublicKey ? `[${typeof credentialPublicKey}] ${credentialPublicKey.length} bytes` : 'UNDEFINED',
                counter,
                hasAttestationObject: !!attestationObject,
                actualTransports: registrationResponse.response.transports
            });

            // Generate user salt for key derivation
            const userSalt = crypto.randomBytes(32).toString('hex');

            // Create or update user account
            let userAccount = await UserAccount.findOne({
                recovery_email: storedChallenge.userEmail
            });

            if (!userAccount) {
                userAccount = new UserAccount({
                    user_id: userId,
                    recovery_email: storedChallenge.userEmail,
                    email_verified: false,
                    user_salt: userSalt,
                    active_passkey_id: Buffer.from(credentialID).toString('base64url'),
                    layer_status: 'layer_0',
                });
            } else {
                userAccount.active_passkey_id = Buffer.from(credentialID).toString('base64url');
                userAccount.user_salt = userSalt;
            }

            await userAccount.save();

            // Store passkey credential
            const passkeyCredential = new PasskeyCredential({
                user_id: userId,
                credential_id: Buffer.from(credentialID).toString('base64url'),
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

            // Initialize email verification (optional - for recovery)
            const emailVerificationId = await this.initializeEmailVerification(
                storedChallenge.userEmail,
                userId,
                'registration'
            );

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
                    layer_status: userAccount.layer_status,
                    email_verified: userAccount.email_verified,
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

            // If user identifier provided (email), get their credentials
            if (userIdentifier) {
                console.log(`🔍 Email-based auth requested for: ${userIdentifier}`);
                const userAccount = await UserAccount.findOne({
                    recovery_email: userIdentifier
                });

                if (userAccount) {
                    const userCredentials = await PasskeyCredential.find({
                        user_id: userAccount.user_id,
                        revoked: false
                    });

                    console.log('🔍 Found credentials for user:', userCredentials.length);
                    userCredentials.forEach((cred, i) => {
                        console.log(`   ${i + 1}. Credential ID: ${cred.credential_id}`);
                        console.log(`      Type: ${typeof cred.credential_id}`);
                        console.log(`      Length: ${cred.credential_id?.length}`);
                        console.log(`      Transports in DB: ${JSON.stringify(cred.transports)}`);
                    });

                    // For email-based auth, DON'T send allowCredentials to avoid conditional UI
                    // This forces the browser to use modal UI and directly prompt Touch ID
                    console.log('🚫 Skipping allowCredentials for email-based auth to force modal Touch ID');
                    allowCredentials = [];
                } else {
                    console.log('❌ No user account found for email:', userIdentifier);
                }
            } else {
                console.log('🔍 No email provided - using discoverable credentials');
            }

            console.log('🔍 About to call generateAuthenticationOptions with:');
            console.log('   allowCredentials length:', allowCredentials.length);
            allowCredentials.forEach((cred, i) => {
                console.log(`   ${i + 1}. id type:`, typeof cred.id);
                console.log(`   ${i + 1}. id value:`, cred.id);
                console.log(`   ${i + 1}. id length:`, cred.id?.length);
                console.log(`   ${i + 1}. type:`, cred.type);
                console.log(`   ${i + 1}. transports:`, cred.transports);
            });

            const finalAllowCredentials = allowCredentials.length > 0 ? allowCredentials : undefined;
            console.log('📋 Final allowCredentials:', finalAllowCredentials ? 'PROVIDED' : 'UNDEFINED');
            console.log('📋 This will trigger:', finalAllowCredentials ? 'CONDITIONAL UI (device selection)' : 'MODAL UI (direct Touch ID)');

            const options = await generateAuthenticationOptions({
                timeout: this.timeout,
                allowCredentials: finalAllowCredentials,
                userVerification: 'preferred',
                rpID: this.rpID,
            });

            console.log('✅ Generated authentication options successfully');

            // Store challenge temporarily
            const challengeId = uuidv4();
            this.challengeStorage.set(challengeId, {
                challenge: options.challenge,
                userIdentifier,
                timestamp: Date.now(),
            });

            this.cleanupExpiredChallenges();

            return {
                challengeId,
                options,
                expiresIn: this.timeout,
            };

        } catch (error) {
            console.error('Authentication options generation failed:', error);
            throw new Error(`Authentication setup failed: ${error.message}`);
        }
    }

    /**
     * Verify authentication response and create session
     */
    async verifyAuthentication(challengeId, authenticationResponse, deviceInfo = {}) {
        try {
            const storedChallenge = this.challengeStorage.get(challengeId);
            if (!storedChallenge) {
                throw new Error('Authentication challenge not found or expired');
            }

            console.log('🔍 Authentication verification started with:', {
                challengeId,
                authResponseId: authenticationResponse.id,
                authResponseType: typeof authenticationResponse.id,
                authResponseIdLength: authenticationResponse.id?.length
            });

            // Convert credential ID to match database format
            // The database stores credential IDs as base64url encoded from the original base64url
            // So we need to convert browser's rawId (base64url) to base64 then back to base64url to match DB
            const searchCredentialId = authenticationResponse.rawId;

            console.log('🔍 Trying different credential ID formats:');
            console.log('   Original rawId:', searchCredentialId);

            // Try to find credential with the original format first
            let credential = await PasskeyCredential.findOne({
                credential_id: searchCredentialId,
                revoked: false
            });

            // If not found, try base64 encoding the rawId (to match double encoding from registration)
            if (!credential) {
                const doubleEncodedId = Buffer.from(searchCredentialId).toString('base64url');
                console.log('   Double encoded format:', doubleEncodedId);

                credential = await PasskeyCredential.findOne({
                    credential_id: doubleEncodedId,
                    revoked: false
                });
            }

            if (!credential) {
                // Debug: List all credentials to see what we have
                const allCredentials = await PasskeyCredential.find({ revoked: false });
                console.log('❌ Credential not found. Available credentials:');
                allCredentials.forEach((cred, i) => {
                    console.log(`   ${i + 1}. ${cred.credential_id} (length: ${cred.credential_id?.length})`);
                });
                console.log('   Searched for:', credentialIdBase64, '(length:', credentialIdBase64?.length, ')');
                throw new Error('Credential not found');
            }

            console.log('✅ Found credential:', credential.credential_id);
            console.log('🔍 Credential details:', {
                id: credential.credential_id,
                counter: credential.counter,
                counterType: typeof credential.counter,
                publicKeyLength: credential.credential_public_key?.length,
                userId: credential.user_id
            });

            // Find user account
            const userAccount = await UserAccount.findOne({
                user_id: credential.user_id
            });

            if (!userAccount) {
                throw new Error('User account not found');
            }

            console.log('🔍 User account found:', userAccount.user_id);

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
                origin: this.origin,
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

            console.log('🔍 About to call verifyAuthenticationResponse with:');
            console.log('   expectedChallenge:', storedChallenge.challenge);
            console.log('   expectedOrigin:', this.origin);
            console.log('   expectedRPID:', this.rpID);
            console.log('   authenticator:', {
                credentialID: authenticatorObj.credentialID,
                credentialPublicKey: authenticatorObj.credentialPublicKey,
                counter: authenticatorObj.counter
            });

            let verification;
            try {
                // Try the v13 API format - maybe authenticator should be called credential
                const verificationOptions = {
                    response: convertedResponse,
                    expectedChallenge: storedChallenge.challenge,
                    expectedOrigin: this.origin,
                    expectedRPID: this.rpID,
                    credential: {
                        id: authenticatorObj.credentialID,
                        publicKey: authenticatorObj.credentialPublicKey,
                        counter: authenticatorObj.counter,
                    },
                    requireUserVerification: true,
                };

                console.log('🔍 Trying credential format:', {
                    id: verificationOptions.credential.id,
                    publicKey: verificationOptions.credential.publicKey,
                    counter: verificationOptions.credential.counter
                });

                verification = await verifyAuthenticationResponse(verificationOptions);
                console.log('✅ Authentication verification successful!');
            } catch (verificationError) {
                console.log('❌ Credential format failed, trying authenticator format...');

                // Fallback to authenticator format
                try {
                    verification = await verifyAuthenticationResponse({
                        response: convertedResponse,
                        expectedChallenge: storedChallenge.challenge,
                        expectedOrigin: this.origin,
                        expectedRPID: this.rpID,
                        authenticator: authenticatorObj,
                        requireUserVerification: true,
                    });
                    console.log('✅ Authentication verification successful with authenticator format!');
                } catch (fallbackError) {
                    console.error('❌ Both formats failed:', {
                        credentialFormatError: verificationError.message,
                        authenticatorFormatError: fallbackError.message,
                        authenticatorCounter: authenticatorObj?.counter,
                        authenticatorCredentialID: authenticatorObj?.credentialID,
                        authenticatorPublicKey: authenticatorObj?.credentialPublicKey?.length
                    });
                    throw fallbackError;
                }
            }

            if (!verification.verified) {
                throw new Error('Authentication verification failed');
            }

            // Update counter
            credential.counter = verification.authenticationInfo.newCounter;
            credential.last_used = new Date();
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

            return {
                success: true,
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
                }
            };

        } catch (error) {
            console.error('Authentication verification failed:', error);
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    /**
     * Initialize email verification process
     */
    async initializeEmailVerification(email, userId, type = 'registration') {
        try {
            const verificationId = uuidv4();
            const verificationCode = crypto.randomInt(100000, 999999).toString();
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes

            const emailVerification = new EmailVerification({
                verification_id: verificationId,
                email,
                user_id: userId,
                verification_code: verificationCode,
                verification_token: verificationToken,
                type,
                expires_at: expiresAt,
            });

            await emailVerification.save();

            // TODO: Send actual email
            console.log(`Email verification code for ${email}: ${verificationCode}`);

            return verificationId;

        } catch (error) {
            console.error('Email verification initialization failed:', error);
            throw new Error(`Email verification setup failed: ${error.message}`);
        }
    }

    /**
     * Verify email verification code
     */
    async verifyEmailCode(verificationId, code) {
        try {
            const verification = await EmailVerification.findOne({
                verification_id: verificationId,
                verified: false,
                expires_at: { $gt: new Date() }
            });

            if (!verification) {
                throw new Error('Verification not found or expired');
            }

            if (verification.attempts >= verification.max_attempts) {
                throw new Error('Maximum verification attempts exceeded');
            }

            verification.attempts += 1;

            if (verification.verification_code !== code) {
                await verification.save();
                throw new Error('Invalid verification code');
            }

            verification.verified = true;
            verification.verified_at = new Date();
            await verification.save();

            // Update user account email verification status
            if (verification.user_id) {
                await UserAccount.updateOne(
                    { user_id: verification.user_id },
                    {
                        email_verified: true,
                        layer_status: 'layer_1' // Auto-upgrade to Layer 1 after email verification
                    }
                );
            }

            return {
                success: true,
                verified: true,
                userId: verification.user_id
            };

        } catch (error) {
            console.error('Email verification failed:', error);
            throw new Error(`Email verification failed: ${error.message}`);
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