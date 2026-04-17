import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Puzzle, ChevronRight, Smartphone, ShieldCheck, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { t } from '../utils/i18n';

interface ExtensionUserData {
    wallet: string;
    cnsName?: string;
    email?: string;
    tier?: string;
    humanId?: string;
}

interface AuthSelectionProps {
    onNext: (method: 'extension' | 'otp') => void;
    onExtensionSuccess?: (userData: ExtensionUserData) => void;
    onError?: (error: string) => void;
    language?: string;
    platform?: 'desktop' | 'mobile';
}

const AuthSelection: React.FC<AuthSelectionProps> = ({
    onNext,
    onExtensionSuccess,
    onError,
    language = 'EN',
    platform = 'desktop'
}) => {
    const [isCheckingExtension, setIsCheckingExtension] = useState(false);
    const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(null);
    const [error, setError] = useState('');

    // Check if extension is installed on mount
    useEffect(() => {
        checkExtensionInstalled();
    }, []);

    // Listen for extension login events
    useEffect(() => {
        const handleExtensionLogin = (event: CustomEvent<ExtensionUserData>) => {
            setIsCheckingExtension(false);
            if (event.detail && event.detail.wallet) {
                onExtensionSuccess?.(event.detail);
            }
        };

        window.addEventListener('casperid-login', handleExtensionLogin as EventListener);
        return () => {
            window.removeEventListener('casperid-login', handleExtensionLogin as EventListener);
        };
    }, [onExtensionSuccess]);

    const checkExtensionInstalled = useCallback(() => {
        // Check for extension anchor or localStorage data
        const anchor = document.getElementById('casperid-draggable-anchor');
        let storedUser: string | null = null;

        try {
            storedUser = localStorage.getItem('casperid_user');
        } catch {
            // localStorage may not be available in some contexts
        }

        if (anchor || storedUser) {
            setExtensionInstalled(true);
            return true;
        }

        // Also check if we can detect extension via a brief timeout
        // Extension injects its content script which adds the anchor
        setTimeout(() => {
            const anchorAfterDelay = document.getElementById('casperid-draggable-anchor');
            setExtensionInstalled(!!anchorAfterDelay);
        }, 500);

        return false;
    }, []);

    const isValidUserData = (data: unknown): data is ExtensionUserData => {
        return (
            typeof data === 'object' &&
            data !== null &&
            'wallet' in data &&
            typeof (data as ExtensionUserData).wallet === 'string' &&
            (data as ExtensionUserData).wallet.length > 0
        );
    };

    const handleExtensionLogin = async () => {
        setIsCheckingExtension(true);
        setError('');

        // Check if already logged in via extension
        try {
            const storedUser = localStorage.getItem('casperid_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (isValidUserData(userData)) {
                    setIsCheckingExtension(false);
                    onExtensionSuccess?.(userData);
                    return;
                }
            }
        } catch {
            // Invalid stored data or localStorage not available, continue with extension trigger
        }

        // Check if extension anchor exists
        const anchor = document.getElementById('casperid-draggable-anchor');

        if (anchor) {
            // Trigger click on the anchor to initiate login
            anchor.click();

            // Set a timeout to show error if no response
            setTimeout(() => {
                setIsCheckingExtension(false);
                // Check again if login succeeded
                try {
                    const newStoredUser = localStorage.getItem('casperid_user');
                    if (!newStoredUser) {
                        setError(t('extension_connect_msg', language));
                    }
                } catch {
                    setError(t('extension_connect_msg', language));
                }
            }, 3000);
        } else {
            // Extension not detected
            setIsCheckingExtension(false);
            setError(t('extension_not_detected', language));
            onError?.('Extension not installed');
        }
    };

    const handleOTPLogin = () => {
        setError('');
        onNext('otp');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-8 flex flex-col justify-center gap-8"
        >
            <div className="text-center space-y-3">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-brand-20 blur-2xl rounded-full" />
                    <div className="relative w-full h-full glass-container flex items-center justify-center rounded-2xl border border-brand-30">
                        <Fingerprint className="w-10 h-10 text-brand" />
                    </div>
                </div>
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-main">{t('welcome_back', language)}</h1>
                <p className="text-muted text-sm leading-relaxed">
                    {t('auth_subtitle', language)}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                {platform === 'desktop' && (
                    <button
                        onClick={handleExtensionLogin}
                        disabled={isCheckingExtension}
                        className="w-full group relative overflow-hidden flex items-center gap-4 bg-brand hover:bg-brand-90 text-white py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-brand"
                    >
                        <div className="bg-white/20 p-2 rounded-lg">
                            {isCheckingExtension ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Puzzle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-base">
                                {isCheckingExtension ? t('connecting', language) : t('sign_in_with_extension', language)}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-white/70">
                                {extensionInstalled === true ? t('extension_detected', language) : t('secure_wallet', language)}
                            </span>
                        </div>
                        <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                )}

                <button
                    onClick={handleOTPLogin}
                    disabled={isCheckingExtension}
                    className="w-full group relative overflow-hidden flex items-center gap-4 dark:bg-white/5 bg-slate-100/50 hover:dark:bg-white/10 hover:bg-slate-200/80 border dark:border-white/10 border-slate-200 text-main py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-50"
                >
                    <div className="bg-brand-10 p-2 rounded-lg">
                        <Smartphone className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-base">{t('sign_in_with_otp', language)}</span>
                        <span className="text-[10px] uppercase tracking-widest text-brand font-bold">{t('two_factor_auth', language)}</span>
                    </div>
                    <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50">
                    <ShieldCheck className="w-5 h-5 text-brand" />
                    <span className="text-[10px] font-bold text-muted">{t('fully_audited', language)}</span>
                </div>
                <div className="glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50">
                    <RefreshCw className="w-5 h-5 text-brand" />
                    <span className="text-[10px] font-bold text-muted">{t('non_custodial', language)}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default AuthSelection;
