import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CredentialQRModal } from './CredentialQRModal';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

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

interface Identity {
  id: string;
  type: 'master' | 'persona';
  name: string;
  context?: string;
  did: string;
  createdAt: string;
  color: string;
  icon: string;
}

interface ContextDID {
  did: string;
  alias?: string;
  context: string;
  routing_type?: 'identity' | 'wallet';
  tier_required?: string;
  created_at?: string;
}

export const CredentialVault: React.FC = () => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
  const [activeTab, setActiveTab] = useState<'credentials' | 'identities'>('identities');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch credentials, profile, and context DIDs in parallel
        const [historyRes, profileRes, contextDidsRes] = await Promise.all([
          apiService.getVerificationHistory(),
          apiService.getUserProfile().catch(() => null),
          apiService.getContextDIDs().catch(() => ({ context_dids: [] }))
        ]);

        if (profileRes) {
          setUserProfile(profileRes);

          // Build identities array
          const identitiesList: Identity[] = [];

          // Add Master Identity if DID exists
          if ((profileRes as any).did_address) {
            const cnsName = (profileRes as any).cns_name;
            identitiesList.push({
              id: 'master',
              type: 'master',
              name: cnsName ? `${cnsName}.cid` : 'Master Identity',
              did: (profileRes as any).did_address,
              createdAt: (profileRes as any).created_at || new Date().toISOString(),
              color: 'from-primary to-[#6D36D6]',
              icon: 'shield_person'
            });
          }

          // Add Context DIDs (Personas)
          const contextDids: ContextDID[] = contextDidsRes?.context_dids || [];
          contextDids.forEach((ctx) => {
            const contextColors: Record<string, string> = {
              professional: 'from-blue-500 to-blue-700',
              gaming: 'from-orange-500 to-orange-700',
              financial: 'from-green-500 to-green-700',
              social: 'from-pink-500 to-pink-700',
            };
            const contextIcons: Record<string, string> = {
              professional: 'business_center',
              gaming: 'sports_esports',
              financial: 'account_balance_wallet',
              social: 'group',
            };
            const cnsName = (profileRes as any).cns_name;
            const humanId = (profileRes as any).human_id;
            const displayAlias = ctx.alias || ctx.context;
            const nameRoot = cnsName ? `${cnsName}.cid` : (humanId || null);
            identitiesList.push({
              id: ctx.did,
              type: 'persona',
              name: nameRoot ? `${displayAlias}.${nameRoot}` : displayAlias,
              context: ctx.context,
              did: ctx.did,
              createdAt: ctx.created_at || new Date().toISOString(),
              color: contextColors[ctx.context] || 'from-gray-500 to-gray-700',
              icon: contextIcons[ctx.context] || 'person'
            });
          });

          setIdentities(identitiesList);
        }

        if (historyRes.success && historyRes.history) {
          const { credentials: creds } = historyRes.history;

          // Map backend credentials to display format
          const mappedCredentials: Credential[] = creds.map((cred: any, index: number) => ({
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
          }));

          setCredentials(mappedCredentials);
        } else {
          setCredentials([]);
        }
      } catch (err: any) {
        console.error('❌ [CredentialVault] Failed to fetch data:', err);
        setError(err.message || 'Failed to load credentials');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Refetch when user changes (e.g., after refreshUser())

  // Helper functions for tier display
  const getTierType = (tier: string): 'Basic ID' | 'Verified ID' | 'Full KYC' => {
    if (tier === 'layer_1') return 'Basic ID';
    if (tier === 'layer_2') return 'Verified ID';
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
      case 'Full KYC': return 'from-primary to-[#6D36D6]';
      case 'Verified ID': return 'from-[#D4AF37] to-[#996515]';
      case 'Basic ID': return 'from-blue-500 to-blue-700';
      default: return 'from-gray-500 to-gray-700';
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

  const getIdentityUrl = (identity: Identity): string => {
    const baseUrl = window.location.origin;
    if (identity.type === 'master') {
      const cnsName = (userProfile as any)?.cns_name;
      return cnsName ? `${baseUrl}/${cnsName}.cid` : `${baseUrl}/profile/${(userProfile as any)?.wallet}`;
    } else {
      // Prefer subdomain format: alias.name (strip .cid from identity.name if present)
      // identity.name is already e.g. "gig.vawa-bitu-sabo.cid" or "gig.premiumname.cid"
      const subdomainSlug = identity.name.replace(/\.cid$/, '');
      return `${baseUrl}/did/${subdomainSlug}`;
    }
  };

  const handleCopyUrl = (identity: Identity) => {
    const url = getIdentityUrl(identity);
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-text-main tracking-tight">Credential Vault</h1>
            <p className="text-text-sub text-lg font-medium">Your verifiable credentials and digital identities.</p>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-text-sub font-medium">Loading your vault...</p>
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
            <p className="text-text-sub text-lg font-medium">Your verifiable credentials and digital identities.</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            <h3 className="text-lg font-bold text-red-900">Error Loading Vault</h3>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-text-main tracking-tight">Credential Vault</h1>
          <p className="text-text-sub text-lg font-medium">Your verifiable credentials and digital identities.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('identities')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'identities'
            ? 'bg-white text-primary shadow-sm'
            : 'text-text-sub hover:text-text-main'
            }`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">badge</span>
            Identities ({identities.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'credentials'
            ? 'bg-white text-primary shadow-sm'
            : 'text-text-sub hover:text-text-main'
            }`}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Verification Badges ({credentials.length})
          </span>
        </button>
      </div>

      {/* Identities Tab */}
      {activeTab === 'identities' && (
        <div className="space-y-6">
          {identities.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-[32px] p-12 text-center">
              <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-text-sub">person_off</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">No Identities Yet</h3>
              <p className="text-text-sub font-medium max-w-md mx-auto mb-6">
                Create your Master DID and Personas from the DID Management page to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {identities.map((identity) => (
                <div key={identity.id} className="group relative">
                  {/* Identity Card */}
                  <div className={`aspect-[1.58/1] rounded-[32px] bg-gradient-to-br ${identity.color} p-8 flex flex-col justify-between text-white shadow-xl group-hover:scale-[1.02] transition-all duration-500 overflow-hidden border border-white/20`}>
                    {/* Card Effects */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                    <div className="absolute -top-20 -right-20 size-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>

                    <div className="relative z-10 flex justify-between items-start">
                      <div className="size-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-3xl text-white drop-shadow-sm">{identity.icon}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest">
                        {identity.type === 'master' ? 'Root Identity' : identity.context}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-2xl font-black tracking-tight mb-1">{identity.name}</h3>
                      <p className="text-sm font-bold opacity-70 font-mono truncate">{identity.did.slice(0, 20)}...{identity.did.slice(-8)}</p>
                    </div>

                    <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4 mt-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase opacity-50">Status</p>
                        <div className="flex items-center gap-1.5">
                          <div className="size-2 rounded-full bg-green-400 animate-pulse"></div>
                          <p className="text-xs font-bold">Active</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase opacity-50">Created</p>
                        <p className="text-xs font-bold">
                          {new Date(identity.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-[32px] backdrop-blur-[2px]">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedIdentity(identity);
                          setShowQRModal(true);
                        }}
                        className="size-12 rounded-full bg-white text-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                        title="Show QR Code"
                      >
                        <span className="material-symbols-outlined">qr_code</span>
                      </button>
                      <button
                        onClick={() => handleCopyUrl(identity)}
                        className="size-12 rounded-full bg-white text-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                        title="Copy Share Link"
                      >
                        <span className="material-symbols-outlined">share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
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
                  {/* Credential Card */}
                  <div className={`aspect-[1.58/1] rounded-[32px] bg-gradient-to-br ${vc.color} p-8 flex flex-col justify-between text-white shadow-xl group-hover:scale-[1.02] transition-all duration-500 overflow-hidden border border-white/20`}>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                    <div className="absolute -top-20 -right-20 size-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>

                    <div className="relative z-10 flex justify-between items-start">
                      <div className="size-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-3xl text-white drop-shadow-sm">{vc.icon}</span>
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
                        onClick={() => {
                          setSelectedCredential(vc);
                          setShowQRModal(true);
                        }}
                        className="size-12 rounded-full bg-white text-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                        title="Show QR Code"
                      >
                        <span className="material-symbols-outlined">qr_code</span>
                      </button>
                      <button
                        onClick={() => {
                          const identifier = userProfile?.cns_name ? `${userProfile.cns_name}.cid` : (userProfile as any)?.wallet;
                          const link = `${window.location.origin}/verify/${vc.id}?as=${identifier}`;
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
      )}

      {/* QR Code Modal - for credentials */}
      {selectedCredential && (
        <CredentialQRModal
          isOpen={showQRModal && !!selectedCredential}
          onClose={() => {
            setShowQRModal(false);
            setSelectedCredential(null);
          }}
          credential={selectedCredential}
          verificationUrl={`${window.location.origin}/verify/${selectedCredential.id}?as=${userProfile?.cns_name ? `${userProfile.cns_name}.cid` : (userProfile as any)?.wallet}`}
        />
      )}

      {/* QR Code Modal - for identities */}
      {selectedIdentity && (
        <CredentialQRModal
          isOpen={showQRModal && !!selectedIdentity}
          onClose={() => {
            setShowQRModal(false);
            setSelectedIdentity(null);
          }}
          credential={{
            id: selectedIdentity.id,
            type: selectedIdentity.type === 'master'
              ? 'Root Identity'
              : selectedIdentity.context
                ? `${selectedIdentity.context.charAt(0).toUpperCase()}${selectedIdentity.context.slice(1)}`
                : 'Persona',
            title: selectedIdentity.name,
            issuer: 'CasperID',
            status: 'Active',
            date: new Date(selectedIdentity.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            }),
            color: selectedIdentity.color,
            icon: selectedIdentity.icon
          }}
          verificationUrl={getIdentityUrl(selectedIdentity)}
        />
      )}
    </div>
  );
};
