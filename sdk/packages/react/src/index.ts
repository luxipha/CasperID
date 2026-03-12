// Styles (optional - consumers can import separately)
import './index.css';

// Main component
export { CasperIDModal } from './CasperIDModal';
export { default } from './CasperIDModal';

// Individual screens (for advanced customisation / white-labelling)
export { default as AuthSelectionScreen } from './screens/AuthSelection';
export { default as LoginScreen } from './screens/Login';
export { default as PinVerificationScreen } from './screens/PinVerification';
export { default as SecurityUpgradeScreen } from './screens/SecurityUpgrade';
export { default as FaceScanScreen } from './screens/FaceScan';
export { default as VerifyIdentityChoiceScreen } from './screens/VerifyIdentityChoice';
export { default as DocumentScanScreen } from './screens/DocumentScan';
export { default as ReviewDataScreen } from './screens/ReviewData';
export { default as MintingIdentityScreen } from './screens/MintingIdentity';
export { default as IdentityVerifiedScreen } from './screens/IdentityVerified';
export { default as PermissionsRequestScreen } from './screens/PermissionsRequest';

// Shared components
export { default as GlassContainer } from './shared/GlassContainer';
export { default as Header } from './shared/Header';
export { default as Footer } from './shared/Footer';

// Types
export type {
    CasperIDModalProps,
    CasperIDTheme,
    Screen,
    SDKMode,
    VerificationTier,
    ScreenProps,
    DocumentType,
    ExtractedDocumentData,
    KYCState,
    OTPState,
} from './types';

// Utilities
export { fetchWithTimeout, ApiError, handleApiResponse } from './utils/fetchWithTimeout';
