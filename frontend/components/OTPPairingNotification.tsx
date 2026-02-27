import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

interface PendingPairing {
  pairingId: string;
  otp: string;
  expiresAt: number;
  expiresIn: number;
  createdAt: number;
  cid: string;
}

interface OTPPairingNotificationProps {
  isAuthenticated: boolean;
}

const OTPPairingNotification: React.FC<OTPPairingNotificationProps> = ({ isAuthenticated }) => {
  const [pendingPairings, setPendingPairings] = useState<PendingPairing[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  // Poll for pending pairings
  const fetchPendingPairings = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiService.getOTPPendingPairings();
      if (response.success && response.pending) {
        setPendingPairings(response.pending);
        setIsVisible(response.pending.length > 0);
      }
    } catch (error) {
      // Silently fail - user might not be logged in
    }
  }, [isAuthenticated]);

  // Poll every 3 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setPendingPairings([]);
      setIsVisible(false);
      return;
    }

    fetchPendingPairings();
    const interval = setInterval(fetchPendingPairings, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchPendingPairings]);

  // Update countdown timers
  useEffect(() => {
    if (pendingPairings.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const newTimeLeft: Record<string, number> = {};

      pendingPairings.forEach((pairing) => {
        const remaining = Math.max(0, pairing.expiresAt - now);
        newTimeLeft[pairing.pairingId] = remaining;
      });

      setTimeLeft(newTimeLeft);

      // Remove expired pairings from display
      const active = pendingPairings.filter(p => newTimeLeft[p.pairingId] > 0);
      if (active.length !== pendingPairings.length) {
        setPendingPairings(active);
        if (active.length === 0) setIsVisible(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingPairings]);

  const handleDismiss = async (pairingId: string) => {
    try {
      await apiService.cancelOTPPairing(pairingId);
      setPendingPairings(prev => prev.filter(p => p.pairingId !== pairingId));
      if (pendingPairings.length <= 1) setIsVisible(false);
    } catch (error) {
      console.error('Failed to cancel pairing:', error);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible || pendingPairings.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
      {pendingPairings.map((pairing) => (
        <div
          key={pairing.pairingId}
          className="bg-white rounded-2xl shadow-2xl border border-primary/20 overflow-hidden animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">smartphone</span>
              <span className="font-bold text-text-main text-sm">Extension Pairing</span>
            </div>
            <button
              onClick={() => handleDismiss(pairing.pairingId)}
              className="text-text-muted hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-text-muted text-xs mb-3">
              Enter this code in your CasperID extension:
            </p>

            {/* OTP Display */}
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                {pairing.otp.split('').map((digit, i) => (
                  <div
                    key={i}
                    className="w-14 h-16 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/30"
                  >
                    <span className="text-3xl font-black text-primary">{digit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="material-symbols-outlined text-amber-500 text-sm">timer</span>
              <span className="text-text-muted">
                Expires in{' '}
                <span className="font-bold text-text-main">
                  {formatTime(timeLeft[pairing.pairingId] || 0)}
                </span>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-amber-50 px-4 py-2 border-t border-amber-100">
            <p className="text-xs text-amber-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Only enter this code if you initiated the pairing
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OTPPairingNotification;
