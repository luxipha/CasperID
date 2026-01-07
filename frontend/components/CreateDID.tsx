
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CreateDIDProps {
  onBack: () => void;
  onViewDetails?: (id: string) => void;
}

export const CreateDID: React.FC<CreateDIDProps> = ({ onBack, onViewDetails }) => {
  const { user, isAuthenticated } = useAuth();
  const [method, setMethod] = useState<'casper' | 'key'>('casper');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [usePasskey, setUsePasskey] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [didName, setDidName] = useState('');

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      setError(null);

      if (!isAuthenticated || !user) {
        throw new Error('You must be authenticated to create a DID');
      }

      // For now, we'll show success immediately since the user already has a DID
      // In the future, this could create additional DIDs or sub-identities
      console.log('Creating DID:', {
        method,
        didName,
        usePasskey,
        userId: user.user_id,
        walletAddress: user.wallet
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (error: any) {
      console.error('DID creation failed:', error);
      setError(error.message || 'Failed to create DID');
    } finally {
      setIsCreating(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full flex items-center justify-center py-12 animate-in zoom-in-95 fade-in duration-500">
        <div className="w-full max-w-[600px] bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(134,82,226,0.15)] border border-gray-100 p-12 flex flex-col items-center text-center">

          {/* Success Icon */}
          <div className="size-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-8">
            <div className="size-12 rounded-full bg-green-500 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[32px] font-bold">check</span>
            </div>
          </div>

          <h2 className="text-[32px] font-black text-text-main mb-4 tracking-tight leading-none">DID Created Successfully!</h2>
          <p className="text-text-sub text-[15px] font-medium leading-relaxed max-w-sm mb-10">
            You can now use this DID to authenticate, sign, and receive verifiable credentials across the network.
          </p>

          {/* Info Box */}
          <div className="w-full bg-[#F8F9FB] rounded-[24px] border border-gray-100 p-8 space-y-6 mb-10">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-text-sub opacity-70">DID Method</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] icon-filled">hub</span>
                <span className="text-[14px] font-black text-text-main">did:casper</span>
              </div>
            </div>

            <div className="h-px bg-gray-200/50"></div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-text-sub opacity-70">DID Identifier</span>
              <div className="flex items-center gap-2 h-10 px-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                <span className="text-[13px] font-mono font-medium text-text-sub">
                  {user?.wallet ? `did:casper:${user.wallet.slice(-6)}` : 'did:casper:73a...9f2'}
                </span>
                <button
                  onClick={() => {
                    if (user?.wallet) {
                      navigator.clipboard.writeText(`did:casper:${user.wallet}`);
                    }
                  }}
                  className="text-text-sub hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-200/50"></div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-text-sub opacity-70">Purpose</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-text-sub text-[20px]">badge</span>
                <span className="text-[14px] font-black text-text-main">Personal Identity</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <button
              onClick={onBack}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-[18px] font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              Go to DID Management
            </button>
            <button
              onClick={() => onViewDetails?.('did:casper:73a...9f2')}
              className="w-full h-14 bg-white border border-gray-200 text-text-main hover:bg-gray-50 rounded-[18px] font-black text-sm flex items-center justify-center gap-3 shadow-sm transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              View New DID Details
            </button>
          </div>
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
          <span className="text-text-main">Create New DID</span>
        </nav>

        <div className="space-y-2">
          <h1 className="text-[36px] font-black text-text-main tracking-tight leading-none">Create Your New DID</h1>
          <p className="text-text-sub text-[15px] font-medium max-w-2xl leading-relaxed">
            Generate a new Decentralized Identifier for a specific purpose or persona.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">

        {/* Section 1: Method Selection */}
        <div className="p-10 border-b border-gray-100">
          <h2 className="text-lg font-bold text-text-main mb-6">Select DID Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* did:casper card */}
            <label
              onClick={() => setMethod('casper')}
              className={`relative flex p-7 rounded-[28px] border-2 transition-all cursor-pointer group ${method === 'casper'
                ? 'border-primary bg-primary/[0.01]'
                : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
            >
              <div className="flex flex-col gap-5 w-full">
                <div className="flex justify-between items-start">
                  <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${method === 'casper' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-text-sub'
                    }`}>
                    <span className="material-symbols-outlined text-[28px] icon-filled">deployed_code</span>
                  </div>
                  <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${method === 'casper' ? 'border-primary' : 'border-gray-200'
                    }`}>
                    {method === 'casper' && <div className="size-3.5 rounded-full bg-primary"></div>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-[17px] font-black text-text-main">did:casper</h3>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">Recommended</span>
                  </div>
                  <p className="text-[13px] text-text-sub font-medium leading-relaxed">
                    Best for persistent identities with full update and recovery capabilities on the Casper network.
                  </p>
                </div>
              </div>
            </label>

            {/* did:key card */}
            <label
              onClick={() => setMethod('key')}
              className={`relative flex p-7 rounded-[28px] border-2 transition-all cursor-pointer group ${method === 'key'
                ? 'border-primary bg-primary/[0.01]'
                : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
            >
              <div className="flex flex-col gap-5 w-full">
                <div className="flex justify-between items-start">
                  <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${method === 'key' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-text-sub'
                    }`}>
                    <span className="material-symbols-outlined text-[28px]">vpn_key</span>
                  </div>
                  <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${method === 'key' ? 'border-primary' : 'border-gray-200'
                    }`}>
                    {method === 'key' && <div className="size-3.5 rounded-full bg-primary"></div>}
                  </div>
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-text-main mb-1.5">did:key</h3>
                  <p className="text-[13px] text-text-sub font-medium leading-relaxed">
                    Lightweight, key-based identifier. Ideal for temporary interactions. Cannot be updated.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Information Input */}
        <div className="p-10 border-b border-gray-100">
          <h2 className="text-lg font-bold text-text-main mb-6">DID Information</h2>
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-bold text-text-main flex items-center gap-1.5">
                DID Name / Purpose <span className="text-text-sub font-medium">(Optional)</span>
              </label>
              <input
                type="text"
                value={didName}
                onChange={(e) => setDidName(e.target.value)}
                className="w-full h-[58px] px-6 rounded-2xl bg-white border border-gray-100 text-[15px] font-medium text-text-main placeholder:text-text-sub/40 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                placeholder="e.g. Personal Blog Identity, Gaming Profile"
                disabled={isCreating}
              />
              <p className="text-[12px] text-text-sub font-medium opacity-80">
                This is stored locally to help you identify this DID later.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Advanced Security Settings Accordion */}
        <div
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="p-8 group cursor-pointer hover:bg-gray-50/50 transition-all border-b border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="size-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]">shield</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-text-main">Advanced Security Settings</h3>
                <p className="text-[13px] text-text-sub font-medium">Configure control keys and recovery options</p>
              </div>
            </div>
            <span className={`material-symbols-outlined text-text-sub group-hover:text-primary transition-all duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </div>
        </div>

        {/* Advanced Content Panel */}
        {isAdvancedOpen && (
          <div className="p-10 space-y-10 animate-in slide-in-from-top-4 duration-300 bg-gray-50/10">
            {/* Assign Control Keys Subsection */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-bold text-text-main mb-1">Assign Control Keys</h3>
                <p className="text-[13px] text-text-sub font-medium leading-relaxed">
                  Select how this DID will be controlled. You can add multiple keys for enhanced security or delegated control.
                </p>
              </div>

              {/* Primary Passkey Option */}
              <div className="p-6 rounded-[24px] border border-primary/20 bg-primary/[0.02] flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="size-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[32px] icon-filled">fingerprint</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[15px] font-bold text-text-main leading-none">Use My Primary Passkey</h4>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest leading-none">Recommended</span>
                    </div>
                    <p className="text-[13px] text-text-sub font-medium max-w-lg leading-relaxed">
                      Control this DID with the Passkey associated with your CasperID. Secure and convenient.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={usePasskey}
                    onChange={() => setUsePasskey(!usePasskey)}
                  />
                  <div className="w-12 h-6.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[22px] after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Grid of other key options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* External Wallet */}
                <div className="p-6 rounded-[24px] border border-gray-100 bg-white flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-gray-50 flex items-center justify-center text-text-sub">
                      <span className="material-symbols-outlined text-[24px]">wallet</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[15px] font-bold text-text-main">Add External Wallet Key</h4>
                      <p className="text-[12px] text-text-sub font-medium leading-relaxed">
                        Connect a MetaMask or other Web3 wallet to control this DID.
                      </p>
                    </div>
                  </div>
                  <button className="w-full h-11 rounded-xl border border-gray-100 flex items-center justify-center gap-2 text-sm font-bold text-text-main hover:bg-gray-50 transition-all">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                    Connect Wallet
                  </button>
                </div>

                {/* Generate New Key */}
                <div className="p-6 rounded-[24px] border border-gray-100 bg-white flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-gray-50 flex items-center justify-center text-text-sub">
                      <span className="material-symbols-outlined text-[24px]">vpn_key</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[15px] font-bold text-text-main">Generate New Key Pair</h4>
                      <p className="text-[12px] text-text-sub font-medium leading-relaxed">
                        Generate a new cryptographic key pair specifically for this DID. You will need to back up this key.
                      </p>
                    </div>
                  </div>
                  <button className="w-full h-11 rounded-xl border border-gray-100 flex items-center justify-center gap-2 text-sm font-bold text-text-main hover:bg-gray-50 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Generate Key
                  </button>
                </div>
              </div>

              {/* Status Info Box */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">info</span>
                <p className="text-[12px] text-blue-900 font-medium">
                  <span className="font-bold">1 key assigned:</span> Primary Passkey. Ensure you have access to at least one controller key at all times to avoid losing control of this DID.
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Recovery Option Subsection */}
            <div className="space-y-4">
              <h3 className="text-[15px] font-bold text-text-main">Recovery Option</h3>
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-sub/50 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                  </div>
                  <input
                    type="email"
                    className="w-full h-[58px] pl-14 pr-6 rounded-2xl bg-white border border-gray-100 text-[15px] font-medium text-text-main placeholder:text-text-sub/40 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                    placeholder="Link an email for recovery notifications"
                  />
                </div>
                <p className="text-[11px] text-text-sub font-medium opacity-70">
                  Optional. Used only for notification during key rotation events.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button
            onClick={onBack}
            disabled={isCreating}
            className="text-[15px] font-bold text-text-sub hover:text-text-main transition-colors px-4 text-center order-2 md:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <div className="flex flex-col md:flex-row items-center gap-8 order-1 md:order-2 w-full md:w-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            {!isAuthenticated && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-600 text-sm font-medium">
                Please authenticate first to create a DID
              </div>
            )}
            <p className="text-[12px] text-text-sub font-medium text-center md:text-right max-sm leading-relaxed max-w-[280px]">
              By creating a DID, you agree to the <a href="#" className="text-primary hover:underline font-bold">Terms of Service</a>.
            </p>
            <button
              onClick={handleCreate}
              disabled={isCreating || !isAuthenticated}
              className="w-full md:w-auto h-[60px] px-10 bg-primary hover:bg-primary/90 text-white rounded-[20px] font-black text-[15px] flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCreating ? (
                <>
                  Creating...
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </>
              ) : (
                <>
                  Create DID
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
