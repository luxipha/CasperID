
import React from 'react';

interface KYCFullSuccessProps {
  onDashboard: () => void;
  onViewProfile: () => void;
}

export const KYCFullSuccess: React.FC<KYCFullSuccessProps> = ({ onDashboard, onViewProfile }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
          Full KYC Completed!
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="size-5 rounded-full bg-green-500 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[14px] font-bold">check</span>
          </div>
          <span className="text-green-500 text-lg font-bold tracking-tight">Your Identity is Fully Verified.</span>
        </div>
      </div>

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
        
        {/* Left: Success Card Area */}
        <div className="space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-12 md:p-16 flex items-start gap-8 relative overflow-hidden">
            {/* Subtle background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-bl-full -mr-20 -mt-20"></div>

            <div className="size-20 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 shrink-0 relative z-10">
              <span className="material-symbols-outlined text-[44px] icon-filled">verified</span>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-text-main leading-tight mb-4 max-w-lg">
                  Congratulations! Your Layer 3 identity verification is now complete.
                </h2>
                <p className="text-text-sub text-lg font-medium leading-relaxed max-w-xl">
                  You can now access all features, higher transaction limits, and regulated services on CasperID and integrated platforms.
                </p>
              </div>

              {/* Verified Method Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
                 <span className="material-symbols-outlined text-text-sub text-[20px]">info</span>
                 <span className="text-sm font-bold text-text-sub">Verified via NIMC & Liveness Check</span>
              </div>
            </div>
          </div>

          <div className="max-w-xl space-y-4">
            <button 
              onClick={onDashboard}
              className="w-full h-16 bg-primary text-white rounded-[22px] font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:bg-primary/95 transition-all active:scale-[0.98]"
            >
              Go to Dashboard
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </button>
            <button 
              onClick={onViewProfile}
              className="w-full text-center text-text-sub hover:text-text-main font-bold text-base transition-colors"
            >
              View My Verified Profile
            </button>
          </div>
        </div>

        {/* Right: Verification Steps Sidebar (All Complete) */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>
            
            <div className="space-y-10 relative">
              {/* Vertical Stepper Line (Full Purple) */}
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-primary"></div>

              {/* Step 1: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 2: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Verification</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 3: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Review & Submit</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 group cursor-pointer hover:bg-gray-50 transition-all">
                <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">support_agent</span>
                </div>
                <div>
                  <p className="text-xs font-black text-text-main leading-none mb-1">Need help?</p>
                  <button className="text-[11px] font-bold text-primary hover:underline">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
