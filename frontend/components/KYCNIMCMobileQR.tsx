
import React from 'react';

interface KYCNIMCMobileQRProps {
  onBack: () => void;
  onCancel: () => void;
  onScanned: () => void;
}

export const KYCNIMCMobileQR: React.FC<KYCNIMCMobileQRProps> = ({ onBack, onCancel, onScanned }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Top Navigation */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-8"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Selection
      </button>

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
        
        {/* Left: QR Area */}
        <div className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
              Scan QR with NIMC App
            </h1>
            <p className="text-text-sub text-lg font-medium leading-relaxed max-w-2xl">
              Open the NIMC Mobile ID app on your smartphone and use the built-in scanner to scan this code.
            </p>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-12 md:p-16 flex flex-col items-center text-center max-w-2xl">
            {/* Styled QR Frame */}
            <div className="relative p-8 bg-gray-50 rounded-[48px] border-4 border-white shadow-inner mb-10 group">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-[48px] animate-pulse"></div>
              
              <div className="size-64 md:size-80 bg-white rounded-[32px] shadow-2xl flex items-center justify-center p-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 cursor-pointer" onClick={onScanned}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=casper-nimc-verification-session-77283" 
                  alt="NIMC QR Code"
                  className="w-full h-full object-contain"
                />
                {/* Custom Logo Center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="size-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-2 border-2 border-primary/10">
                      <span className="material-symbols-outlined text-primary text-3xl font-black">badge</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 w-full">
              <div className="flex items-center justify-center gap-3 px-6 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <span className="material-symbols-outlined text-primary animate-spin">refresh</span>
                <span className="text-sm font-bold text-indigo-900 tracking-tight">Code refreshes in 45s</span>
              </div>
              
              <div className="pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
                 <p className="text-sm text-text-sub font-medium">Don't have the app?</p>
                 <div className="flex gap-4">
                    <button className="h-10 px-4 bg-black text-white rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg">
                       <span className="material-symbols-outlined text-lg">apple</span> App Store
                    </button>
                    <button className="h-10 px-4 bg-black text-white rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg">
                       <span className="material-symbols-outlined text-lg">play_arrow</span> Play Store
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Standard Verification Steps */}
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
                <div className="flex flex-col"><span className="text-sm font-black text-text-main">Choose Method</span><span className="text-[11px] font-bold text-text-sub">Completed</span></div>
              </div>
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">2</div>
                <div className="flex flex-col"><span className="text-sm font-black text-primary">Verification</span><span className="text-[11px] font-bold text-text-sub">Scan NIMC QR</span></div>
              </div>
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">3</div>
                <div className="flex flex-col"><span className="text-sm font-black text-text-main">Liveness Check</span><span className="text-[11px] font-bold text-text-sub">Face scan verification</span></div>
              </div>
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">4</div>
                <div className="flex flex-col"><span className="text-sm font-black text-text-main">Review & Submit</span><span className="text-[11px] font-bold text-text-sub">Final confirmation</span></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
