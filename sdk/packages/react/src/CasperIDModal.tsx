import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import GlassContainer from './shared/GlassContainer';
import Header from './shared/Header';
import Footer from './shared/Footer';

import AuthSelection from './screens/AuthSelection';
import Login from './screens/Login';
import PinVerification from './screens/PinVerification';
import SecurityUpgrade from './screens/SecurityUpgrade';
import FaceScan from './screens/FaceScan';
import VerifyIdentityChoice from './screens/VerifyIdentityChoice';
import DocumentScan from './screens/DocumentScan';
import ReviewData from './screens/ReviewData';
import MintingIdentity from './screens/MintingIdentity';
import IdentityVerified from './screens/IdentityVerified';
import PermissionsRequest from './screens/PermissionsRequest';

import type {
    CasperIDModalProps,
    Screen,
    SDKMode,
    OTPState,
    KYCState,
    DocumentType,
    ExtractedDocumentData,
    StartVerificationResponse
} from './types';

// Resolve 'system' mode to actual light/dark
function resolveMode(mode: SDKMode = 'light'): 'light' | 'dark' {
    if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
}

const FOOTER_SCREENS: Screen[] = ['AuthSelection', 'Login', 'PinVerification'];

// Default API base URL
const DEFAULT_API_BASE_URL = 'https://apis.casperid.com';

// Initial KYC state
const initialKYCState: KYCState = {
    requestId: '',
    verificationTier: 'layer_3'
};

export const CasperIDModal: React.FC<CasperIDModalProps> = ({
    isOpen,
    apiKey,
    theme = {},
    requiredTier,
    onSuccess,
    onClose,
    onError,
    mode = 'login',
    previewMode = false,
    initialScreen,
}) => {
    const {
        primaryColor = '#8651e1',
        borderRadius = '12',
        fontFamily = 'Inter',
        mode: themeMode = 'light',
    } = theme;

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(resolveMode(themeMode));
    const [screen, setScreen] = useState<Screen>(
        initialScreen ?? (mode === 'verify' ? 'SecurityUpgrade' : 'AuthSelection')
    );

    // OTP flow state
    const [otpState, setOtpState] = useState<OTPState>({ email: '', verificationId: '' });
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    // KYC flow state
    const [kycState, setKycState] = useState<KYCState>(initialKYCState);
    const [uploadId, setUploadId] = useState<string>('');
    const [credentialHash, setCredentialHash] = useState<string>('');

    // API base URL (could be configurable via props in the future)
    const apiBaseUrl = DEFAULT_API_BASE_URL;

    // Apply CSS variables + theme class to the modal root
    const cssVars = {
        '--casperid-primary': primaryColor,
        '--casperid-radius': `${borderRadius}px`,
        '--casperid-font': fontFamily,
    } as React.CSSProperties;

    // Sync system theme
    useEffect(() => {
        if (themeMode === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => setResolvedTheme(e.matches ? 'dark' : 'light');
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        } else {
            setResolvedTheme(resolveMode(themeMode));
        }
    }, [themeMode]);

    // Reset to first screen when opened (unless previewMode controls it via initialScreen)
    useEffect(() => {
        if (isOpen && !previewMode) {
            setScreen(initialScreen ?? (mode === 'verify' ? 'SecurityUpgrade' : 'AuthSelection'));
            // Reset all state when modal opens
            setOtpState({ email: '', verificationId: '' });
            setSessionToken(null);
            setKycState(initialKYCState);
            setUploadId('');
            setCredentialHash('');
        }
    }, [isOpen, mode, previewMode, initialScreen]);

    const toggleTheme = () =>
        setResolvedTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    const go = useCallback((next: Screen) => setScreen(next), []);

    // Start KYC verification flow
    const startVerification = useCallback(async (tier: 'layer_2' | 'layer_3') => {
        try {
            // Use the correct endpoint for each layer
            const endpoint = tier === 'layer_2'
                ? `${apiBaseUrl}/api/v2/verification/layer2/start`
                : `${apiBaseUrl}/api/v2/verification/layer3/start`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                credentials: 'include',
                body: JSON.stringify({
                    purpose: 'sdk_verification',
                    ...(tier === 'layer_3' ? { verificationMethod: 'document' } : {})
                })
            });

            const data: StartVerificationResponse = await response.json();

            if (data.success && data.verification) {
                setKycState(prev => ({
                    ...prev,
                    requestId: data.verification!.requestId,
                    verificationTier: tier
                }));
                return data.verification.requestId;
            } else {
                throw new Error(data.error || 'Failed to start verification');
            }
        } catch (err) {
            console.error('Failed to start verification:', err);
            onError?.(err instanceof Error ? err : new Error('Failed to start verification'));
            return null;
        }
    }, [apiBaseUrl, apiKey, onError]);

    // Handle successful OTP verification
    const handleOTPSuccess = useCallback((token: string) => {
        setSessionToken(token);
        // Continue to next screen (SecurityUpgrade or IdentityVerified based on requiredTier)
        go('SecurityUpgrade');
    }, [go]);

    // Handle extension login success
    const handleExtensionSuccess = useCallback((userData: any) => {
        // Extension auth is complete - generate token and proceed
        const mockToken = `cid_ext_${apiKey}_${Date.now()}`;
        setSessionToken(mockToken);
        // Skip to appropriate screen based on user's tier
        go('SecurityUpgrade');
    }, [apiKey, go]);

    // Handle SecurityUpgrade start
    const handleSecurityUpgradeNext = useCallback(async () => {
        // Start Layer 2 verification (face scan)
        const requestId = await startVerification('layer_2');
        if (requestId) {
            go('FaceScan');
        }
    }, [startVerification, go]);

    // Handle FaceScan completion
    const handleFaceScanNext = useCallback(async (livenessVerified: boolean) => {
        setKycState(prev => ({ ...prev, livenessVerified }));

        // Check if we need Layer 3 (document verification)
        if (requiredTier === 'L3') {
            // Start Layer 3 verification
            const requestId = await startVerification('layer_3');
            if (requestId) {
                go('VerifyIdentityChoice');
            }
        } else {
            // Layer 2 complete, go to minting
            go('MintingIdentity');
        }
    }, [requiredTier, startVerification, go]);

    // Handle document type selection
    const handleDocumentTypeSelected = useCallback((documentType: DocumentType) => {
        setKycState(prev => ({ ...prev, documentType }));
        go('DocumentScan');
    }, [go]);

    // Handle document scan completion
    const handleDocumentScanNext = useCallback((extractedData: ExtractedDocumentData, docUploadId: string) => {
        setKycState(prev => ({ ...prev, extractedData }));
        setUploadId(docUploadId);
        go('ReviewData');
    }, [go]);

    // Handle review data confirmation
    const handleReviewDataNext = useCallback((confirmedData: ExtractedDocumentData) => {
        setKycState(prev => ({ ...prev, extractedData: confirmedData }));
        go('MintingIdentity');
    }, [go]);

    // Handle document retake
    const handleDocumentRetake = useCallback(() => {
        setKycState(prev => ({ ...prev, extractedData: undefined }));
        setUploadId('');
        go('DocumentScan');
    }, [go]);

    // Handle minting completion
    const handleMintingNext = useCallback((hash?: string) => {
        if (hash) {
            setCredentialHash(hash);
        }
        go('IdentityVerified');
    }, [go]);

    // Handle final success (after permissions approved)
    const handleSuccess = useCallback(() => {
        const token = sessionToken || `cid_${apiKey}_${Date.now()}`;
        onSuccess?.(token);
        onClose?.();
    }, [apiKey, sessionToken, onSuccess, onClose]);

    // Handle errors
    const handleError = useCallback((error: string) => {
        onError?.(new Error(error));
    }, [onError]);

    // Login screen handlers
    const handleLoginNext = useCallback((email: string, verificationId: string) => {
        setOtpState({ email, verificationId });
        go('PinVerification');
    }, [go]);

    if (!isOpen && !previewMode) return null;

    // Render screen content
    const renderScreen = () => {
        switch (screen) {
            case 'AuthSelection':
                return (
                    <AuthSelection
                        onNext={(method) => go(method === 'otp' ? 'Login' : 'SecurityUpgrade')}
                        onExtensionSuccess={handleExtensionSuccess}
                        onError={handleError}
                    />
                );
            case 'Login':
                return (
                    <Login
                        onNext={handleLoginNext}
                        onError={handleError}
                        apiBaseUrl={apiBaseUrl}
                    />
                );
            case 'PinVerification':
                return (
                    <PinVerification
                        email={otpState.email}
                        verificationId={otpState.verificationId}
                        onNext={handleOTPSuccess}
                        onError={handleError}
                        apiBaseUrl={apiBaseUrl}
                    />
                );
            case 'SecurityUpgrade':
                return (
                    <SecurityUpgrade
                        onNext={handleSecurityUpgradeNext}
                        onSkip={() => go('IdentityVerified')}
                    />
                );
            case 'FaceScan':
                return (
                    <FaceScan
                        requestId={kycState.requestId}
                        onNext={handleFaceScanNext}
                        onError={handleError}
                        apiBaseUrl={apiBaseUrl}
                    />
                );
            case 'VerifyIdentityChoice':
                return (
                    <VerifyIdentityChoice
                        onNext={handleDocumentTypeSelected}
                    />
                );
            case 'DocumentScan':
                return (
                    <DocumentScan
                        requestId={kycState.requestId}
                        documentType={kycState.documentType || 'passport'}
                        onNext={handleDocumentScanNext}
                        onError={handleError}
                        apiBaseUrl={apiBaseUrl}
                    />
                );
            case 'ReviewData':
                return (
                    <ReviewData
                        requestId={kycState.requestId}
                        documentType={kycState.documentType || 'passport'}
                        extractedData={kycState.extractedData || {}}
                        uploadId={uploadId}
                        onNext={handleReviewDataNext}
                        onRetake={handleDocumentRetake}
                        onError={handleError}
                        apiBaseUrl={apiBaseUrl}
                    />
                );
            case 'MintingIdentity':
                return (
                    <MintingIdentity
                        requestId={kycState.requestId}
                        onNext={handleMintingNext}
                        onError={handleError}
                        apiBaseUrl={apiBaseUrl}
                    />
                );
            case 'IdentityVerified':
                return <IdentityVerified onNext={() => go('PermissionsRequest')} />;
            case 'PermissionsRequest':
                return <PermissionsRequest onApprove={handleSuccess} onDeny={() => onClose?.()} />;
            default:
                return null;
        }
    };

    // In previewMode, render the card directly (no fixed overlay)
    if (previewMode) {
        return (
            <div style={cssVars} className={`relative ${resolvedTheme}`}>
                <GlassContainer className="backdrop-blur-3xl">
                    <Header
                        onClose={onClose}
                        showClose={screen !== 'AuthSelection'}
                        subtitle={screen === 'PermissionsRequest' ? 'PERMISSION REQUEST' : 'SECURE SDK'}
                        theme={resolvedTheme}
                        toggleTheme={toggleTheme}
                    />
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div key={screen} className="flex-1 flex flex-col">
                                {renderScreen()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    {FOOTER_SCREENS.includes(screen) && (
                        <Footer>
                            <p className="text-[11px] text-slate-500 font-medium">
                                By connecting, you agree to our{' '}
                                <a className="text-[var(--casperid-primary,#8651e1)] hover:underline ml-1" href="#">Terms of Service</a>
                                {' '}&amp;{' '}
                                <a className="text-[var(--casperid-primary,#8651e1)] hover:underline ml-1" href="#">Privacy Policy</a>
                            </p>
                        </Footer>
                    )}
                </GlassContainer>
            </div>
        );
    }

    return (
        // Overlay backdrop — sits on top of the host app
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            {/* Ambient glows — inside the overlay, behind the card */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full blur-[120px]"
                    style={{ backgroundColor: `${primaryColor}1a` }}
                />
                <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-[#6DE8EC]/5 blur-[100px] rounded-full" />
            </div>

            {/* The glass modal card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={cssVars}
                className={`relative selection:bg-[var(--casperid-primary,#8651e1)]/30 ${resolvedTheme}`}
            >
                <GlassContainer className="backdrop-blur-3xl">
                    <Header
                        onClose={onClose}
                        showClose={screen !== 'AuthSelection'}
                        subtitle={screen === 'PermissionsRequest' ? 'PERMISSION REQUEST' : 'SECURE SDK'}
                        theme={resolvedTheme}
                        toggleTheme={toggleTheme}
                    />

                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div key={screen} className="flex-1 flex flex-col">
                                {renderScreen()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer with ToS links, shown on early screens */}
                    {FOOTER_SCREENS.includes(screen) && (
                        <Footer>
                            <p className="text-[11px] text-slate-500 font-medium">
                                By connecting, you agree to our{' '}
                                <a className="text-[var(--casperid-primary,#8651e1)] hover:underline ml-1" href="#">
                                    Terms of Service
                                </a>{' '}
                                &amp;{' '}
                                <a className="text-[var(--casperid-primary,#8651e1)] hover:underline ml-1" href="#">
                                    Privacy Policy
                                </a>
                            </p>
                        </Footer>
                    )}
                </GlassContainer>
            </motion.div>
        </div>
    );
};

export default CasperIDModal;
