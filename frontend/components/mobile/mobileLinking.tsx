
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface MobileLinkingPageProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface QRData {
  type: string;
  version: number;
  userId: string;
  email: string;
  name: string;
  options: any; // WebAuthn PublicKeyCredentialCreationOptions
  serverUrl: string;
  expiresAt: number;
}

export const MobileLinkingPage: React.FC<MobileLinkingPageProps> = ({ onComplete, onCancel }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if user is in a capable browser
  const isInCapableBrowser = () => {
    // First check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      return false;
    }

    const userAgent = navigator.userAgent.toLowerCase();

    // Check for in-app browsers that don't support WebAuthn properly
    const isInApp = userAgent.includes('wv') || // WebView
      userAgent.includes('fban') || // Facebook
      userAgent.includes('fbav') || // Facebook
      userAgent.includes('instagram') || // Instagram
      userAgent.includes('twitter') || // Twitter
      userAgent.includes('tiktok') || // TikTok
      userAgent.includes('line') || // Line
      userAgent.includes('whatsapp'); // WhatsApp


    return !isInApp;
  };

  // Parse QR data from URL on component mount
  useEffect(() => {
    const parseQRData = async () => {
      try {
        setIsLoading(true);

        // Check browser capability first
        if (!window.PublicKeyCredential) {
          throw new Error('WebAuthn not supported. Please use Chrome, Safari, or Firefox.');
        }

        if (!isInCapableBrowser()) {
          throw new Error('Please open this link in your device\'s default browser (Safari/Chrome) for Face ID/Touch ID to work.');
        }

        // Get QR data from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const qrDataParam = urlParams.get('data');

        if (!qrDataParam) {
          throw new Error('No QR data found. Please scan the QR code again.');
        }

        // Parse the QR data
        const parsedData: QRData = JSON.parse(decodeURIComponent(qrDataParam));

        // Validate QR data
        if (parsedData.type !== 'casperid_registration' || !parsedData.userId || !parsedData.options) {
          throw new Error('Invalid QR code. Please scan a valid CasperID pairing code.');
        }

        // Check if QR code has expired
        if (Date.now() > parsedData.expiresAt) {
          throw new Error('QR code has expired. Please generate a new one from your desktop.');
        }

        setQrData(parsedData);
        setError('');

      } catch (error: any) {
        console.error('QR parsing failed:', error);
        setError(error.message || 'Failed to parse QR code data');
      } finally {
        setIsLoading(false);
      }
    };

    parseQRData();
  }, []);

  const handleCreatePasskey = async () => {
    if (!qrData) {
      setError('No QR data available');
      return;
    }

    setError('');

    // Directly trigger WebAuthn instead of showing modal
    await handleSystemVerify();
  };

  const handleSystemVerify = async () => {
    if (!qrData) {
      setError('No registration data available');
      return;
    }

    try {
      setIsVerifying(true);

      // Check WebAuthn support
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported on this device. Please use a modern browser.');
      }

      // Convert base64url strings to ArrayBuffers for WebAuthn
      const challenge = new Uint8Array(atob(qrData.options.challenge.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => c.charCodeAt(0)));
      const userId = new Uint8Array(atob(qrData.options.user.id.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => c.charCodeAt(0)));

      const credentialCreationOptions: PublicKeyCredentialCreationOptions = {
        ...qrData.options,
        challenge: challenge,
        user: {
          ...qrData.options.user,
          id: userId
        }
      };


      // Create the passkey using WebAuthn
      const credential = await navigator.credentials.create({
        publicKey: credentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create passkey. Please try again.');
      }


      // Prepare credential data for backend
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        userId: qrData.userId,
        credential: {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          type: credential.type,
          response: {
            attestationObject: Array.from(new Uint8Array(response.attestationObject)),
            clientDataJSON: Array.from(new Uint8Array(response.clientDataJSON))
          }
        },
        deviceInfo: {
          deviceName: navigator.userAgent.includes('iPhone') ? 'iPhone' :
            navigator.userAgent.includes('Android') ? 'Android' : 'Mobile Device',
          deviceType: 'mobile',
          userAgent: navigator.userAgent
        }
      };

      // Send to backend to complete registration
      const registrationResult = await apiService.passkeyRegisterComplete(credentialData);

      if (!registrationResult.success) {
        throw new Error(registrationResult.error || 'Registration failed');
      }

      setIsSuccess(true);

      // Show success state briefly, then complete
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Passkey creation failed:', error);
      setError(error.message || 'Failed to create passkey. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Show loading state while parsing QR data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-text-sub font-medium">Processing QR code...</p>
        </div>
      </div>
    );
  }

  // Show error state if QR parsing failed
  if (error && !qrData) {
    const needsBrowserRedirect = error.includes('default browser');

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="size-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mx-auto">
            <span className="material-symbols-outlined text-[40px]">
              {needsBrowserRedirect ? 'open_in_browser' : 'error'}
            </span>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-text-main">
              {needsBrowserRedirect ? 'Open in Browser' : 'Setup Failed'}
            </h2>
            <p className="text-text-sub text-sm leading-relaxed">{error}</p>

            {needsBrowserRedirect && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                <p className="text-blue-800 text-sm font-medium">
                  <strong>How to open in browser:</strong><br />
                  1. Tap the "Open in Browser" button below<br />
                  2. Or copy this URL and paste in Safari/Chrome
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {needsBrowserRedirect ? (
              <>
                <button
                  onClick={() => {
                    // Try to open in external browser
                    const currentUrl = window.location.href;
                    window.open(currentUrl, '_blank');
                  }}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                  <span className="material-symbols-outlined text-sm mr-2">open_in_new</span>
                  Open in Browser
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('URL copied! Paste in Safari or Chrome.');
                  }}
                  className="px-6 py-3 bg-white border border-gray-200 text-text-main font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Copy Link
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onCancel}
                  className="px-6 py-3 bg-white border border-gray-200 text-text-main font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="size-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mx-auto">
            <span className="material-symbols-outlined text-[40px]">check_circle</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-main">Account Created!</h2>
            <p className="text-text-sub">Return to your desktop to continue.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative font-sans text-text-main overflow-hidden select-none">
      {/* --- Main Linking Screen --- */}
      <div className="flex-1 flex flex-col p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px] font-bold">fingerprint</span>
            </div>
            <span className="text-xl font-black tracking-tight">CasperID</span>
          </div>
          <button onClick={onCancel} className="text-text-sub hover:text-text-main transition-colors">
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
            <div className="size-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#00F0FF]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-sub">Linking with Desktop</span>
          </div>
        </div>

        {/* Visual Rings Area */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <div className="relative size-64 md:size-80 flex items-center justify-center">
            {/* Ambient Rings */}
            <div className="absolute inset-0 border border-gray-50 rounded-full opacity-50 scale-100"></div>
            <div className="absolute inset-8 border border-gray-100 rounded-full opacity-70 scale-100"></div>
            <div className="absolute inset-16 border border-gray-200 rounded-full scale-100"></div>

            {/* Central Avatar Card */}
            <div className="relative size-40 bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(134,82,226,0.15)] flex flex-col items-center justify-center border border-gray-50 transition-transform hover:scale-105 duration-700">
              <div className="size-20 text-primary mb-2 opacity-80">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
                  <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M12,13c-1.94,0-3.5-1.56-3.5-3.5S10.06,6,12,6s3.5,1.56,3.5,3.5S13.94,13,12,13z M12,14.5c2.33,0,7,1.17,7,3.5V19 H5v-1c0-2.33,4.67-3.5,7-3.5z" opacity=".2" />
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M12,12c2.21,0,4-1.79,4-4s-1.79-4-4-4s-4,1.79-4,4S9.79,12,12,12z M12,14c-2.67,0-8,1.34-8,4v2h16v-2C20,15.34,14.67,14,12,14z" />
                </svg>
              </div>
              <div className="px-3 py-1 bg-green-500 rounded-lg text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200">
                Ready
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center mt-8 space-y-4 px-4">
            <h1 className="text-3xl font-black text-text-main tracking-tight leading-tight">
              Complete Passkey Setup
            </h1>
            <p className="text-text-sub text-base font-medium leading-relaxed">
              Your desktop session is waiting. Use your phone's biometrics or PIN to securely link this device.
            </p>
            {qrData && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-text-sub font-medium">
                  Creating account for: <span className="font-bold text-text-main">{qrData.email.split('@')[0]}@***</span>
                </p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-6 pb-10">
          <button
            onClick={handleCreatePasskey}
            disabled={isVerifying}
            className="w-full h-16 bg-primary text-white rounded-3xl font-black text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Authenticating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">fingerprint</span>
                Create Passkey
              </>
            )}
          </button>
          <p className="text-center text-text-sub text-sm font-medium">
            Face ID, Touch ID, or device PIN will be used
          </p>
        </div>

        {/* Footer Info Box */}
        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 flex gap-4 items-start mb-8">
          <div className="size-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mt-0.5 shrink-0">
            <span className="material-symbols-outlined text-[16px] font-bold">verified_user</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-[13px] font-black text-text-main leading-none">End-to-End Encrypted</h4>
            <p className="text-[11px] text-text-sub font-medium leading-relaxed">
              Your Passkey is hardware-protected on this device and never shared with our servers.
            </p>
          </div>
        </div>

        <p className="text-center text-[9px] font-black text-text-sub/40 uppercase tracking-[0.2em] pb-4">
          Powered by CasperID Identity Layer
        </p>
      </div>

    </div>
  );
};
