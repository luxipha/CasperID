
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DIDManagementProps {
  onCreateNew: () => void;
  onManageDID: (name?: string) => void;
  onExportKeys?: () => void;
  onImportDID?: () => void;
  onConfigureIdentity?: () => void;
}

interface UserData {
  did_address?: string;
  wallet?: string;
  tier?: string;
  account_created_at?: string;
  passkey_count?: number;
  cns_name?: string;
  human_id?: string;
}

interface ContextDID {
  did: string;
  alias: string;
  context: string;
  routing_type?: 'identity' | 'wallet';
  target_wallet?: string;
  tier_required?: string;
  created_at?: string;
}

export const DIDManagement: React.FC<DIDManagementProps> = ({ onCreateNew, onManageDID, onExportKeys, onImportDID, onConfigureIdentity }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [contextDIDs, setContextDIDs] = useState<ContextDID[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // getUserProfile() already includes context_dids, no need for separate call
        const profile = await apiService.getUserProfile();
        setUserData(profile as any);
        setContextDIDs((profile as any).context_dids || []);
      } catch (error) {
        console.error('Failed to fetch DID data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]); // Refetch when user changes (e.g., after refreshUser())

  const handleMintDID = async () => {
    try {
      const result = await apiService.mintDID();
      if ((result as any).success) {
        alert(`DID minted successfully: ${(result as any).did}`);
        // Refresh data
        const profile = await apiService.getUserProfile();
        setUserData(profile as any);
      }
    } catch (error: any) {
      alert('Failed to mint DID: ' + (error.message || 'Unknown error'));
    }
  };

  // Format DID for display (truncate middle)
  const formatDID = (did?: string) => {
    if (!did) return 'Not created';
    if (did.length <= 20) return did;
    return `${did.slice(0, 15)}...${did.slice(-8)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get display name for Primary Identity
  const getPrimaryIdentityName = () => {
    if (userData?.cns_name) return userData.cns_name;
    if (userData?.human_id) return userData.human_id;
    return 'No identity set';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-text-sub font-medium">Loading DID information...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">DID Management</h1>
          <p className="text-text-sub text-base font-medium">Manage your Decentralized Identifiers, keys, and control delegation.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-3">
            <button
              onClick={onExportKeys}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-text-main hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export Keys
            </button>
            <button
              onClick={onImportDID}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-text-main hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">upload</span>
              Import DID
            </button>
            <button
              onClick={onCreateNew}
              disabled={userData?.tier === 'layer_1'}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 ${userData?.tier === 'layer_1'
                ? 'bg-gray-100 text-text-sub/40 border border-gray-100 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                }`}
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Create Persona
            </button>
          </div>
          <p className="text-xs text-text-sub font-medium text-right max-w-xs">
            Create contextual personas for different aspects of your identity (work, gaming, social).
          </p>
          {userData?.tier === 'layer_1' && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3 max-w-sm ml-auto animate-in fade-in slide-in-from-top-2 duration-500">
              <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">verified_user</span>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Verification Required</p>
                <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                  Layer 2 Verification is required to unlock Personas. Upgrade your profile to start creating contextual identities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Identity Card */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col justify-between relative overflow-hidden h-[200px]">
          <div className="relative z-10">
            <p className="text-[11px] font-extrabold text-text-sub uppercase tracking-widest mb-3">Primary Identity</p>
            <h3 className="text-xl font-black text-text-main tracking-tight mb-3">{getPrimaryIdentityName()}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary"></span>
                Root Identity
              </span>
              <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-600 text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Active
              </span>
            </div>
          </div>
          <button
            onClick={onConfigureIdentity}
            className="relative z-10 text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
          >
            Configure <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-5">
            <span className="material-symbols-outlined text-[80px] text-primary">public</span>
          </div>
        </div>

        {/* Active Identifiers */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col justify-between relative overflow-hidden h-[200px]">
          <div className="relative z-10">
            <p className="text-[11px] font-extrabold text-text-sub uppercase tracking-widest mb-4">Active Identifiers</p>
            <div className="flex items-baseline gap-3">
              <span className="text-[44px] font-black text-text-main leading-none tracking-tighter">
                {(userData?.did_address ? 1 : 0) + contextDIDs.length}
              </span>
              {(userData?.did_address || contextDIDs.length > 0) ? (
                <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-600 text-[10px] font-bold">Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[10px] font-bold">None</span>
              )}
            </div>
          </div>
          {!userData?.did_address && (
            <button
              onClick={handleMintDID}
              className="relative z-10 text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
            >
              Create DID <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-5">
            <img src="/logos/logo.svg" alt="CasperID" className="w-24 h-24" />
          </div>
        </div>

        {/* Verification Methods */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col justify-between h-[200px]">
          <div>
            <p className="text-[11px] font-extrabold text-text-sub uppercase tracking-widest mb-4">Verification Methods</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-[44px] font-black text-text-main leading-none tracking-tighter">
                {userData?.passkey_count || 0}
              </span>
              <span className="text-xs text-text-sub font-bold">
                Passkey{(userData?.passkey_count || 0) !== 1 ? 's' : ''} registered
              </span>
            </div>
            <p className="text-xs text-text-sub">
              {userData?.passkey_count ?
                `Your ${userData.passkey_count === 1 ? 'passkey device is' : 'passkey devices are'} active and ready for authentication.` :
                'No passkeys registered yet.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Your DIDs Table Section */}
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-text-main tracking-tight">Your DIDs</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="material-symbols-outlined text-text-sub">filter_list</span>
            <div className="relative flex-1 sm:flex-none">
              <select className="appearance-none h-11 pl-4 pr-10 rounded-xl bg-gray-50 border-none text-sm font-bold text-text-main cursor-pointer focus:ring-2 focus:ring-primary/10">
                <option>All Methods</option>
                <option>did:casper</option>
                <option>did:key</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub text-lg">expand_more</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest">Identifier (DID)</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest">Method</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest">Created</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userData?.did_address ? (
                <tr
                  onClick={() => onManageDID(getPrimaryIdentityName())}
                  className="hover:bg-gray-50/40 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-text-main">{getPrimaryIdentityName()}</span>
                      <span className="text-[11px] font-mono font-medium text-text-sub">{formatDID(userData.did_address)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/10">
                      did:casper
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-text-main">{formatDate(userData.account_created_at)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500"></span>
                      <span className="text-sm font-bold text-text-main">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-text-sub group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">manage_accounts</span>
                    </button>
                  </td>
                </tr>
              ) : null}
              {/* Context DIDs (Personas) */}
              {contextDIDs.map((ctx) => (
                <tr
                  key={ctx.did}
                  onClick={() => onManageDID(`${ctx.alias || ctx.context}.${getPrimaryIdentityName()}`)}
                  className="hover:bg-gray-50/40 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-text-main">{ctx.alias || ctx.context}.{getPrimaryIdentityName()}</span>
                      <span className="text-[11px] font-mono font-medium text-text-sub">{formatDID(ctx.did)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {ctx.context}
                      </span>
                      {ctx.routing_type === 'wallet' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold">
                          Wallet
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-text-main">{formatDate(ctx.created_at)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500"></span>
                      <span className="text-sm font-bold text-text-main">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-text-sub group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">manage_accounts</span>
                    </button>
                  </td>
                </tr>
              ))}
              {/* Empty state */}
              {!userData?.did_address && contextDIDs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-text-sub">fingerprint</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-text-main">No DID Created Yet</h3>
                        <p className="text-sm text-text-sub max-w-md">
                          Create your decentralized identifier to start using blockchain-based identity verification.
                        </p>
                      </div>
                      <button
                        onClick={handleMintDID}
                        className="mt-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        Create Your DID
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm font-bold text-text-sub">
            Showing <span className="text-text-main">{(userData?.did_address ? 1 : 0) + contextDIDs.length}</span> of <span className="text-text-main">{(userData?.did_address ? 1 : 0) + contextDIDs.length}</span> DIDs
          </p>
        </div>
      </section>
    </div>
  );
};
