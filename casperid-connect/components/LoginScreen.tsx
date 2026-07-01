import React, { useState, useEffect, useRef } from 'react';
import { getStorageData, setStorageData } from '../services/storageService';
import { ShieldCheck, RefreshCw, ExternalLink, ArrowLeft, User, KeyRound } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

type LoginMode = 'select' | 'session' | 'otp-cid' | 'otp-verify';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'https://api.casperid.com';

const LoginScreen: React.FC<Props> = ({ onSuccess }) => {
  const [mode, setMode] = useState<LoginMode>('otp-cid');
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'not_found' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // OTP pairing state
  const [cid, setCid] = useState('');
  const [pairingId, setPairingId] = useState<string | null>(null);
  const [userHint, setUserHint] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Session sync logic (existing)
  const startSync = async () => {
    setStatus('syncing');
    setProgress(0);

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.id) {
        try {
          await chrome.tabs.sendMessage(activeTab.id, { type: 'TRIGGER_SYNC' });
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch {
          // Ignore missing content script and fall back to extension storage.
        }
      }
    }

    const { userData } = await getStorageData();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (userData) {
            setStatus('success');
            setStorageData({ connected: true });
            setTimeout(onSuccess, 1500);
          } else {
            setStatus('not_found');
          }
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  // OTP pairing - initiate
  const handleCIDSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cid.trim()) return;

    setError(null);
    setStatus('syncing');

    try {
      const response = await fetch(`${API_BASE_URL}/api/passkey/pairing/otp/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: cid.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate pairing');
      }

      setPairingId(data.pairingId);
      setUserHint(data.userHint);
      setExpiresAt(data.expiresAt);
      setMode('otp-verify');
      setStatus('idle');

    } catch (err: any) {
      setError(err.message || 'Failed to find CasperID');
      setStatus('error');
    }
  };

  // OTP pairing - verify
  const handleOTPVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 3 || !pairingId) return;

    setIsVerifying(true);
    setOtpError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/passkey/pairing/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingId,
          otp: otpValue,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Store session and user data
      await setStorageData({
        connected: true,
        userData: data.user,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt
      });

      setStatus('success');
      setTimeout(onSuccess, 1500);

    } catch (err: any) {
      setOtpError(err.message || 'Verification failed');
      setOtp(['', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // OTP input handling
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError(null);

    // Auto-advance
    if (value && index < 2) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-submit when complete
    if (index === 2 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 3) {
        handleOTPVerify();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Countdown timer for OTP
  useEffect(() => {
    if (!expiresAt || mode !== 'otp-verify') return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        setOtpError('OTP expired. Please try again.');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, mode]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mode selection screen
  if (mode === 'select') {
    return (
      <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-700 px-4">
        <div className="mb-8 text-center">
          <h2 className="text-[#1A1A2E] text-2xl font-extrabold mb-2 tracking-tight">Connect to CasperID</h2>
          <p className="text-[#626D85] text-sm font-medium">Choose how to link your identity</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setMode('session'); startSync(); }}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-[#1A1A2E]">Detect Web Session</p>
                <p className="text-xs text-[#626D85]">Sync from CasperID.com if logged in</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('otp-cid')}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-[#1A1A2E]">Pair with OTP Code</p>
                <p className="text-xs text-[#626D85]">Enter your CasperID and verify</p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={() => window.open('https://CasperID.com', '_blank')}
          className="mt-6 text-xs font-bold text-[#626D85] hover:text-primary transition-colors underline underline-offset-4"
        >
          Don't have an account? Sign up
        </button>
      </div>
    );
  }

  // CID entry screen
  if (mode === 'otp-cid') {
    return (
      <div className="flex-1 flex flex-col animate-in fade-in duration-500 px-4">
        <button
          onClick={() => { setMode('select'); setError(null); setCid(''); }}
          className="flex items-center gap-2 text-sm text-[#626D85] hover:text-primary mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[#1A1A2E] text-xl font-extrabold mb-1">Enter your CasperID</h2>
          <p className="text-[#626D85] text-sm">Username or email linked to your account</p>
        </div>

        <form onSubmit={handleCIDSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              placeholder="username or email"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!cid.trim() || status === 'syncing'}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'syncing' ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Finding account...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    );
  }

  // OTP verification screen
  if (mode === 'otp-verify') {
    return (
      <div className="flex-1 flex flex-col animate-in fade-in duration-500 px-4">
        <button
          onClick={() => { setMode('otp-cid'); setOtp(['', '', '']); setOtpError(null); }}
          className="flex items-center gap-2 text-sm text-[#626D85] hover:text-primary mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-[#1A1A2E] text-xl font-extrabold mb-1">Enter OTP Code</h2>
          <p className="text-[#626D85] text-sm">
            Check your CasperID portal for the 3-digit code
          </p>
          {userHint && (
            <p className="text-xs text-primary mt-2 font-medium">{userHint}</p>
          )}
        </div>

        {status === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <p className="font-bold text-green-600 text-lg">Connected!</p>
          </div>
        ) : (
          <>
            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(i, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  disabled={isVerifying}
                  className={`w-16 h-20 text-center text-3xl font-black rounded-xl border-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${otpError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } ${isVerifying ? 'opacity-50' : ''}`}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-center text-xs text-red-500 mb-4">{otpError}</p>
            )}

            {/* Timer */}
            {timeLeft > 0 && (
              <div className="text-center text-xs text-[#626D85] mb-4">
                Code expires in <span className="font-bold text-primary">{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={handleOTPVerify}
              disabled={otp.join('').length !== 3 || isVerifying}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Connect'
              )}
            </button>

            <p className="mt-4 text-center text-xs text-[#626D85]">
              Open <a href="https://CasperID.com" target="_blank" className="text-primary hover:underline">CasperID.com</a> to see your code
            </p>
          </>
        )}
      </div>
    );
  }

  // Session sync screen (existing)
  return (
    <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-700">
      <button
        onClick={() => { setMode('select'); setStatus('idle'); setProgress(0); }}
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-[#626D85] hover:text-primary"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-10 text-center px-6">
        <h2 className="text-[#1A1A2E] text-2xl font-extrabold mb-2 tracking-tight">Syncing Session</h2>
        <p className="text-[#626D85] text-sm font-medium leading-relaxed">
          Checking CasperID.com for active credentials...
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="relative size-48 flex items-center justify-center">
          {status === 'syncing' && (
            <>
              <div className="absolute size-40 rounded-full border border-primary/10 animate-ripple-soft"></div>
              <div className="absolute size-40 rounded-full border border-secondary/10 animate-ripple-soft [animation-delay:2s]"></div>
              <div className="absolute size-44 border border-dashed border-gray-100 rounded-full animate-spin-slow opacity-40"></div>
            </>
          )}

          <div className="relative size-40 flex items-center justify-center">
            <svg className="absolute inset-0 size-40 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-100/50" />
              <circle
                cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="4" fill="transparent"
                strokeDasharray={465} strokeDashoffset={465 - (465 * progress) / 100}
                className={`transition-all duration-300 ease-out ${status === 'success' ? 'text-green-500' : 'text-primary'}`}
                strokeLinecap="round"
              />
            </svg>

            <div className={`size-28 rounded-full flex items-center justify-center z-10 transition-all duration-500 shadow-xl ${status === 'success' ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-50'
              }`}>
              {status === 'success' ? (
                <ShieldCheck size={48} className="text-green-500" />
              ) : (
                <RefreshCw size={48} className={`text-primary ${status === 'syncing' ? 'animate-spin' : ''}`} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6">
        {status === 'not_found' ? (
          <div className="text-center animate-in slide-in-from-bottom-2 duration-500">
            <p className="font-bold text-[13px] uppercase text-red-500 mb-2">No Session Found</p>
            <p className="text-[#626D85] text-xs mb-6">
              Please log in to your CasperID account on the web platform first, or try OTP pairing.
            </p>
            <button
              onClick={() => setMode('otp-cid')}
              className="w-full py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
            >
              Try OTP Pairing Instead
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className={`font-bold text-[13px] uppercase ${status === 'success' ? 'text-green-500' : 'text-primary'}`}>
              {status === 'success' ? 'Identity Verified' : 'Connecting to CasperID...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
