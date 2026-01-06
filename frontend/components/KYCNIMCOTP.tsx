
import React, { useState, useEffect } from 'react';

interface KYCNIMCOTPProps {
  onBack: () => void;
  onVerify: (otp: string) => void;
  onCancel: () => void;
}

export const KYCNIMCOTP: React.FC<KYCNIMCOTPProps> = ({ onBack, onVerify, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(59);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
        
        {/* Left: OTP Input Area */}
        <div className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
              NIMC Verification via OTP
            </h1>
            <p className="text-text-sub text-lg font-medium leading-relaxed max-w-2xl">
              Enter the One-Time Password (OTP) sent to your NIMC registered phone number.
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-10 max-w-2xl space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-black text-text-main">Verification Code</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full h-24 rounded-2xl bg-white border border-gray-100 text-4xl font-black text-center tracking-[0.5em] text-text-main placeholder:text-gray-100 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  placeholder="000000"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-sub text-sm font-bold">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  Resend OTP in {timeLeft}s
                </div>
                <button 
                  disabled={timeLeft > 0}
                  className="text-primary font-black text-sm hover:underline disabled:opacity-40"
                >
                  Resend Code
                </button>
              </div>
            </div>

            <button 
              disabled={otp.length !== 6}
              onClick={() => onVerify(otp)}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Verify OTP
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>

            <div className="pt-4 flex flex-col items-center gap-4 border-t border-gray-50">
              <p className="text-text-sub text-sm font-bold">Didn't receive the OTP?</p>
              <button 
                onClick={onBack}
                className="text-primary font-black text-sm hover:underline"
              >
                Try another verification method
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
                  <span className="text-[11px] font-bold text-text-sub">NIMC OTP</span>
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
