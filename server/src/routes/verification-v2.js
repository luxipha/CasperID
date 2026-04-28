const express = require('express');
const router = express.Router();
const verificationServiceV2 = require('../services/verification-v2');
const multer = require('multer');
const path = require('path');
const { extractApp } = require('../middleware/app-auth');
const imagekit = require('../services/imagekit');
const { v4: uuidv4 } = require('uuid');
const { DataShare } = require('../database/temporary-shares');

/**
 * Verification V2 Routes
 * Updated verification flows that work with self-custody wallets
 * Supports Layer 2 (liveness) and Layer 3 (full KYC) verification
 */

// Use memory storage — files are uploaded directly to ImageKit, never written to disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
        const extname = path.extname(file.originalname).toLowerCase();
        const hasValidExtension = allowedTypes.test(extname);
        const hasValidMimetype = allowedTypes.test(file.mimetype);

        // Allow if EITHER mimetype is valid OR extension is valid (for blob uploads without filenames)
        // Or if originalname is 'blob' (common for FormData blob uploads)
        if (hasValidMimetype || hasValidExtension || file.originalname === 'blob') {
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
router.post('/layer2/start', extractApp, async (req, res) => {
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
            purpose,
            appId: req.businessApp?.app_id // Pass appId from context
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
    { name: 'imageFrames', maxCount: 30 } // Increased to handle more frames from liveness check
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

        // Validate that we have frames
        if (!livenessData.imageFrames || livenessData.imageFrames.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No image frames provided for liveness verification'
            });
        }

        if (livenessData.imageFrames.length < 10) {
            return res.status(400).json({
                success: false,
                error: `Insufficient frames for liveness verification. Got ${livenessData.imageFrames.length}, need at least 10`
            });
        }

        const result = await verificationServiceV2.processLivenessCheck(requestId, livenessData);

        res.json({
            success: true,
            liveness: result
        });

    } catch (error) {
        console.error('Liveness check failed:', error);
        res.status(500).json({
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
router.post('/layer3/start', extractApp, async (req, res) => {
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
            purpose,
            appId: req.businessApp?.app_id // Pass appId from context
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
 * Files go directly to ImageKit — no temporary files are written to disk.
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

        // Tiers are independent — layer_1 or layer_2 users can proceed to Layer 3
        const ELIGIBLE_TIERS = ['layer_1', 'layer_2'];
        if (!ELIGIBLE_TIERS.includes(userAccount.tier)) {
            return res.status(403).json({
                error: 'Layer 1 or Layer 2 verification required before Layer 3',
                current_status: userAccount.tier
            });
        }

        const { document_type } = req.body;

        // Support both 'license' and 'drivers_license' to be safe
        const normalizedDocType = document_type === 'license' ? 'drivers_license' : document_type;

        if (!normalizedDocType || !['passport', 'drivers_license', 'national_id'].includes(normalizedDocType)) {
            return res.status(400).json({ success: false, error: 'Invalid document_type' });
        }

        const frontImageFile = req.files?.front_image?.[0];
        const backImageFile = req.files?.back_image?.[0];

        if (!frontImageFile) {
            return res.status(400).json({ success: false, error: 'front_image is required' });
        }

        // Passport only needs front, others need both
        if (normalizedDocType !== 'passport' && !backImageFile) {
            return res.status(400).json({ success: false, error: 'back_image is required for ID/Driver\'s License' });
        }

        // Upload front image to ImageKit (no temp file written to disk)
        const frontUploadResponse = await imagekit.files.upload({
            file: frontImageFile.buffer.toString('base64'),
            fileName: `kyc-front-${userAccount.user_id}-${Date.now()}`,
            folder: '/kyc-documents',
            useUniqueFileName: true
        });

        // Upload back image to ImageKit if provided
        let backUploadResponse = null;
        if (backImageFile) {
            backUploadResponse = await imagekit.files.upload({
                file: backImageFile.buffer.toString('base64'),
                fileName: `kyc-back-${userAccount.user_id}-${Date.now()}`,
                folder: '/kyc-documents',
                useUniqueFileName: true
            });
        }

        // Generate upload ID for tracking (moved up)
        const crypto = require('crypto');
        const uploadId = crypto.randomBytes(16).toString('hex');

        let extractedData = {
            document_type: normalizedDocType,
            document_number: '',
            first_name: '',
            last_name: '',
            date_of_birth: '',
            gender: '',
            nationality: 'Nigerian',
            confidence: 0
        };
        // EXTRACT DATA VIA OCR
        try {
            // Initialize Tesseract OCR worker (tesseract.js)
            const { createWorker } = require('tesseract.js');
            
            // Re-wrap in a localized try-catch to ensure worker.terminate() always runs
            worker = await createWorker('eng');

            // Configure Tesseract for document scanning.
            // PSM 6 = "Assume a single uniform block of text" — avoids OSD (osd.traineddata) requirements.
            await worker.setParameters({
                tessedit_pageseg_mode: '6',
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /-.,',
            });

            // Perform OCR directly on in-memory buffer
            const { data } = await worker.recognize(frontImageFile.buffer);

            // Parse extracted text into structured data
            extractedData = parseDocumentText(data.text, normalizedDocType, data.confidence);

            await worker.terminate();
            worker = null;
        } catch (ocrError) {
            console.error('[OCR] Extraction failed, falling back to manual entry:', ocrError.message);
            if (worker) {
                try { await worker.terminate(); } catch (_) {}
                worker = null;
            }
            // extractedData remains at its default values, which is fine
        }
      

        res.json({
            success: true,
            upload_id: uploadId,
            front_image_url: frontUploadResponse.url,
            front_image_file_id: frontUploadResponse.fileId,
            back_image_url: backUploadResponse?.url || null,
            back_image_file_id: backUploadResponse?.fileId || null,
            extracted_data: extractedData,
            confidence: extractedData.confidence || 0,
            needs_review: true,
            message: 'Document processed. Please review the extracted data.'
        });

    } catch (error) {
        if (worker) {
            try { await worker.terminate(); } catch (_) {}
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
 * Finds the pending VerificationRequestV2 created by /layer3/start and
 * enriches it with the OCR-extracted document data.
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

        // Fetch the full user account from database (session may lack some fields)
        const { UserAccount, VerificationRequestV2 } = require('../database/models');
        const fullUserAccount = await UserAccount.findOne({ user_id: userAccount.user_id });

        if (!fullUserAccount) {
            return res.status(404).json({ success: false, error: 'User account not found' });
        }

        // Tiers are independent — layer_1 or layer_2 can reach Layer 3
        const ELIGIBLE_TIERS = ['layer_1', 'layer_2'];
        if (!ELIGIBLE_TIERS.includes(fullUserAccount.tier)) {
            return res.status(403).json({
                error: 'Layer 1 or Layer 2 verification required for Full KYC',
                current_tier: fullUserAccount.tier
            });
        }

        const {
            document_data,
            upload_id,
            front_image_url,
            front_image_file_id,
            back_image_url,
            back_image_file_id,
            liveness_verified
        } = req.body;

        if (!document_data || !upload_id) {
            return res.status(400).json({ success: false, error: 'Missing required fields: document_data and upload_id' });
        }

        // Find the pending VerificationRequestV2 opened by /layer3/start
        const pendingRequest = await VerificationRequestV2.findOne({
            user_id: fullUserAccount.user_id,
            verification_tier: 'layer_3',
            status: { $in: ['pending', 'in_progress'] }
        });

        if (!pendingRequest) {
            return res.status(400).json({
                error: 'No active Layer 3 verification session found. Please call /layer3/start first.'
            });
        }

        // Enrich the existing request with document data
        pendingRequest.status = 'in_progress';
        pendingRequest.verification_data = {
            ...pendingRequest.verification_data,
            document_verified: true, // Provisional — admin review will confirm
            document_type: document_data.document_type,
            document_number: document_data.document_number,
            nin: document_data.nin,
            first_name: document_data.first_name,
            last_name: document_data.last_name,
            date_of_birth: document_data.date_of_birth,
            gender: document_data.gender,
            nationality: document_data.nationality || 'Nigerian',
            home_address: document_data.address,
            liveness_verified: liveness_verified || false,
            // ImageKit references (no local paths)
            front_image_url: front_image_url || null,
            front_image_file_id: front_image_file_id || null,
            back_image_url: back_image_url || null,
            back_image_file_id: back_image_file_id || null,
            upload_id,
            submitted_at: new Date().toISOString()
        };

        await pendingRequest.save();

        res.json({
            success: true,
            verification_request_id: pendingRequest.request_id,
            status: 'in_progress',
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
                credentialHash: cred.credential_hash,
                // Attach ZK data from the UserAccount to the credentials
                zk_verified: sessionData.userAccount.zk_verified || false,
                zk_transaction_hash: sessionData.userAccount.zk_transaction_hash || null,
                zk_nullifier: sessionData.userAccount.zk_nullifier || null
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

        // Generate a share ID and store in TTL collection (24 hour expiry)
        const shareId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const dataShare = new DataShare({
            share_id: shareId,
            user_id: result.data?.verification?.wallet || 'unknown',
            wallet: result.data?.verification?.wallet,
            human_id: result.data?.verification?.human_id,
            package_data: result,
            shared_fields: fields || [],
            signature: result.signature,
            public_key: result.public_key,
            expires_at: expiresAt
        });
        await dataShare.save();

        res.json({
            success: true,
            sharePackage: result,
            share_id: shareId,
            verification_url: `/share-view/${shareId}`,
            expires_at: expiresAt
        });

    } catch (error) {
        console.error('Selective Disclosure failed:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Retrieve a stored share package by ID
 * GET /api/v2/verification/share/:shareId
 */
router.get('/share/:shareId', async (req, res) => {
    try {
        const { shareId } = req.params;

        // Find the stored share package
        const dataShare = await DataShare.findOne({ share_id: shareId });

        if (!dataShare) {
            return res.status(404).json({
                success: false,
                error: 'Share package not found or has expired'
            });
        }

        // Increment view count
        dataShare.view_count += 1;
        await dataShare.save();

        // Verify the package is still valid
        const verificationResult = await verificationServiceV2.verifySharePackage(dataShare.package_data);

        res.json({
            success: true,
            share_id: dataShare.share_id,
            package_data: dataShare.package_data,
            shared_fields: dataShare.shared_fields,
            created_at: dataShare.created_at,
            expires_at: dataShare.expires_at,
            view_count: dataShare.view_count,
            verification: verificationResult
        });

    } catch (error) {
        console.error('Failed to retrieve share package:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Verify a Selective Disclosure share package
 * POST /api/v2/verification/share/verify
 */
router.post('/share/verify', async (req, res) => {
    try {
        const { sharePackage } = req.body;

        if (!sharePackage) {
            return res.status(400).json({
                success: false,
                error: 'Share package is required'
            });
        }

        const result = await verificationServiceV2.verifySharePackage(sharePackage);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Share verification failed:', error);
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