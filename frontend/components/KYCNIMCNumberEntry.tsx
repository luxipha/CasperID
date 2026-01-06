
import React, { useState } from 'react';

interface KYCNIMCNumberEntryProps {
  onBack: () => void;
  onNext: (number: string) => void;
  onCancel: () => void;
}

export const KYCNIMCNumberEntry: React.FC<KYCNIMCNumberEntryProps> = ({ onBack, onNext, onCancel }) => {
  const [nimcNumber, setNimcNumber] = useState('');

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
        
        {/* Left: Input Area */}
        <div className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
              Enter Your NIMC Number
            </h1>
            <p className="text-text-sub text-lg font-medium leading-relaxed max-w-2xl">
              Please enter your Virtual National Identity Number (vNIN) or Mobile Web Services (MWS) Code to proceed with verification.
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-10 max-w-2xl space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-black text-text-main">vNIN or MWS Code</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-text-sub/50 group-focus-within:text-primary transition-colors">badge</span>
                </div>
                <input 
                  type="text" 
                  value={nimcNumber}
                  onChange={(e) => setNimcNumber(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border border-gray-100 text-base font-medium text-text-main placeholder:text-text-sub/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  placeholder="Enter your vNIN or MWS code"
                />
              </div>
              <p className="text-[12px] text-text-sub font-medium opacity-70">
                Find your vNIN on your NIN slip or use your MWS code.
              </p>
            </div>

            <button 
              disabled={!nimcNumber}
              onClick={() => onNext(nimcNumber)}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Get OTP
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>

            <div className="pt-4 flex flex-col items-center gap-4 border-t border-gray-50">
              <button className="flex items-center gap-2 text-primary font-bold text-sm hover:underline group">
                <span className="material-symbols-outlined text-lg">help</span>
                Where to find my NIMC number?
              </button>
              <button 
                onClick={onBack}
                className="text-text-sub hover:text-text-main font-bold text-sm"
              >
                Choose a different verification method
              </button>
            </div>
          </div>
        </div>

        {/* Right: Verification Steps Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>
            
            <div className="space-y-10 relative">
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                <div className="absolute top-0 left-0 w-full h-[33%] bg-primary"></div>
              </div>

              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub">Completed</span>
                </div>
              </div>

              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary">Verification</span>
                  <span className="text-[11px] font-bold text-text-sub">NIMC Number</span>
                </div>
              </div>

              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub">Face scan verification</span>
                </div>
              </div>

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
