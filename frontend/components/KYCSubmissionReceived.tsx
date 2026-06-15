
import React from 'react';

interface KYCSubmissionReceivedProps {
  onDashboard: () => void;
  actionLabel?: string;
}

export const KYCSubmissionReceived: React.FC<KYCSubmissionReceivedProps> = ({
  onDashboard,
  actionLabel = 'Go to Dashboard',
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 md:pb-20">
      {/* Page Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-[30px] md:text-[40px] font-black text-text-main tracking-tight leading-tight">
          Full KYC Submission Received!
        </h1>
        <p className="text-primary text-base md:text-lg font-bold tracking-tight mt-2">
          Your Layer 3 verification is now under review.
        </p>
      </div>

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">
        
        {/* Left: Status Card Area */}
        <div className="space-y-8">
          <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-16 flex flex-col sm:flex-row items-start gap-5 md:gap-8 relative overflow-hidden">
            
            {/* Hourglass Icon Circle */}
            <div className="size-14 md:size-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[32px] md:text-[44px] animate-[pulse_3s_infinite]">hourglass_empty</span>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-4">
                <h2 className="text-lg md:text-2xl font-black text-text-main leading-relaxed max-w-xl">
                  We are securely reviewing your identity details and liveness check. This process typically takes <span className="text-primary">24-48 hours.</span>
                </h2>
                <p className="text-text-sub text-base md:text-lg font-medium leading-relaxed max-w-xl">
                  You will receive a notification on your dashboard and via email once your Layer 3 verification is complete.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <button 
              onClick={onDashboard}
              className="w-full h-14 md:h-16 bg-primary text-white rounded-[18px] md:rounded-[22px] font-black text-base md:text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:bg-primary/95 transition-all active:scale-[0.98]"
            >
              {actionLabel}
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Verification Steps Sidebar (All Complete) */}
        <aside className="hidden lg:block space-y-6">
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
