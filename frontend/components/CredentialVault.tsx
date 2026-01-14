
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Credential {
  id: string;
  type: string;
  title: string;
  issuer: string;
  status: string;
  date: string;
  color: string;
  icon: string;
}

export const CredentialVault: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await apiService.getVerificationHistory();

        if (response.success && response.history) {
          const { credentials: creds, currentStatus } = response.history;

          // Map backend credentials to display format
          const mappedCredentials: Credential[] = creds.map((cred: any, index: number) => {
            const mapped = {
              id: cred.credentialHash || `cred-${index}`,
              type: getTierType(cred.tier),
              title: getTierTitle(cred.tier),
              issuer: 'CasperID',
              status: cred.revoked ? 'Revoked' : 'Verified',
              date: new Date(cred.issuedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              }),
              color: getTierColor(cred.tier),
              icon: getTierIcon(cred.tier)
            };
            return mapped;
          });

          setCredentials(mappedCredentials);
        } else {
          console.warn('⚠️  [CredentialVault] No credentials in response');
          setCredentials([]);
        }
      } catch (err: any) {
        console.error('❌ [CredentialVault] Failed to fetch credentials:', err);
        console.error('❌ [CredentialVault] Error details:', err.message);
        setError(err.message || 'Failed to load credentials');
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, []);

  // Helper functions to map tier to display properties
  // Helper functions to map tier to display properties
  // Standard Mapping (User Requested):
  // basic -> Basic ID (Green)
  // layer_2 -> Verified ID (Blue)
  // full_kyc -> Full KYC (Purple)

  const getTierType = (tier: string): 'Basic ID' | 'Verified ID' | 'Full KYC' => {
    if (tier === 'layer_1') return 'Basic ID';
    if (tier === 'layer_2') return 'Verified ID';
    if (tier === 'layer_3') return 'Full KYC';

    // Legacy Safety
    if (tier === 'layer_1') return 'Basic ID';
    if (tier === 'layer_3') return 'Full KYC';

    return 'Basic ID';
  };

  const getTierTitle = (tier: string): string => {
    const type = getTierType(tier);
    switch (type) {
      case 'Full KYC': return 'Full KYC Verified';
      case 'Verified ID': return 'Identity Verified';
      case 'Basic ID': return 'CasperID Basic';
      default: return 'Verification';
    }
  };

  const getTierColor = (tier: string): string => {
    const type = getTierType(tier);
    switch (type) {
      case 'Full KYC':
        return 'from-primary to-[#6D36D6]';
      case 'Verified ID':
        return 'from-[#D4AF37] to-[#996515]';
      case 'Basic ID':
        return 'from-blue-500 to-blue-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getTierIcon = (tier: string): string => {
    const type = getTierType(tier);
    switch (type) {
      case 'Full KYC': return 'verified_user';
      case 'Verified ID': return 'fingerprint';
      case 'Basic ID': return 'badge';
      default: return 'help_outline';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-text-main tracking-tight">Credential Vault</h1>
            <p className="text-text-sub text-lg font-medium">Your collection of verifiable digital certificates and identity proofs.</p>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-text-sub font-medium">Loading your credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-text-main tracking-tight">Credential Vault</h1>
            <p className="text-text-sub text-lg font-medium">Your collection of verifiable digital certificates and identity proofs.</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            <h3 className="text-lg font-bold text-red-900">Error Loading Credentials</h3>
          </div>
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-text-main tracking-tight">Credential Vault</h1>
          <p className="text-text-sub text-lg font-medium">Your collection of verifiable digital certificates and identity proofs.</p>
        </div>
        <button className="h-14 px-8 bg-white border border-gray-200 rounded-2xl font-black text-sm text-text-main hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined">add_circle</span>
          Add New Credential
        </button>
      </div>

      {credentials.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-[32px] p-12 text-center">
          <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-text-sub">workspace_premium</span>
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">No Credentials Yet</h3>
          <p className="text-text-sub font-medium max-w-md mx-auto mb-6">
            Complete verification to earn your first credential. Start with email verification to unlock more features.
          </p>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all">
            Start Verification
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {credentials.map((vc) => (
            <div key={vc.id} className="group relative">
              {/* The "Card" UI */}
              <div className={`aspect-[1.58/1] rounded-[32px] bg-gradient-to-br ${vc.color} p-8 flex flex-col justify-between text-white shadow-xl group-hover:scale-[1.02] transition-all duration-500 overflow-hidden`}>
                {/* Card Hologram Effect */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="absolute -top-20 -right-20 size-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>

                <div className="relative z-10 flex justify-between items-start">
                  <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">{vc.icon}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest">
                    {vc.type}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tight mb-1">{vc.title}</h3>
                  <p className="text-sm font-bold opacity-70">Issued by {vc.issuer}</p>
                </div>

                <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4 mt-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase opacity-50">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`size-2 rounded-full ${vc.status === 'Verified' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <p className="text-xs font-bold">{vc.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-50">Issued</p>
                    <p className="text-xs font-bold">{vc.date}</p>
                  </div>
                </div>
              </div>

              {/* Card Hover Actions */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-[32px] backdrop-blur-[2px]">
                <div className="flex gap-3">
                  <button
                    onClick={() => alert(`QR Code for ${vc.title}\n(Feature coming soon)`)}
                    className="size-12 rounded-full bg-white text-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                    title="Show QR Code"
                  >
                    <span className="material-symbols-outlined">qr_code</span>
                  </button>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/verify/${vc.id}`;
                      navigator.clipboard.writeText(link);
                      alert('Verification link copied to clipboard!');
                    }}
                    className="size-12 rounded-full bg-white text-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                    title="Copy Share Link"
                  >
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Placeholder for new verification */}
          <div className="aspect-[1.58/1] rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary/40 hover:bg-white transition-all">
            <div className="size-14 rounded-full bg-gray-50 flex items-center justify-center text-text-sub group-hover:text-primary group-hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <p className="text-sm font-black text-text-sub group-hover:text-primary">Verify More Details</p>
          </div>
        </div>
      )}
    </div>
  );
};
