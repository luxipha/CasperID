const express = require('express');
const router = express.Router();
const verificationServiceV2 = require('../services/verification-v2');
const multer = require('multer');
const path = require('path');

/**
 * Verification V2 Routes
 * Updated verification flows that work with self-custody wallets
 * Supports Layer 2 (liveness) and Layer 3 (full KYC) verification
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// ============================================
// LAYER 2 VERIFICATION (Liveness)
// ============================================

/**
 * Start Layer 2 verification
 * POST /api/v2/verification/layer2/start
 */
router.post('/layer2/start', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { linkWallet, purpose } = req.body;

        const result = await verificationServiceV2.startLayer2Verification(sessionToken, {
            linkWallet,
            purpose
        });

        res.json({
            success: true,
            verification: result
        });

    } catch (error) {
        console.error('Layer 2 verification start failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Submit liveness check for Layer 2
 * POST /api/v2/verification/liveness
 */
router.post('/liveness', upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'imageFrames', maxCount: 10 }
]), async (req, res) => {
    try {
        const { requestId, metadata } = req.body;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                error: 'Request ID is required'
            });
        }

        const livenessData = {
            videoFile: req.files['videoFile'] ? req.files['videoFile'][0] : null,
            imageFrames: req.files['imageFrames'] || [],
            metadata: metadata ? JSON.parse(metadata) : {}
        };

        const result = await verificationServiceV2.processLivenessCheck(requestId, livenessData);

        res.json({
            success: true,
            liveness: result
        });

    } catch (error) {
        console.error('Liveness check failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// LAYER 3 VERIFICATION (Full KYC)
// ============================================

/**
 * Start Layer 3 verification
 * POST /api/v2/verification/layer3/start
 */
router.post('/layer3/start', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { verificationMethod, purpose } = req.body;

        const result = await verificationServiceV2.startLayer3Verification(sessionToken, {
            verificationMethod,
            purpose
        });

        res.json({
            success: true,
            verification: result
        });

    } catch (error) {
        console.error('Layer 3 verification start failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Submit document upload for Layer 3 WITH OCR EXTRACTION
 * POST /api/v2/verification/layer3/documents/upload
 */
router.post('/layer3/documents/upload', upload.fields([
    { name: 'front_image', maxCount: 1 },
    { name: 'back_image', maxCount: 1 }
]), async (req, res) => {
    let worker = null;

    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({ success: false, error: 'Invalid or expired session' });
        }

        const userAccount = sessionData.userAccount;

        // Validate user is eligible for Layer 3
        if (userAccount.tier !== 'layer_2') {
            return res.status(403).json({
                error: 'Layer 2 verification required before Layer 3',
                current_status: userAccount.tier
            });
        }

        const { document_type } = req.body;

        if (!document_type || !['passport', 'drivers_license', 'national_id'].includes(document_type)) {
            return res.status(400).json({ success: false, error: 'Invalid document_type' });
        }

        const frontImage = req.files?.front_image?.[0];
        const backImage = req.files?.back_image?.[0];

        if (!frontImage) {
            return res.status(400).json({ success: false, error: 'front_image is required' });
        }

        // Passport only needs front, others need both
        if (document_type !== 'passport' && !backImage) {
            return res.status(400).json({ success: false, error: 'back_image is required for ID/Driver\'s License' });
        }


        // Initialize Tesseract OCR worker with better configuration
        const { createWorker } = require('tesseract.js');
        worker = await createWorker('eng', 1, {
            logger: m => { }
        });

        // Configure Tesseract for better accuracy
        await worker.setParameters({
            tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /-.,',
        });

        // Perform OCR on front image with confidence data
        const { data } = await worker.recognize(frontImage.path);


        // If confidence is too low, try again with different settings
        let finalText = data.text;
        if (data.confidence < 60) {
            await worker.setParameters({
                tessedit_pageseg_mode: '6', // Assume a single uniform block of text
            });
            const retry = await worker.recognize(frontImage.path);
            if (retry.data.confidence > data.confidence) {
                finalText = retry.data.text;
            }
        }

        // Parse extracted text into structured data
        const extractedData = parseDocumentText(finalText, document_type, data.confidence);

        // Generate upload ID for tracking
        const crypto = require('crypto');
        const uploadId = crypto.randomBytes(16).toString('hex');

        await worker.terminate();

        res.json({
            success: true,
            upload_id: uploadId,
            extracted_data: extractedData,
            confidence: extractedData.confidence || 0.7,
            needs_review: true,
            message: 'Document processed successfully. Please review the extracted data.'
        });

    } catch (error) {
        if (worker) {
            await worker.terminate();
        }

        console.error('[Layer3] Document upload error:', error);
        res.status(500).json({
            error: 'Failed to process document',
            details: error.message
        });
    }
});

/**
 * Parse OCR text into structured data based on document type
 */
function parseDocumentText(text, documentType, ocrConfidence = 0) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    const extracted = {
        document_type: documentType,
        document_number: '',
        nin: '', // National ID Number
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: 'Nigerian',
        address: '',
        phone_number: '',
        confidence: ocrConfidence || 0.65
    };

    // Simple pattern matching (enhance this based on actual document formats)
    lines.forEach((line, index) => {
        const upperLine = line.toUpperCase();

        // Surname extraction (Nigerian passport has separate Surname field)
        if (upperLine.includes('SURNAME') && !upperLine.includes('GIVEN')) {
            const nextLine = lines[index + 1];
            if (nextLine && nextLine.length > 1 && nextLine.length < 50) {
                extracted.last_name = nextLine.toUpperCase();
            }
        }

        // Given Names extraction
        if (upperLine.includes('GIVEN NAMES') || upperLine.includes('PRNOMS')) {
            const nextLine = lines[index + 1];
            if (nextLine && nextLine.length > 1) {
                extracted.first_name = nextLine.split(/\s+/)[0].toUpperCase();
            }
        }

        // Passport number (Nigerian format: letter + 8 digits)
        const passportMatch = line.match(/[AB]\d{8}/);
        if (passportMatch && !extracted.document_number) {
            extracted.document_number = passportMatch[0];
        }

        // Extract NIN (11 digits, usually after "NIN" label on Nigerian passport)
        if (upperLine.includes('NIN')) {
            const nextLine = lines[index + 1];
            const ninMatch = nextLine?.match(/\d{11}/) || line.match(/\d{11}/);
            if (ninMatch && !extracted.nin) {
                extracted.nin = ninMatch[0];
            }
        }

        // Date of birth (Nigerian passport format: DD MMM /MONTH YY)
        const dobMatch = line.match(/(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z\/\s]*(\d{2})/i);
        if (dobMatch && !extracted.date_of_birth) {
            const day = dobMatch[1].padStart(2, '0');
            const month = dobMatch[2].toUpperCase();
            const year = '19' + dobMatch[3]; // Assuming 19xx
            extracted.date_of_birth = `${day} ${month} ${year}`;
        }

        // Gender (single letter M or F)
        if ((line.trim() === 'M' || line.trim() === '-M') && !extracted.gender) {
            extracted.gender = 'Male';
        } else if ((line.trim() === 'F' || line.trim() === '-F') && !extracted.gender) {
            extracted.gender = 'Female';
        }

        // Nationality
        if (upperLine.includes('NIGERIA')) {
            extracted.nationality = 'Nigerian';
        }
    });

    return extracted;
}

/**
 * Submit Layer 3 verification request for admin review  
 * POST /api/v2/verification/layer3/submit
 */
router.post('/layer3/submit', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({ success: false, error: 'Invalid or expired session' });
        }

        const userAccount = sessionData.userAccount;

        // Session may not include email, fetch from database
        const { UserAccount } = require('../database/models');
        const fullUserAccount = await UserAccount.findOne({ wallet: userAccount.wallet });

        if (!fullUserAccount) {
            return res.status(404).json({ success: false, error: 'User account not found' });
        }

        // Validate Layer 2 complete
        if (fullUserAccount.tier !== 'layer_2') {
            return res.status(403).json({
                error: 'Layer 2 verification required'
            });
        }

        const { document_data, upload_id, liveness_verified } = req.body;

        if (!document_data || !upload_id) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const { VerificationRequest } = require('../database/models');

        // Check for existing pending request
        const existingRequest = await VerificationRequest.findOne({
            wallet: fullUserAccount.wallet,
            tier: 'layer_3',
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                error: 'You already have a pending Full KYC verification request',
                request_id: existingRequest._id
            });
        }


        // Try to load saved liveness frames from the liveness check
        let livenessFrames = [];
        let livenessCompletedAt = null;
        try {
            const fs = require('fs');
            const path = require('path');
            const livenessDataPath = path.join(__dirname, `../../uploads/liveness/${fullUserAccount.wallet.slice(-20)}-result.json`);

            if (fs.existsSync(livenessDataPath)) {
                const livenessData = JSON.parse(fs.readFileSync(livenessDataPath, 'utf8'));
                livenessFrames = livenessData.frame_paths || [];
                livenessCompletedAt = livenessData.completed_at;
            }
        } catch (err) {
            console.warn('[FullKYC] Could not load liveness frames:', err.message);
        }

        // Create verification request
        const verificationRequest = new VerificationRequest({
            wallet: fullUserAccount.wallet,
            email: fullUserAccount.recovery_email, // Using recovery_email field
            tier: 'layer_3',
            status: 'pending',

            // Populate top-level fields for admin mapping
            first_name: document_data.first_name,
            last_name: document_data.last_name,
            date_of_birth: document_data.date_of_birth,
            phone_number: document_data.phone_number,
            home_address: document_data.address,
            location: document_data.address,

            verification_method: 'document',

            // Store everything in the existing 'metadata' field to prevent data loss
            metadata: {
                document_type: document_data.document_type,
                document_number: document_data.document_number,
                gender: document_data.gender,
                nationality: document_data.nationality || 'Nigerian',
                nin: document_data.nin,
                liveness_verified: liveness_verified || false,
                liveness_frames: livenessFrames,
                liveness_completed_at: livenessCompletedAt,
                upload_id: upload_id,
                document_data_json: JSON.stringify(document_data) // Backup of full OCR
            },

            created_at: new Date()
        });

        await verificationRequest.save();


        res.json({
            success: true,
            verification_request_id: verificationRequest._id,
            status: 'pending',
            message: 'Verification request submitted successfully. Our team will review it shortly.'
        });

    } catch (error) {
        console.error('[Layer3] Submit error:', error);
        res.status(500).json({
            error: 'Failed to submit verification request',
            details: error.message
        });
    }
});


// ============================================
// VERIFICATION STATUS & MANAGEMENT
// ============================================

/**
 * Get verification status
 * GET /api/v2/verification/:requestId/status
 */
router.get('/:requestId/status', async (req, res) => {
    try {
        const { requestId } = req.params;
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        const result = await verificationServiceV2.getVerificationStatus(requestId, sessionToken);

        res.json({
            success: true,
            verification: result
        });

    } catch (error) {
        console.error('Verification status check failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Cancel verification request
 * DELETE /api/v2/verification/:requestId
 */
router.delete('/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Validate session and find verification request
        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const { VerificationRequestV2 } = require('../database/models');
        const verificationRequest = await VerificationRequestV2.findOne({
            request_id: requestId,
            user_id: sessionData.userAccount.user_id
        });

        if (!verificationRequest) {
            return res.status(404).json({
                success: false,
                error: 'Verification request not found'
            });
        }

        verificationRequest.status = 'cancelled';
        await verificationRequest.save();

        res.json({
            success: true,
            message: 'Verification request cancelled',
            requestId
        });

    } catch (error) {
        console.error('Verification cancellation failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// USER VERIFICATION HISTORY
// ============================================

/**
 * Get user's verification history
 * GET /api/v2/verification/history
 */
router.get('/history', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const webauthnService = require('../services/webauthn');
        const sessionData = await webauthnService.validateSession(sessionToken);

        if (!sessionData) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const { VerificationRequestV2, Credential } = require('../database/models');

        // Get verification requests
        const verificationRequests = await VerificationRequestV2.find({
            user_id: sessionData.userAccount.user_id
        }).sort({ created_at: -1 }).limit(20);

        // Get issued credentials
        const credentials = await Credential.find({
            wallet: sessionData.userAccount.wallet
        }).sort({ created_at: -1 });

        const history = {
            requests: verificationRequests.map(req => ({
                requestId: req.request_id,
                verificationType: req.verification_tier,
                status: req.status,
                purpose: req.purpose,
                createdAt: req.created_at,
                completedAt: req.completed_at,
                errorMessage: req.error_message
            })),
            credentials: credentials.map(cred => ({
                tier: cred.tier,
                issuedAt: cred.created_at,
                lastKycAt: new Date(cred.last_kyc_at * 1000),
                lastLivenessAt: cred.last_liveness_at ? new Date(cred.last_liveness_at * 1000) : null,
                revoked: cred.revoked,
                credentialHash: cred.credential_hash
            })),
            currentStatus: {
                layerStatus: sessionData.userAccount.tier,
                walletAddress: sessionData.userAccount.wallet,
                emailVerified: sessionData.userAccount.email_verified,
                metamaskConnected: sessionData.userAccount.metamask_connected
            }
        };

        res.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('History retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// SELECTIVE DISCLOSURE (SHARE KYC)
// ============================================

/**
 * Generate a Selective Disclosure share package
 * POST /api/v2/verification/share
 */
router.post('/share', async (req, res) => {
    try {
        const sessionToken = req.cookies.casperid_session ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { fields } = req.body;

        const result = await verificationServiceV2.generateSharePackage(sessionToken, fields);

        res.json({
            success: true,
            sharePackage: result
        });

    } catch (error) {
        console.error('Selective Disclosure failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// VERIFICATION REQUIREMENTS
// ============================================

/**
 * Get verification requirements for each tier
 * GET /api/v2/verification/requirements
 */
router.get('/requirements', async (req, res) => {
    try {
        const requirements = {
            layer_1: {
                description: 'Basic Identity Setup',
                requirements: ['Email verification', 'Passkey authentication'],
                benefits: ['Self-custody wallet', 'Basic identity claims'],
                estimatedTime: '2-5 minutes'
            },
            layer_2: {
                description: 'Liveness Verification',
                requirements: ['Liveness check (facial recognition)', 'Optional wallet linking'],
                benefits: ['Proof of humanity', 'Sybil resistance', 'Basic verification credential'],
                estimatedTime: '3-7 minutes'
            },
            layer_3: {
                description: 'Full KYC Verification',
                requirements: [
                    'Government ID verification',
                    'Liveness check',
                    'Document verification',
                    'Identity data validation'
                ],
                benefits: [
                    'Full identity verification',
                    'Regulated service access',
                    'Higher trust score',
                    'Complete verification credential'
                ],
                estimatedTime: '10-15 minutes'
            }
        };

        res.json({
            success: true,
            requirements
        });

    } catch (error) {
        console.error('Requirements retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;