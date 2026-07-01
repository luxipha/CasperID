const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const QRCode = require('qrcode');
const {
    UserAccount,
    VerificationRequestV2,
    PasskeyCredential,
    Credential,
    UserProfile,
    DevicePairing
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

    getAccountFrontendUrl() {
        return (process.env.ACCOUNT_FRONTEND_URL || process.env.FRONTEND_URL || 'https://account.casperid.com')
            .replace(/\/$/, '');
    }

    async acknowledgeLivenessPairing(requestId, pairingId, pairingToken) {
        if (!requestId || !pairingId || !pairingToken) {
            throw new Error('Request ID, pairing ID, and pairing token are required');
        }

        const pairing = await DevicePairing.findOne({
            pairing_id: pairingId,
            pairing_token: pairingToken,
            verification_request_id: requestId,
            status: 'pending',
            expires_at: { $gt: new Date() }
        });

        if (!pairing) {
            throw new Error('Invalid or expired pairing session');
        }

        const verificationRequest = await VerificationRequestV2.findOne({
            request_id: requestId,
            user_id: pairing.user_id,
            status: { $in: ['pending', 'in_progress'] }
        });

        if (!verificationRequest) {
            throw new Error('Verification request not found or expired');
        }

        if (verificationRequest.status === 'pending') {
            verificationRequest.status = 'in_progress';
            await verificationRequest.save();
        }

        return { requestId, pairingId, status: 'scanning' };
    }

    /**
     * Start Layer 2 verification (Liveness + QR Pairing for cross-device flow)
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
                tier: { $in: ['layer_2', 'layer_3'] },
                revoked: false
            });

            if (existingCredential) {
                throw new Error('User already has Layer 2 or higher credentials');
            }

            // Create verification request
            const requestId = uuidv4();
            const verificationRequest = new VerificationRequestV2({
                request_id: requestId,
                user_id: userAccount.user_id,
                dapp_id: appId,
                verification_tier: 'layer_2',
                requested_fields: ['liveness_verified'],
                purpose,
                status: 'pending'
            });

            await verificationRequest.save();

            // Generate QR pairing code for cross-device verification
            // Desktop shows QR, mobile scans it to link the liveness session
            const pairingId = uuidv4();
            const pairingToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + (5 * 60 * 1000)); // 5 minute expiry

            const qrPayload = {
                version: 1,
                type: 'casperid_liveness',
                pairingId,
                pairingToken,
                requestId,
                verificationTier: 'layer_2',
                serverUrl: process.env.API_BASE_URL || (process.env.API_HOST ? `https://${process.env.API_HOST}` : 'https://api.casperid.com'),
                expiresAt: expiresAt.getTime()
            };
            const mobileLivenessUrl = `${this.getAccountFrontendUrl()}/liveness?data=${encodeURIComponent(JSON.stringify(qrPayload))}`;

            // Store pairing record
            const devicePairing = new DevicePairing({
                pairing_id: pairingId,
                user_id: userAccount.user_id,
                qr_code_data: JSON.stringify(qrPayload),
                pairing_token: pairingToken,
                expires_at: expiresAt,
                verification_request_id: requestId,
                verification_tier: 'layer_2'
            });

            await devicePairing.save();

            // Generate QR code image
            const qrCodeDataURL = await QRCode.toDataURL(mobileLivenessUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#1A1A2E',
                    light: '#FFFFFF'
                }
            });

            return {
                requestId,
                pairingId,
                pairingToken,
                verificationType: 'layer_2',
                status: 'pending',
                requirements: {
                    livenessCheck: true,
                    walletLink: linkWallet
                },
                expiresAt: verificationRequest.expires_at,
                qrCode: {
                    dataUrl: qrCodeDataURL,
                    payload: qrPayload,
                    mobileUrl: mobileLivenessUrl
                },
                nextStep: 'scan_qr_code'
            };

        } catch (error) {
            console.error('Layer 2 verification start failed:', error);
            throw new Error(`Layer 2 verification failed: ${error.message}`);
        }
    }

    /**
     * Start Layer 3 verification (Full KYC + Liveness with QR Pairing)
     */
    async startLayer3Verification(sessionToken, options = {}) {
        try {
            const {
                verificationMethod = 'document_upload', // 'document_upload', 'nimc', or 'bvn'
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

            const submittedRequest = await VerificationRequestV2.findOne({
                user_id: userAccount.user_id,
                verification_tier: 'layer_3',
                status: { $in: ['pending', 'in_progress'] },
                'verification_data.submitted_at': { $exists: true, $nin: [null, ''] },
                expires_at: { $gt: new Date() }
            }).sort({ created_at: -1 });

            if (submittedRequest) {
                throw new Error('Layer 3 verification is already submitted and under review');
            }

            // Reuse an unfinished draft so reopening the flow does not create
            // duplicate Layer 3 requests. A draft is not under review until
            // /layer3/submit records verification_data.submitted_at.
            let verificationRequest = await VerificationRequestV2.findOne({
                user_id: userAccount.user_id,
                verification_tier: 'layer_3',
                status: { $in: ['pending', 'in_progress'] },
                'verification_data.submitted_at': { $in: [null, ''] },
                expires_at: { $gt: new Date() }
            }).sort({ created_at: -1 });

            if (!verificationRequest) {
                verificationRequest = new VerificationRequestV2({
                    request_id: uuidv4(),
                    user_id: userAccount.user_id,
                    dapp_id: appId,
                    verification_tier: 'layer_3',
                    requested_fields: ['identity_verified', 'liveness_verified'],
                    purpose,
                    status: 'pending'
                });
                await verificationRequest.save();
            }

            const requestId = verificationRequest.request_id;

            // Only the newest scoped QR handoff should remain usable.
            await DevicePairing.updateMany({
                verification_request_id: requestId,
                status: { $in: ['pending', 'processing'] }
            }, {
                $set: { status: 'cancelled' }
            });

            // Generate QR pairing code for cross-device liveness verification
            const pairingId = uuidv4();
            const pairingToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + (5 * 60 * 1000)); // 5 minute expiry

            const qrPayload = {
                version: 1,
                type: 'casperid_liveness',
                pairingId,
                pairingToken,
                requestId,
                verificationTier: 'layer_3',
                serverUrl: process.env.API_BASE_URL || (process.env.API_HOST ? `https://${process.env.API_HOST}` : 'https://api.casperid.com'),
                expiresAt: expiresAt.getTime()
            };
            const mobileLivenessUrl = `${this.getAccountFrontendUrl()}/liveness?data=${encodeURIComponent(JSON.stringify(qrPayload))}`;

            // Store pairing record
            const devicePairing = new DevicePairing({
                pairing_id: pairingId,
                user_id: userAccount.user_id,
                qr_code_data: JSON.stringify(qrPayload),
                pairing_token: pairingToken,
                expires_at: expiresAt,
                verification_request_id: requestId,
                verification_tier: 'layer_3'
            });

            await devicePairing.save();

            // Generate QR code image
            const qrCodeDataURL = await QRCode.toDataURL(mobileLivenessUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#1A1A2E',
                    light: '#FFFFFF'
                }
            });

            return {
                requestId,
                pairingId,
                pairingToken,
                verificationType: 'layer_3',
                status: 'pending',
                verificationMethod,
                requirements: {
                    identityDocument: verificationMethod === 'document_upload',
                    nimcVerification: verificationMethod === 'nimc',
                    bvnVerification: verificationMethod === 'bvn',
                    livenessCheck: true
                },
                expiresAt: verificationRequest.expires_at,
                qrCode: {
                    dataUrl: qrCodeDataURL,
                    payload: qrPayload,
                    mobileUrl: mobileLivenessUrl
                },
                nextStep: verificationMethod === 'document_upload' ? 'document_upload' : 'identity_verification'
            };

        } catch (error) {
            console.error('Layer 3 verification start failed:', error);
            throw new Error(`Layer 3 verification failed: ${error.message}`);
        }
    }

    /**
     * Process liveness check (used in both Layer 2 and Layer 3)
    * Supports optional pairingId for cross-device verification linking
     */
    async processLivenessCheck(requestId, livenessData, authorization = {}) {
        let authorizedPairing = null;
        const processingStartedAt = Date.now();
        try {
            const {
                videoFile,
                imageFrames,
                metadata = {}
            } = livenessData;

            const { pairingId = null, pairingToken = null, userSessionToken = null } = authorization;

            // Find verification request
            const verificationRequest = await VerificationRequestV2.findOne({
                request_id: requestId,
                status: { $in: ['pending', 'in_progress'] }
            });

            if (!verificationRequest) {
                throw new Error('Verification request not found or expired');
            }

            let isAuthorized = false;
            if (userSessionToken) {
                const sessionData = await this.validateUserSession(userSessionToken);
                isAuthorized = sessionData?.userAccount?.user_id === verificationRequest.user_id;
            }

            // Cross-device submissions must prove possession of the token embedded in the QR payload.
            if (pairingId) {
                authorizedPairing = await DevicePairing.findOneAndUpdate(
                    {
                        pairing_id: pairingId,
                        pairing_token: pairingToken,
                        verification_request_id: requestId,
                        user_id: verificationRequest.user_id,
                        status: 'pending',
                        expires_at: { $gt: new Date() }
                    },
                    { $set: { status: 'processing' } },
                    { new: true }
                );

                if (!authorizedPairing) {
                    throw new Error('Invalid or expired pairing session');
                }

                isAuthorized = true;
            }

            if (!isAuthorized) {
                throw new Error('Not authorized to submit this verification request');
            }

            // Validate imageFrames
            if (!imageFrames || imageFrames.length === 0) {
                throw new Error('No image frames provided for liveness verification');
            }

            // Update status to in_progress
            verificationRequest.status = 'in_progress';
            await verificationRequest.save();

            // Convert imageFrames (multer file objects) to buffers
            const frameBuffers = imageFrames.map(frame => frame.buffer);
            const isLayer3 = verificationRequest.verification_tier === 'layer_3';

            // Layer 2 is auto-decided and does not need slow admin-review uploads.
            let livenessFrameUrls = [];
            if (isLayer3) try {
                const imagekit = require('./imagekit');

                const uploadPromises = imageFrames.map((frame, i) => {
                    return imagekit.files.upload({
                        file: frame.buffer.toString('base64'),
                        fileName: `liveness-${requestId}-frame-${i}-${Date.now()}`,
                        folder: '/liveness-frames',
                        useUniqueFileName: true
                    }).then(response => response.url);
                });

                livenessFrameUrls = await Promise.all(uploadPromises);
            } catch (uploadError) {
                console.error('[Liveness] ImageKit upload failed:', uploadError.message);
                // Continue without frames - admin won't see them but verification can proceed
            }

            // Extract step sequence from metadata, or use default
            const stepSequence = metadata.stepSequence || ['blink', 'open_mouth'];

            // Process liveness using Gemini AI
            let livenessScore;
            let livenessAnalysis;
            try {
                livenessAnalysis = await geminiService.verifyLivenessSequence(frameBuffers, stepSequence);
                // Convert confidence (0-100) to score (0-1)
                livenessScore = livenessAnalysis.confidence / 100;
            } catch (aiError) {
                console.error('Liveness AI analysis failed:', aiError);
                // Fallback to basic checks if AI fails
                livenessScore = 0.7; // Conservative score
                livenessAnalysis = {
                    passed: false,
                    confidence: 70,
                    reasoning: 'AI analysis unavailable, using fallback score'
                };
            }

            // For Layer 2: AI makes the decision (auto-approve/reject)
            // For Layer 3: AI provides analysis for admin review (never auto-reject)
            let livenessVerified;
            if (isLayer3) {
                // Layer 3: Always accept for admin review, store AI analysis
                livenessVerified = true;
            } else {
                // Layer 2: AI decision is final
                livenessVerified = livenessScore >= this.LIVENESS_THRESHOLD && livenessAnalysis.passed;
            }

            // Update verification data with liveness frames
            verificationRequest.verification_data = {
                ...verificationRequest.verification_data,
                liveness_score: livenessScore,
                liveness_verified: livenessVerified,
                liveness_analysis: livenessAnalysis,
                liveness_processed_at: Date.now(),
                liveness_frame_urls: livenessFrameUrls,
                liveness_confidence: Math.round(livenessScore * 100),
                liveness_ai_passed: livenessAnalysis.passed, // Store AI result separately for admin
                liveness_ai_reasoning: livenessAnalysis.reasoning
            };

            // Only fail if Layer 2 and AI rejected
            if (!isLayer3 && !livenessVerified) {
                // Keep the scoped pairing and request active so the user can retry before expiry.
                verificationRequest.status = 'pending';
                verificationRequest.error_message = `Liveness verification failed. Score: ${livenessScore}`;
                await verificationRequest.save();
                if (authorizedPairing) {
                    authorizedPairing.status = 'pending';
                    await authorizedPairing.save();
                }

                return {
                    success: false,
                    error: 'Liveness verification failed',
                    score: livenessScore,
                    threshold: this.LIVENESS_THRESHOLD,
                    reasoning: livenessAnalysis.reasoning,
                    validationChecks: livenessAnalysis.validationChecks
                };
            }

            if (authorizedPairing) {
                authorizedPairing.status = 'completed';
                authorizedPairing.completed_at = new Date();
                await authorizedPairing.save();
            }

            // If this is Layer 2 and only liveness is required, complete verification
            if (verificationRequest.verification_tier === 'layer_2') {
                return await this.completeLayer2Verification(requestId);
            }

            // For Layer 3, liveness is one step - proceed to next step (admin will review)
            await verificationRequest.save();

            return {
                success: true,
                status: 'completed',
                livenessVerified: true,
                score: livenessScore,
                aiPassed: livenessAnalysis.passed, // Include AI result in response
                nextStep: 'identity_verification',
                requestId
            };

        } catch (error) {
            if (authorizedPairing?.status === 'processing') {
                authorizedPairing.status = 'pending';
                await authorizedPairing.save().catch((pairingError) => {
                    console.error('Failed to release liveness pairing after error:', pairingError);
                });
            }
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
            userAccount.tier = 'layer_2';
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
            if (!userSessionToken) {
                throw new Error('Authentication required');
            }

            const sessionData = await this.validateUserSession(userSessionToken);
            if (!sessionData) {
                throw new Error('Invalid or expired session');
            }

            const verificationRequest = await VerificationRequestV2.findOne({
                request_id: requestId,
                user_id: sessionData.userAccount.user_id
            });

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
     * Build the shareable identity field catalogue from profile + latest completed Layer 3 data.
     */
    async buildShareableIdentityData(userAccount) {
        const profile = await UserProfile.findOne({ wallet: userAccount.wallet }).lean();
        if (!profile) {
            throw new Error('User profile not found');
        }

        const latestLayer3 = await VerificationRequestV2.findOne({
            user_id: userAccount.user_id,
            verification_tier: 'layer_3',
            status: 'completed'
        }).sort({ completed_at: -1, created_at: -1 }).lean();

        const verificationData = latestLayer3?.verification_data || {};
        const profileName = profile.name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null;
        const verifiedName = verificationData.full_name ||
            [verificationData.first_name, verificationData.middle_name, verificationData.last_name].filter(Boolean).join(' ') ||
            null;
        const identityProvider = verificationData.identity_provider || null;
        const verificationMethod = verificationData.verification_method || null;
        const verificationCompletedAt = latestLayer3?.completed_at || null;

        const calculateAge = (value) => {
            if (!value) return null;
            const dob = new Date(value);
            if (Number.isNaN(dob.getTime())) return null;
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDelta = today.getMonth() - dob.getMonth();
            if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
                age -= 1;
            }
            return age;
        };

        const resolvedCountry = verificationData.country_context === 'nigeria'
            ? 'Nigeria'
            : (verificationData.nationality || profile.country || null);

        const passportNumber = verificationData.document_type === 'passport'
            ? verificationData.document_number
            : null;

        const baseVerificationMetadata = {
            tier: userAccount.tier,
            human_id: profile.human_id,
            wallet: userAccount.wallet,
            timestamp: Date.now(),
            layer3_verified: !!latestLayer3,
            latest_layer3_completed_at: verificationCompletedAt
        };

        const fields = {
            name: {
                value: verifiedName || profileName,
                verified: !!verifiedName,
                source: verifiedName ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verifiedName ? verificationMethod : null,
                sensitive: false,
                label: 'Full Name',
                description: 'Your displayable verified name'
            },
            first_name: {
                value: verificationData.first_name || profile.first_name || null,
                verified: !!verificationData.first_name,
                source: verificationData.first_name ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verificationData.first_name ? verificationMethod : null,
                sensitive: false,
                label: 'First Name',
                description: 'Your given name'
            },
            last_name: {
                value: verificationData.last_name || profile.last_name || null,
                verified: !!verificationData.last_name,
                source: verificationData.last_name ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verificationData.last_name ? verificationMethod : null,
                sensitive: false,
                label: 'Last Name',
                description: 'Your family name'
            },
            human_id: {
                value: profile.human_id || userAccount.human_id || null,
                verified: !!(profile.human_id || userAccount.human_id),
                source: 'casperid',
                verification_method: null,
                sensitive: false,
                label: 'Human ID',
                description: 'Your CasperID human-readable identity'
            },
            email: {
                value: userAccount.recovery_email || profile.email || null,
                verified: !!userAccount.email_verified,
                source: 'account',
                verification_method: 'email_verification',
                sensitive: true,
                label: 'Email Address',
                description: 'Your verified account email'
            },
            phone_number: {
                value: verificationData.phone_number || profile.phone_number || null,
                verified: !!verificationData.phone_number,
                source: verificationData.phone_number ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verificationData.phone_number ? verificationMethod : null,
                sensitive: true,
                label: 'Phone Number',
                description: 'Your contact phone number'
            },
            address: {
                value: verificationData.home_address || profile.address || null,
                verified: !!verificationData.home_address,
                source: verificationData.home_address ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verificationData.home_address ? verificationMethod : null,
                sensitive: true,
                label: 'Home Address',
                description: 'Your residential address'
            },
            city: {
                value: profile.city || null,
                verified: false,
                source: 'profile',
                verification_method: null,
                sensitive: false,
                label: 'City',
                description: 'Your city from profile settings'
            },
            country: {
                value: resolvedCountry,
                verified: !!verificationData.nationality || verificationData.country_context === 'nigeria',
                source: verificationData.nationality || verificationData.country_context ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verificationData.nationality || verificationData.country_context ? verificationMethod : null,
                sensitive: false,
                label: 'Country',
                description: 'Country resolved from your verified identity context'
            },
            nationality: {
                value: verificationData.nationality || null,
                verified: !!verificationData.nationality,
                source: verificationData.nationality ? (identityProvider || 'layer3_review') : null,
                verification_method: verificationData.nationality ? verificationMethod : null,
                sensitive: false,
                label: 'Nationality',
                description: 'Nationality from your Layer 3 verification'
            },
            date_of_birth: {
                value: verificationData.date_of_birth || profile.date_of_birth || null,
                verified: !!verificationData.date_of_birth,
                source: verificationData.date_of_birth ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verificationData.date_of_birth ? verificationMethod : null,
                sensitive: true,
                label: 'Date of Birth',
                description: 'Your date of birth'
            },
            age: {
                value: calculateAge(verificationData.date_of_birth || profile.date_of_birth),
                verified: !!(verificationData.date_of_birth || profile.date_of_birth),
                source: verificationData.date_of_birth ? (identityProvider || 'layer3_review') : 'profile',
                verification_method: verificationData.date_of_birth ? verificationMethod : null,
                sensitive: false,
                label: 'Verified Age',
                description: 'Calculated from your stored date of birth'
            },
            wallet: {
                value: userAccount.wallet || null,
                verified: !!userAccount.wallet,
                source: 'casper_wallet',
                verification_method: null,
                sensitive: false,
                label: 'Wallet Address',
                description: 'Your public Casper wallet'
            },
            tier: {
                value: userAccount.tier || 'layer_0',
                verified: true,
                source: 'casperid',
                verification_method: null,
                sensitive: false,
                label: 'Verification Tier',
                description: 'Your current CasperID verification level'
            },
            document_type: {
                value: verificationData.document_type || null,
                verified: !!verificationData.document_type && !!latestLayer3,
                source: verificationData.document_type ? 'layer3_document_review' : null,
                verification_method: verificationMethod,
                sensitive: false,
                label: 'Document Type',
                description: 'The ID document type used for Layer 3'
            },
            document_number: {
                value: verificationData.document_number || null,
                verified: !!verificationData.document_number && !!latestLayer3,
                source: verificationData.document_number ? 'layer3_document_review' : null,
                verification_method: verificationMethod,
                sensitive: true,
                label: 'Document Number',
                description: 'The identifier printed on your submitted ID'
            },
            passport_number: {
                value: passportNumber,
                verified: !!passportNumber && !!latestLayer3,
                source: passportNumber ? 'layer3_document_review' : null,
                verification_method: verificationMethod,
                sensitive: true,
                label: 'Passport Number',
                description: 'Shared only when your Layer 3 document was a passport'
            },
            nin: {
                value: verificationData.nin || null,
                verified: verificationData.nin_verified === true,
                source: verificationData.nin ? (identityProvider || 'layer3_review') : null,
                verification_method: verificationMethod,
                sensitive: true,
                label: 'NIN',
                description: 'National Identification Number'
            },
            bvn: {
                value: verificationData.bvn || null,
                verified: verificationData.bvn_verified === true,
                source: verificationData.bvn ? (identityProvider || 'layer3_review') : null,
                verification_method: verificationMethod,
                sensitive: true,
                label: 'BVN',
                description: 'Bank Verification Number'
            },
            bvn_verified: {
                value: verificationData.bvn_verified === true ? true : null,
                verified: verificationData.bvn_verified === true,
                source: verificationData.bvn_verified === true ? (identityProvider || 'layer3_review') : null,
                verification_method: verificationMethod,
                sensitive: false,
                label: 'BVN Verification Status',
                description: 'Whether CasperID confirmed your BVN through a provider'
            },
            nin_verified: {
                value: verificationData.nin_verified === true ? true : null,
                verified: verificationData.nin_verified === true,
                source: verificationData.nin_verified === true ? (identityProvider || 'layer3_review') : null,
                verification_method: verificationMethod,
                sensitive: false,
                label: 'NIN Verification Status',
                description: 'Whether CasperID confirmed your NIN through a provider'
            },
            identity_provider: {
                value: identityProvider,
                verified: !!identityProvider,
                source: identityProvider ? 'casperid' : null,
                verification_method: verificationMethod,
                sensitive: false,
                label: 'Identity Provider',
                description: 'Provider used for your upstream identity check'
            },
            provider_document_match: {
                value: verificationData.provider_document_match || null,
                verified: verificationData.provider_document_match?.overall_match === true,
                source: verificationData.provider_document_match ? 'casperid_comparison' : null,
                verification_method: verificationMethod,
                sensitive: false,
                label: 'Provider vs Document Match',
                description: 'Comparison between provider-backed identity data and uploaded document data'
            }
        };

        return {
            profile,
            latestLayer3,
            verificationData,
            verification: baseVerificationMetadata,
            fields
        };
    }

    async getAvailableShareFields(sessionToken) {
        const sessionData = await this.validateUserSession(sessionToken);
        if (!sessionData) {
            throw new Error('Invalid or expired session');
        }

        const { userAccount } = sessionData;
        const shareableData = await this.buildShareableIdentityData(userAccount);
        return Object.entries(shareableData.fields).map(([id, config]) => ({
            id,
            label: config.label,
            description: config.description,
            value: config.value,
            available: config.value !== null && config.value !== undefined && config.value !== '',
            verified: config.verified,
            source: config.source,
            verification_method: config.verification_method,
            sensitive: !!config.sensitive
        }));
    }

    /**
     * Generate a Selective Disclosure share package
     */
    async generateSharePackage(sessionToken, requestedFields = []) {
        try {
            const sessionData = await this.validateUserSession(sessionToken);
            if (!sessionData) {
                throw new Error('Invalid or expired session');
            }

            const { userAccount } = sessionData;
            const shareableData = await this.buildShareableIdentityData(userAccount);
            const sharedData = {};
            const fieldMetadata = {};
            const availableFieldIds = Object.keys(shareableData.fields);
            const filteredRequestedFields = [...new Set((requestedFields || []).filter(field => availableFieldIds.includes(field)))];

            filteredRequestedFields.forEach((field) => {
                const fieldConfig = shareableData.fields[field];
                const hasValue = fieldConfig && fieldConfig.value !== null && fieldConfig.value !== undefined && fieldConfig.value !== '';
                if (!hasValue) {
                    return;
                }
                sharedData[field] = fieldConfig.value;
                fieldMetadata[field] = {
                    verified: fieldConfig.verified,
                    source: fieldConfig.source,
                    verification_method: fieldConfig.verification_method,
                    sensitive: !!fieldConfig.sensitive
                };
            });

            // Always include basic verification metadata
            sharedData.verification = {
                ...shareableData.verification,
                shared_fields: filteredRequestedFields
            };
            sharedData.field_metadata = fieldMetadata;

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
                field_metadata: fieldMetadata,
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
