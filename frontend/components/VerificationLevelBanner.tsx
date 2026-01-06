import React from 'react';

interface VerificationLevel {
  current: 'layer_0' | 'layer_1' | 'layer_2' | 'layer_3';
  next?: 'layer_1' | 'layer_2' | 'layer_3';
}

interface VerificationLevelBannerProps {
  userLevel: VerificationLevel['current'];
  onUpgrade?: (nextLevel: VerificationLevel['next']) => void;
  className?: string;
}

export const VerificationLevelBanner: React.FC<VerificationLevelBannerProps> = ({ 
  userLevel, 
  onUpgrade,
  className = '' 
}) => {
  // Define verification level information - using exact reference colors
  const levelInfo = {
    layer_0: {
      current: 'Passkey Identity',
      next: 'layer_1' as const,
      nextName: 'Basic Verified',
      action: 'Verify Email',
      description: 'Add recovery email and upgrade to Basic Verified status for enhanced security.',
      color: 'bg-[#F4F0FF] border-[#E2D6FF] text-[#6B46C1]',
      buttonColor: 'bg-[#6B46C1] text-white',
      icon: 'shield'
    },
    layer_1: {
      current: 'Basic Verified',
      next: 'layer_2' as const,
      nextName: 'Enhanced Trust',
      action: 'Verify Liveness Now',
      description: 'Enhance your trust score and access financial services by completing Layer 3 verification.',
      color: 'bg-[#F4F0FF] border-[#E2D6FF] text-[#6B46C1]',
      buttonColor: 'bg-[#6B46C1] text-white',
      icon: 'verified_user'
    },
    layer_2: {
      current: 'Enhanced Trust',
      next: 'layer_3' as const,
      nextName: 'Full KYC',
      action: 'Complete KYC',
      description: 'Unlock all services and maximum trust score with full KYC verification.',
      color: 'bg-[#F4F0FF] border-[#E2D6FF] text-[#6B46C1]',
      buttonColor: 'bg-[#6B46C1] text-white',
      icon: 'security'
    },
    layer_3: {
      current: 'Full KYC Verified',
      next: undefined,
      nextName: '',
      action: '',
      description: 'You have completed all verification levels and have maximum trust score.',
      color: 'bg-[#F0FDF4] border-[#DCFCE7] text-[#16A34A]',
      buttonColor: 'bg-[#16A34A] text-white',
      icon: 'verified'
    }
  };

  const info = levelInfo[userLevel];
  
  // Don't show banner if user is at max level
  if (!info.next) {
    return null;
  }

  const handleUpgrade = () => {
    if (info.next && onUpgrade) {
      onUpgrade(info.next);
    }
  };

  return (
    <div className={`rounded-2xl border p-4 flex items-center justify-between ${info.color} ${className}`}>
      <div className="flex items-center gap-3">
        {/* Info Icon */}
        <div className="size-6 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-sm">info</span>
        </div>
        
        {/* Content */}
        <div>
          <h3 className="font-bold text-sm tracking-tight mb-0.5">
            Your Identity is {info.current}. Complete Liveness Check for {info.nextName} (Layer {info.next?.slice(-1)}).
          </h3>
          <p className="text-xs font-medium opacity-80">
            {info.description}
          </p>
        </div>
      </div>
      
      {/* Action Button */}
      <button
        onClick={handleUpgrade}
        className={`px-4 py-2 rounded-lg font-bold text-xs ${info.buttonColor} hover:opacity-90 transition-all active:scale-95 whitespace-nowrap`}
      >
        {info.action}
      </button>
    </div>
  );
};