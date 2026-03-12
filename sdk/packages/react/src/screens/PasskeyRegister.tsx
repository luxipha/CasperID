import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Loader2, ShieldCheck, AlertCircle, CheckCircle2, Key, Smartphone, Lock } from 'lucide-react';
import { t } from '../utils/i18n';
import {
    isWebAuthnSupported,
    isPlatformAuthenticatorAvailable,
    createPasskey
} from '../utils/webauthn';
import type { PasskeyRegisterInitResponse, PasskeyRegisterCompleteResponse } from '../types';

interface PasskeyRegisterProps {
    email: string;
    sessionToken: string;
    onSuccess: (user: PasskeyRegisterCompleteResponse['user']) => void;
    onError?: (error: string) => void;
    onSkip?: () => void;
    apiBaseUrl?: string;
    previewMode?: boolean;
    language?: string;
}

const PasskeyRegister: React.FC<PasskeyRegisterProps> = ({
    email,
    sessionToken,
    onSuccess,
    onError,
    onSkip,
    apiBaseUrl = 'https://apis.casperid.com',
    previewMode = false,
    language = 'EN'
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

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

    const handleRegister = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError('');

        if (previewMode) {
            // Mock success for preview
            setTimeout(() => {
                setIsLoading(false);
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess({
                        user_id: 'mock-user-id',
                        email: email,
                        tier: 'layer_0'
                    });
                }, 1000);
            }, 1500);
            return;
        }

        try {
            // Step 1: Get registration options from server
            const initResponse = await fetch(`${apiBaseUrl}/api/passkey/register/begin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            if (!initResponse.ok) {
                const errorData = await initResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to initialize registration');
            }

            const initData: PasskeyRegisterInitResponse = await initResponse.json();

            if (!initData.success || !initData.options) {
                throw new Error(initData.error || 'Invalid registration options');
            }

            // Step 2: Create passkey using WebAuthn
            const credential = await createPasskey(initData.options);

            // Step 3: Complete registration with server
            const completeResponse = await fetch(`${apiBaseUrl}/api/passkey/register/finish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    credential
                })
            });

            if (!completeResponse.ok) {
                const errorData = await completeResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Registration failed');
            }

            const completeData: PasskeyRegisterCompleteResponse = await completeResponse.json();

            if (completeData.success) {
                setIsSuccess(true);
                // Brief delay to show success state
                setTimeout(() => {
                    onSuccess(completeData.user);
                }, 1000);
            } else {
                throw new Error(completeData.error || 'Registration failed');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';

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

    const benefits = [
        { icon: Key, text: t('passkey_benefit_1', language) },
        { icon: ShieldCheck, text: t('passkey_benefit_2', language) },
        { icon: Smartphone, text: t('passkey_benefit_3', language) }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-8 pt-12"
        >
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-main tracking-tight leading-tight">
                    {t('create_passkey', language)}
                </h2>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                    {t('passkey_register_subtitle', language)}
                </p>
            </div>

            {/* Email display */}
            <div className="mb-6 p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl">
                <p className="text-xs text-muted mb-1">{t('signing_in_as', language)}</p>
                <p className="text-main font-semibold">{email}</p>
            </div>

            {/* Benefits list */}
            <div className="mb-8">
                <p className="text-sm font-semibold text-main mb-4">{t('passkey_benefits_title', language)}</p>
                <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                                <benefit.icon className="w-5 h-5 text-brand" />
                            </div>
                            <span className="text-sm text-muted">{benefit.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status indicator */}
            {(isLoading || isSuccess || error) && (
                <div className="flex-1 flex flex-col items-center justify-center py-4">
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
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                            isSuccess
                                ? 'bg-green-500/20 border-2 border-green-400'
                                : isLoading
                                    ? 'bg-brand/20 border-2 border-brand'
                                    : 'bg-red-500/10 border-2 border-red-400'
                        }`}
                    >
                        {isSuccess ? (
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        ) : isLoading ? (
                            <Loader2 className="w-10 h-10 text-brand animate-spin" />
                        ) : (
                            <AlertCircle className="w-10 h-10 text-red-400" />
                        )}
                    </motion.div>

                    <p className="text-main font-semibold text-center">
                        {isSuccess
                            ? t('passkey_created', language)
                            : isLoading
                                ? t('creating_passkey', language)
                                : t('passkey_create_failed', language)
                        }
                    </p>

                    {error && (
                        <p className="text-red-500 text-sm text-center mt-2 max-w-xs">
                            {error}
                        </p>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto space-y-3 pb-8">
                {!isSuccess && (
                    <button
                        onClick={handleRegister}
                        disabled={!isSupported || isLoading}
                        className="w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{t('creating_passkey', language)}</span>
                            </>
                        ) : (
                            <>
                                <Fingerprint className="w-5 h-5" />
                                <span>{t('register_passkey', language)}</span>
                            </>
                        )}
                    </button>
                )}

                {onSkip && !isLoading && !isSuccess && (
                    <button
                        onClick={onSkip}
                        className="w-full h-12 bg-transparent border dark:border-white/10 border-slate-200 text-muted hover:text-main font-medium rounded-2xl flex items-center justify-center transition-colors"
                    >
                        {t('do_this_later', language)}
                    </button>
                )}
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 pb-4 opacity-50">
                <Lock className="text-muted w-3 h-3" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">
                    {t('e2e_encrypted', language)}
                </span>
            </div>
        </motion.div>
    );
};

export default PasskeyRegister;
