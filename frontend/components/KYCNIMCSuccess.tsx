
import React from 'react';

interface KYCNIMCSuccessProps {
  onProceed: () => void;
  onCancel: () => void;
}

export const KYCNIMCSuccess: React.FC<KYCNIMCSuccessProps> = ({ onProceed, onCancel }) => {
  return (
    <div className="w-full max-w-[640px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(134,82,226,0.12)] overflow-hidden">
        
        {/* Progress Header */}
        <div className="p-8 md:p-10 border-b border-gray-50 bg-gray-50/20">
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-black text-text-main">Step 3 of 4: Verification</span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-primary text-[11px] font-black tracking-wider">75%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Success Content Area */}
        <div className="p-10 md:p-14 flex flex-col items-center text-center">
          
          {/* Animated Success Icon */}
          <div className="size-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-10 relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping duration-[3s]"></div>
            <div className="size-16 rounded-full bg-green-500 flex items-center justify-center text-white relative z-10 shadow-lg">
              <span className="material-symbols-outlined text-[36px] font-bold">check</span>
            </div>
          </div>

          <h2 className="text-[32px] md:text-[36px] font-black text-text-main mb-4 tracking-tight leading-tight">
            NIMC Verification Successful!
          </h2>
          <p className="text-text-sub text-lg font-medium leading-relaxed max-w-md mb-10">
            Your identity details have been securely fetched. We will now proceed with a quick Liveness Check to complete Layer 3.
          </p>

          {/* Data Retrieved Card */}
          <div className="w-full bg-[#F8F9FB] rounded-[24px] border border-gray-100 p-6 flex items-center justify-between mb-6 group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              </div>
              <div className="text-left">
                <h4 className="text-base font-black text-text-main leading-tight">NIMC Data Retrieved</h4>
                <p className="text-sm text-text-sub font-medium mt-0.5">National Identity Number (NIN)</p>
              </div>
            </div>
            <div className="size-14 rounded-2xl bg-bg-dark flex items-center justify-center text-secondary shadow-lg">
               <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="w-full bg-indigo-50/50 rounded-[20px] border border-indigo-100/50 p-6 flex gap-4 text-left mb-10">
             <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
               <span className="material-symbols-outlined text-primary text-[20px]">face</span>
             </div>
             <p className="text-[14px] text-indigo-900 font-bold leading-relaxed">
               <span className="text-primary">Almost there.</span> The next step involves a facial scan to verify that the person attempting to verify is a live person.
             </p>
          </div>

          {/* Primary Action */}
          <button 
            onClick={onProceed}
            className="w-full h-16 bg-primary text-white rounded-[22px] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:bg-primary/95 transition-all active:scale-[0.98] mb-8"
          >
            Proceed to Liveness Check
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>

          {/* Cancel Option */}
          <button 
            onClick={onCancel}
            className="text-text-sub hover:text-alerts transition-colors font-bold text-sm"
          >
            Cancel and return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
