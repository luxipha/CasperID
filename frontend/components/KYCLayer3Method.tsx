
import React from 'react';

interface KYCLayer3MethodProps {
  onBack: () => void;
  onSelectMethod: (method: 'nimc' | 'upload') => void;
}

export const KYCLayer3Method: React.FC<KYCLayer3MethodProps> = ({ onBack, onSelectMethod }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

        {/* Left: Selection Area */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
              Choose Verification Method
            </h1>
            <p className="text-text-sub text-lg font-medium leading-relaxed max-w-2xl">
              Select how you would like to complete your identity verification.
            </p>
          </div>

          <div className="space-y-6">
            {/* NIMC Card - DISABLED */}
            <div
              className="w-full text-left bg-white rounded-[32px] border border-gray-100 shadow-soft p-8 flex items-center gap-6 opacity-50 cursor-not-allowed relative overflow-hidden"
            >
              {/* Coming Soon Badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-200 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Coming Soon
              </div>

              <div className="size-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[32px]">badge</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black text-text-main">NIMC Verification</h3>
                </div>
                <p className="text-text-sub text-base font-medium leading-relaxed max-w-xl">
                  Verify using your National Identity Management Commission number via QR Code (Mobile) or OTP (Desktop).
                </p>
              </div>
              <span className="material-symbols-outlined text-text-sub ml-4">lock</span>
            </div>

            {/* Upload ID Card */}
            <button
              onClick={() => onSelectMethod('upload')}
              className="w-full text-left bg-white rounded-[32px] border border-gray-100 shadow-soft p-8 flex flex-col gap-6 group hover:border-primary/40 hover:shadow-glow transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">upload_file</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-black text-text-main">Upload Government ID</h3>
                  </div>
                  <p className="text-text-sub text-base font-medium leading-relaxed max-w-xl">
                    Upload a photo of your Passport, Driver's License, or National ID card.
                  </p>
                </div>
                <span className="material-symbols-outlined text-text-sub group-hover:text-primary transition-colors ml-4">chevron_right</span>
              </div>

              <div className="flex flex-wrap gap-2 pl-20">
                {['Passport', "Driver's License", 'ID Card'].map(tag => (
                  <span key={tag} className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-black text-text-sub uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* Right: Verification Steps Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

            <div className="space-y-10 relative">
              {/* Vertical Stepper Line */}
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100"></div>

              {/* Step 1: Choose Method (Active) */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs shadow-md">
                  1
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub">Select your preferred document type.</span>
                </div>
              </div>

              {/* Step 2: Verification */}
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Verification</span>
                  <span className="text-[11px] font-bold text-text-sub">Document Upload or NIMC</span>
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
      <div className="mt-12 flex justify-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          Cancel Verification
        </button>
      </div>
    </div>
  );
};
