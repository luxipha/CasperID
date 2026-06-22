import React, { useEffect, useMemo, useState } from 'react';
import { L3LivenessCheck } from './L3LivenessCheck';
import { LivenessCheck } from './LivenessCheck';
import { apiService } from '../services/api';

interface PairingPayload {
  type: 'casperid_liveness';
  requestId: string;
  pairingId: string;
  pairingToken: string;
  verificationTier: 'layer_2' | 'layer_3';
  expiresAt: number;
}

export default function HostedLivenessCapture() {
  const [isComplete, setIsComplete] = useState(false);
  const payload = useMemo<PairingPayload | null>(() => {
    try {
      const value = new URLSearchParams(window.location.search).get('data');
      if (!value) return null;
      const parsed = JSON.parse(value) as PairingPayload;
      if (parsed.type !== 'casperid_liveness' || Date.now() > parsed.expiresAt) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!payload) return;
    const acknowledgementKey = `casperid_liveness_ack:${payload.pairingId}`;
    if (sessionStorage.getItem(acknowledgementKey) === '1') return;
    sessionStorage.setItem(acknowledgementKey, '1');

    apiService.post('/api/v2/verification/pairing/acknowledge', {
      requestId: payload.requestId,
      pairingId: payload.pairingId,
      pairingToken: payload.pairingToken,
    }).catch(() => {
      sessionStorage.removeItem(acknowledgementKey);
    });
  }, [payload]);

  if (!payload) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center font-bold">This liveness pairing link is invalid or expired.</div>;
  }

  if (isComplete) {
    return (
      <main className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-black">Verification complete</h1>
          <p className="mt-2 text-sm text-text-sub">You can return to your other device.</p>
        </div>
      </main>
    );
  }

  return payload.verificationTier === 'layer_3'
    ? <L3LivenessCheck pairingPayload={payload} onComplete={() => setIsComplete(true)} />
    : <LivenessCheck pairingPayload={payload} layer={2} onComplete={() => setIsComplete(true)} />;
}
