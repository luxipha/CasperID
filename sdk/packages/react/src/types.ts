export type Screen =
    | 'AuthSelection'
    | 'Login'
    | 'PinVerification'
    | 'SecurityUpgrade'
    | 'FaceScan'
    | 'VerifyIdentityChoice'
    | 'DocumentScan'
    | 'ReviewData'
    | 'MintingIdentity'
    | 'IdentityVerified'
    | 'PermissionsRequest';

export type SDKMode = 'light' | 'dark' | 'system';
export type VerificationTier = 'L1' | 'L2' | 'L3';

export interface CasperIDTheme {
    primaryColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    mode?: SDKMode;
}

export interface CasperIDModalProps {
    /** Whether the modal is visible */
    isOpen: boolean;
    /** Your CasperID API key (from the Business Dashboard) */
    apiKey: string;
    /** Theme overrides — merged with cloud-synced config */
    theme?: CasperIDTheme;
    /** Minimum verification tier required. SDK will auto step-up if needed. */
    requiredTier?: VerificationTier;
    /** Called when authentication/verification succeeds */
    onSuccess?: (token: string) => void;
    /** Called when the user dismisses the modal */
    onClose?: () => void;
    /** Called when an unrecoverable error occurs */
    onError?: (error: Error) => void;
    /** Use 'login' for full auth, 'verify' for KYC-only mode */
    mode?: 'login' | 'verify';
    /**
     * When true, renders the modal card inline (no fixed overlay, no backdrop).
     * Used by the Design Studio preview pane.
     */
    previewMode?: boolean;
    /** Force a specific screen (used by Design Studio step navigation) */
    initialScreen?: Screen;
}

export interface ScreenProps {
    onNext: (screen?: Screen) => void;
    theme: 'light' | 'dark';
}

// OTP Authentication State
export interface OTPState {
    email: string;
    verificationId: string;
}

// API Response types
export interface SendOTPResponse {
    success: boolean;
    verificationId?: string;
    userExists?: boolean;
    hasPasskey?: boolean;
    error?: string;
    message?: string;
}

export interface VerifyOTPResponse {
    success: boolean;
    sessionToken?: string;
    error?: string;
    attemptsLeft?: number;
}

// SDK Configuration
export interface CasperIDConfig {
    apiBaseUrl?: string;
}

// KYC Types
export type DocumentType = 'passport' | 'drivers_license' | 'national_id';

export interface KYCState {
    requestId: string;
    verificationTier: 'layer_2' | 'layer_3';
    documentType?: DocumentType;
    extractedData?: ExtractedDocumentData;
    livenessVerified?: boolean;
}

export interface ExtractedDocumentData {
    document_type?: string;
    document_number?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: string;
    nationality?: string;
    confidence?: number;
}

export interface StartVerificationResponse {
    success: boolean;
    verification?: {
        requestId: string;
        verificationType: string;
        status: string;
        requirements: {
            livenessCheck?: boolean;
            walletLink?: boolean;
            identityDocument?: boolean;
            nimcVerification?: boolean;
        };
        verificationMethod?: string;
        expiresAt: string;
        nextStep: string;
    };
    error?: string;
}

export interface LivenessResponse {
    success: boolean;
    liveness?: {
        passed: boolean;
        confidence: number;
        antiSpoofingScore?: number;
    };
    error?: string;
}

export interface DocumentUploadResponse {
    success: boolean;
    upload_id?: string;
    extracted_data?: ExtractedDocumentData;
    confidence?: number;
    needs_review?: boolean;
    error?: string;
}

export interface VerificationStatusResponse {
    success: boolean;
    verification?: {
        requestId: string;
        status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
        verificationType?: string;
        createdAt?: string;
        completedAt?: string;
        expiresAt?: string;
        progress?: {
            livenessCompleted?: boolean;
            documentCompleted?: boolean;
            livenessScore?: number;
        };
        results?: {
            verified: boolean;
            tier: string;
            proofHash: string;
            signature: string;
        };
        error?: string;
    };
    error?: string;
}

export interface Layer3SubmitResponse {
    success: boolean;
    verification_request_id?: string;
    status?: string;
    message?: string;
    error?: string;
}
