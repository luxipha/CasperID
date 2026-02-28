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

import type { CasperIDModalProps, Screen, SDKMode } from './types';

// Resolve 'system' mode to actual light/dark
function resolveMode(mode: SDKMode = 'light'): 'light' | 'dark' {
    if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
}

const FOOTER_SCREENS: Screen[] = ['AuthSelection', 'Login', 'PinVerification'];

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
        }
    }, [isOpen, mode, previewMode, initialScreen]);

    const toggleTheme = () =>
        setResolvedTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    const go = useCallback((next: Screen) => setScreen(next), []);

    const handleSuccess = useCallback(() => {
        // In a real implementation, exchange the session for a signed token
        const mockToken = `cid_${apiKey}_${Date.now()}`;
        onSuccess?.(mockToken);
        onClose?.();
    }, [apiKey, onSuccess, onClose]);

    if (!isOpen && !previewMode) return null;

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
                            {screen === 'AuthSelection' && (
                                <motion.div key="auth" className="flex-1 flex flex-col">
                                    <AuthSelection onNext={(m) => go(m === 'otp' ? 'Login' : 'SecurityUpgrade')} />
                                </motion.div>
                            )}
                            {screen === 'Login' && (
                                <motion.div key="login" className="flex-1 flex flex-col">
                                    <Login onNext={() => go('PinVerification')} />
                                </motion.div>
                            )}
                            {screen === 'PinVerification' && (
                                <motion.div key="pin" className="flex-1 flex flex-col">
                                    <PinVerification onNext={() => go('SecurityUpgrade')} />
                                </motion.div>
                            )}
                            {screen === 'SecurityUpgrade' && (
                                <motion.div key="upgrade" className="flex-1 flex flex-col">
                                    <SecurityUpgrade onNext={() => go('FaceScan')} onSkip={() => go('IdentityVerified')} />
                                </motion.div>
                            )}
                            {screen === 'FaceScan' && (
                                <motion.div key="face" className="flex-1 flex flex-col">
                                    <FaceScan onNext={() => go('VerifyIdentityChoice')} />
                                </motion.div>
                            )}
                            {screen === 'VerifyIdentityChoice' && (
                                <motion.div key="choice" className="flex-1 flex flex-col">
                                    <VerifyIdentityChoice onNext={() => go('DocumentScan')} />
                                </motion.div>
                            )}
                            {screen === 'DocumentScan' && (
                                <motion.div key="doc" className="flex-1 flex flex-col">
                                    <DocumentScan onNext={() => go('ReviewData')} />
                                </motion.div>
                            )}
                            {screen === 'ReviewData' && (
                                <motion.div key="review" className="flex-1 flex flex-col">
                                    <ReviewData onNext={() => go('MintingIdentity')} />
                                </motion.div>
                            )}
                            {screen === 'MintingIdentity' && (
                                <motion.div key="mint" className="flex-1 flex flex-col">
                                    <MintingIdentity onNext={() => go('IdentityVerified')} />
                                </motion.div>
                            )}
                            {screen === 'IdentityVerified' && (
                                <motion.div key="verified" className="flex-1 flex flex-col">
                                    <IdentityVerified onNext={() => go('PermissionsRequest')} />
                                </motion.div>
                            )}
                            {screen === 'PermissionsRequest' && (
                                <motion.div key="perms" className="flex-1 flex flex-col">
                                    <PermissionsRequest onApprove={() => { }} onDeny={onClose} />
                                </motion.div>
                            )}
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
                            {screen === 'AuthSelection' && (
                                <motion.div key="auth" className="flex-1 flex flex-col">
                                    <AuthSelection
                                        onNext={(method) =>
                                            go(method === 'otp' ? 'Login' : 'SecurityUpgrade')
                                        }
                                    />
                                </motion.div>
                            )}
                            {screen === 'Login' && (
                                <motion.div key="login" className="flex-1 flex flex-col">
                                    <Login onNext={() => go('PinVerification')} />
                                </motion.div>
                            )}
                            {screen === 'PinVerification' && (
                                <motion.div key="pin" className="flex-1 flex flex-col">
                                    <PinVerification onNext={() => go('SecurityUpgrade')} />
                                </motion.div>
                            )}
                            {screen === 'SecurityUpgrade' && (
                                <motion.div key="upgrade" className="flex-1 flex flex-col">
                                    <SecurityUpgrade
                                        onNext={() => go('FaceScan')}
                                        onSkip={() => go('IdentityVerified')}
                                    />
                                </motion.div>
                            )}
                            {screen === 'FaceScan' && (
                                <motion.div key="face" className="flex-1 flex flex-col">
                                    <FaceScan onNext={() => go('VerifyIdentityChoice')} />
                                </motion.div>
                            )}
                            {screen === 'VerifyIdentityChoice' && (
                                <motion.div key="choice" className="flex-1 flex flex-col">
                                    <VerifyIdentityChoice onNext={() => go('DocumentScan')} />
                                </motion.div>
                            )}
                            {screen === 'DocumentScan' && (
                                <motion.div key="doc" className="flex-1 flex flex-col">
                                    <DocumentScan onNext={() => go('ReviewData')} />
                                </motion.div>
                            )}
                            {screen === 'ReviewData' && (
                                <motion.div key="review" className="flex-1 flex flex-col">
                                    <ReviewData onNext={() => go('MintingIdentity')} />
                                </motion.div>
                            )}
                            {screen === 'MintingIdentity' && (
                                <motion.div key="mint" className="flex-1 flex flex-col">
                                    <MintingIdentity onNext={() => go('IdentityVerified')} />
                                </motion.div>
                            )}
                            {screen === 'IdentityVerified' && (
                                <motion.div key="verified" className="flex-1 flex flex-col">
                                    <IdentityVerified onNext={() => go('PermissionsRequest')} />
                                </motion.div>
                            )}
                            {screen === 'PermissionsRequest' && (
                                <motion.div key="perms" className="flex-1 flex flex-col">
                                    <PermissionsRequest
                                        onApprove={handleSuccess}
                                        onDeny={onClose}
                                    />
                                </motion.div>
                            )}
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
