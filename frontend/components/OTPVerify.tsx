
import React, { useState, useEffect } from 'react';

interface OTPVerifyProps {
  email: string;
  verificationId: string;
  onSuccess: (response: any) => void;
  onBack: () => void;
  onVerifyCode?: (verificationId: string, otp: string) => Promise<any>;
  onResendCode?: (verificationId: string) => Promise<any>;
  title?: string;
  description?: string;
  backLabel?: string;
  successLabel?: string;
  errorTitle?: string;
}

export const OTPVerify: React.FC<OTPVerifyProps> = ({
  email,
  verificationId,
  onSuccess,
  onBack,
  onVerifyCode,
  onResendCode,
  title = 'Verify Identity',
  description,
  backLabel = 'Change Email',
  successLabel = 'Verify & Continue',
  errorTitle = 'Verification Failed',
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [error, setError] = useState('');

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setError('');

      const otpString = otp.join('');
      const { apiService } = await import('../services/api');
      const response = onVerifyCode
        ? await onVerifyCode(verificationId, otpString)
        : await apiService.verifyOTP(verificationId, otpString);

      if (response.success) {
        onSuccess(response);
      } else {
        setError(response.error || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setError(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      const { apiService } = await import('../services/api');
      const response = onResendCode
        ? await onResendCode(verificationId)
        : await apiService.resendOTP(verificationId);

      if (response.success) {
        setTimeLeft(59);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(response.error || 'Failed to resend code');
      }
    } catch (error: any) {
      console.error('Resend OTP failed:', error);
      setError(error.message || 'Failed to resend code');
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-4 duration-500">
      <div className="w-full max-w-[480px] space-y-10">

        <div className="text-center space-y-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-text-sub hover:text-primary font-bold text-sm transition-colors mb-4 group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {backLabel}
          </button>
          <h1 className="text-3xl font-black text-text-main tracking-tight">{title}</h1>
          <p className="text-text-sub text-base font-medium">
            {description || <>We sent a 6-digit code to <span className="text-text-main font-bold">{email}</span></>}
          </p>
        </div>

        <div className="bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_100px_-20px_rgba(134,82,226,0.12)] p-10 md:p-12 space-y-10">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="size-11 md:size-12 rounded-xl bg-gray-50 border-2 border-transparent text-center text-xl font-black text-text-main focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              disabled={!isComplete || isLoading}
              onClick={handleVerify}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="size-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                successLabel
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                  <div>
                    <p className="text-red-800 font-bold text-sm">{errorTitle}</p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-text-sub text-xs font-bold">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {timeLeft > 0 ? `Resend code in ${timeLeft}s` : (
                <button onClick={handleResend} className="text-primary hover:underline">Resend code now</button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-text-sub/40 uppercase tracking-[0.2em]">
          Secured by CasperID Verification System
        </p>
      </div>
    </div>
  );
};
