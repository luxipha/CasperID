import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import GlassContainer from './shared/GlassContainer';
import Header from './shared/Header';
import Footer from './shared/Footer';

import AuthSelection from './screens/AuthSelection';
import Login from './screens/Login';
import PasskeyAuth from './screens/PasskeyAuth';
import PasskeyRegister from './screens/PasskeyRegister';
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
    StartVerificationResponse,
    AuthState,
    PasskeyAuthCompleteResponse,
    PasskeyRegisterCompleteResponse,
    AppMetadata,
    AppMetadataResponse,
    CasperIDTheme
} from './types';

// Resolve 'system' mode to actual light/dark
function resolveMode(mode: SDKMode = 'light'): 'light' | 'dark' {
    if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
}

const FOOTER_SCREENS: Screen[] = ['AuthSelection', 'Login', 'PasskeyAuth', 'PinVerification', 'PasskeyRegister'];

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
    apiBaseUrl,
    termsUrl = '#',
    privacyUrl = '#',
    logoUrl,
    language = 'EN',
    layout,
    platform,
}) => {
    const [cloudTheme, setCloudTheme] = useState<CasperIDTheme>({});
    // Track loading state for cloud theme - prevents flash of default colors
    const [isLoadingCloudTheme, setIsLoadingCloudTheme] = useState(!previewMode && !!apiKey);

    const {
        primaryColor: propPrimaryColor,
        borderRadius: propBorderRadius,
        fontFamily: propFontFamily,
        mode: themeMode = 'light',
        layout: propLayout,
        platform: themePlatform,
    } = theme || {};

    // Helper to detect mobile devices automatically
    const isMobileDevice = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Merge cloud theme with props (props take precedence)
    const primaryColor = propPrimaryColor || cloudTheme.primaryColor || '#8651e1';
    const borderRadius = propBorderRadius || cloudTheme.borderRadius || '12';
    const fontFamily = propFontFamily || cloudTheme.fontFamily || 'Inter';
    const finalLayout = layout || propLayout || cloudTheme.layout || 'auto';

    // Platform logic: Prop -> Theme Prop -> Cloud Sync -> Auto-Detect -> Default Desktop
    const finalPlatform = platform || themePlatform || cloudTheme.platform || (isMobileDevice ? 'mobile' : 'desktop');

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(resolveMode(themeMode));
    const [screen, setScreen] = useState<Screen>(
        initialScreen ?? (mode === 'verify' ? 'SecurityUpgrade' : 'AuthSelection')
    );

    // OTP flow state
    const [otpState, setOtpState] = useState<OTPState>({ email: '', verificationId: '' });
    const [sessionToken, setSessionToken] = useState<string | null>(null);

    // Auth state - tracks user status through the flow
    const [authState, setAuthState] = useState<AuthState>({
        email: '',
        userExists: false,
        hasPasskey: false,
        userAccount: null
    });

    // KYC flow state
    const [kycState, setKycState] = useState<KYCState>(initialKYCState);
    const [uploadId, setUploadId] = useState<string>('');
    const [credentialHash, setCredentialHash] = useState<string>('');
    const [appMetadata, setAppMetadata] = useState<AppMetadata | null>(null);

    // API base URL - use custom URL if provided, otherwise default
    const finalApiBaseUrl = apiBaseUrl || DEFAULT_API_BASE_URL;

    // Normalize border radius to always have 'px' suffix
    const normalizedRadius = borderRadius.toString().endsWith('px')
        ? borderRadius.toString()
        : `${borderRadius}px`;

    // Normalize font family
    const normalizedFont = fontFamily.includes(' ')
        ? `"${fontFamily}", sans-serif`
        : `${fontFamily}, sans-serif`;

    // Generate a unique ID for scoped styles
    const modalId = React.useId().replace(/:/g, '');

    // Apply CSS variables + theme class to the modal root
    const cssVars = {
        '--casperid-primary': primaryColor,
        '--casperid-radius': normalizedRadius,
        '--casperid-font': normalizedFont,
    } as React.CSSProperties;

    // Generate a unique key for the style element to force re-application when theme changes
    const styleKey = `${modalId}-${primaryColor}-${normalizedRadius}-${normalizedFont}`;

    // Generate scoped CSS for proper variable inheritance with !important to override :root defaults
    const scopedStyles = `
        #casperid-modal-${modalId},
        #casperid-modal-${modalId} * {
            --casperid-primary: ${primaryColor} !important;
            --casperid-radius: ${normalizedRadius} !important;
            --casperid-font: ${normalizedFont} !important;
        }
    `;

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

    // Sync screen in previewMode when initialScreen prop changes
    useEffect(() => {
        if (previewMode && initialScreen) {
            setScreen(initialScreen);
        }
    }, [previewMode, initialScreen]);

    // Reset to first screen when opened (for real usage)
    useEffect(() => {
        if (isOpen && !previewMode) {
            setScreen(initialScreen ?? (mode === 'verify' ? 'SecurityUpgrade' : 'AuthSelection'));
            setOtpState({ email: '', verificationId: '' });
            setSessionToken(null);
            setAuthState({ email: '', userExists: false, hasPasskey: false, userAccount: null });
            setKycState(initialKYCState);
            setUploadId('');
            setCredentialHash('');
        }
    }, [isOpen, mode, previewMode, initialScreen]);

    // Fetch App Metadata on mount
    useEffect(() => {
        if (!apiKey || previewMode) {
            setIsLoadingCloudTheme(false);
            return;
        }

        const fetchAppMetadata = async () => {
            try {
                const response = await fetch(`${finalApiBaseUrl}/api/business/app-metadata/${apiKey}`);
                if (response.ok) {
                    const data: AppMetadataResponse = await response.json();
                    if (data.success && data.app) {
                        setAppMetadata(data.app);
                        // Apply brand theme from cloud
                        if (data.app.theme) {
                            setCloudTheme({
                                primaryColor: data.app.theme.primaryColor,
                                borderRadius: data.app.theme.borderRadius,
                                fontFamily: data.app.theme.fontFamily,
                                layout: data.app.theme.layout,
                                platform: data.app.theme.platform
                            });
                        }
                    }
                }
            } catch (err) {
                console.warn('[CasperID] Failed to fetch app metadata:', err);
            } finally {
                setIsLoadingCloudTheme(false);
            }
        };

        fetchAppMetadata();
    }, [apiKey, finalApiBaseUrl, previewMode]);

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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

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
            onError?.(err instanceof Error ? err : new Error('Failed to start verification'));
            return null;
        }
    }, [apiBaseUrl, apiKey, onError]);

    // Handle successful OTP verification - new user needs passkey registration
    const handleOTPSuccess = useCallback((token: string, userAccount?: AuthState['userAccount'], businessToken?: string) => {
        setSessionToken(token);
        setAuthState(prev => ({
            ...prev,
            sessionToken: token,
            businessToken: businessToken,
            userAccount: userAccount || null
        }));

        // Check if user already has L1 setup (wallet + DID)
        if (userAccount?.wallet && userAccount?.did_address) {
            // User has L1, check if they need passkey registration
            if (!authState.hasPasskey) {
                go('PasskeyRegister');
            } else {
                // Has passkey and L1, check tier requirements
                proceedBasedOnTier(userAccount.tier);
            }
        } else {
            // New user - needs passkey registration then L1 setup
            go('PasskeyRegister');
        }
    }, [go, authState.hasPasskey]);

    // Handle passkey user detected (returning user with passkey)
    const handlePasskeyUser = useCallback((email: string) => {
        setAuthState(prev => ({ ...prev, email, hasPasskey: true, userExists: true }));
        go('PasskeyAuth');
    }, [go]);

    // Handle successful passkey authentication (returning user)
    const handlePasskeyAuthSuccess = useCallback((token: string, user?: PasskeyAuthCompleteResponse['user'], businessToken?: string) => {
        setSessionToken(token);
        setAuthState(prev => ({
            ...prev,
            sessionToken: token,
            businessToken: businessToken,
            userAccount: user ? {
                user_id: user.user_id,
                wallet: user.wallet,
                tier: user.tier,
                did_address: user.did_address
            } : null
        }));

        // Returning user - check tier requirements
        proceedBasedOnTier(user?.tier);
    }, []);

    // Handle successful passkey registration (new user)
    const handlePasskeyRegisterSuccess = useCallback((user?: PasskeyRegisterCompleteResponse['user'], businessToken?: string) => {
        setAuthState(prev => ({
            ...prev,
            hasPasskey: true,
            businessToken: businessToken,
            userAccount: user ? {
                user_id: user.user_id,
                tier: user.tier
            } : prev.userAccount
        }));

        // After passkey registration, proceed to MintingIdentity for L1 setup
        go('MintingIdentity');
    }, [go]);

    // Determine next step based on user's tier and required tier
    const proceedBasedOnTier = useCallback((currentTier?: string) => {
        const tier = currentTier || 'layer_0';

        // If no specific tier required, or user meets requirement, go to success
        if (!requiredTier) {
            go('IdentityVerified');
            return;
        }

        // Map requiredTier to layer format
        const requiredLayer = requiredTier === 'L1' ? 'layer_1' :
            requiredTier === 'L2' ? 'layer_2' :
                requiredTier === 'L3' ? 'layer_3' : 'layer_1';

        // Check if user already meets the requirement
        const tierOrder = ['layer_0', 'layer_1', 'layer_2', 'layer_3'];
        const currentIndex = tierOrder.indexOf(tier);
        const requiredIndex = tierOrder.indexOf(requiredLayer);

        if (currentIndex >= requiredIndex) {
            // User meets requirement
            go('IdentityVerified');
        } else if (requiredIndex >= 2) {
            // Need L2 or L3 - start with SecurityUpgrade prompt
            go('SecurityUpgrade');
        } else {
            // Just need L1, which should be done by now
            go('IdentityVerified');
        }
    }, [requiredTier, go]);

    // Handle MintingIdentity completion (wallet + DID created for L1, or verification submitted for L2/L3)
    const handleMintingSuccess = useCallback(async (result?: { wallet?: string; didAddress?: string; credentialHash?: string }) => {
        if (result?.wallet) {
            setAuthState(prev => ({
                ...prev,
                userAccount: {
                    ...prev.userAccount,
                    user_id: prev.userAccount?.user_id || '',
                    wallet: result.wallet,
                    did_address: result.didAddress,
                    tier: 'layer_1'
                }
            }));
        }

        if (result?.credentialHash) {
            setCredentialHash(result.credentialHash);
        }

        // REFRESH TOKEN: Get a fresh token that includes the new verified wallet and humanId
        if (sessionToken && !previewMode) {
            try {
                const response = await fetch(`${finalApiBaseUrl}/api/casperid/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: sessionToken, apiKey })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.token) {
                        console.log('[CasperID SDK] Token refreshed after verification');
                        setSessionToken(data.token);
                        setAuthState(prev => ({
                            ...prev,
                            sessionToken: data.token,
                            businessToken: data.business_token || prev.businessToken
                        }));
                    }
                }
            } catch (err) {
                console.warn('[CasperID SDK] Failed to refresh token after verification:', err);
            }
        }

        // Check tier requirements after minting
        // Determine what our tier SHOULD be now based on what we just did
        let currentTier = result?.wallet ? 'layer_1' : (authState.userAccount?.tier || 'layer_1');
        
        // If we just finished a Layer 2 verification, we know the tier is now layer_2
        // regardless of whether the token refresh succeeded yet.
        if (kycState.livenessVerified && kycState.verificationTier === 'layer_2') {
            currentTier = 'layer_2';
        } else if (kycState.documentType && kycState.verificationTier === 'layer_3') {
            currentTier = 'layer_3';
        }

        proceedBasedOnTier(currentTier);
    }, [authState.userAccount?.tier, proceedBasedOnTier, sessionToken, finalApiBaseUrl, previewMode, kycState]);

    // Handle extension login success
    const handleExtensionSuccess = useCallback((userData: any) => {
        // Extension auth is complete - use token from extension if provided
        const token = userData?.sessionToken || userData?.token;
        const bToken = userData?.business_token || userData?.businessToken;

        if (token) {
            setSessionToken(token);
        }

        if (bToken) {
            setAuthState(prev => ({ ...prev, businessToken: bToken }));
        }

        // Skip to appropriate screen based on user's tier
        go('SecurityUpgrade');
    }, [go]);

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


    // Handle final success (after permissions approved)
    const handleSuccess = useCallback(() => {
        if (!sessionToken) {
            onError?.(new Error('No valid session token available'));
            return;
        }
        onSuccess?.(sessionToken, {
            businessToken: authState.businessToken
        });
        onClose?.();
    }, [sessionToken, authState.businessToken, onSuccess, onClose, onError]);

    // Handle errors
    const handleError = useCallback((error: string) => {
        onError?.(new Error(error));
    }, [onError]);

    // Login screen handlers
    const handleLoginNext = useCallback((email: string, verificationId: string) => {
        setOtpState({ email, verificationId });
        setAuthState(prev => ({ ...prev, email }));
        go('PinVerification');
    }, [go]);

    if (!isOpen && !previewMode) return null;

    // Show loading state while fetching cloud theme (prevents flash of default colors)
    if (isLoadingCloudTheme && !previewMode) {
        return (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            >
                <div className="w-12 h-12 border-3 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
        );
    }

    // Render screen content
    const renderScreen = () => {
        switch (screen) {
            case 'AuthSelection':
                return (
                    <AuthSelection
                        onNext={(method) => go(method === 'otp' ? 'Login' : 'SecurityUpgrade')}
                        onExtensionSuccess={handleExtensionSuccess}
                        onError={handleError}
                        language={language}
                        platform={finalPlatform}
                    />
                );
            case 'Login':
                return (
                    <Login
                        onNext={handleLoginNext}
                        onPasskeyUser={handlePasskeyUser}
                        onError={handleError}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'PasskeyAuth':
                return (
                    <PasskeyAuth
                        email={authState.email}
                        onSuccess={handlePasskeyAuthSuccess}
                        onError={handleError}
                        onFallbackToOTP={() => go('Login')}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'PasskeyRegister':
                return (
                    <PasskeyRegister
                        email={authState.email || otpState.email}
                        sessionToken={sessionToken || ''}
                        onSuccess={handlePasskeyRegisterSuccess}
                        onError={handleError}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'PinVerification':
                return (
                    <PinVerification
                        email={otpState.email}
                        verificationId={otpState.verificationId}
                        onNext={handleOTPSuccess}
                        onError={handleError}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'SecurityUpgrade':
                return (
                    <SecurityUpgrade
                        onNext={handleSecurityUpgradeNext}
                        onSkip={() => go('IdentityVerified')}
                        language={language}
                    />
                );
            case 'FaceScan':
                return (
                    <FaceScan
                        requestId={kycState.requestId}
                        onNext={handleFaceScanNext}
                        onError={handleError}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'VerifyIdentityChoice':
                return (
                    <VerifyIdentityChoice
                        onNext={handleDocumentTypeSelected}
                        language={language}
                    />
                );
            case 'DocumentScan':
                return (
                    <DocumentScan
                        requestId={kycState.requestId}
                        documentType={kycState.documentType!}
                        onNext={handleDocumentScanNext}
                        onError={handleError}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'ReviewData':
                return (
                    <ReviewData
                        requestId={kycState.requestId}
                        documentType={kycState.documentType!}
                        extractedData={kycState.extractedData!}
                        uploadId={uploadId}
                        onNext={handleReviewDataNext}
                        onRetake={() => go('DocumentScan')}
                        onError={handleError}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'MintingIdentity':
                // Determine the tier based on current state
                const mintingTier = kycState.requestId ? kycState.verificationTier : 'layer_1';
                return (
                    <MintingIdentity
                        tier={mintingTier}
                        sessionToken={sessionToken || ''}
                        requestId={kycState.requestId}
                        onNext={handleMintingSuccess}
                        onError={handleError}
                        apiBaseUrl={finalApiBaseUrl}
                        apiKey={apiKey}
                        previewMode={previewMode}
                        language={language}
                    />
                );
            case 'IdentityVerified':
                return <IdentityVerified onNext={() => go('PermissionsRequest')} language={language} />;
            case 'PermissionsRequest':
                return (
                    <PermissionsRequest
                        onApprove={handleSuccess}
                        onDeny={() => onClose?.()}
                        language={language}
                        appName={appMetadata?.name}
                        appLogo={logoUrl || appMetadata?.logo_url}
                    />
                );
            default:
                return null;
        }
    };

    // In previewMode, render the card directly (no fixed overlay)
    if (previewMode) {
        return (
            <>
                <style key={styleKey}>{scopedStyles}</style>
                <div id={`casperid-modal-${modalId}`} style={cssVars} className={`relative ${resolvedTheme}`}>
                    <GlassContainer className="backdrop-blur-3xl" theme={resolvedTheme}>
                        {screen !== 'FaceScan' && (
                            <Header
                                onClose={onClose}
                                showClose={screen !== 'AuthSelection'}
                                subtitle={screen === 'PermissionsRequest' ? 'PERMISSION REQUEST' : 'SECURE SDK'}
                                theme={resolvedTheme}
                                toggleTheme={toggleTheme}
                            />
                        )}
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
                                    <a className="text-brand hover:underline ml-1" href={termsUrl} target="_blank" rel="noopener noreferrer">Terms of Service</a>
                                    {' '}&amp;{' '}
                                    <a className="text-brand hover:underline ml-1" href={privacyUrl} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                                </p>
                            </Footer>
                        )}
                    </GlassContainer>
                </div>
            </>
        );
    }

    return (
        <>
            <style key={styleKey}>{scopedStyles}</style>
            {/* Overlay backdrop — sits on top of the host app */}
            <div
                className={`fixed inset-0 z-[9999] flex items-center justify-center ${finalLayout === 'fullscreen' ? 'p-0' : 'p-4'}`}
                style={{ backgroundColor: finalLayout === 'fullscreen' ? 'transparent' : 'rgba(0,0,0,0.6)', backdropFilter: finalLayout === 'fullscreen' ? 'none' : 'blur(6px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose?.()}
            >
                {/* Ambient glows — inside the overlay, behind the card */}
                {finalLayout !== 'fullscreen' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div
                            className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full blur-[120px]"
                            style={{ backgroundColor: `${primaryColor}1a` }}
                        />
                        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-[#6DE8EC]/5 blur-[100px] rounded-full" />
                    </div>
                )}

                {/* The glass modal card */}
                <motion.div
                    id={`casperid-modal-${modalId}`}
                    initial={finalLayout === 'fullscreen' ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={finalLayout === 'fullscreen' ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    style={cssVars}
                    className={`relative selection:bg-brand/30 ${resolvedTheme} ${
                        finalLayout === 'fullscreen'
                            ? 'w-full h-full'
                            : finalPlatform === 'mobile'
                                ? 'w-full max-w-md h-[90vh] max-h-[800px]'
                                : 'w-full max-w-xl h-[85vh] max-h-[900px]'
                    }`}
                >
                    <GlassContainer className={`backdrop-blur-3xl ${finalLayout === 'fullscreen' ? 'w-full h-full rounded-none' : ''}`} theme={resolvedTheme}>
                        {screen !== 'FaceScan' && (
                            <Header
                                onClose={onClose}
                                showClose={screen !== 'AuthSelection'}
                                subtitle={screen === 'PermissionsRequest' ? 'PERMISSION REQUEST' : 'SECURE SDK'}
                                theme={resolvedTheme}
                                toggleTheme={toggleTheme}
                            />
                        )}

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
                                    <a className="text-brand hover:underline ml-1" href={termsUrl} target="_blank" rel="noopener noreferrer">
                                        Terms of Service
                                    </a>{' '}
                                    &amp;{' '}
                                    <a className="text-brand hover:underline ml-1" href={privacyUrl} target="_blank" rel="noopener noreferrer">
                                        Privacy Policy
                                    </a>
                                </p>
                            </Footer>
                        )}
                    </GlassContainer>
                </motion.div>
            </div>
        </>
    );
};

export default CasperIDModal;
