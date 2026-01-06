
import React from 'react';

interface RevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  appName: string;
  description: string;
  logoSrc?: string;
  logoText?: string;
  logoBg?: string;
}

export const RevokeModal: React.FC<RevokeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  appName,
  description,
  logoSrc,
  logoText,
  logoBg = 'bg-primary'
}) => {
  if (!isOpen) return null;

  return (
    // Fixed: Using !fixed and inset-0 to ensure it breaks out of any parent transforms.
    // Increased z-index to 9999 to ensure it covers headers and sidebars.
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Immersive Glass Backdrop */}
      <div 
        className="absolute inset-0 bg-text-main/40 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      >
        {/* Subtle vignette and grain for premium feel */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-[44px] shadow-[0_48px_96px_-12px_rgba(0,0,0,0.25)] p-8 sm:p-12 flex flex-col items-center text-center animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
        
        {/* Top Decorative Border (Glass Shimmer) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-transparent via-gray-100 to-transparent rounded-full mt-3 opacity-50"></div>

        {/* App Icon Area with Disconnect Badge */}
        <div className="relative mb-10 group">
          <div className="absolute -inset-4 bg-primary/10 rounded-[36px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className={`relative size-24 sm:size-28 rounded-[32px] ${logoBg} flex items-center justify-center text-white shadow-2xl overflow-hidden transform group-hover:scale-105 transition-transform duration-500`}>
            {logoSrc ? (
              <img src={logoSrc} className="w-full h-full object-contain p-4" alt={appName} />
            ) : (
              <span className="text-4xl font-black">{logoText || appName[0]}</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
          </div>
          <div className="absolute -bottom-2 -right-2 size-11 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white z-20">
            <div className="size-full rounded-full bg-alerts flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px] font-bold">link_off</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight leading-tight">
            {title} <span className="text-primary">{appName}</span>?
          </h2>
          <p className="text-text-sub text-base font-medium leading-relaxed opacity-80">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-4">
          <button 
            onClick={onConfirm}
            className="w-full h-16 bg-alerts text-white rounded-[24px] font-black text-base flex items-center justify-center gap-3 shadow-2xl shadow-alerts/30 hover:bg-alerts/90 transition-all active:scale-[0.97] group"
          >
            <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">link_off</span>
            Disconnect Now
          </button>
          <button 
            onClick={onClose}
            className="w-full h-14 bg-transparent text-text-sub hover:text-text-main hover:bg-gray-50 rounded-[24px] font-black text-sm transition-all border border-transparent hover:border-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
