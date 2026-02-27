const { body, param, query, validationResult } = require('express-validator');
const { rateLimitMiddleware } = require('../utils/rate-limiter');
const { normalizeEmail } = require('../utils/email-normalizer');

/**
 * Input validation middleware using express-validator
 * Provides validation for all new endpoints
 */

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

/**
 * Validation rules for passkey registration
 */
const validatePasskeyRegistration = [
    body('email')
        .isEmail()
        .customSanitizer(value => normalizeEmail(value))
        .withMessage('Valid email is required'),
    body('name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .trim()
        .escape()
        .withMessage('Name must be 1-100 characters'),
    handleValidationErrors
];

/**
 * Validation rules for passkey authentication
 */
const validatePasskeyAuth = [
    body('challengeId')
        .optional()
        .isUUID()
        .withMessage('Challenge ID must be a valid UUID'),
    body('credential')
        .optional()
        .isObject()
        .withMessage('Credential must be an object'),
    body('deviceInfo')
        .optional()
        .isObject()
        .withMessage('Device info must be an object'),
    handleValidationErrors
];

/**
 * Validation rules for email verification
 */
const validateEmailVerification = [
    body('verificationId')
        .isUUID()
        .withMessage('Verification ID must be a valid UUID'),
    body('code')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Verification code must be 6 digits'),
    handleValidationErrors
];

/**
 * Validation rules for MetaMask dApp registration
 */
const validateDappRegistration = [
    body('dappName')
        .isLength({ min: 1, max: 100 })
        .trim()
        .escape()
        .withMessage('DApp name must be 1-100 characters'),
    body('dappOrigin')
        .isURL({ protocols: ['https'] })
        .withMessage('DApp origin must be a valid HTTPS URL'),
    body('developerEmail')
        .optional()
        .isEmail()
        .customSanitizer(value => normalizeEmail(value))
        .withMessage('Developer email must be valid'),
    body('webhookUrl')
        .optional()
        .isURL({ protocols: ['https'] })
        .withMessage('Webhook URL must be a valid HTTPS URL'),
    handleValidationErrors
];

/**
 * Validation rules for permission requests
 */
const validatePermissionRequest = [
    body('metamaskAddress')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('MetaMask address must be a valid Ethereum address'),
    body('userEmail')
        .optional()
        .isEmail()
        .customSanitizer(value => normalizeEmail(value))
        .withMessage('User email must be valid'),
    body('requestedPermissions')
        .isArray({ min: 1 })
        .withMessage('At least one permission must be requested'),
    body('requestedPermissions.*.action')
        .isIn(['verify:identity', 'verify:liveness', 'verify:kyc', 'spend:verification_fee'])
        .withMessage('Invalid permission action'),
    body('durationDays')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Duration must be between 1 and 365 days'),
    handleValidationErrors
];

/**
 * Validation rules for verification execution
 */
const validateVerificationExecution = [
    body('grantId')
        .isUUID()
        .withMessage('Grant ID must be a valid UUID'),
    body('verificationType')
        .isIn(['layer_2', 'layer_3'])
        .withMessage('Verification type must be layer_2 or layer_3'),
    body('requestedFields')
        .optional()
        .isArray()
        .withMessage('Requested fields must be an array'),
    body('purpose')
        .optional()
        .isLength({ max: 500 })
        .trim()
        .escape()
        .withMessage('Purpose must be less than 500 characters'),
    handleValidationErrors
];

/**
 * Validation rules for verification requests
 */
const validateVerificationRequest = [
    body('verificationMethod')
        .optional()
        .isIn(['document_upload', 'nimc'])
        .withMessage('Verification method must be document_upload or nimc'),
    body('linkWallet')
        .optional()
        .isBoolean()
        .withMessage('Link wallet must be a boolean'),
    body('purpose')
        .optional()
        .isLength({ max: 500 })
        .trim()
        .escape()
        .withMessage('Purpose must be less than 500 characters'),
    handleValidationErrors
];

/**
 * Validation rules for UUID parameters
 */
const validateUUIDParam = (paramName) => [
    param(paramName)
        .isUUID()
        .withMessage(`${paramName} must be a valid UUID`),
    handleValidationErrors
];

/**
 * Validation rules for MetaMask address linking
 */
const validateMetaMaskLinking = [
    body('metamaskAddress')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('MetaMask address must be a valid Ethereum address'),
    body('signature')
        .optional()
        .isHexadecimal()
        .withMessage('Signature must be hexadecimal'),
    body('message')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Message must be less than 1000 characters'),
    handleValidationErrors
];

/**
 * Sanitize file upload data
 */
const validateFileUpload = (req, res, next) => {
    if (req.files) {
        for (const fieldName in req.files) {
            const files = Array.isArray(req.files[fieldName]) 
                ? req.files[fieldName] 
                : [req.files[fieldName]];
            
            for (const file of files) {
                // Check file size
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    return res.status(400).json({
                        success: false,
                        error: `File ${file.originalname} is too large. Max size is 10MB.`
                    });
                }
                
                // Check file type
                const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
                const isValidType = allowedTypes.test(file.mimetype) && 
                                  allowedTypes.test(file.originalname.toLowerCase());
                
                if (!isValidType) {
                    return res.status(400).json({
                        success: false,
                        error: `File ${file.originalname} has invalid type. Only images and videos allowed.`
                    });
                }
            }
        }
    }
    
    next();
};

/**
 * Rate limiting for different endpoint types
 */
const passkeyRateLimit = rateLimitMiddleware('passkey_auth');
const verificationRateLimit = rateLimitMiddleware('verification_requests');
const permissionRateLimit = rateLimitMiddleware('permission_requests');

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
    res.set({
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    });
    next();
};

/**
 * API key validation middleware
 */
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required in X-API-Key header'
        });
    }
    
    // Basic API key format validation
    if (!apiKey.startsWith('ck_') || apiKey.length < 50) {
        return res.status(401).json({
            success: false,
            error: 'Invalid API key format'
        });
    }
    
    next();
};

module.exports = {
    handleValidationErrors,
    validatePasskeyRegistration,
    validatePasskeyAuth,
    validateEmailVerification,
    validateDappRegistration,
    validatePermissionRequest,
    validateVerificationExecution,
    validateVerificationRequest,
    validateUUIDParam,
    validateMetaMaskLinking,
    validateFileUpload,
    passkeyRateLimit,
    verificationRateLimit,
    permissionRateLimit,
    securityHeaders,
    validateApiKey
};