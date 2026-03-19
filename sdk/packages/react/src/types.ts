export type Screen =
    | 'AuthSelection'
    | 'Login'
    | 'PasskeyAuth'       // Returning user biometric authentication
    | 'PasskeyRegister'   // New user passkey creation
    | 'PinVerification'
    | 'SecurityUpgrade'
    | 'FaceScan'
    | 'VerifyIdentityChoice'
    | 'DocumentScan'
    | 'ReviewData'
    | 'MintingIdentity'   // Unified screen for L1/L2/L3 minting
    | 'IdentityVerified'
    | 'PermissionsRequest';

export type SDKMode = 'light' | 'dark' | 'system';
export type VerificationTier = 'L1' | 'L2' | 'L3';
export type LayoutMode = 'auto' | 'modal' | 'fullscreen';
export type Platform = 'desktop' | 'mobile';

export interface CasperIDTheme {
    primaryColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    mode?: SDKMode;
    layout?: LayoutMode;
    platform?: Platform;
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
    onSuccess?: (sessionToken: string, data?: { businessToken?: string }) => void;
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
    /** Base URL for API requests. Defaults to https://apis.casperid.com */
    apiBaseUrl?: string;
    /** Current layout mode — 'auto' (default), 'modal', or 'fullscreen' */
    layout?: LayoutMode;
    /** Terms of Service URL */
    termsUrl?: string;
    /** Privacy Policy URL */
    privacyUrl?: string;
    /** Logo URL for branding */
    logoUrl?: string;
    /** Default language for the SDK (e.g., 'EN', 'ES', 'FR') */
    language?: string;
    /** Explicitly target a platform: 'desktop' or 'mobile' */
    platform?: Platform;
}

export interface ScreenProps {
    onNext: (screen?: Screen) => void;
    theme: 'light' | 'dark';
    apiBaseUrl?: string;
    language?: string;
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
    business_token?: string;
    expiresAt?: string;
    error?: string;
    attemptsLeft?: number;
    userExists?: boolean;
    hasPasskey?: boolean;
    userAccount?: {
        user_id: string;
        wallet?: string;
        tier?: string;
        did_address?: string;
    } | null;
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

// Passkey / WebAuthn Types
export interface PasskeyRegisterInitResponse {
    success: boolean;
    userId?: string;
    options?: PublicKeyCredentialCreationOptionsJSON;
    expiresIn?: number;
    error?: string;
}

export interface PasskeyRegisterCompleteResponse {
    success: boolean;
    credential_id?: string;
    session_token?: string;
    business_token?: string;
    expires_at?: string;
    user?: {
        user_id: string;
        email: string;
        tier: string;
    };
    error?: string;
}

export interface PasskeyAuthInitResponse {
    success: boolean;
    challengeId?: string;
    options?: PublicKeyCredentialRequestOptionsJSON;
    error?: string;
}

export interface PasskeyAuthCompleteResponse {
    success: boolean;
    session_token?: string;
    business_token?: string;
    expires_at?: string;
    user?: {
        user_id: string;
        email: string;
        wallet?: string;
        tier: string;
        did_address?: string;
    };
    error?: string;
}

// WebAuthn JSON types (for transport)
export interface PublicKeyCredentialCreationOptionsJSON {
    challenge: string;
    rp: {
        name: string;
        id?: string;
    };
    user: {
        id: string;
        name: string;
        displayName: string;
    };
    pubKeyCredParams: Array<{
        type: 'public-key';
        alg: number;
    }>;
    timeout?: number;
    attestation?: AttestationConveyancePreference;
    authenticatorSelection?: {
        authenticatorAttachment?: AuthenticatorAttachment;
        residentKey?: ResidentKeyRequirement;
        requireResidentKey?: boolean;
        userVerification?: UserVerificationRequirement;
    };
    excludeCredentials?: Array<{
        type: 'public-key';
        id: string;
        transports?: AuthenticatorTransport[];
    }>;
}

export interface PublicKeyCredentialRequestOptionsJSON {
    challenge: string;
    timeout?: number;
    rpId?: string;
    allowCredentials?: Array<{
        type: 'public-key';
        id: string;
        transports?: AuthenticatorTransport[];
    }>;
    userVerification?: UserVerificationRequirement;
}

// L1 Setup Types
export interface WalletGenerateResponse {
    success: boolean;
    walletInfo?: {
        walletAddress: string;
        humanId: string;
        publicKey: string;
    };
    alreadyExists?: boolean;
    error?: string;
}

export interface DIDMintResponse {
    success: boolean;
    did_address?: string;
    transaction_hash?: string;
    error?: string;
}

// App Metadata for Branding
export interface AppMetadata {
    app_id: string;
    name: string;
    logo_url?: string;
    theme?: {
        primaryColor?: string;
        borderRadius?: string;
        fontFamily?: string;
        layout?: LayoutMode;
        platform?: Platform;
    };
}

export interface AppMetadataResponse {
    success: boolean;
    app?: AppMetadata;
    error?: string;
}

// Auth State for SDK internal use
export interface AuthState {
    email: string;
    sessionToken?: string;
    businessToken?: string;
    userExists: boolean;
    hasPasskey: boolean;
    userAccount?: {
        user_id: string;
        wallet?: string;
        tier?: string;
        did_address?: string;
    } | null;
}
