
import React, { useState, useEffect } from 'react';

interface CIDExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CIDExplanationModal: React.FC<CIDExplanationModalProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-text-main/10 backdrop-blur-sm transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div 
        className={`relative w-full max-w-[500px] h-full bg-[#F4F9FF] shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-y-auto no-scrollbar ${
          isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
      >
        <div className="p-8 md:p-12 space-y-12">
          {/* Back Button */}
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-primary hover:brightness-90 transition-all font-bold text-[16px] group"
          >
            <span className="material-symbols-outlined text-[24px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Your Identities
          </button>

          {/* Heading Section */}
          <div className="space-y-6">
            <h1 className="text-[44px] md:text-[52px] font-black text-text-main tracking-tight leading-[1.05]">
              Why upgrade to a <br/>
              <span className="text-primary">.CID</span> domain?
            </h1>
            <p className="text-[#626D85] text-[17px] font-medium leading-relaxed">
              Your CasperID is the foundation of your digital life on the Casper Network. Replace complex wallet addresses with a name that is uniquely yours.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-10">
            {/* Feature 1 */}
            <div className="flex gap-6 items-start">
               <div className="size-14 rounded-[20px] bg-white border border-gray-100 shadow-soft flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[28px]">public</span>
               </div>
               <div className="space-y-1">
                  <h3 className="text-[20px] font-black text-text-main leading-tight">Universal Handle</h3>
                  <p className="text-[#626D85] text-[16px] font-medium leading-relaxed opacity-80">
                    One name for all your assets, profile, and interactions across the ecosystem.
                  </p>
               </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-6 items-start">
               <div className="size-14 rounded-[20px] bg-white border border-gray-100 shadow-soft flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[28px]">touch_app</span>
               </div>
               <div className="space-y-1">
                  <h3 className="text-[20px] font-black text-text-main leading-tight">One-Tap Login</h3>
                  <p className="text-[#626D85] text-[16px] font-medium leading-relaxed opacity-80">
                    Authenticate instantly into decentralized apps using your human-readable ID.
                  </p>
               </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-6 items-start">
               <div className="size-14 rounded-[20px] bg-white border border-gray-100 shadow-soft flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[28px] icon-filled">verified</span>
               </div>
               <div className="space-y-1">
                  <h3 className="text-[20px] font-black text-text-main leading-tight">Verifiable Identity</h3>
                  <p className="text-[#626D85] text-[16px] font-medium leading-relaxed opacity-80">
                    Link your KYC status and reputation to your .cid for enhanced trust.
                  </p>
               </div>
            </div>
          </div>

          {/* Network Update Box */}
          <div className="bg-[#EEF4FF] rounded-[32px] p-8 space-y-4 border border-primary/5">
             <h4 className="text-primary font-black text-[12px] uppercase tracking-[0.2em]">NETWORK UPDATE</h4>
             <p className="text-[#3F4865] text-[16px] font-bold leading-relaxed">
               Registering a .cid domain creates a soulbound metadata record on the Casper Network, ensuring your identity is permanent and user-controlled.
             </p>
          </div>

          {/* Close Button at bottom for mobile */}
          <div className="pt-4 pb-10">
            <button 
              onClick={onClose}
              className="w-full h-16 bg-white border border-gray-200 text-text-main rounded-2xl font-black text-sm shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
