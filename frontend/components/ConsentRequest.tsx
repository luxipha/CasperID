
import React from 'react';

interface ConsentRequestProps {
  appName: string;
  appLogo?: string;
  requestedScopes?: string[];
  onApprove: () => void;
  onDeny: () => void;
}

const scopeDetails: Record<string, { title: string; description: string; icon: string }> = {
  'verify:identity': { title: 'Identity verification status', description: 'Whether your CasperID identity is verified', icon: 'verified' },
  'verify:liveness': { title: 'Liveness verification', description: 'Whether you completed a liveness check', icon: 'face' },
  'verify:kyc': { title: 'KYC verification status', description: 'Your verification level, not your identity documents', icon: 'shield' },
  'read:profile': { title: 'Basic profile', description: 'Your CasperID display name', icon: 'badge' },
  'read:kyc_level': { title: 'Verification level', description: 'Your current CasperID tier', icon: 'workspace_premium' },
  'read:email': { title: 'Email address', description: 'Your verified account email', icon: 'mail' },
  'read:wallet': { title: 'Wallet address', description: 'Your public Casper wallet address', icon: 'account_balance_wallet' },
};

export const ConsentRequest: React.FC<ConsentRequestProps> = ({
  appName,
  appLogo,
  requestedScopes = ['verify:identity', 'read:profile', 'read:kyc_level'],
  onApprove,
  onDeny
}) => {
  return (
    <div className="w-full max-w-[600px] mx-auto animate-in zoom-in-95 fade-in duration-500 py-8">
      <div className="bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden">

        {/* Header Header */}
        <div className="p-10 text-center border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="size-20 rounded-3xl bg-white shadow-xl flex items-center justify-center border border-gray-100 overflow-hidden p-3">
              {appLogo ? <img src={appLogo} className="w-full h-full object-contain" alt={appName} /> : <span className="material-symbols-outlined text-primary text-4xl">apps</span>}
            </div>
            <div className="size-8 text-text-sub">
              <span className="material-symbols-outlined text-[32px]">sync_alt</span>
            </div>
            <div className="size-20 rounded-[22px] bg-primary text-white shadow-xl flex items-center justify-center transform rotate-12">
              <img src="/logos/logo.png" alt="CasperID" className="w-10 h-10 -rotate-12 object-contain" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">
            Connect to <span className="text-primary">{appName}</span>?
          </h2>
          <p className="text-text-sub text-sm font-medium mt-2 max-w-sm mx-auto">
            This application is requesting access to your verified identity data.
          </p>
        </div>

        {/* Data Points List */}
        <div className="p-10 space-y-6">
          <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Requested Permissions</p>

          <div className="space-y-3">
            {requestedScopes.map((scope) => {
              const detail = scopeDetails[scope] || { title: scope, description: 'Requested application permission', icon: 'key' };
              return (
                <div key={scope} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[24px]">{detail.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-text-main">{detail.title}</h4>
                      <p className="text-[11px] text-text-sub font-medium">{detail.description}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">verified_user</span>
            <p className="text-[13px] text-blue-900 font-bold leading-relaxed">
              Privacy Shield Active. Your full legal document (Passport/NIN) will <span className="text-primary underline">never</span> be shared with the app.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex flex-col gap-4">
          <button
            onClick={onApprove}
            className="w-full h-16 bg-primary text-white rounded-[22px] font-black text-lg shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Approve Connection
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            onClick={onDeny}
            className="w-full h-12 text-text-sub hover:text-alerts font-bold text-sm"
          >
            Deny Access
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] font-black text-text-sub uppercase tracking-[0.3em] opacity-40">
        Secured by Casper Encryption Standard (v2.0)
      </p>
    </div>
  );
};
