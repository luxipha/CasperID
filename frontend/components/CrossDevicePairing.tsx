
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface CrossDevicePairingProps {
  onBack: () => void;
  onPaired: (email: string) => void;
}

export const CrossDevicePairing: React.FC<CrossDevicePairingProps> = ({ onBack, onPaired }) => {
  const [status, setStatus] = useState<'initializing' | 'waiting' | 'scanning' | 'confirming' | 'success' | 'error'>('initializing');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes

  // Initialize cross-device registration
  useEffect(() => {
    const initializeCrossDeviceRegistration = async () => {
      try {
        setStatus('initializing');
        const tempEmail = `user_${Date.now()}@casperid.temp`;
        setEmail(tempEmail);

        // Start cross-device registration
        const response = await apiService.passkeyRegisterInit(tempEmail, 'CasperID User', true);

        if (response.success && response.qrCode) {
          setQrCodeUrl(response.qrCode.dataURL);
          setUserId(response.userId);
          setExpiresAt(response.qrCode.payload.expiresAt);
          setTimeLeft(Math.floor((response.qrCode.payload.expiresAt - Date.now()) / 1000));
          setStatus('waiting');

          // Start polling for completion
          startPolling(response.userId);
        } else {
          throw new Error('Failed to generate QR code');
        }
      } catch (error: any) {
        console.error('Cross-device registration initialization failed:', error);
        setError(error.message || 'Failed to initialize cross-device pairing');
        setStatus('error');
      }
    };

    initializeCrossDeviceRegistration();
  }, []);

  // Countdown timer with auto-refresh
  useEffect(() => {
    if (status === 'waiting' || status === 'scanning' || status === 'confirming') {
      const timer = setInterval(() => {
        const remaining = Math.floor((expiresAt - Date.now()) / 1000);
        if (remaining <= 0) {
          // Auto-refresh QR code instead of expiring
          refreshQRCode();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, expiresAt]);

  // Auto-refresh QR code when it expires
  const refreshQRCode = async () => {
    try {
      const tempEmail = `user_${Date.now()}@casperid.temp`;
      setEmail(tempEmail);

      // Generate new QR code
      const response = await apiService.passkeyRegisterInit(tempEmail, 'CasperID User', true);

      if (response.success && response.qrCode) {
        setQrCodeUrl(response.qrCode.dataURL);
        setUserId(response.userId);
        setExpiresAt(response.qrCode.payload.expiresAt);
        setTimeLeft(Math.floor((response.qrCode.payload.expiresAt - Date.now()) / 1000));

        // Start polling for the new registration
        startPolling(response.userId);
      }
    } catch (error) {
      console.error('Failed to refresh QR code:', error);
      // Only show error if multiple refresh attempts fail
    }
  };

  // Poll for registration completion
  const startPolling = async (userId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await apiService.passkeyRegisterStatus(userId);

        if (statusResponse.success) {
          if (statusResponse.completed) {
            clearInterval(pollInterval);
            setStatus('success');

            // Store session tokens if provided
            if (statusResponse.sessionToken) {
              apiService.setTokens({
                sessionToken: statusResponse.sessionToken,
                expiresAt: new Date(statusResponse.expiresAt).getTime()
              });
            }

            // Complete the flow
            setTimeout(() => {
              onPaired(email);
            }, 1500);
          } else {
            // Still pending, update status based on time elapsed
            const elapsed = Date.now() - (expiresAt - 5 * 60 * 1000); // 5 minutes total
            if (elapsed > 10000 && status === 'waiting') { // After 10 seconds
              setStatus('scanning');
            } else if (elapsed > 20000 && status === 'scanning') { // After 20 seconds  
              setStatus('confirming');
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Store interval for cleanup (no automatic timeout - let auto-refresh handle expiry)
    return pollInterval;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
        <div className="text-center space-y-6 max-w-md">
          <div className="size-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto">
            <span className="material-symbols-outlined text-[40px]">error</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-main">Pairing Failed</h2>
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
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'initializing') {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-text-sub font-medium">Generating QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="w-full max-w-[1100px] grid grid-cols-[1fr_420px] gap-16 items-center">

        {/* Instructions - Desktop optimized */}
        <div className="space-y-10">
          <div className="space-y-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-sub hover:text-primary font-bold text-sm transition-colors group"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to setup
            </button>
            <h1 className="text-5xl font-black text-text-main tracking-tight leading-tight">
              Pair with your <span className="text-primary">Mobile Device</span>
            </h1>
            <p className="text-text-sub text-xl font-medium leading-relaxed max-w-lg">
              Use your phone's biometrics to secure your desktop session. No passwords required.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start group">
              <div className="size-12 rounded-xl bg-white shadow-soft flex items-center justify-center text-primary border border-gray-100 font-black shrink-0 group-hover:scale-110 transition-transform text-lg">1</div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-text-main">Open CasperID Mobile</h4>
                <p className="text-base text-text-sub font-medium">Launch the app on your iOS or Android device.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="size-12 rounded-xl bg-white shadow-soft flex items-center justify-center text-primary border border-gray-100 font-black shrink-0 group-hover:scale-110 transition-transform text-lg">2</div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-text-main">Scan the Pairing Code</h4>
                <p className="text-base text-text-sub font-medium">Tap 'Scan' in the mobile app and point your camera here.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="size-12 rounded-xl bg-white shadow-soft flex items-center justify-center text-primary border border-gray-100 font-black shrink-0 group-hover:scale-110 transition-transform text-lg">3</div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-text-main">Confirm Biometrics</h4>
                <p className="text-base text-text-sub font-medium">Use FaceID or TouchID on your phone to link devices.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
            <div className="flex -space-x-2">
              <img src="https://picsum.photos/id/1/40/40" className="size-8 rounded-full border-2 border-white" alt="App Store" />
              <img src="https://picsum.photos/id/2/40/40" className="size-8 rounded-full border-2 border-white" alt="Play Store" />
            </div>
            <p className="text-xs font-bold text-text-sub uppercase tracking-widest opacity-60 italic">Available on App Store & Play Store</p>
          </div>
        </div>

        {/* QR Vault - Desktop optimized */}
        <div className="relative">
          <div className={`bg-white rounded-[48px] border-4 border-white shadow-[0_40px_100px_-20px_rgba(134,82,226,0.2)] p-14 flex flex-col items-center transition-all duration-500 ${status === 'success' ? 'scale-105 border-green-400' : ''}`}>

            {/* Pairing Status Badge */}
            <div className={`mb-10 px-6 py-3 rounded-full border flex items-center gap-3 transition-all ${status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-primary/5 border-primary/10 text-primary'
              }`}>
              <div className={`size-2.5 rounded-full ${status === 'success' ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                {status === 'waiting' && 'Waiting for scan'}
                {status === 'scanning' && 'Device detected'}
                {status === 'confirming' && 'Confirming on phone'}
                {status === 'success' && 'Pairing successful'}
              </span>
            </div>

            {/* QR Container - Desktop optimized */}
            <div className="relative size-80 p-8 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">

              {/* The QR Code */}
              <div className={`transition-all duration-700 ${status === 'success' || status === 'confirming' ? 'opacity-10 scale-90 blur-sm' : 'opacity-100'}`}>
                <img
                  src={qrCodeUrl}
                  alt="Pairing QR"
                  className="size-full object-contain"
                />
              </div>

              {/* Success Overlay */}
              {status === 'success' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                  <div className="size-24 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl shadow-green-200 mb-4">
                    <span className="material-symbols-outlined text-[48px] font-bold">check</span>
                  </div>
                  <p className="text-green-600 font-black text-base uppercase tracking-widest">Linked</p>
                </div>
              )}

              {/* Confirming Spinner */}
              {status === 'confirming' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center animate-pulse">
                  <span className="material-symbols-outlined text-[64px] text-primary mb-4">fingerprint</span>
                  <p className="text-primary font-black text-sm uppercase tracking-widest">Verify on phone</p>
                </div>
              )}

              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary/20 rounded-tl-2xl group-hover:border-primary transition-colors"></div>
              <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary/20 rounded-tr-2xl group-hover:border-primary transition-colors"></div>
              <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary/20 rounded-bl-2xl group-hover:border-primary transition-colors"></div>
              <div className="absolute bottom-0 right-0 size-8 border-b-4 border-r-4 border-primary/20 rounded-br-2xl group-hover:border-primary transition-colors"></div>
            </div>

            <p className="mt-10 text-text-sub text-sm font-medium opacity-60">
              {timeLeft < 10 ?
                <span className="text-orange-600 font-bold">QR refreshing in {timeLeft}s...</span> :
                <>Session expires in <span className="text-text-main font-bold">{formatTime(timeLeft)}</span></>
              }
            </p>
          </div>

          {/* Secure Hint */}
          <div className="mt-8 flex items-center justify-center gap-3 opacity-50">
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span className="text-xs font-bold uppercase tracking-widest">End-to-End Encrypted Handshake</span>
          </div>
        </div>
      </div>
    </div>
  );
};
