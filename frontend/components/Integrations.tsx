
import React, { useState, useEffect } from 'react';
import { RevokeModal } from './RevokeModal';
import { apiService } from '../services/api';

// Helper to map backend actions to UI labels (Same as DataControls)
const PERMISSION_MAP: Record<string, { label: string; sub: string; icon: string; color: string; bg?: string; text?: string; border?: string }> = {
  'verify:identity': { label: 'Identity Profile', sub: 'Basic info', icon: 'account_circle', color: 'text-primary' },
  'verify:kyc': { label: 'KYC Status', sub: 'Verified Credential', icon: 'verified', color: 'text-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  'verify:liveness': { label: 'Liveness Check', sub: 'Biometric', icon: 'face', color: 'text-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  'spend:verification_fee': { label: 'Wallet Spend', sub: 'Fees', icon: 'account_balance_wallet', color: 'text-green-600', bg: 'bg-green-50', text: 'text-green-700' },
};

const getPermissionDetails = (action: string) => {
  return PERMISSION_MAP[action] || { label: action, sub: 'Custom', icon: 'security', color: 'text-gray-600' };
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const discoveryApps = [
  { name: 'Discord', category: 'Social & Community', icon: 'forum', color: 'bg-[#5865F2]' },
  { name: 'GitHub', category: 'Developer Tools', icon: 'code', color: 'bg-black' },
  { name: 'Aave', category: 'DeFi Lending', icon: 'currency_bitcoin', color: 'bg-gradient-to-tr from-[#B6509E] to-[#2EBAC6]' },
  { name: 'Lens Protocol', category: 'Social Graph', icon: 'camera', color: 'bg-[#8b5cf6]' },
];

export const Integrations: React.FC = () => {
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingApp, setRevokingApp] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserPermissions();
      const data = response.userPermissions || { permissions: [] };

      const mappedApps = data.permissions.map((grant: any) => ({
        grantId: grant.grantId,
        name: grant.dappName,
        type: 'Web3',
        lastActive: formatTimeAgo(grant.updatedAt || grant.createdAt),
        logo: grant.dappName.charAt(0),
        logoBg: 'bg-indigo-600', // Default brand color
        logoIsIcon: false,
        permissions: grant.permissions.map((p: any) => ({
          ...getPermissionDetails(p.action)
        }))
      }));

      setActiveConnections(mappedApps);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = (app: any) => {
    setRevokingApp(app);
  };

  const confirmRevoke = async () => {
    if (!revokingApp) return;
    try {
      await apiService.revokePermission(revokingApp.grantId, "User revoked via Integrations page");
      setRevokingApp(null);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to revoke:', error);
      alert('Failed to revoke access');
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em] text-text-main">Connected Applications</h1>
        <p className="text-text-sub text-base font-normal leading-relaxed">
          Manage who has access to your CasperID. Review permissions, track usage, and revoke access instantly.
          You are in control of your digital footprint.
        </p>
      </div>

      {/* Filter & Search Section - Visual Only for now */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="w-full lg:w-96 relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-text-sub group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input
            className="w-full h-12 rounded-xl bg-white border border-gray-200 pl-10 pr-4 text-text-main placeholder:text-text-sub/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-sm"
            placeholder="Search by app name or ID..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 w-full lg:w-auto">
          <button className="flex h-10 shrink-0 items-center justify-center px-5 rounded-lg bg-primary text-white text-sm font-semibold transition-all shadow-md shadow-primary/20">
            All Applications
          </button>
          <button className="flex h-10 shrink-0 items-center justify-center px-5 rounded-lg bg-white text-text-sub hover:text-primary hover:bg-gray-50 border border-gray-200 hover:border-primary/30 text-sm font-medium transition-all shadow-sm">
            Web2 Services
          </button>
          <button className="flex h-10 shrink-0 items-center justify-center px-5 rounded-lg bg-white text-text-sub hover:text-primary hover:bg-gray-50 border border-gray-200 hover:border-primary/30 text-sm font-medium transition-all shadow-sm">
            Web3 DApps
          </button>
          <button className="flex h-10 shrink-0 items-center justify-center px-5 rounded-lg bg-white text-text-sub hover:text-alerts hover:bg-red-50 border border-gray-200 hover:border-alerts/30 text-sm font-medium transition-all shadow-sm">
            Revoked
          </button>
        </div>
      </div>

      {/* Active Connections */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 rounded-md bg-primary/10">
            <span className="material-symbols-outlined text-primary text-[20px] icon-filled">link</span>
          </div>
          <h2 className="text-xl font-bold text-text-main">Active Connections</h2>
          <span className="bg-secondary/10 text-primary border border-secondary/20 text-xs font-extrabold px-2.5 py-1 rounded-full">{activeConnections.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : activeConnections.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-gray-100 p-12 text-center text-text-sub">
            <span className="material-symbols-outlined text-4xl mb-4">link_off</span>
            <p>No active integrations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeConnections.map((app, i) => (
              <div key={i} className="group flex flex-col p-6 rounded-[24px] bg-white border border-gray-100 hover:border-secondary/50 transition-all shadow-soft hover:shadow-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex gap-4 items-center">
                    <div className={`size-14 rounded-xl ${app.logoBg} flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-gray-50 overflow-hidden`}>
                      {app.logoIsIcon ? (
                        <span className="material-symbols-outlined !text-3xl">{app.logo}</span>
                      ) : (
                        app.logo
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-text-main">{app.name}</h3>
                        <span className={`flex items-center justify-center ${app.type === 'Web3' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-current opacity-50`}>
                          {app.type}
                        </span>
                      </div>
                      <p className="text-xs text-text-sub mt-1 font-medium">Last active: {app.lastActive}</p>
                    </div>
                  </div>
                  <div className="size-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(0,240,255,0.6)] animate-pulse"></div>
                </div>

                <div className="flex-1 relative z-10">
                  <p className="text-[10px] font-extrabold text-text-sub mb-3 uppercase tracking-widest">Permissions Granted</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {app.permissions.map((p: any, j: number) => (
                      <div key={j} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${p.bg || 'bg-gray-50'} ${p.text || 'text-text-sub'} text-xs font-semibold border ${p.border || 'border-gray-100'}`}>
                        <span className={`material-symbols-outlined text-[16px] ${p.color}`}>{p.icon}</span>
                        {p.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-5 border-t border-gray-100 relative z-10">
                  <button className="flex-1 h-10 rounded-xl bg-white border border-gray-200 hover:border-primary hover:text-primary text-text-main text-sm font-bold transition-all shadow-sm">
                    Manage
                  </button>
                  <button
                    onClick={() => handleRevoke(app)}
                    className="flex items-center justify-center size-10 rounded-xl bg-red-50 text-alerts border border-transparent hover:border-alerts/30 hover:bg-red-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">link_off</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Revoke Modal Integration */}
      {revokingApp && (
        <RevokeModal
          isOpen={true}
          onClose={() => setRevokingApp(null)}
          onConfirm={confirmRevoke}
          title={`Disconnect ${revokingApp.name}?`}
          appName={revokingApp.name}
          description="Revoking access will immediately disconnect this application from your CasperID. You may need to reconnect to use its features again."
          logoText={!revokingApp.logoIsIcon ? revokingApp.logo : undefined}
          logoBg={revokingApp.logoBg}
        />
      )}

      {/* Discover Integrations Section remains same... */}
      <section className="mt-8 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-secondary/10">
              <span className="material-symbols-outlined text-primary icon-filled">explore</span>
              <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full opacity-50"></div>
            </div>
            <h2 className="text-xl font-bold text-text-main relative">Discover Integrations</h2>
          </div>
          <a className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 hover:gap-2 transition-all" href="#">
            View Marketplace
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {discoveryApps.map((app, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-[20px] bg-white border border-gray-100 hover:border-secondary transition-all hover:shadow-lg hover:shadow-secondary/10 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 pointer-events-none"></div>
              <div className={`size-12 rounded-xl ${app.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20`}>
                <span className="material-symbols-outlined">{app.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-text-main truncate group-hover:text-primary transition-colors">{app.name}</h4>
                <p className="text-[10px] font-bold text-text-sub truncate uppercase tracking-tight">{app.category}</p>
              </div>
              <button className="size-9 rounded-full bg-gray-50 hover:bg-primary hover:text-white text-text-sub flex items-center justify-center transition-all shadow-sm">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
