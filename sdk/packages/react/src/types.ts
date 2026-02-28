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
