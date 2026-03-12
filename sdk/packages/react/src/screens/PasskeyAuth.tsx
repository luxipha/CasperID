import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Loader2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { t } from '../utils/i18n';
import {
    isWebAuthnSupported,
    isPlatformAuthenticatorAvailable,
    authenticateWithPasskey
} from '../utils/webauthn';
import type { PasskeyAuthInitResponse, PasskeyAuthCompleteResponse } from '../types';

interface PasskeyAuthProps {
    email: string;
    onSuccess: (sessionToken: string, user: PasskeyAuthCompleteResponse['user']) => void;
    onError?: (error: string) => void;
    onFallbackToOTP?: () => void;
    apiBaseUrl?: string;
    previewMode?: boolean;
    language?: string;
}

const PasskeyAuth: React.FC<PasskeyAuthProps> = ({
    email,
    onSuccess,
    onError,
    onFallbackToOTP,
    apiBaseUrl = 'https://apis.casperid.com',
    previewMode = false,
    language = 'EN'
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [autoTriggered, setAutoTriggered] = useState(false);

    // Check WebAuthn support on mount
    useEffect(() => {
        const checkSupport = async () => {
            const supported = isWebAuthnSupported();
            const platformAvailable = await isPlatformAuthenticatorAvailable();
            setIsSupported(supported && platformAvailable);

            if (!supported || !platformAvailable) {
                setError(t('webauthn_not_supported', language));
            }
        };
        checkSupport();
    }, [language]);

    // Auto-trigger passkey auth on mount (better UX)
    useEffect(() => {
        if (isSupported && !autoTriggered && !previewMode) {
            setAutoTriggered(true);
            // Small delay to let the UI render first
            const timer = setTimeout(() => {
                handleAuthenticate();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isSupported, autoTriggered, previewMode]);

    const handleAuthenticate = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError('');

        if (previewMode) {
            // Mock success for preview
            setTimeout(() => {
                setIsLoading(false);
                onSuccess('mock-session-token', {
                    user_id: 'mock-user-id',
                    email: email,
                    tier: 'layer_1'
                });
            }, 1500);
            return;
        }

        try {
            // Step 1: Get authentication options from server
            const initResponse = await fetch(`${apiBaseUrl}/api/passkey/auth/begin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            if (!initResponse.ok) {
                const errorData = await initResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to initialize authentication');
            }

            const initData: PasskeyAuthInitResponse = await initResponse.json();

            if (!initData.success || !initData.options) {
                throw new Error(initData.error || 'Invalid authentication options');
            }

            // Step 2: Trigger WebAuthn authentication
            const credential = await authenticateWithPasskey(initData.options);

            // Step 3: Complete authentication with server
            const completeResponse = await fetch(`${apiBaseUrl}/api/passkey/auth/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    credential
                })
            });

            if (!completeResponse.ok) {
                const errorData = await completeResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Authentication failed');
            }

            const completeData: PasskeyAuthCompleteResponse = await completeResponse.json();

            if (completeData.success && completeData.session_token) {
                onSuccess(completeData.session_token, completeData.user);
            } else {
                throw new Error(completeData.error || 'Authentication failed');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Authentication failed';

            // Handle user cancellation gracefully
            if (message.includes('cancelled') || message.includes('NotAllowedError')) {
                setError(t('passkey_cancelled', language));
            } else {
                setError(message);
                onError?.(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-8 pt-12"
        >
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-main tracking-tight leading-tight">
                    {t('welcome_back', language)}
                </h2>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                    {t('passkey_auth_subtitle', language)}
                </p>
            </div>

            {/* Email display */}
            <div className="mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl">
                <p className="text-xs text-muted mb-1">{t('signing_in_as', language)}</p>
                <p className="text-main font-semibold">{email}</p>
            </div>

            {/* Passkey animation area */}
            <div className="flex-1 flex flex-col items-center justify-center py-8">
                <motion.div
                    animate={isLoading ? {
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{
                        duration: 1.5,
                        repeat: isLoading ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                        isLoading
                            ? 'bg-brand/20 border-2 border-brand'
                            : error
                                ? 'bg-red-500/10 border-2 border-red-400'
                                : 'bg-brand/10 border-2 border-brand/30'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-10 h-10 text-brand animate-spin" />
                    ) : error ? (
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    ) : (
                        <Fingerprint className="w-10 h-10 text-brand" />
                    )}
                </motion.div>

                <p className="text-main font-semibold text-center mb-2">
                    {isLoading
                        ? t('authenticating', language)
                        : error
                            ? t('authentication_failed', language)
                            : t('use_passkey', language)
                    }
                </p>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-4 max-w-xs">
                        {error}
                    </p>
                )}

                {!isLoading && (
                    <p className="text-muted text-sm text-center max-w-xs">
                        {t('passkey_auth_hint', language)}
                    </p>
                )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pb-8">
                {!isLoading && (
                    <button
                        onClick={handleAuthenticate}
                        disabled={!isSupported}
                        className="w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {error ? (
                            <>
                                <RefreshCw className="w-5 h-5" />
                                <span>{t('try_again', language)}</span>
                            </>
                        ) : (
                            <>
                                <Fingerprint className="w-5 h-5" />
                                <span>{t('authenticate', language)}</span>
                            </>
                        )}
                    </button>
                )}

                {onFallbackToOTP && (
                    <button
                        onClick={onFallbackToOTP}
                        disabled={isLoading}
                        className="w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {t('use_email_instead', language)}
                    </button>
                )}
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 pb-4 opacity-50">
                <ShieldCheck className="text-muted w-3 h-3" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">
                    {t('biometric_secured', language)}
                </span>
            </div>
        </motion.div>
    );
};

export default PasskeyAuth;
