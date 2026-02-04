import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MobilePasskeyHandoff } from './onboarding/MobilePasskeyHandoff';
import Logo from './Logo';

interface OnboardingStartProps {
  email: string; // Email verified from OTP flow
  onContinue: (email: string) => void;
  onLogin: () => void;
}

export const OnboardingStart: React.FC<OnboardingStartProps> = ({ email, onContinue, onLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showMobileHandoff, setShowMobileHandoff] = useState(false);
  const [platformBiometricsAvailable, setPlatformBiometricsAvailable] = useState<boolean | null>(null);

  // Check for platform biometric support (Face ID, Touch ID, Windows Hello)
  React.useEffect(() => {
    const checkBiometrics = async () => {
      if (window.PublicKeyCredential &&
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setPlatformBiometricsAvailable(available);

          // Trigger friendly Casper bot message if legacy
          if (available === false && (window as any).$crisp) {
            (window as any).$crisp.push(["do", "chat:open"]);
            (window as any).$crisp.push(["do", "message:show", ["text", "Hey there! Casper here. 👻 I noticed your device doesn't have a biometric scanner (Face ID/Fingerprint). No worries! You can use your phone to secure your account. Just click 'Use my phone instead' and I'll help you sync up! 📱"]]);
          }
        } catch (err) {
          console.error('Error checking biometrics:', err);
          setPlatformBiometricsAvailable(false);
        }
      } else {
        setPlatformBiometricsAvailable(false);
      }
    };
    checkBiometrics();
  }, []);

  const handleCreatePasskey = async () => {
    try {
      clearError();
      setIsRegistering(true);

      // Check WebAuthn support
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser. Please use Chrome, Safari, or Firefox.');
      }

      // Use the verified email to register passkey
      const tempDisplayName = 'CasperID User'; // Temporary until human-id is generated

      await register(email, tempDisplayName);


      // If successful, continue to main app
      onContinue(email);
    } catch (error: any) {
      console.error('❌ Passkey creation failed:', error);
      // Error is handled by the auth context and displayed in UI
    } finally {
      setIsRegistering(false);
    }
  };

  // Mobile Handoff view
  if (showMobileHandoff) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.12)] overflow-hidden">
          <MobilePasskeyHandoff
            email={email}
            onComplete={async () => {
              // For REGISTRATION: wallet minting happens async in the background
              // Go through onboarding-progress which shows minting progress and waits for wallet
              onContinue(email);
            }}
            onBack={() => setShowMobileHandoff(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-[540px] space-y-8">

        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10 mb-4">
            <span className="material-symbols-outlined text-primary text-sm">verified</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Email Verified</span>
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">Create Your Passkey</h1>
          <p className="text-text-sub text-base font-medium">
            Use your device's biometric authentication to create a secure passkey for <strong>{email}</strong>
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.12)] p-10 md:p-12 relative overflow-hidden">
          {/* Decorative Ring */}
          <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10"></div>

          <div className="flex flex-col items-center space-y-10 relative z-10">
            {/* Biometric Icon */}
            <div className="relative">
              <div className={`size-28 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl transition-transform duration-500 ${isRegistering ? 'scale-110 shadow-primary/40' : ''}`}>
                <Logo
                  showName={false}
                  className={`scale-150 ${isRegistering ? 'animate-pulse' : ''}`}
                  variant="svg"
                  href={null as any}
                />
              </div>
              {isRegistering && (
                <div className="absolute inset-0 rounded-3xl border-4 border-primary/20 animate-ping"></div>
              )}
            </div>

            {/* Info Section */}
            <div className="w-full text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-text-main">Secure Biometric Authentication</h3>
                <p className="text-text-sub text-sm leading-relaxed">
                  Your passkey will use your device's built-in biometric authentication like Face ID, Touch ID, or fingerprint scanner for secure access.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="size-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-primary">face</span>
                  </div>
                  <p className="text-xs font-bold text-text-sub">Face ID</p>
                </div>
                <div className="text-center">
                  <div className="size-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-primary">fingerprint</span>
                  </div>
                  <p className="text-xs font-bold text-text-sub">Touch ID</p>
                </div>
                <div className="text-center">
                  <div className="size-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-primary">security</span>
                  </div>
                  <p className="text-xs font-bold text-text-sub">PIN/Pattern</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4">
              <button
                onClick={handleCreatePasskey}
                disabled={isRegistering || isLoading || platformBiometricsAvailable === false}
                className={`w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale ${platformBiometricsAvailable === false
                  ? 'bg-gray-200 text-gray-400 shadow-none border border-gray-100'
                  : 'bg-primary text-white shadow-primary/30 hover:bg-primary/90'
                  }`}
              >
                {isRegistering || isLoading ? (
                  <>
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Passkey...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">add_circle</span>
                    Create My Passkey
                  </>
                )}
              </button>

              {/* Use Phone Option */}
              <button
                onClick={() => setShowMobileHandoff(true)}
                disabled={isRegistering || isLoading}
                className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 border transition-all active:scale-[0.98] disabled:opacity-50 ${platformBiometricsAvailable === false
                  ? 'bg-primary/5 border-primary/20 text-primary shadow-lg shadow-primary/5 animate-pulse ring-2 ring-primary/10'
                  : 'bg-gray-50 text-text-main border-gray-200 hover:bg-gray-100'
                  }`}
              >
                <span className="material-symbols-outlined text-primary">smartphone</span>
                Use my phone instead
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    <div>
                      <p className="text-red-800 font-bold text-sm">Passkey Creation Failed</p>
                      <p className="text-red-600 text-xs mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-text-sub/40 text-xs">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>Your passkey never leaves your device and cannot be accessed by anyone else</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-text-sub font-medium text-sm">
            Already have a passkey?{' '}
            <button onClick={onLogin} className="text-primary font-black hover:underline">
              Sign In Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};