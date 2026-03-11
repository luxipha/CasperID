
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ViewDIDProps {
  onBack: () => void;
}

export const ManageDID: React.FC<ViewDIDProps> = ({ onBack }) => {
  // Use AuthContext instead of fetching profile data again
  const { user, isLoading: loading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Map auth user to the expected format
  const userData = user ? {
    did_address: user.did_address,
    wallet: user.wallet,
    email: user.email,
    tier: user.tier,
    created_at: user.created_at,
    metamask_connected: user.metamask_connected,
    metamask_address: user.metamask_address
  } : null;

  const handleCopyDID = () => {
    if (userData?.did_address) {
      navigator.clipboard.writeText(userData.did_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateDID = (did?: string) => {
    if (!did) return '';
    if (did.length <= 30) return did;
    return `${did.slice(0, 22)}...${did.slice(-6)}`;
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
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-[13px] font-bold text-text-sub">
          <button
            onClick={onBack}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            DID Management
          </button>
          <span className="material-symbols-outlined text-[18px] opacity-40">chevron_right</span>
          <span className="text-text-main">View DID Details</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-[36px] font-black text-text-main tracking-tight leading-none">Your Decentralized ID</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black border border-green-100 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Active
              </span>
            </div>
            <div className="flex items-center gap-3 w-fit px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <span className="text-sm font-mono font-medium text-text-sub">
                {truncateDID(userData?.did_address) || 'No DID created'}
              </span>
              {userData?.did_address && (
                <button
                  onClick={handleCopyDID}
                  className="text-text-sub hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DID Information Section */}
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/10">
          <h2 className="text-sm font-black text-text-main uppercase tracking-widest">DID Information</h2>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
          <div>
            <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">DID Identifier</p>
            <p className="text-[17px] font-mono font-bold text-text-main break-all">
              {truncateDID(userData?.did_address) || 'Not created'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">DID Method</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">did:casper</span>
              <span className="text-[13px] text-text-sub font-medium">(On-Chain)</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Associated Wallet</p>
            <p className="text-[17px] font-mono font-bold text-text-main break-all">
              {userData?.wallet || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Account Created</p>
            <p className="text-[17px] font-bold text-text-main">
              {formatDate(userData?.created_at)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Verification Level</p>
            <div className="flex items-center gap-2">
              {userData?.tier === 'layer_3' && (
                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-black border border-green-200">
                  Layer 3 - Fully Verified
                </span>
              )}
              {userData?.tier === 'layer_2' && (
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black border border-blue-200">
                  Layer 2 - Liveness Verified
                </span>
              )}
              {userData?.tier === 'layer_1' && (
                <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[11px] font-black border border-yellow-200">
                  Layer 1 - Email Verified
                </span>
              )}
              {!userData?.tier && (
                <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-[11px] font-black border border-gray-200">
                  Not Verified
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Recovery Email</p>
            <p className="text-[17px] font-bold text-text-main">
              {userData?.email || 'Not set'}
            </p>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">fingerprint</span>
            <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Authentication Method</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-5 p-6 rounded-[24px] border border-gray-100 bg-gray-50/30">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[32px] icon-filled">fingerprint</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-[15px] font-bold text-text-main">Passkey Authentication</h4>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest">Active</span>
              </div>
              <p className="text-[13px] text-text-sub font-medium">Your DID is secured with passkey authentication (biometric or device security)</p>
            </div>
          </div>

          {userData?.metamask_connected && (
            <div className="flex items-center gap-5 p-6 rounded-[24px] border border-gray-100 bg-gray-50/30 mt-4">
              <div className="size-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_v7.8.0_Icon.png" className="w-10 h-10" alt="MetaMask" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[15px] font-bold text-text-main">MetaMask Connected</h4>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest">Linked</span>
                </div>
                <p className="text-[13px] text-text-sub font-medium font-mono">{userData.metamask_address || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Box */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-[24px] p-6 flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-600 text-[24px] mt-0.5">info</span>
        <div className="flex-1">
          <h4 className="text-[15px] font-bold text-blue-900 mb-1">Read-Only View</h4>
          <p className="text-[13px] text-blue-800 font-medium leading-relaxed">
            Your DID is automatically created and managed by CasperID. You can export it for backup purposes, but direct editing is not supported.
            This ensures the integrity and security of your decentralized identity.
          </p>
        </div>
      </div>

      {/* Page Footer Buttons */}
      <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button
          onClick={onBack}
          className="text-[15px] font-bold text-text-sub hover:text-text-main transition-colors px-4 text-center order-2 md:order-1"
        >
          Back to DID Management
        </button>
        <div className="flex gap-3 order-1 md:order-2">
          <button
            onClick={handleCopyDID}
            className="flex-1 md:flex-none h-[60px] px-8 bg-white border-2 border-gray-200 text-text-main hover:bg-gray-50 rounded-[20px] font-black text-[15px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copied!' : 'Copy DID'}
          </button>
        </div>
      </div>
    </div>
  );
};
