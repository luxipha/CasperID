
import React from 'react';

interface ContextOption {
  id: string;
  type: 'master' | 'persona';
  title: string;
  subtitle: string;
  badge?: string;
}

interface ConsentRequestProps {
  appName: string;
  appLogo?: string;
  requestedScopes?: string[];
  sharedFields?: string[];
  contextOptions?: ContextOption[];
  selectedContextId?: string;
  onSelectContext?: (contextId: string) => void;
  onApprove: () => void;
  onDeny: () => void;
  approveLabel?: string;
  denyLabel?: string;
}

const scopeDetails: Record<string, { title: string; description: string; icon: string }> = {
  'verify:identity': { title: 'Identity verification status', description: 'Whether your CasperID identity is verified', icon: 'verified' },
  'verify:age': { title: '18+ age confirmation', description: 'Whether your verified identity indicates you are 18 or older', icon: 'cake' },
  'verify:liveness': { title: 'Liveness verification', description: 'Whether you completed a liveness check', icon: 'face' },
  'verify:kyc': { title: 'KYC verification status', description: 'Your verification level, not your identity documents', icon: 'shield' },
  'read:profile': { title: 'Basic profile', description: 'Your CasperID display name', icon: 'badge' },
  'read:kyc_level': { title: 'Verification level', description: 'Your current CasperID tier', icon: 'workspace_premium' },
  'read:email': { title: 'Email address', description: 'Your verified account email', icon: 'mail' },
  'read:wallet': { title: 'Wallet address', description: 'Your public Casper wallet address', icon: 'account_balance_wallet' },
  'read:trust_capacity': {
    title: 'Mobility Trust Capacity',
    description: 'Provider and consumer scores, status, timestamp, and policy version. No trip history or written reviews.',
    icon: 'verified_user'
  },
};

const sharedFieldLabels: Record<string, string> = {
  name: 'Name',
  human_id: 'Human ID',
  email: 'Email',
  wallet: 'Wallet',
  over_18: '18+ Age Confirmation',
  tier: 'Verification Level',
  verified: 'Identity Verification Status',
  trust_capacity: 'Mobility Trust Capacity',
};

export const ConsentRequest: React.FC<ConsentRequestProps> = ({
  appName,
  appLogo,
  requestedScopes = ['verify:identity', 'read:profile', 'read:kyc_level'],
  sharedFields = [],
  contextOptions = [],
  selectedContextId = 'master',
  onSelectContext,
  onApprove,
  onDeny,
  approveLabel,
  denyLabel = 'Deny Access'
}) => {
  const selectedContext = contextOptions.find((option) => option.id === selectedContextId) || contextOptions[0];

  return (
    <div className="w-full max-w-[600px] mx-auto animate-in zoom-in-95 fade-in duration-500 py-4 md:py-8">
      <div className="bg-white rounded-[28px] md:rounded-[44px] border border-gray-100 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.15)] overflow-hidden">

        {/* Header Header */}
        <div className="px-5 py-7 md:p-10 text-center border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-center gap-3 md:gap-6 mb-5 md:mb-6">
            <div className="size-16 md:size-20 rounded-[22px] md:rounded-3xl bg-white shadow-xl flex items-center justify-center border border-gray-100 overflow-hidden p-2 md:p-3">
              {appLogo ? <img src={appLogo} className="w-full h-full object-contain" alt={appName} /> : <span className="material-symbols-outlined text-primary text-4xl">apps</span>}
            </div>
            <div className="size-6 md:size-8 text-text-sub">
              <span className="material-symbols-outlined text-[24px] md:text-[32px]">sync_alt</span>
            </div>
            <div className="size-16 md:size-20 rounded-[20px] md:rounded-[22px] bg-primary text-white shadow-xl flex items-center justify-center transform rotate-12">
              <img src="/logos/logo.png" alt="CasperID" className="w-8 h-8 md:w-10 md:h-10 -rotate-12 object-contain" />
            </div>
          </div>
          <h2 className="text-[30px] md:text-2xl font-black text-text-main tracking-tight leading-tight">
            Connect to <span className="text-primary">{appName}</span>?
          </h2>
          <p className="text-text-sub text-sm md:text-sm font-medium mt-2 max-w-sm mx-auto">
            This application is requesting access to your verified identity data.
          </p>
        </div>

        {/* Data Points List */}
        <div className="p-5 md:p-10 space-y-5 md:space-y-6">
          {contextOptions.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Share As</p>
              <div className="space-y-3">
                {contextOptions.map((option) => {
                  const isSelected = option.id === selectedContextId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSelectContext?.(option.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/[0.04] shadow-sm shadow-primary/10'
                          : 'border-gray-100 bg-white hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-[15px] font-bold text-text-main">{option.title}</h4>
                          <p className="mt-1 text-[11px] font-medium leading-relaxed text-text-sub">{option.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {option.badge && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-text-sub">
                              {option.badge}
                            </span>
                          )}
                          <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-gray-300'}`}>
                            {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedContext && (
                <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-primary/70">Selected identity</p>
                  <p className="mt-2 text-sm font-bold text-text-main">{selectedContext.title}</p>
                  <p className="mt-1 text-[12px] font-medium leading-relaxed text-text-sub">{selectedContext.subtitle}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Requested Permissions</p>

          <div className="space-y-3">
            {requestedScopes.map((scope) => {
              const detail = scopeDetails[scope] || { title: scope, description: 'Requested application permission', icon: 'key' };
              return (
                <div key={scope} className="flex items-center justify-between gap-3 p-4 md:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="size-10 md:size-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[22px] md:text-[24px]">{detail.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-bold text-text-main">{detail.title}</h4>
                      <p className="text-[11px] md:text-[11px] text-text-sub font-medium leading-relaxed">{detail.description}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary shrink-0">check_circle</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 md:p-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-text-sub opacity-60">What {appName} will receive</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sharedFields.length > 0 ? sharedFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full border border-primary/15 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary/80"
                >
                  {sharedFieldLabels[field] || field.replace(/_/g, ' ')}
                </span>
              )) : (
                <span className="text-[12px] font-medium text-text-sub">Only the verification result and approved access status.</span>
              )}
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 md:p-5 flex gap-3 md:gap-4">
            <span className="material-symbols-outlined text-blue-600 text-[22px] shrink-0">verified_user</span>
            <p className="text-[13px] text-blue-900 font-bold leading-relaxed">
              Privacy Shield Active. Your full legal document (Passport/NIN) will <span className="text-primary underline">never</span> be shared with the app.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-5 md:p-10 bg-gray-50/50 border-t border-gray-50 flex flex-col gap-3 md:gap-4">
          <button
            onClick={onApprove}
            className="w-full h-14 md:h-16 bg-primary text-white rounded-[18px] md:rounded-[22px] font-black text-base md:text-lg shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {approveLabel || `Continue to ${appName}`}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            onClick={onDeny}
            className="w-full h-11 md:h-12 text-text-sub hover:text-alerts font-bold text-sm"
          >
            {denyLabel}
          </button>
        </div>
      </div>

      <p className="mt-6 md:mt-8 text-center text-[10px] font-black text-text-sub uppercase tracking-[0.25em] md:tracking-[0.3em] opacity-40">
        Secured by Casper Encryption Standard (v2.0)
      </p>
    </div>
  );
};
