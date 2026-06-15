
import React from 'react';

interface KYCNIMCSelectionProps {
  onBack: () => void;
  onSelectMode: (mode: 'mobile' | 'desktop') => void;
  onCancel: () => void;
}

export const KYCNIMCSelection: React.FC<KYCNIMCSelectionProps> = ({ onBack, onSelectMode, onCancel }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 md:pb-20">
      {/* Top Navigation */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-5 md:mb-8"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Method Choice
      </button>

      {/* Page Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-[30px] md:text-[40px] font-black text-text-main tracking-tight leading-tight">
          How would you like to verify with NIMC?
        </h1>
        <p className="text-text-sub text-base md:text-lg font-medium leading-relaxed max-w-2xl mt-2">
          Choose your preferred method below to proceed.
        </p>
      </div>

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">
        
        {/* Left: Mode Selection Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* Mobile QR Card */}
          <div className="order-2 md:order-1 bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-10 flex flex-col items-center text-center group hover:shadow-glow transition-all">
            <div className="size-14 md:size-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary mb-4 md:mb-8 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[40px]">qr_code_scanner</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-text-main mb-3 md:mb-4">Verify via QR Code (Mobile)</h3>
            <p className="text-text-sub text-sm md:text-base font-medium leading-relaxed mb-5 md:mb-10 flex-1">
              Scan with your phone's NIMC app to verify. Requires NIMC app installed on your mobile device.
            </p>
            <button 
              onClick={() => onSelectMode('mobile')}
              className="w-full h-14 border-2 border-gray-100 rounded-2xl font-black text-sm hover:border-primary/40 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              Select
            </button>
          </div>

          {/* Desktop OTP Card */}
          <div className="order-1 md:order-2 bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-10 flex flex-col items-center text-center group hover:shadow-glow transition-all relative overflow-hidden">
            {/* Subtle Shimmer Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10"></div>
            
            <div className="size-14 md:size-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary mb-4 md:mb-8 group-hover:scale-105 transition-transform relative z-10">
              <span className="material-symbols-outlined text-[40px]">computer</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-text-main mb-3 md:mb-4 relative z-10">Verify via OTP (Desktop)</h3>
            <p className="text-text-sub text-sm md:text-base font-medium leading-relaxed mb-5 md:mb-10 flex-1 relative z-10">
              Receive an OTP to your registered NIMC phone number and enter it directly on your desktop.
            </p>
            <button 
              onClick={() => onSelectMode('desktop')}
              className="w-full h-14 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] relative z-10"
            >
              Select
            </button>
          </div>

        </div>

        {/* Right: Verification Steps Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>
            
            <div className="space-y-10 relative">
              {/* Vertical Stepper Line */}
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                <div className="absolute top-0 left-0 w-full h-[33%] bg-primary"></div>
              </div>

              {/* Step 1: Choose Method (Completed) */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub">Completed</span>
                </div>
              </div>

              {/* Step 2: Verification (Active) */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary">Verification</span>
                  <span className="text-[11px] font-bold text-text-sub">Select NIMC Mode</span>
                </div>
              </div>

              {/* Step 3: Liveness Check */}
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub">Face scan verification</span>
                </div>
              </div>

              {/* Step 4: Review & Submit */}
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  4
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Review & Submit</span>
                  <span className="text-[11px] font-bold text-text-sub">Final confirmation</span>
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

      {/* Footer Exit Link */}
      <div className="mt-8 md:mt-12 flex justify-center">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          Cancel Verification
        </button>
      </div>
    </div>
  );
};
