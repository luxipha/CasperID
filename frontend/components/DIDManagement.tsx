
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface DIDManagementProps {
  onCreateNew: () => void;
  onManageDID: (id: string) => void;
  onExportKeys?: () => void;
  onImportDID?: () => void;
}

interface UserData {
  did_address?: string;
  wallet?: string;
  tier?: string;
  account_created_at?: string;
  passkey_count?: number;
}

export const DIDManagement: React.FC<DIDManagementProps> = ({ onCreateNew, onManageDID, onExportKeys, onImportDID }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profile = await apiService.getUserProfile();
        console.log('📋 User profile for DID Management:', profile);
        setUserData(profile as any);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

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
              onClick={onImportDID}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-text-main hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">upload</span>
              Import DID
            </button>
            <button
              onClick={onCreateNew}
              disabled={!!userData?.did_address}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 ${userData?.did_address
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{userData?.did_address ? 'check_circle' : 'add_circle'}</span>
              {userData?.did_address ? 'DID Already Created' : 'Create New DID'}
            </button>
          </div>
          {userData?.did_address && (
            <p className="text-xs text-text-sub font-medium text-right max-w-xs">
              You can only have one DID per account. Use Export to backup your existing DID.
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Identifiers */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft flex flex-col justify-between relative overflow-hidden h-[200px]">
          <div className="relative z-10">
            <p className="text-[11px] font-extrabold text-text-sub uppercase tracking-widest mb-4">Active Identifiers</p>
            <div className="flex items-baseline gap-3">
              <span className="text-[44px] font-black text-text-main leading-none tracking-tighter">
                {userData?.did_address ? '1' : '0'}
              </span>
              {userData?.did_address ? (
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

        {/* Backup & Security (Dark Card) */}
        <div className="bg-[#1A1A2E] p-8 rounded-[32px] shadow-xl text-white flex flex-col justify-between relative overflow-hidden h-[200px]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Backup & Security</p>
              <span className="material-symbols-outlined text-secondary text-xl icon-filled">verified</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Export Keys</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[200px]">
              Securely export your DID documents and private keys for backup.
            </p>
          </div>
          <button
            onClick={onExportKeys}
            className="relative z-10 w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition-all border border-white/5"
          >
            Start Export Process
          </button>
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
                  onClick={() => onManageDID(userData.did_address!)}
                  className="hover:bg-gray-50/40 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono font-bold text-text-main">{formatDID(userData.did_address)}</span>
                      <span className="text-[10px] text-text-sub font-medium">Controller: Self</span>
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
              ) : (
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
            Showing <span className="text-text-main">{userData?.did_address ? '1' : '0'}</span> of <span className="text-text-main">{userData?.did_address ? '1' : '0'}</span> DIDs
          </p>
        </div>
      </section>
    </div>
  );
};
