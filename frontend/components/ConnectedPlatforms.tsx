
import React from 'react';

const platforms = [
  { 
    title: "Uniswap", 
    badge: "WEB3", 
    badgeColor: "bg-blue-100 text-blue-700",
    id: "did:ethr:0x71...9A23",
    imageUrl: "https://cryptologos.cc/logos/uniswap-uni-logo.png"
  },
  { 
    title: "Discord", 
    badge: "WEB2", 
    badgeColor: "bg-purple-100 text-purple-700",
    id: "user#4492",
    icon: "discord"
  },
  { 
    title: "MetaMask", 
    badge: "WALLET", 
    badgeColor: "bg-green-100 text-green-700",
    id: "0x8a...4b12",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_v7.8.0_Icon.png"
  }
];

export const ConnectedPlatforms: React.FC = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-text-main">Connected Platforms</h3>
        <button className="flex items-center gap-1 text-primary text-[10px] font-extrabold bg-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
          <span className="material-icons-outlined text-sm">add</span> Add New
        </button>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-3">
        {platforms.map((p, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-soft flex items-center justify-between group border border-gray-50">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${!p.imageUrl ? 'bg-indigo-50 text-indigo-500' : ''}`}>
                {p.imageUrl ? (
                  <img alt={p.title} className="w-6 h-6 object-contain" src={p.imageUrl} />
                ) : (
                  <span className="material-icons-outlined text-lg">{p.icon}</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-main flex items-center gap-2">
                  {p.title} 
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </h4>
                <p className="text-xs text-text-sub font-medium">{p.id}</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        ))}
      </div>

      {/* Desktop Card Grid */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        {platforms.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col h-full group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 ${!p.imageUrl ? 'bg-indigo-50 text-indigo-500' : ''}`}>
                   {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="w-8 h-8 object-contain" /> : <span className="material-icons-outlined text-2xl">{p.icon}</span>}
                </div>
                <div>
                  <h4 className="font-bold text-text-main text-lg leading-tight">{p.title}</h4>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200 mt-1"></div>
            </div>
            <p className="text-text-sub text-sm leading-relaxed mb-6">Access verified via CasperID. Permissions managed by you.</p>
            <div className="pt-4 border-t border-gray-50 mt-auto">
              <p className="text-[11px] font-mono text-gray-400">{p.id}</p>
            </div>
          </div>
        ))}
        <div className="bg-white/40 rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center gap-3 group hover:border-primary/40 hover:bg-white/60 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-all">
            <span className="material-symbols-outlined text-2xl">add_link</span>
          </div>
          <h4 className="font-bold text-text-main">Login with Casper</h4>
          <p className="text-xs text-text-sub font-medium">Connect to Web2/Web3 apps</p>
        </div>
      </div>
    </section>
  );
};
