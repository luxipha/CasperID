
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const IdentityStatusCard: React.FC = () => {
  const { user } = useAuth();
  const [layerStatus, setLayerStatus] = useState<string>('unverified');

  useEffect(() => {
    if (user?.tier) {
      setLayerStatus(user.tier);
    }
  }, [user]);

  const getStatusInfo = () => {
    switch (layerStatus) {
      case 'layer_3':
        return {
          title: 'Full Identity\nVerified',
          badge: 'Fully Verified',
          badgeColor: 'bg-green-500',
          cta: 'Manage Verification',
          icon: 'verified_user'
        };
      case 'layer_2':
        return {
          title: 'Liveness\nVerified',
          badge: 'Liveness Verified',
          badgeColor: 'bg-blue-500',
          cta: 'Complete Full KYC (Layer 3)',
          icon: 'face'
        };
      case 'layer_1':
        return {
          title: 'Email\nVerified',
          badge: 'Email Verified',
          badgeColor: 'bg-yellow-500',
          cta: 'Get professional with .cid',
          icon: 'mail'
        };
      default:
        return {
          title: 'Basic Identity\nActive',
          badge: 'Not Verified',
          badgeColor: 'bg-gray-400',
          cta: 'Start Verification',
          icon: 'shield'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8652E2] to-[#6D36D6] text-white shadow-soft p-7 h-full flex flex-col justify-between group">
      {/* Infinity Symbol Background Decoration */}
      <div className="absolute top-1/2 right-[-20%] -translate-y-1/2 opacity-10 pointer-events-none select-none">
        <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100C71.3914 100 81.6514 95.2323 88.9375 87.625L151.062 32.375C158.349 24.7677 168.609 20 180 20C202.091 20 220 37.9086 220 60C220 82.0914 202.091 100 180 100C157.909 100 140 82.0914 140 60" stroke="white" strokeWidth="20" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-[18px] opacity-80">{statusInfo.icon}</span>
          <span className="text-[11px] font-bold tracking-[0.1em] uppercase opacity-80">IDENTITY STATUS</span>
        </div>
        <h2 className="text-[32px] font-bold leading-[1.1] mb-8 tracking-tight whitespace-pre-line">{statusInfo.title}</h2>
      </div>

      <div className="relative z-10 space-y-3">
        <div className={`inline-flex items-center gap-2 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 ${statusInfo.badgeColor}`}>
          <span className="material-symbols-outlined text-[16px]">key</span>
          <span className="text-[12px] font-bold">{statusInfo.badge}</span>
        </div>
        <button className="w-full bg-white text-primary hover:bg-white/90 py-3.5 rounded-2xl text-[14px] font-bold transition-all shadow-lg active:scale-[0.98]">
          {statusInfo.cta}
        </button>
      </div>
    </section>
  );
};

export const ReusableKYCCard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<any>(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await apiService.getVerificationHistory();

        let combinedData = response.history || {};

        // Also fetch identity status to get pending_upgrade_tier
        if (user?.wallet) {
          try {
            const identityData = await apiService.get(`/api/identity-status?wallet=${encodeURIComponent(user.wallet)}`);

            // Merge identity status into verification data
            combinedData = {
              ...combinedData,
              currentStatus: {
                ...combinedData.currentStatus,
                pending_upgrade_tier: identityData.pending_upgrade_tier,
                status: identityData.status
              }
            };
          } catch (err) {
            console.error('Failed to fetch identity status:', err);
          }
        }

        if (response.success) {
          setVerificationData(combinedData);
        }
      } catch (err) {
        console.error('❌ [ReusableKYCCard] Failed to fetch verification:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [user]);

  const getStatusInfo = (tier?: string, credentials?: any[]) => {
    // Define tier levels to handle hierarchy (L3 includes L2 and L1)
    const tierLevels: Record<string, number> = {
      'layer_0': 0,
      'layer_1': 1,
      'layer_2': 2,
      'layer_3': 3
    };

    const targetLevel = tierLevels[tier || ''] || 0;

    // Check if credential exists for this tier OR higher
    const hasCredential = credentials?.some((c: any) => {
      const credLevel = tierLevels[c.tier] || 0;
      return credLevel >= targetLevel && !c.revoked;
    });

    if (hasCredential) {
      return { status: 'Verified', color: 'text-green-600', bg: 'bg-green-500' };
    }

    // Check pending requests from verification history
    const hasPendingRequest = verificationData?.requests?.some(
      (r: any) => r.verificationType === tier && r.status === 'pending'
    );

    // Also check for pending Layer 3 upgrade from currentStatus
    const hasPendingUpgrade = tier === 'layer_3' &&
      verificationData?.currentStatus?.pending_upgrade_tier === 'layer_3' &&
      verificationData?.currentStatus?.status === 'pending';

    if (hasPendingRequest || hasPendingUpgrade) {
      return { status: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    }

    return { status: 'Not Started', color: 'text-gray-400', bg: 'bg-gray-200' };
  };

  if (loading) {
    return (
      <div className="bg-white p-7 rounded-[32px] shadow-soft h-full flex items-center justify-center border border-gray-50">
        <div className="text-center">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-text-sub">Loading...</p>
        </div>
      </div>
    );
  }

  const govIdStatus = getStatusInfo('layer_3', verificationData?.credentials);  // layer_3 = Full KYC with Gov ID
  const livenessStatus = getStatusInfo('layer_2', verificationData?.credentials); // layer_2 = Liveness Check
  const currentLayerStatus = verificationData?.currentStatus?.layerStatus || 'unverified';

  return (
    <div className="bg-white p-7 rounded-[32px] shadow-soft h-full flex flex-col justify-between border border-gray-50">
      <div>
        <div className="flex justify-between items-start mb-1">
          <p className="text-[11px] font-bold text-text-sub uppercase tracking-wider">REUSABLE KYC</p>
          <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
            <span className="material-icons-outlined text-lg">more_horiz</span>
          </button>
        </div>
        <h3 className="text-[24px] font-bold text-text-main mb-6 leading-tight">
          {currentLayerStatus === 'layer_3' ? 'Fully\nVerified' :
            currentLayerStatus === 'layer_2' ? 'Liveness:\nComplete' :
              currentLayerStatus === 'layer_1' ? 'Email:\nVerified' :
                'Liveness:\nPending'}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[14px]">
            <div className="flex items-center gap-3 text-text-main font-semibold">
              <span className="material-icons-outlined text-text-sub text-[20px]">badge</span>
              Gov ID
            </div>
            <div className={`flex items-center gap-2 font-bold text-[12px] ${govIdStatus.color}`}>
              <span className={`w-2 h-2 rounded-full ${govIdStatus.bg}`}></span>
              {govIdStatus.status}
            </div>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <div className="flex items-center gap-3 text-text-main font-semibold">
              <span className="material-icons-outlined text-text-sub text-[20px]">videocam</span>
              Liveness
            </div>
            <div className={`flex items-center gap-2 font-bold text-[12px] ${livenessStatus.color}`}>
              <span className={`w-2 h-2 rounded-full ${livenessStatus.bg}`}></span>
              {livenessStatus.status}
            </div>
          </div>
          <div className="flex items-center justify-between text-[14px]">
            <div className="flex items-center gap-3 text-text-main font-semibold">
              <span className="material-icons-outlined text-text-sub text-[20px]">search</span>
              AML Check
            </div>
            <div className="flex items-center gap-2 text-text-sub font-bold text-[12px]">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              {currentLayerStatus === 'layer_3' ? 'Verified' : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      <button className="mt-6 pt-4 border-t border-gray-50 text-[14px] font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all group">
        {currentLayerStatus === 'layer_3' ? 'View Credentials' :
          currentLayerStatus === 'layer_2' ? 'Complete Full KYC (Layer 3)' :
            'Start Liveness Check (Layer 2)'}
        <span className="material-icons-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
};

export const TrustScoreCard: React.FC = () => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [scoreLabel, setScoreLabel] = useState('No verification');

  useEffect(() => {
    // Calculate trust score based on tier
    const calculateScore = () => {
      switch (user?.tier) {
        case 'layer_3':
          return { score: 95, label: 'Fully verified identity' };
        case 'layer_2':
          return { score: 70, label: 'Liveness verified' };
        case 'layer_1':
          return { score: 40, label: 'Email verified only' };
        default:
          return { score: 5, label: 'No verification completed' };
      }
    };

    const result = calculateScore();
    setScore(result.score);
    setScoreLabel(result.label);
  }, [user]);

  const getScoreColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    if (score >= 20) return 'from-orange-500 to-red-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="bg-white p-7 rounded-[32px] shadow-soft h-full relative overflow-hidden flex flex-col justify-between border border-gray-50">
      {/* Faint Shield Background */}
      <span className="material-icons-outlined absolute top-10 right-[-10px] text-[120px] text-primary/5 select-none pointer-events-none">shield</span>

      <div>
        <p className="text-[11px] font-bold text-text-sub uppercase tracking-wider mb-2">CASPER TRUST SCORE</p>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-[48px] font-extrabold text-text-main leading-none tracking-tight">{score}</span>
          <span className="text-[18px] text-text-sub font-bold">/100</span>
        </div>

        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-8">
          <div
            className={`bg-gradient-to-r ${getScoreColor()} h-full rounded-full transition-all duration-1000`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-gray-50/80 rounded-2xl p-4">
        <span className={`material-icons-outlined text-[20px] ${score >= 70 ? 'text-green-600' : 'text-text-sub'}`}>
          {score >= 70 ? 'verified' : 'hourglass_empty'}
        </span>
        <p className="text-[13px] text-text-sub font-semibold tracking-tight">{scoreLabel}</p>
      </div>
    </div>
  );
};
