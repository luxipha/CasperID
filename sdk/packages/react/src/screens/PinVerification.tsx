import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Delete, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import type { VerifyOTPResponse } from '../types';

interface PinVerificationProps {
    email: string;
    verificationId: string;
    onNext: (sessionToken: string) => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
}

const PinVerification: React.FC<PinVerificationProps> = ({
    email,
    verificationId,
    onNext,
    onError,
    apiBaseUrl = 'https://apis.casperid.com'
}) => {
    const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [currentVerificationId, setCurrentVerificationId] = useState(verificationId);

    // Cooldown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-verify when all digits are entered
    useEffect(() => {
        if (pin.every(digit => digit !== '') && !isVerifying) {
            handleVerify();
        }
    }, [pin]);

    const handleDigitPress = useCallback((digit: string) => {
        setError('');
        setPin(prev => {
            const newPin = [...prev];
            const emptyIndex = newPin.findIndex(d => d === '');
            if (emptyIndex !== -1) {
                newPin[emptyIndex] = digit;
            }
            return newPin;
        });
    }, []);

    const handleDelete = useCallback(() => {
        setError('');
        setPin(prev => {
            const newPin = [...prev];
            // Find last filled digit
            for (let i = newPin.length - 1; i >= 0; i--) {
                if (newPin[i] !== '') {
                    newPin[i] = '';
                    break;
                }
            }
            return newPin;
        });
    }, []);

    const handleVerify = async () => {
        const otp = pin.join('');
        if (otp.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verificationId: currentVerificationId,
                    otp
                }),
            });

            const data: VerifyOTPResponse = await response.json();

            if (data.success && data.sessionToken) {
                onNext(data.sessionToken);
            } else {
                setError(data.error || 'Invalid code. Please try again.');
                if (data.attemptsLeft !== undefined) {
                    setError(`Invalid code. ${data.attemptsLeft} attempts remaining.`);
                }
                // Clear pin on error
                setPin(['', '', '', '', '', '']);
                onError?.(data.error || 'Verification failed');
            }
        } catch (err) {
            const errorMessage = 'Unable to verify. Please try again.';
            setError(errorMessage);
            setPin(['', '', '', '', '', '']);
            onError?.(errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || isResending) return;

        setIsResending(true);
        setError('');

        try {
            const response = await fetch(`${apiBaseUrl}/api/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ verificationId: currentVerificationId }),
            });

            const data = await response.json();

            if (data.success) {
                setResendCooldown(60); // 60 second cooldown
                setPin(['', '', '', '', '', '']);
                // Note: verificationId stays the same for resend
            } else {
                setError(data.error || 'Failed to resend code');
            }
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    // Mask email for display
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col px-8 pt-12"
        >
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-main">Verify Your Email</h1>
                <p className="text-muted text-sm font-medium">
                    Enter the 6-digit code sent to <span className="text-main font-semibold">{maskedEmail}</span>
                </p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-between gap-2 mb-6">
                {pin.map((digit, i) => (
                    <div
                        key={i}
                        className={`size-12 rounded-full glass-container flex items-center justify-center text-xl font-bold border transition-all ${
                            digit
                                ? 'text-[#6DE8EC] dark:border-[#6DE8EC]/30 border-[#6DE8EC]/50'
                                : 'text-muted dark:border-white/10 border-slate-200'
                        } ${error ? 'border-red-400 dark:border-red-500' : ''}`}
                    >
                        {digit}
                        {!digit && pin.findIndex(d => d === '') === i && (
                            <div className="w-0.5 h-5 bg-[var(--casperid-primary,#8651e1)] animate-pulse" />
                        )}
                    </div>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-xs font-medium text-center mb-4">{error}</p>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleDigitPress(num.toString())}
                        disabled={isVerifying}
                        className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50"
                    >
                        {num}
                    </button>
                ))}
                <div className="h-14" />
                <button
                    onClick={() => handleDigitPress('0')}
                    disabled={isVerifying}
                    className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main disabled:opacity-50"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isVerifying}
                    className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center transition-colors text-main disabled:opacity-50"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pb-8 space-y-4">
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || pin.some(d => d === '')}
                    className="w-full h-14 bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white font-bold rounded-full transition-all shadow-lg shadow-[var(--casperid-primary,#8651e1)]/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <>
                            <span>Verify</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
                <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isResending}
                    className="w-full h-14 dark:bg-white/5 hover:dark:bg-white/10 bg-slate-100 hover:bg-slate-200 text-muted font-bold rounded-full transition-all border dark:border-white/10 border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isResending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending...</span>
                        </>
                    ) : resendCooldown > 0 ? (
                        <span>Resend Code ({resendCooldown}s)</span>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" />
                            <span>Resend Code</span>
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default PinVerification;
