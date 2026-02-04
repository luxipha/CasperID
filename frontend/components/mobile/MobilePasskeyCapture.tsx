import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

// Utility function to convert ArrayBuffer to base64url
function arrayBufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Utility function to convert base64url to ArrayBuffer
function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/') + padding;

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
}

interface SessionData {
    email: string;
    expiresAt: number;
    type?: 'casperid_mobile_register' | 'casperid_mobile_login';
}

/**
 * MobilePasskeyCapture Component
 * 
 * Mobile-only page accessed via QR code scan.
 * Allows users to register or login a passkey on their mobile device
 * to complete desktop setup/login.
 */
export const MobilePasskeyCapture: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { login } = useAuth(); // Access login from AuthContext

    const [status, setStatus] = useState<'loading' | 'ready' | 'registering' | 'success' | 'error' | 'expired'>('loading');
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [error, setError] = useState<string>('');

    // Extract sessionId from URL if not from params
    const getSessionId = () => {
        if (sessionId) return sessionId;
        const path = window.location.pathname;
        if (path.startsWith('/mobile/register/')) {
            return path.replace('/mobile/register/', '');
        }
        if (path.startsWith('/mobile/login/')) {
            return path.replace('/mobile/login/', '');
        }
        return null;
    };

    // Fetch session data on mount
    useEffect(() => {
        const fetchSession = async () => {
            const sid = getSessionId();
            if (!sid) {
                setError('Invalid session link');
                setStatus('error');
                return;
            }

            try {
                // First, try to parse data from URL query param (embedded in QR code)
                const urlParams = new URLSearchParams(window.location.search);
                const dataParam = urlParams.get('data');

                if (dataParam) {
                    try {
                        const parsedData = JSON.parse(decodeURIComponent(dataParam));
                        if ((parsedData.type === 'casperid_mobile_register' || parsedData.type === 'casperid_mobile_login') && parsedData.email) {
                            // Check if expired
                            if (Date.now() > parsedData.expiresAt) {
                                setStatus('expired');
                                return;
                            }
                            setSessionData({
                                email: parsedData.email,
                                expiresAt: parsedData.expiresAt,
                                type: parsedData.type
                            });
                            setStatus('ready');
                            return;
                        }
                    } catch (parseErr) {
                        console.warn('[MobileCapture] Failed to parse data param, falling back to API');
                    }
                }

                // Fallback: fetch from API
                const response = await apiService.getPendingSession(sid);

                if (response.success && response.session) {
                    setSessionData({
                        ...response.session,
                        type: response.session.type === 'login' ? 'casperid_mobile_login' : 'casperid_mobile_register'
                    });
                    setStatus('ready');
                } else {
                    throw new Error(response.error || 'Session not found');
                }
            } catch (err: any) {
                console.error('[MobileCapture] Fetch error:', err);
                if (err.message?.includes('expired')) {
                    setStatus('expired');
                } else {
                    setError(err.message || 'Failed to load session');
                    setStatus('error');
                }
            }
        };

        fetchSession();
    }, [sessionId]);

    // Handle passkey action (register or login) using native WebAuthn API
    const handleAction = async () => {
        const sid = getSessionId();
        if (!sid || !sessionData) return;

        setStatus('registering');

        try {
            if (sessionData.type === 'casperid_mobile_login') {
                // Login flow using AuthContext
                const result = await login(sessionData.email);

                if (result.success && result.user) {
                    const tokens = apiService.getTokens();
                    const userAccount = result.user;

                    if (!tokens) {
                        throw new Error('Failed to retrieve session tokens');
                    }

                    const completeResponse = await apiService.completePendingSession(sid, {
                        userId: userAccount.user_id,
                        sessionToken: tokens.sessionToken,
                        expiresAt: new Date(tokens.expiresAt).toISOString(),
                        userAccount: userAccount
                    });

                    if (completeResponse.success) {
                        setStatus('success');
                    } else {
                        throw new Error(completeResponse.error || 'Failed to sync with desktop');
                    }
                } else {
                    throw new Error('Authentication failed');
                }
            } else {
                // Registration flow
                const optionsResponse = await apiService.passkeyRegisterInit(
                    sessionData.email,
                    'CasperID User',
                    false
                );

                if (!optionsResponse.success || !optionsResponse.options) {
                    throw new Error('Failed to get registration options');
                }

                // Store userId for the complete call
                const userId = (optionsResponse as any).userId;
                if (!userId) {
                    throw new Error('No user ID received from registration init');
                }

                const options = optionsResponse.options;
                const challenge = base64urlToArrayBuffer(options.challenge);

                const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
                    publicKey: {
                        ...options,
                        challenge,
                        user: {
                            ...options.user,
                            id: base64urlToArrayBuffer(options.user.id),
                        },
                    },
                };

                const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions) as PublicKeyCredential;

                if (!credential) {
                    throw new Error('Failed to create credential');
                }

                const response = credential.response as AuthenticatorAttestationResponse;

                // 1. Convert response to format expected by SimpleWebAuthn
                const credentialResponse = {
                    id: credential.id,
                    rawId: arrayBufferToBase64url(credential.rawId),
                    response: {
                        attestationObject: arrayBufferToBase64url(response.attestationObject),
                        clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
                        transports: response.getTransports?.() || []
                    },
                    type: credential.type,
                    clientExtensionResults: credential.getClientExtensionResults(),
                    authenticatorAttachment: credential.authenticatorAttachment
                };

                // 2. Perform standard server-side verification/registration
                // Include userId in the request payload!
                const completeResponse = await apiService.passkeyRegisterComplete({
                    userId,
                    credential: credentialResponse,
                    deviceInfo: {
                        deviceType: 'mobile',
                        deviceName: getMobileDeviceName(),
                        userAgent: navigator.userAgent
                    }
                });

                if (!completeResponse.success) {
                    throw new Error(completeResponse.error || 'Server registration failed');
                }

                // 3. Signal desktop that registration is done
                // We only need to send metadata, not the key itself
                const handoffResponse = await apiService.completePendingSession(sid, {
                    credentialId: credential.id,
                    userId: completeResponse.userId, // returned from standard register complete
                    deviceInfo: {
                        deviceType: 'mobile',
                        deviceName: getMobileDeviceName(),
                        userAgent: navigator.userAgent
                    }
                });

                if (handoffResponse.success) {
                    setStatus('success');
                } else {
                    throw new Error(handoffResponse.error || 'Failed to sync with desktop');
                }
            }

        } catch (err: any) {
            console.error('[MobileCapture] Registration error:', err);

            // Handle user cancellation gracefully
            if (err.name === 'NotAllowedError') {
                setError('Passkey registration was cancelled. Please try again.');
            } else {
                setError(err.message || 'Failed to register passkey');
            }
            setStatus('error');
        }
    };

    // Get device name from user agent
    const getMobileDeviceName = (): string => {
        const ua = navigator.userAgent;
        if (/iPhone/.test(ua)) return 'iPhone';
        if (/iPad/.test(ua)) return 'iPad';
        if (/Android/.test(ua)) {
            const match = ua.match(/Android.*;\s*([^)]+)\)/);
            return match ? match[1].split(' ')[0] : 'Android Device';
        }
        return 'Mobile Device';
    };

    // Expired state
    if (status === 'expired') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col items-center justify-center p-6 text-center">
                <div className="size-24 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-orange-500 text-[48px]">timer_off</span>
                </div>
                <h1 className="text-2xl font-black text-text-main mb-2">Session Expired</h1>
                <p className="text-text-sub mb-8 max-w-xs">
                    This QR code has expired. Please go back to your desktop and generate a new one.
                </p>
                <button
                    onClick={() => window.close()}
                    className="px-6 py-3 bg-gray-100 text-text-main font-bold rounded-xl"
                >
                    Close
                </button>
            </div>
        );
    }

    // Error state
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col items-center justify-center p-6 text-center">
                <div className="size-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-red-500 text-[48px]">error</span>
                </div>
                <h1 className="text-2xl font-black text-text-main mb-2">Something went wrong</h1>
                <p className="text-text-sub mb-8 max-w-xs">{error}</p>
                <button
                    onClick={() => setStatus('ready')}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6 text-center">
                <div className="size-24 rounded-full bg-green-500 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <span className="material-symbols-outlined text-white text-[48px]">check_circle</span>
                </div>
                <h1 className="text-2xl font-black text-text-main mb-2">Setup Complete!</h1>
                <p className="text-text-sub mb-8 max-w-xs">
                    Your passkey has been safely created. You can now close this tab and return to your desktop.
                </p>
                <button
                    onClick={() => window.close()}
                    className="w-full max-w-xs py-4 bg-primary text-white font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all"
                >
                    Done
                </button>
            </div>
        );
    }

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-text-sub font-medium">Loading session...</p>
            </div>
        );
    }

    // Ready state - main UI
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <div className="mb-10">
                <Logo showName={false} className="scale-150" />
            </div>

            {/* Content */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-text-main mb-2">
                    {sessionData?.type === 'casperid_mobile_login' ? 'Confirm Sign In' : 'Complete Your Setup'}
                </h1>
                <p className="text-text-sub max-w-xs">
                    {sessionData?.type === 'casperid_mobile_login'
                        ? <>Security check for <strong className="text-text-main">{sessionData?.email}</strong>. Use Face ID or Touch ID to verify.</>
                        : <>Create a passkey for <strong className="text-text-main">{sessionData?.email}</strong> using Face ID or Touch ID.</>}
                </p>
            </div>

            {/* Action Button */}
            <button
                onClick={handleAction}
                disabled={status === 'registering'}
                className={`w-full max-w-xs py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${status === 'registering'
                    ? 'bg-gray-100 text-text-sub'
                    : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]'
                    }`}
            >
                {status === 'registering' ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                        {sessionData?.type === 'casperid_mobile_login' ? 'Verifying...' : 'Registering...'}
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">{sessionData?.type === 'casperid_mobile_login' ? 'verified_user' : 'fingerprint'}</span>
                        {sessionData?.type === 'casperid_mobile_login' ? 'Sign In Now' : 'Create Passkey'}
                    </>
                )}
            </button>

            {/* Security note */}
            <div className="mt-8 flex items-center gap-2 text-text-sub text-xs">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Secured with end-to-end encryption
            </div>
        </div>
    );
};

export default MobilePasskeyCapture;
