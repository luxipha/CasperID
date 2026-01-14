
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CrossAppVerificationModal } from './CrossAppVerificationModal';

interface PostOnboardingBannerProps {
  onComplete?: () => void;
}

export const PostOnboardingBanner: React.FC<PostOnboardingBannerProps> = ({ onComplete }) => {
  const [showBanner, setShowBanner] = useState(true);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!showBanner) return;

    // Animate progress over 3 seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // After progress completes, check MetaMask status
          setTimeout(() => {
            checkMetaMaskStatus();
          }, 500);
          return 100;
        }
        return prev + 2; // Increment by 2% every 60ms for smooth animation
      });
    }, 60);

    return () => clearInterval(interval);
  }, [showBanner]);

  const checkMetaMaskStatus = () => {
    if (!user?.metamask_connected) {
      setShowMetaMaskModal(true);
    } else {
      completeBanner();
    }
  };

  const completeBanner = () => {
    setShowBanner(false);
    onComplete?.();
  };

  const handleMetaMaskConnect = () => {
    // TODO: Implement MetaMask connection logic
    setShowMetaMaskModal(false);
    completeBanner();
  };

  const handleMetaMaskSkip = () => {
    setShowMetaMaskModal(false);
    completeBanner();
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Notification Banner */}
      <div className="bg-[#F5F3FF] rounded-[32px] border-2 border-[#E9E4FF] p-8 flex items-center justify-between shadow-soft relative overflow-hidden animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-8 relative z-10">
          <div className="relative">
            <div className="size-20 rounded-full bg-[#E9E4FF] flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[40px]">fingerprint</span>
            </div>
            <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-green-500">
              <span className="material-symbols-outlined text-[16px] font-bold">check_circle</span>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-primary tracking-tight">
              Authentication Successful! Setting Up Your Basic Identity...
            </h2>
            <p className="text-[#626D85] text-base font-medium max-w-2xl leading-relaxed">
              You have successfully authenticated via Passkey. We are now generating your Layer 1 DID and encryption keys. This process takes just a moment.
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-primary">Setup Progress</span>
                <span className="text-xs font-bold text-primary">{Math.floor(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-[#E9E4FF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Spinner (visible until progress completes) */}
        {progress < 100 && (
          <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        )}

        {/* Checkmark (visible when progress completes) */}
        {progress >= 100 && (
          <div className="size-10 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-300">
            <span className="material-symbols-outlined text-white text-[24px] font-bold">check</span>
          </div>
        )}
      </div>

      {/* CrossAppVerificationModal */}
      <CrossAppVerificationModal
        isOpen={showMetaMaskModal}
        onClose={handleMetaMaskSkip}
        onConnect={handleMetaMaskConnect}
      />
    </>
  );
};
