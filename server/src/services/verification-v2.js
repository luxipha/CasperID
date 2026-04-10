const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const {
    UserAccount,
    VerificationRequestV2,
    PasskeyCredential,
    Credential,
    UserProfile
} = require('../database/models');
const walletGenerator = require('./wallet-generator');
const geminiService = require('./gemini');
const { eventBus, EVENTS } = require('./eventBus');

/**
 * Verification Service V2
 * Updated verification flows that work with self-custody wallets
 * Supports both Layer 2 (liveness) and Layer 3 (full KYC) verification
 */
class VerificationServiceV2 {
    constructor() {
        this.VERIFICATION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
        this.LIVENESS_THRESHOLD = 0.8; // Minimum score for liveness verification
    }

    /**
     * Start Layer 2 verification (Liveness + Optional Wallet Link)
     */
    async startLayer2Verification(sessionToken, options = {}) {
        try {
            const { linkWallet = false, purpose = 'Layer 2 Verification', appId = 'casperid-internal' } = options;

            // Validate user session
            const sessionData = await this.validateUserSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid or expired session');
            }

            const { userAccount } = sessionData;

            // Check if user is eligible for Layer 2
            if (userAccount.tier !== 'layer_1') {
                throw new Error('User must complete Layer 1 before Layer 2 verification');
            }

            // Check if already verified at Layer 2 or higher
            const existingCredential = await Credential.findOne({
                wallet: userAccount.wallet,
                tier: { $in: ['layer_1', 'layer_3'] },
                revoked: false
            });

            if (existingCredential) {
                throw new Error('User already has verification credentials');
            }

            // Create verification request
            const requestId = uuidv4();
            const verificationRequest = new VerificationRequestV2({
                request_id: requestId,
                user_id: userAccount.user_id,
                dapp_id: appId, // Use provided appId
                verification_tier: 'layer_2',
                requested_fields: ['liveness_verified'],
                purpose,
                status: 'pending'
            });

            await verificationRequest.save();

            return {
                requestId,
                verificationType: 'layer_2',
                status: 'pending',
                requirements: {
                    livenessCheck: true,
                    walletLink: linkWallet
                },
                expiresAt: verificationRequest.expires_at,
                nextStep: 'liveness_check'
            };

        } catch (error) {
            console.error('Layer 2 verification start failed:', error);
            throw new Error(`Layer 2 verification failed: ${error.message}`);
        }
    }

    /**
     * Start Layer 3 verification (Full KYC + Liveness)
     */
    async startLayer3Verification(sessionToken, options = {}) {
        try {
            const {
                verificationMethod = 'document_upload', // 'document_upload' or 'nimc'
                purpose = 'Layer 3 KYC Verification',
                appId = 'casperid-internal'
            } = options;

            // Validate user session
            const sessionData = await this.validateUserSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid or expired session');
            }

            const { userAccount } = sessionData;

            // Tiers are independent — layer_1 or layer_2 can start Layer 3 directly.
            // Only unverified (layer_0) users are blocked.
            const ELIGIBLE_TIERS = ['layer_1', 'layer_2'];
            if (!ELIGIBLE_TIERS.includes(userAccount.tier)) {
                throw new Error('Email verification (Layer 1) must be completed before starting Layer 3');
            }

            // Create verification request
            const requestId = uuidv4();
            const verificationRequest = new VerificationRequestV2({
                request_id: requestId,
                user_id: userAccount.user_id,
                dapp_id: appId,
                verification_tier: 'layer_3',
                requested_fields: ['identity_verified', 'liveness_verified'],
                purpose,
                status: 'pending'
            });

            await verificationRequest.save();

            return {
                requestId,
                verificationType: 'layer_3',
                status: 'pending',
                verificationMethod,
                requirements: {
                    identityDocument: verificationMethod === 'document_upload',
                    nimcVerification: verificationMethod === 'nimc',
                    livenessCheck: true
                },
                expiresAt: verificationRequest.expires_at,
                nextStep: verificationMethod === 'nimc' ? 'nimc_verification' : 'document_upload'
            };

        } catch (error) {
            console.error('Layer 3 verification start failed:', error);
            throw new Error(`Layer 3 verification failed: ${error.message}`);
        }
    }

    /**
     * Process liveness check (used in both Layer 2 and Layer 3)
     */
    async processLivenessCheck(requestId, livenessData) {
        try {
            const {
                videoFile,
                imageFrames,
                metadata = {}
            } = livenessData;

            // Find verification request
            const verificationRequest = await VerificationRequestV2.findOne({
                request_id: requestId,
                status: { $in: ['pending', 'in_progress'] }
            });

            if (!verificationRequest) {
                throw new Error('Verification request not found or expired');
            }

            // Update status to in_progress
            verificationRequest.status = 'in_progress';
            await verificationRequest.save();

            // Process liveness using Gemini AI
            let livenessScore;
            try {
                livenessScore = await geminiService.analyzeLiveness(imageFrames, metadata);
            } catch (aiError) {
                console.error('Liveness AI analysis failed:', aiError);
                // Fallback to basic checks if AI fails
                livenessScore = 0.7; // Conservative score
            }

            const livenessVerified = livenessScore >= this.LIVENESS_THRESHOLD;

            // Update verification data
            verificationRequest.verification_data = {
                ...verificationRequest.verification_data,
                liveness_score: livenessScore,
                liveness_verified: livenessVerified,
                liveness_processed_at: Date.now()
            };

            if (!livenessVerified) {
                verificationRequest.status = 'failed';
                verificationRequest.error_message = `Liveness verification failed. Score: ${livenessScore}`;
                await verificationRequest.save();

                return {
                    success: false,
                    error: 'Liveness verification failed',
                    score: livenessScore,
                    threshold: this.LIVENESS_THRESHOLD
                };
            }

            // If this is Layer 2 and only liveness is required, complete verification
            if (verificationRequest.verification_tier === 'layer_2') {
                return await this.completeLayer2Verification(requestId);
            }

            // For Layer 3, liveness is one step - proceed to next step
            await verificationRequest.save();

            return {
                success: true,
                livenessVerified: true,
                score: livenessScore,
                nextStep: 'identity_verification',
                requestId
            };

        } catch (error) {
            console.error('Liveness check processing failed:', error);
            throw new Error(`Liveness check failed: ${error.message}`);
        }
    }

    /**
     * Process document upload for Layer 3 verification
     */
    async processDocumentUpload(requestId, documentData) {
        try {
            const {
                documentType,
                frontImage,
                backImage,
                documentNumber,
                extractedData
            } = documentData;

            const verificationRequest = await VerificationRequestV2.findOne({
                request_id: requestId,
                status: 'in_progress'
            });

            if (!verificationRequest) {
                throw new Error('Verification request not found');
            }

            // TODO: Implement document verification logic
            // This would integrate with document verification services
            const documentVerified = true; // Placeholder

            // Update verification data
            verificationRequest.verification_data = {
                ...verificationRequest.verification_data,
                document_type: documentType,
                document_number: documentNumber,
                document_verified: documentVerified,
                extracted_data: extractedData,
                document_processed_at: Date.now()
            };

            await verificationRequest.save();

            // Check if both liveness and document are verified
            const canComplete = verificationRequest.verification_data.liveness_verified &&
                documentVerified;

            if (canComplete) {
                return await this.completeLayer3Verification(requestId);
            }

            return {
                success: true,
                documentVerified,
                nextStep: 'liveness_check',
                requestId
            };

        } catch (error) {
            console.error('Document upload processing failed:', error);
            throw new Error(`Document verification failed: ${error.message}`);
        }
    }

    /**
     * Complete Layer 2 verification and issue credential
     */
    async completeLayer2Verification(requestId) {
        try {
            const verificationRequest = await VerificationRequestV2.findOne({
                request_id: requestId
            });

            if (!verificationRequest) {
                throw new Error('Verification request not found');
            }

            const userAccount = await UserAccount.findOne({
                user_id: verificationRequest.user_id
            });

            if (!userAccount) {
                throw new Error('User account not found');
            }

            // Generate verification proof using self-custody wallet
            const proofData = await this.generateVerificationProof(
                userAccount,
                'layer_2',
                verificationRequest.verification_data
            );

            // Create credential
            const credentialData = await this.createVerificationCredential(
                userAccount,
                'layer_2', // Correctly identifying as layer_2
                proofData
            );

            // Update verification request
            verificationRequest.status = 'completed';
            verificationRequest.completed_at = new Date();
            verificationRequest.proof_generated = true;
            verificationRequest.proof_data = proofData;
            await verificationRequest.save();

            userAccount.updated_at = new Date();
            await userAccount.save();

            // Emit L2 verification completed event (subscribers handle email, webhook, activity)
            const profile = await UserProfile.findOne({ wallet: userAccount.wallet });
            const userName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') : null;

            eventBus.emit(EVENTS.VERIFICATION_L2_COMPLETED, {
                userId: userAccount.user_id,
                email: userAccount.recovery_email,
                name: userName,
                wallet: userAccount.wallet,
                tier: 'layer_2',
                dappId: verificationRequest.dapp_id
            });

            return {
                success: true,
                verificationType: 'layer_2',
                status: 'completed',
                credential: credentialData,
                proofData,
                userAccount: {
                    user_id: userAccount.user_id,
                    tier: userAccount.tier,
                    wallet: userAccount.wallet
                }
            };

        } catch (error) {
            console.error('Layer 2 completion failed:', error);
            throw new Error(`Layer 2 verification completion failed: ${error.message}`);
        }
    }

    /**
     * Complete Layer 3 verification and issue credential
     */
    async completeLayer3Verification(requestId) {
        try {
            const verificationRequest = await VerificationRequestV2.findOne({
                request_id: requestId
            });

            if (!verificationRequest) {
                throw new Error('Verification request not found');
            }

            const userAccount = await UserAccount.findOne({
                user_id: verificationRequest.user_id
            });

            // Generate verification proof
            const proofData = await this.generateVerificationProof(
                userAccount,
                'layer_3',
                verificationRequest.verification_data
            );

            // Create credential
            const credentialData = await this.createVerificationCredential(
                userAccount,
                'layer_3', // Layer 3 maps to 'layer_3' tier
                proofData
            );

            // Update verification request
            verificationRequest.status = 'completed';
            verificationRequest.completed_at = new Date();
            verificationRequest.proof_generated = true;
            verificationRequest.proof_data = proofData;
            await verificationRequest.save();

            // Update user account status
            userAccount.tier = 'layer_3';
            userAccount.updated_at = new Date();
            await userAccount.save();

            // Dispatch webhook if this is an external app
            if (verificationRequest.dapp_id && verificationRequest.dapp_id !== 'casperid-internal') {
                const { dispatchEvent } = require('../utils/webhook-dispatcher');
                const { WEBHOOK_EVENTS } = require('../constants/webhook-events');

                dispatchEvent(verificationRequest.dapp_id, WEBHOOK_EVENTS.KYC_COMPLETED, {
                    user_id: userAccount.user_id,
                    wallet: userAccount.wallet,
                    tier: 'layer_3',
                    completed_at: new Date().toISOString(),
                    verification_type: 'document'
                }).catch(err => console.error('KYC Webhook dispatch error (L3):', err));
            }

            return {
                success: true,
                verificationType: 'layer_3',
                status: 'completed',
                credential: credentialData,
                proofData,
                userAccount: {
                    user_id: userAccount.user_id,
                    tier: userAccount.tier,
                    wallet: userAccount.wallet
                }
            };

        } catch (error) {
            console.error('Layer 3 completion failed:', error);
            throw new Error(`Layer 3 verification completion failed: ${error.message}`);
        }
    }

    /**
     * Generate cryptographic proof using self-custody wallet
     */
    async generateVerificationProof(userAccount, verificationTier, verificationData) {
        try {
            // Create proof payload
            const proofPayload = {
                user_id: userAccount.user_id,
                wallet: userAccount.wallet,
                verification_tier: verificationTier,
                liveness_score: verificationData.liveness_score,
                liveness_verified: verificationData.liveness_verified,
                document_verified: verificationData.document_verified || false,
                timestamp: Date.now(),
                issuer: 'CasperID'
            };

            const payloadHash = crypto.createHash('sha256')
                .update(JSON.stringify(proofPayload))
                .digest();

            // Sign with user's self-custody wallet
            const signatureData = await walletGenerator.signTransactionForUser(
                userAccount.user_id,
                payloadHash,
                'verification_proof'
            );

            return {
                credential_hash: payloadHash.toString('hex'),
                signature: signatureData.signature,
                public_key: signatureData.publicKey,
                verification_timestamp: proofPayload.timestamp,
                proof_payload: proofPayload
            };

        } catch (error) {
            console.error('Proof generation failed:', error);
            throw new Error(`Proof generation failed: ${error.message}`);
        }
    }

    /**
     * Create verification credential (compatible with existing system)
     */
    async createVerificationCredential(userAccount, tier, proofData) {
        try {
            // Use existing credential creation logic
            const credentialMinter = require('../utils/credential-minter');

            const credentialData = {
                wallet: userAccount.wallet,
                tier,
                last_kyc_at: Math.floor(Date.now() / 1000),
                last_liveness_at: Math.floor(Date.now() / 1000),
                issuer_id: 'casperid-v2',
                verification_data: proofData.proof_payload
            };

            const credential = await credentialMinter.mintCredential(credentialData);

            return credential;

        } catch (error) {
            console.error('Credential creation failed:', error);
            throw new Error(`Credential creation failed: ${error.message}`);
        }
    }

    /**
     * Get verification status
     */
    async getVerificationStatus(requestId, userSessionToken = null) {
        try {
            let query = { request_id: requestId };

            // If user session provided, ensure they own the request
            if (userSessionToken) {
                const sessionData = await this.validateUserSession(userSessionToken);
                if (sessionData) {
                    query.user_id = sessionData.userAccount.user_id;
                }
            }

            const verificationRequest = await VerificationRequestV2.findOne(query);

            if (!verificationRequest) {
                throw new Error('Verification request not found');
            }

            const response = {
                requestId,
                status: verificationRequest.status,
                verificationType: verificationRequest.verification_tier,
                createdAt: verificationRequest.created_at,
                completedAt: verificationRequest.completed_at,
                expiresAt: verificationRequest.expires_at
            };

            if (verificationRequest.verification_data) {
                response.progress = {
                    livenessCompleted: !!verificationRequest.verification_data.liveness_verified,
                    documentCompleted: !!verificationRequest.verification_data.document_verified,
                    livenessScore: verificationRequest.verification_data.liveness_score
                };
            }

            if (verificationRequest.status === 'completed' && verificationRequest.proof_generated) {
                response.results = {
                    verified: true,
                    tier: verificationRequest.verification_tier,
                    proofHash: verificationRequest.proof_data.credential_hash,
                    signature: verificationRequest.proof_data.signature
                };
            }

            if (verificationRequest.status === 'failed') {
                response.error = verificationRequest.error_message;
            }

            return response;

        } catch (error) {
            console.error('Verification status check failed:', error);
            throw new Error(`Status check failed: ${error.message}`);
        }
    }

    /**
     * Generate a Selective Disclosure share package
     */
    async generateSharePackage(sessionToken, requestedFields = []) {
        try {
            // Validate user session
            const sessionData = await this.validateUserSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid or expired session');
            }

            const { userAccount } = sessionData;

            // Fetch user's profile which contains the verified data
            const { UserProfile } = require('../database/models');
            const profile = await UserProfile.findOne({ wallet: userAccount.wallet });

            if (!profile) {
                throw new Error('User profile not found');
            }

            // Filter data based on requested fields
            const sharedData = {};
            const availableFields = [
                'first_name', 'last_name', 'email', 'phone_number',
                'city', 'country', 'pronouns', 'headline', 'about', 'age'
            ];

            requestedFields.forEach(field => {
                if (field === 'age' && profile.date_of_birth) {
                    // Calculate age from date_of_birth
                    const dob = new Date(profile.date_of_birth);
                    if (!isNaN(dob.getTime())) {
                        const today = new Date();
                        let age = today.getFullYear() - dob.getFullYear();
                        const m = today.getMonth() - dob.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                            age--;
                        }
                        sharedData.age = age;
                    }
                    return;
                }

                if (availableFields.includes(field) && profile[field]) {
                    sharedData[field] = profile[field];
                }
            });

            // If a custom address was requested, we handle that specifically
            if (requestedFields.includes('address') && profile.address) {
                sharedData.address = profile.address;
            }

            // Always include basic verification metadata
            sharedData.verification = {
                tier: userAccount.tier,
                human_id: profile.human_id,
                wallet: userAccount.wallet,
                timestamp: Date.now()
            };

            // Sign the shared data package
            const payloadHash = crypto.createHash('sha256')
                .update(JSON.stringify(sharedData))
                .digest();

            const signatureData = await walletGenerator.signTransactionForUser(
                userAccount.user_id,
                payloadHash,
                'selective_disclosure'
            );

            return {
                share_id: uuidv4(),
                data: sharedData,
                signature: signatureData.signature,
                public_key: signatureData.publicKey,
                signer: 'CasperID-User',
                timestamp: sharedData.verification.timestamp
            };

        } catch (error) {
            console.error('Selective Disclosure generation failed:', error);
            throw new Error(`Failed to generate share package: ${error.message}`);
        }
    }

    /**
     * Verify a Selective Disclosure share package
     */
    async verifySharePackage(sharePackage) {
        try {
            const { data, signature, public_key, timestamp } = sharePackage;

            if (!data || !signature || !public_key) {
                throw new Error('Invalid share package: missing required fields');
            }

            // 1. Verify timestamp (prevent old replay attacks - 24h window)
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000;
            if (now - timestamp > maxAge) {
                throw new Error('Share package has expired');
            }

            // 2. Verify signature
            const payloadHash = crypto.createHash('sha256')
                .update(JSON.stringify(data))
                .digest();

            const isVerified = walletGenerator.verifySignature(
                payloadHash,
                signature,
                public_key
            );

            if (!isVerified) {
                throw new Error('Invalid signature: share package has been tampered with or is not authentic');
            }

            // 3. Verify that the public_key corresponds to the wallet in the data
            if (data.verification?.wallet) {
                // In Casper, we'd checking if the public_key resolves to this wallet
                // For now, we trust the signature proves possession of the key
                // but we could add extra checks here if needed.
            }

            return {
                valid: true,
                data: data,
                signer: sharePackage.signer,
                verifiedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Share package verification failed:', error);
            throw new Error(`Verification failed: ${error.message}`);
        }
    }

    /**
     * Validate user session (integrate with existing session system)
     */
    async validateUserSession(sessionToken) {
        try {
            const webauthnService = require('./webauthn');
            return await webauthnService.validateSession(sessionToken);
        } catch (error) {
            return null;
        }
    }
}

module.exports = new VerificationServiceV2();