import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Verified, Lock, ArrowRight, Loader2 } from 'lucide-react';
import type { SendOTPResponse } from '../types';
import { t } from '../utils/i18n';

interface LoginProps {
    onNext: (email: string, verificationId: string) => void;
    onPasskeyUser?: (email: string) => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
    previewMode?: boolean;
    language?: string;
}

const Login: React.FC<LoginProps> = ({
    onNext,
    onPasskeyUser,
    onError,
    apiBaseUrl = 'https://apis.casperid.com',
    previewMode = false,
    language = 'EN'
}) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError(t('error_email_required', language));
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(t('error_invalid_email', language));
            return;
        }

        setIsLoading(true);
        setError('');

        if (previewMode) {
            // Mock delay and success for preview
            setTimeout(() => {
                setIsLoading(false);
                onNext(email.trim().toLowerCase(), 'mock-v-id-123456789');
            }, 1000);
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

            const data: SendOTPResponse = await response.json();

            if (data.success) {
                // Returning user with passkey - route to passkey auth
                if (data.userExists && data.hasPasskey) {
                    if (onPasskeyUser) {
                        onPasskeyUser(email.trim().toLowerCase());
                    } else {
                        // Fallback: show message if no handler provided
                        setError(t('error_passkey_registered', language));
                    }
                    setIsLoading(false);
                    return;
                }

                // New user or user without passkey - proceed to OTP
                if (data.verificationId) {
                    onNext(email.trim().toLowerCase(), data.verificationId);
                } else {
                    setError(t('error_send_code_failed', language));
                }
            } else {
                setError(data.error || t('error_send_code_failed', language));
                onError?.(data.error || t('error_send_code_failed', language));
            }
        } catch (err) {
            const errorMessage = t('error_connection_failed', language);
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
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
                <h2 className="text-3xl font-extrabold text-main tracking-tight leading-tight">{t('welcome_back', language)}</h2>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                    {t('enter_email', language)}
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                        {t('email_address', language)}
                    </label>
                    <div className="relative">
                        <input
                            className={`w-full dark:bg-black/20 bg-slate-100/50 border ${error ? 'border-red-400 dark:border-red-500' : 'dark:border-white/10 border-slate-200'} rounded-2xl h-14 px-5 text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-30 transition-all font-medium`}
                            placeholder="name@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            autoComplete="email"
                            autoFocus
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                            <Mail className="w-5 h-5" />
                        </div>
                    </div>
                    {error && (
                        <p className="text-red-500 text-xs font-medium ml-1 mt-1">{error}</p>
                    )}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-14 bg-brand hover:bg-brand/90 text-white font-bold rounded-2xl shadow-xl shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t('sending_code', language)}</span>
                        </>
                    ) : (
                        <>
                            <span>{t('continue', language)}</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

            <div className="mt-auto pb-8">
                <div className="p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl mb-6">
                    <div className="flex items-start gap-3">
                        <Verified className="text-[#6DE8EC] w-5 h-5 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-muted leading-normal font-medium">
                            {t('security_notice', language)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 opacity-50">
                    <Lock className="text-muted w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">{t('e2e_encrypted', language)}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default Login;
