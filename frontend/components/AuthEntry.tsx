
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

interface AuthEntryProps {
  onEmailSubmit: (email: string, verificationId: string) => void;
  onReturningUser: (email: string) => void;
  onBiometricLogin: (email?: string) => void;
}

export const AuthEntry: React.FC<AuthEntryProps> = ({ onEmailSubmit, onReturningUser, onBiometricLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Detect the current device type
  const getCurrentDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)) {
      return /ipad|tablet/.test(userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      setError('');

      const { apiService } = await import('../services/api');
      const response = await apiService.sendOTP(email);

      if (response.success) {
        if ((response as any).userExists && (response as any).hasPasskey) {
          // Returning user - check for device type hint first
          try {
            const { deviceType: passkeyDeviceType, transports } = await login(email, true);
            const currentDevice = getCurrentDeviceType();

            // Determine if passkey is on a different device
            // If transports includes 'hybrid', it was registered via cross-device (QR scan)
            const isHybridPasskey = transports?.includes('hybrid');
            const passkeyOnMobile = passkeyDeviceType === 'mobile' || passkeyDeviceType === 'tablet';
            const currentDeviceIsMobile = currentDevice === 'mobile' || currentDevice === 'tablet';

            // Decision logic:
            // 1. If current device matches passkey device type → native WebAuthn
            // 2. If current device differs from passkey device → QR code flow
            const needsCrossDeviceAuth = (currentDeviceIsMobile !== passkeyOnMobile) ||
              (isHybridPasskey && currentDevice === 'desktop' && passkeyOnMobile);

            if (needsCrossDeviceAuth) {
              // Cross-device authentication needed - trigger QR code flow
              onBiometricLogin(email);
            } else {
              // Same device as passkey - trigger native passkey/fingerprint prompt
              await login(email);
              onReturningUser(email);
            }
          } catch (loginError: any) {
            console.error('Sign-in failed:', loginError);
            setError(loginError.message || 'Sign-in failed. Please try again.');
          }
        } else {
          // New user - continue with OTP verification
          onEmailSubmit(email, (response as any).verificationId);
        }
      } else {
        setError(response.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      setError(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyClick = () => {
    setIsVerifying(true);
    // Simulate biometric check
    setTimeout(() => {
      setIsVerifying(false);
      onBiometricLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#8652E2_1.5px,transparent_1.5px)] [background-size:32px_32px]"></div>

      <div className="w-full max-w-[480px] z-10 flex flex-col items-center gap-10">
        {/* Branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 flex items-center justify-center rotate-12 transition-transform hover:rotate-0 cursor-default">
            <Logo showName={false} className="scale-[2.0]" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-text-main tracking-tight leading-none">CasperID</h1>
            <p className="text-text-sub text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Sovereign Identity Layer</p>
          </div>
        </div>

        {/* Unified Entry Card */}
        <div className="w-full bg-white rounded-[44px] border border-gray-100 shadow-[0_48px_96px_-12px_rgba(134,82,226,0.15)] p-10 md:p-12 space-y-8 transition-all duration-500">

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-text-main">Sign In</h2>
            <p className="text-text-sub text-sm font-medium leading-relaxed px-4">
              Enter your email to verify access or use your device passkey for instant entry.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-sub/40 group-focus-within:text-primary transition-colors">mail</span>
              </div>
              <input
                autoFocus
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-gray-50 border border-transparent text-base font-bold text-text-main placeholder:text-text-sub/30 focus:bg-white focus:border-primary/30 transition-all outline-none"
                placeholder="name@company.com"
              />
            </div>

            <button
              disabled={!email || isLoading || isVerifying}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 group"
            >
              {isLoading ? (
                <>
                  <div className="size-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>Continue with Email <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span></>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                <div>
                  <p className="text-red-800 font-bold text-sm">Failed to Send Code</p>
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}


          <div className="grid grid-cols-2 gap-4">
            <button disabled className="h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-not-allowed opacity-60">
              <img src="https://www.google.com/favicon.ico" className="size-3 grayscale opacity-40" alt="" />
              Google
            </button>
            <button disabled className="h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-not-allowed opacity-60">
              <span className="material-symbols-outlined text-[16px]">apple</span>
              Apple
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-text-sub/30 uppercase tracking-[0.3em]">
          Powered by CasperID Security Standard
        </p>
      </div>
    </div>
  );
};
