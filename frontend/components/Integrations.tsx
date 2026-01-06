
import React, { useState } from 'react';
import { RevokeModal } from './RevokeModal';

const activeConnections = [
  { 
    name: 'Uniswap', 
    type: 'Web3', 
    lastActive: '2 hours ago',
    logo: 'U',
    logoBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    logoSrc: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    permissions: [
      { label: 'Wallet Address', icon: 'account_balance_wallet', color: 'text-primary' },
      { label: 'Tx History', icon: 'history', color: 'text-primary' }
    ]
  },
  { 
    name: 'Google', 
    type: 'Web2', 
    lastActive: 'Yesterday',
    logoSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDogvhjGuCx_rfWCreLaDcrw_tcT02ZNA0-RUJp9jddyHzIpzco5PIdTjP7qMf3GZHwMNV2WhZC7IwTz0RKJ8N750-cAclN7PoaMV3rZ_Ku3SkoWwftMB2qcsfo81I4KvbevEtJlf5Pu9JWKbAxEy_qt0cVnrz8V2eMZvKtqgXfzx8-YD1vXktUkY7UppQYP2O8iTR_yMT2RhpKvaaIKxJoPvqpXjazFAtyRkb6De0EohjTZG8e_tzBPjfxIzjpRtqiVzvGaNI9Xg',
    logoBg: 'bg-white',
    permissions: [
      { label: 'Email Address', icon: 'mail', color: 'text-blue-500' },
      { label: 'Profile Info', icon: 'badge', color: 'text-blue-500' }
    ]
  },
  { 
    name: 'OpenSea', 
    type: 'Web3', 
    lastActive: '5 days ago',
    logo: 'sailing',
    logoIsIcon: true,
    logoBg: 'bg-blue-500',
    permissions: [
      { label: 'Wallet Address', icon: 'account_balance_wallet', color: 'text-primary' },
      { label: 'Trading Rights', icon: 'gavel', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700' }
    ]
  },
];

const discoveryApps = [
  { name: 'Discord', category: 'Social & Community', icon: 'forum', color: 'bg-[#5865F2]' },
  { name: 'GitHub', category: 'Developer Tools', icon: 'code', color: 'bg-black' },
  { name: 'Aave', category: 'DeFi Lending', icon: 'currency_bitcoin', color: 'bg-gradient-to-tr from-[#B6509E] to-[#2EBAC6]' },
  { name: 'Lens Protocol', category: 'Social Graph', icon: 'camera', color: 'bg-[#8b5cf6]' },
];

export const Integrations: React.FC = () => {
  const [revokingApp, setRevokingApp] = useState<typeof activeConnections[0] | null>(null);

  const handleRevoke = (app: typeof activeConnections[0]) => {
    setRevokingApp(app);
  };

  const confirmRevoke = () => {
    // Logic to revoke would happen here
    setRevokingApp(null);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-2 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em] text-text-main">Connected Applications</h1>
        <p className="text-text-sub text-base font-normal leading-relaxed">
          Manage who has access to your CasperID. Review permissions, track usage, and revoke access instantly. 
          You are in control of your digital footprint.
        </p>
      </div>

      {/* Filter & Search Section */}
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
          <span className="bg-secondary/10 text-primary border border-secondary/20 text-xs font-extrabold px-2.5 py-1 rounded-full">3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeConnections.map((app, i) => (
            <div key={i} className="group flex flex-col p-6 rounded-[24px] bg-white border border-gray-100 hover:border-secondary/50 transition-all shadow-soft hover:shadow-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex gap-4 items-center">
                  <div className={`size-14 rounded-xl ${app.logoBg} flex items-center justify-center text-white font-bold text-2xl shadow-lg border border-gray-50 overflow-hidden`}>
                    {app.logoSrc ? (
                      <img src={app.logoSrc} className="w-full h-full object-contain p-2" alt={app.name} />
                    ) : app.logoIsIcon ? (
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
                  {app.permissions.map((p, j) => (
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
      </section>

      {/* Revoke Modal Integration */}
      {revokingApp && (
        <RevokeModal 
          isOpen={true}
          onClose={() => setRevokingApp(null)}
          onConfirm={confirmRevoke}
          title="Confirm Disconnect from"
          appName={revokingApp.name}
          description="Revoking access will immediately disconnect this application from your CasperID. You may need to reconnect to use its features again."
          logoSrc={revokingApp.logoSrc}
          logoText={revokingApp.logoSrc ? undefined : revokingApp.logo}
          logoBg={revokingApp.logoBg}
        />
      )}

      {/* Discover Integrations Section remains same... */}
      <section className="mt-8 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-secondary/10">
              <span className="material-symbols-outlined text-primary icon-filled">explore</span>
            </div>
            <h2 className="text-xl font-bold text-text-main">Discover Integrations</h2>
          </div>
          <a className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 hover:gap-2 transition-all" href="#">
            View Marketplace 
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {discoveryApps.map((app, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-[20px] bg-white border border-gray-100 hover:border-secondary transition-all hover:shadow-lg hover:shadow-secondary/10 group cursor-pointer">
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
