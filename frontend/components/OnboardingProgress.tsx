
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProgressProps {
  email?: string;
  onComplete: () => void;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ email, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0); // 0: Verifying, 1: Wallet, 2: DID+Security
  const [walletGenerated, setWalletGenerated] = useState(false);
  const [didMinted, setDidMinted] = useState(false);
  const { refreshUser } = useAuth();

  // Use a ref to track wallet readiness across the interval closure
  const walletReadyRef = React.useRef(false);

  useEffect(() => {
    let walletCreated = false;
    let securitySetupCompleted = false;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }

        const next = prev + 1.2; // Speed controlled by the decimal

        // Update steps based on progress
        if (next < 35) {
          setStep(0);
        } else if (next < 75) {
          setStep(1);
          // Trigger wallet generation at 35% progress
          if (!walletCreated && next >= 35) {
            walletCreated = true;
            generateWallet();
          }
        } else {
          setStep(2);
          // Trigger DID minting ONLY if wallet is ready (prevents race condition)
          if (!securitySetupCompleted && next >= 75 && walletReadyRef.current) {
            securitySetupCompleted = true;
            setupSecurityAndMintDID();
          }
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);


  const generateWallet = async () => {
    try {
      // Import API service dynamically to avoid circular dependencies
      const { apiService } = await import('../services/api');

      // Call wallet generation endpoint
      const walletResponse = await apiService.generateWallet();

      if (walletResponse.success) {
        setWalletGenerated(true);
        walletReadyRef.current = true; // Signal that DID minting can now proceed

        // Refresh user data to get the new wallet address
        await refreshUser();

      } else {
        console.error('❌ Wallet generation failed:', walletResponse.error);
        // Continue with the animation even if wallet generation fails
        // We can retry later in the dashboard
      }
    } catch (error) {
      console.error('❌ Wallet generation error:', error);
      // Continue with the animation even if there's an error
    }
  };

  const setupSecurityAndMintDID = async () => {
    try {
      // Import API service dynamically
      const { apiService } = await import('../services/api');

      // Step 1: Mint DID on Casper blockchain
      const didResponse = await apiService.mintDID();

      if (didResponse.success) {
        // DID minted
      }

      // Step 2: Generate backup recovery keys
      const backupResponse = await apiService.generateBackupKeys();

      if (backupResponse.success) {
        // Backup keys generated
      }

      // Step 3: Set up device fingerprinting and security preferences
      const securityResponse = await apiService.initializeSecurity({
        deviceFingerprint: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`
      });

      if (securityResponse.success) {
        // Security setup completed
      }

      // Step 4: Record successful account creation
      const metricsResponse = await apiService.recordAccountCreation();

      if (metricsResponse.success) {
        // Account creation recorded
      }

      setDidMinted(true);

      // Final refresh to get updated user data
      await refreshUser();

    } catch (error) {
      console.error('❌ DID minting and security setup error:', error);
      // Continue with the animation even if there's an error
      // These operations can be retried later
    }
  };

  const steps = [
    { label: 'Verifying Passkey credentials', id: 0 },
    { label: 'Generating secure wallet', id: 1 },
    { label: 'Minting DID and setting up security', id: 2 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Dots Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#8652E2_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="w-full max-w-[540px] bg-white rounded-[48px] border border-gray-100 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.1)] p-12 md:p-16 flex flex-col items-center text-center relative z-10">

        {/* Animated Fingerprint Area */}
        <div className="relative size-36 mb-12">
          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
          <div className="absolute inset-4 rounded-full border border-primary/40 animate-[spin_4s_linear_infinite]">
            <div className="size-2 bg-[#00F0FF] rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#00F0FF]"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-inner">
            <div className="size-20 bg-gray-50 rounded-3xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
              <span className="material-symbols-outlined text-[48px] font-light">fingerprint</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E] tracking-tight leading-none">
            Setting up your secure profile...
          </h2>
          <p className="text-[#626D85] text-[15px] font-medium leading-relaxed max-w-sm mx-auto">
            We're creating your secure wallet, minting your blockchain identity, and setting up security features. This establishes your Layer 0 CasperID profile.
          </p>
        </div>

        {/* Progress Bar Section */}
        <div className="w-full space-y-3 mb-12">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Processing</span>
            <span className="text-sm font-black text-[#1A1A2E]">{Math.floor(progress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] via-primary to-purple-800 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            >
              {/* Segmented effect overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_90%,rgba(255,255,255,0.4)_100%)] [background-size:12px_100%] opacity-30"></div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="w-full bg-[#F8F9FB] rounded-3xl p-8 space-y-6">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-5 transition-all duration-500">
              <div className={`size-8 rounded-full flex items-center justify-center transition-all ${step > s.id
                ? 'bg-[#E7F9ED] text-[#28A745]'
                : step === s.id
                  ? 'text-primary animate-pulse'
                  : 'bg-white border-2 border-gray-100 text-gray-300'
                }`}>
                {step > s.id ? (
                  <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                ) : step === s.id ? (
                  <span className="material-symbols-outlined text-[22px] animate-spin">refresh</span>
                ) : (
                  <div className="size-4 rounded-full bg-gray-50 border border-gray-200"></div>
                )}
              </div>
              <span className={`text-[15px] font-black transition-all ${step > s.id
                ? 'text-[#626D85] line-through opacity-50'
                : step === s.id
                  ? 'text-primary'
                  : 'text-[#626D85] opacity-50'
                }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Notice Footer */}
        <div className="mt-12 w-full">
          <div className="bg-[#F8F9FB] rounded-2xl py-4 px-6 flex items-center justify-center gap-3 border border-gray-50">
            <span className="material-symbols-outlined text-text-sub text-[20px]">info</span>
            <span className="text-[13px] font-bold text-[#626D85]">Please do not close this window</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 flex items-center gap-2 opacity-40">
        <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
        <span className="text-[15px] font-black tracking-tight text-[#1A1A2E]">CasperID</span>
      </div>
    </div>
  );
};
