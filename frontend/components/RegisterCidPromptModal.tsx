
import React from 'react';

interface RegisterCIDPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export const RegisterCIDPromptModal: React.FC<RegisterCIDPromptModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-main/20 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[540px] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(134,82,226,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50"
        >
          <span className="material-symbols-outlined text-[28px]">close</span>
        </button>

        <div className="p-10 md:p-14 flex flex-col items-center text-center">
          {/* .CID Branding Icon */}
          <div className="relative mb-10 group">
            <div className="absolute -inset-4 bg-primary/10 rounded-[36px] blur-2xl animate-pulse"></div>
            <div className="relative size-24 rounded-[32px] bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-2xl overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
              <span className="material-symbols-outlined text-[48px] font-black">stars</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
            </div>
            {/* Hanging Label */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-gray-100 flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium ID</span>
            </div>
          </div>

          <h2 className="text-[32px] font-black text-text-main leading-tight tracking-tight mb-5 px-4">
            Claim Your Personal <span className="text-primary">.cid</span> Domain
          </h2>

          <p className="text-text-sub text-[17px] font-medium leading-relaxed max-w-sm mb-12">
            Upgrade your system identifier to a human-readable identity. Secure your unique name on the Casper Network today.
          </p>

          <div className="w-full space-y-6">
            <button
              onClick={onRegister}
              className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              Check Availability
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <button
              onClick={onClose}
              className="text-text-sub hover:text-text-main font-bold text-[15px] transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8F9FB] border-t border-gray-50 p-6 flex items-center justify-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[18px] icon-filled">verified_user</span>
          <p className="text-[11px] font-bold text-text-sub/70 leading-none">
            Your .cid becomes your primary digital fingerprint across the internet.
          </p>
        </div>
      </div>
    </div>
  );
};
