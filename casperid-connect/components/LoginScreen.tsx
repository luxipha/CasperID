import React, { useState, useEffect } from 'react';
import { getStorageData, setStorageData } from '../services/storageService';
import { ShieldCheck, RefreshCw, Unplug, ExternalLink } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

const LoginScreen: React.FC<Props> = ({ onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'not_found'>('idle');
  const [progress, setProgress] = useState(0);

  const startSync = async () => {
    setStatus('syncing');
    setProgress(0);

    // Send message to content script to re-sync session from localStorage
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.id) {
        try {
          await chrome.tabs.sendMessage(activeTab.id, { type: 'TRIGGER_SYNC' });
          // Wait for content script to sync to storage and background to hydrate
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.log('[CasperID] No content script on this page, checking storage directly');
        }
      }
    }

    // Now check storage for synced data
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
            setStatus('not_found'); // If no user data found in storage
          }
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  return (
    <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-700">
      <div className="mb-10 text-center px-6">
        <h2 className="text-[#1A1A2E] text-2xl font-extrabold mb-2 tracking-tight">Syncing Session</h2>
        <p className="text-[#626D85] text-sm font-medium leading-relaxed">
          Checking CasperID.io for active credentials...
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="relative size-48 flex items-center justify-center">

          {/* Subtle Radar Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {status === 'syncing' && (
              <>
                <div className="absolute size-40 rounded-full border border-primary/10 animate-ripple-soft"></div>
                <div className="absolute size-40 rounded-full border border-secondary/10 animate-ripple-soft [animation-delay:2s]"></div>
              </>
            )}

            {/* Soft background rotation during syncing */}
            {status === 'syncing' && (
              <div className="absolute size-44 border border-dashed border-gray-100 rounded-full animate-spin-slow opacity-40"></div>
            )}
          </div>

          {/* Progress Circle SVG */}
          <div className="relative size-40 flex items-center justify-center">
            <svg className="absolute inset-0 size-40 -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r="74"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-gray-100/50"
              />
              {/* Active Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r="74"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={465}
                strokeDashoffset={465 - (465 * progress) / 100}
                className={`transition-all duration-300 ease-out ${status === 'success' ? 'text-green-500' : 'text-primary'
                  }`}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Circle and Icon */}
            <div className={`size-28 rounded-full flex items-center justify-center z-10 transition-all duration-500 shadow-xl ${status === 'success'
              ? 'bg-green-50 border border-green-100 shadow-success-glow'
              : 'bg-white border border-gray-50 shadow-purple-50'
              }`}>
              <div className="relative">
                {status === 'success' && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-green-200/50"></div>
                )}
                {status === 'success' ? (
                  <ShieldCheck size={48} className="text-green-500 transition-all duration-500 relative z-20 scale-110" />
                ) : (
                  <RefreshCw size={48} className={`text-primary transition-all duration-500 relative z-20 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {status === 'idle' ? (
          <div className="flex justify-center">
            <button
              onClick={startSync}
              className="w-[85%] h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              Detect Web Session
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
            </button>
          </div>
        ) : status === 'not_found' ? (
          <div className="text-center px-6 animate-in slide-in-from-bottom-2 duration-500">
            <p className="font-bold text-[13px] tracking-[0.15em] uppercase text-alert mb-2">
              No Session Found
            </p>
            <p className="text-text-sub text-xs font-medium mb-6">
              Please log in to your CasperID account on the web platform first.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.open('http://www.casperId.com', '_blank')}
                className="w-[85%] h-12 border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                Go to Website
                <ExternalLink size={18} />
              </button>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="text-center px-6">
            <p className={`font-bold text-[13px] tracking-[0.15em] uppercase transition-colors duration-500 mb-2 ${status === 'success' ? 'text-green-500' : 'text-primary'
              }`}>
              {status === 'success' ? 'Identity Verified' : (
                progress < 30 ? 'Connecting to CasperID...' :
                  progress < 70 ? 'Verifying Certificates...' :
                    'Finalizing Security Handshake...'
              )}
            </p>
            <p className="text-text-sub text-xs font-medium animate-in fade-in duration-1000">
              {status === 'success' ? 'Accessing encrypted profile' : 'Checking secure session cookies...'}
            </p>
          </div>
        )}

        <div className="pt-4 flex flex-col items-center gap-5">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50/50 border border-green-100/50 transition-all duration-500">
            <span className={`size-2 rounded-full transition-colors duration-500 ${status === 'success' ? 'bg-green-500' : 'bg-green-400 animate-pulse'
              }`}></span>
            <span className="text-[10px] font-extrabold text-green-700 uppercase tracking-widest">Encrypted Tunnel Active</span>
          </div>

          <button
            onClick={() => window.open('http://www.casperId.com', '_blank')}
            className="text-xs font-bold text-text-sub hover:text-primary transition-colors underline underline-offset-4 decoration-gray-200 hover:decoration-primary"
          >
            Not logged in? Go to portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;