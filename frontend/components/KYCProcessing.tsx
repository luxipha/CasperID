
import React, { useEffect } from 'react';

interface KYCProcessingProps {
  title: string;
  subtitle: string;
  onComplete: () => void;
}

export const KYCProcessing: React.FC<KYCProcessingProps> = ({ title, subtitle, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full max-w-[600px] mx-auto animate-in fade-in duration-700 py-12">
      <div className="bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.15)] p-12 md:p-16 flex flex-col items-center text-center relative overflow-hidden">

        {/* Animated Scanning Beam */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent w-1/2 animate-[loading_2s_infinite_linear]"></div>
        </div>

        {/* Processing Animation */}
        <div className="relative size-40 mb-10">
          {/* Outer Rotating Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-[spin_10s_linear_infinite]"></div>

          {/* Middle Pulsing Circle */}
          <div className="absolute inset-4 rounded-full bg-primary/5 animate-pulse"></div>

          {/* Inner Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-20 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30">
              <span className="material-symbols-outlined text-[44px] animate-bounce">database</span>
            </div>
          </div>

          {/* Floating Data Points */}
          <div className="absolute -top-2 -right-2 size-8 rounded-lg bg-secondary text-primary flex items-center justify-center shadow-lg animate-bounce [animation-delay:0.2s]">
            <span className="material-symbols-outlined text-sm">fingerprint</span>
          </div>
          <div className="absolute -bottom-2 -left-2 size-8 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-lg animate-bounce [animation-delay:0.5s]">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black text-text-main tracking-tight leading-none">
            {title}
          </h2>
          <p className="text-text-sub text-lg font-medium leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Progress List */}
        <div className="w-full mt-10 space-y-3">
          {[
            { label: 'Secure connection established', delay: '0s' },
            { label: 'Analyzing document authenticity', delay: '1s' },
            { label: 'Extracting identity details', delay: '2s' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100/50 animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: item.delay }}>
              <div className="size-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-bold text-text-sub uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] font-black text-text-sub uppercase tracking-[0.3em] opacity-40">
        Secured by Casper Encryption Standard
      </p>
    </div>
  );
};
