import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';

interface MobilePasskeyHandoffProps {
    email: string;
    onComplete: (sessionData: {
        sessionToken: string;
        expiresAt: string;
        userAccount: any;
    }) => void;
    onBack: () => void;
}

/**
 * MobilePasskeyHandoff Component
 * 
 * Displays a QR code for users to scan with their mobile device
 * and register a passkey there instead of on the current desktop.
 * 
 * Flow:
 * 1. Creates a pending session linked to the user's verified email
 * 2. Displays QR code for mobile scanning
 * 3. Polls for completion
 * 4. Calls onComplete when mobile registration is done
 */
export const MobilePasskeyHandoff: React.FC<MobilePasskeyHandoffProps> = ({
    email,
    onComplete,
    onBack
}) => {
    const [status, setStatus] = useState<'initializing' | 'waiting' | 'success' | 'error' | 'expired'>('initializing');
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [sessionId, setSessionId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [expiresAt, setExpiresAt] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(300);

    // Initialize pending session
    const initSession = useCallback(async () => {
        try {
            setStatus('initializing');
            setError('');

            const response = await apiService.createPendingSession(email);

            if (response.success && response.qrCode) {
                setQrCodeUrl(response.qrCode.dataURL);
                setSessionId(response.sessionId);
                setExpiresAt(response.expiresAt);
                setTimeLeft(Math.floor((response.expiresAt - Date.now()) / 1000));
                setStatus('waiting');
            } else {
                throw new Error('Failed to create session');
            }
        } catch (err: any) {
            console.error('[MobileHandoff] Init error:', err);
            setError(err.message || 'Failed to initialize mobile handoff');
            setStatus('error');
        }
    }, [email]);

    useEffect(() => {
        initSession();
    }, [initSession]);

    // Countdown timer
    useEffect(() => {
        if (status !== 'waiting') return;

        const timer = setInterval(() => {
            const remaining = Math.floor((expiresAt - Date.now()) / 1000);
            if (remaining <= 0) {
                setStatus('expired');
                clearInterval(timer);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [status, expiresAt]);

    // Poll for completion
    useEffect(() => {
        if (status !== 'waiting' || !sessionId) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await apiService.getPendingSessionStatus(sessionId);

                if (response.success) {
                    if (response.status === 'completed') {
                        clearInterval(pollInterval);
                        setStatus('success');

                        // Store session token
                        if (response.sessionToken && response.expiresAt) {
                            apiService.setTokens({
                                sessionToken: response.sessionToken,
                                expiresAt: new Date(response.expiresAt).getTime()
                            });
                        }

                        // Notify parent after brief success animation
                        setTimeout(() => {
                            onComplete({
                                sessionToken: response.sessionToken,
                                expiresAt: response.expiresAt,
                                userAccount: response.userAccount
                            });
                        }, 1500);
                    } else if (response.status === 'expired') {
                        clearInterval(pollInterval);
                        setStatus('expired');
                    }
                }
            } catch (err) {
                console.error('[MobileHandoff] Poll error:', err);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [status, sessionId, onComplete]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Error state
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="size-20 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <span className="material-symbols-outlined text-[40px]">error</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-text-main">Something went wrong</h3>
                    <p className="text-text-sub">{error}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-white border border-gray-200 text-text-main font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={initSession}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Expired state
    if (status === 'expired') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="size-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <span className="material-symbols-outlined text-[40px]">timer_off</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-text-main">Session Expired</h3>
                    <p className="text-text-sub">The QR code has expired. Generate a new one to continue.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-white border border-gray-200 text-text-main font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={initSession}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                    >
                        Generate New QR
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (status === 'initializing') {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-text-sub font-medium">Generating QR code...</p>
            </div>
        );
    }

    // Main QR display (waiting or success)
    return (
        <div className="flex flex-col items-center p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-text-main">
                    Scan with your phone
                </h3>
                <p className="text-text-sub">
                    Open your camera app and scan the QR code to continue setup on your mobile device.
                </p>
            </div>

            {/* QR Code Container */}
            <div className={`relative p-8 bg-white rounded-3xl border-2 transition-all duration-500 ${status === 'success'
                    ? 'border-green-400 shadow-lg shadow-green-100'
                    : 'border-gray-100 shadow-lg'
                }`}>
                {/* QR Code */}
                <div className={`transition-all duration-500 ${status === 'success' ? 'opacity-20 blur-sm' : 'opacity-100'
                    }`}>
                    <img
                        src={qrCodeUrl}
                        alt="Scan to register passkey"
                        className="size-64 object-contain"
                    />
                </div>

                {/* Success Overlay */}
                {status === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                        <div className="size-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl mb-3">
                            <span className="material-symbols-outlined text-[40px]">check</span>
                        </div>
                        <p className="text-green-600 font-black text-sm uppercase tracking-widest">
                            Passkey Registered
                        </p>
                    </div>
                )}
            </div>

            {/* Timer */}
            {status === 'waiting' && (
                <p className={`text-sm ${timeLeft < 30 ? 'text-orange-600 font-bold' : 'text-text-sub'}`}>
                    Expires in <span className="font-bold">{formatTime(timeLeft)}</span>
                </p>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 rounded-2xl p-6 max-w-sm w-full space-y-4">
                <div className="flex items-start gap-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        1
                    </div>
                    <p className="text-sm text-text-sub">
                        Open the <strong className="text-text-main">Camera app</strong> on your iPhone or Android
                    </p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        2
                    </div>
                    <p className="text-sm text-text-sub">
                        Point at the QR code and tap the notification
                    </p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        3
                    </div>
                    <p className="text-sm text-text-sub">
                        Use <strong className="text-text-main">Face ID</strong> or <strong className="text-text-main">Touch ID</strong> to create your passkey
                    </p>
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="text-text-sub hover:text-primary font-bold text-sm transition-colors flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Use this device instead
            </button>
        </div>
    );
};

export default MobilePasskeyHandoff;
