
import React, { useState } from 'react';
import { RevokeModal } from './RevokeModal';

const stats = [
  { label: 'Privacy Score', value: '92', total: '100', trend: '+2% vs last week', icon: 'shield', color: 'text-green-600', progress: 92 },
  { label: 'Active Connections', value: '12', sub: 'Apps connected', icon: 'hub', color: 'text-primary' },
  { label: 'Recent Requests (7d)', value: '34', sub: 'New activity', icon: 'history', color: 'text-blue-500', note: 'Most accessed: Identity Profile (ZK-Proof)' },
];

const appPermissions = [
  {
    name: 'Uniswap Protocol',
    type: 'Web3',
    category: 'Decentralized Exchange',
    logo: 'U',
    logoBg: 'bg-pink-100 text-pink-600',
    logoSrc: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    permissions: [
      { id: 'p1', label: 'Identity Profile', sub: 'Basic info (ZK-Proof)', icon: 'account_circle', enabled: true },
      { id: 'p2', label: 'KYC Status', sub: 'Verified Credential', icon: 'verified', enabled: true, verified: true },
      { id: 'p3', label: 'Wallet Address', sub: 'Public Key (Raw Data)', icon: 'account_balance_wallet', enabled: true },
    ]
  },
  {
    name: 'LinkedIn Clone',
    type: 'Web2',
    category: 'Professional Networking',
    logo: 'work',
    logoIsIcon: true,
    logoBg: 'bg-blue-100 text-blue-600',
    permissions: [
      { id: 'p4', label: 'Email Address', sub: 'Primary Email (Raw Data)', icon: 'contact_mail', enabled: true },
      { id: 'p5', label: 'Resume Data', sub: 'Work history, Education', icon: 'description', enabled: false },
      { id: 'p6', label: 'Location', sub: 'City/Country (Revoked)', icon: 'location_on', enabled: false, revoked: true },
    ]
  }
];

export const DataControls: React.FC = () => {
  const [revokingApp, setRevokingApp] = useState<typeof appPermissions[0] | null>(null);

  return (
    <div className="space-y-10 pb-12">
      {/* Heading */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.03em] text-text-main">Data Controls & Privacy</h1>
        <p className="text-text-sub text-base font-normal max-w-2xl leading-relaxed">
          Manage your consent, view permissions granted to connected Web2 and Web3 applications, and control your digital footprint with Zero-Knowledge proofs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-text-sub text-[11px] font-bold uppercase tracking-widest">{s.label}</p>
              <span className={`material-symbols-outlined ${s.color} text-[22px] ${idx === 0 ? 'icon-filled' : ''}`}>{s.icon}</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-text-main text-3xl font-extrabold leading-none tracking-tight">
                {s.value}{s.total && <span className="text-lg text-text-sub font-bold">/{s.total}</span>}
              </p>
              {s.trend && <span className="text-green-600 text-[10px] font-bold mb-1 uppercase tracking-tight">{s.trend}</span>}
              {s.sub && <span className="text-text-sub text-[11px] font-bold mb-1 uppercase tracking-tight">{s.sub}</span>}
            </div>
            {s.progress !== undefined ? (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${s.progress}%` }}></div>
              </div>
            ) : s.note ? (
              <p className="text-[10px] text-text-sub font-medium mt-1 italic">{s.note}</p>
            ) : (
               <div className="flex -space-x-2 mt-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 shadow-sm" style={{ backgroundImage: `url(https://picsum.photos/id/${i + 20}/50/50)`, backgroundSize: 'cover' }}></div>
                ))}
                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[9px] text-gray-500 font-bold">+9</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connected Apps Control */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-text-main">Connected Applications</h2>
          <div className="relative w-full md:w-80 group">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            </span>
            <input 
              className="w-full h-11 rounded-xl border-none bg-white py-2 pl-10 pr-4 text-sm text-text-main shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none" 
              placeholder="Search apps or services..." 
              type="text"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {appPermissions.map((app, idx) => (
            <div key={idx} className="bg-white rounded-[32px] border border-gray-100 p-7 shadow-soft flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${app.logoBg} flex items-center justify-center shadow-sm`}>
                    {app.logoIsIcon ? (
                      <span className="material-symbols-outlined text-[32px]">{app.logo}</span>
                    ) : (
                      <span className="font-extrabold text-2xl">{app.logo}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-text-main tracking-tight">{app.name}</h3>
                      <span className="bg-blue-50 text-blue-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-100/50">
                        {app.type}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-sub font-medium">{app.category}</p>
                  </div>
                </div>
                <button className="text-text-sub hover:text-primary transition-colors p-1">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>

              <div className="space-y-1">
                {app.permissions.map((p) => (
                  <div key={p.id} className={`flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 ${p.revoked ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-text-sub">
                        <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main">{p.label}</span>
                        <span className={`text-[11px] font-medium flex items-center gap-1 ${p.verified ? 'text-green-600' : 'text-text-sub'}`}>
                          {p.verified && <span className="material-symbols-outlined text-[12px] icon-filled">check_circle</span>}
                          {p.sub}
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={p.enabled} disabled={p.revoked} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 px-4 rounded-2xl bg-gray-50 text-sm font-bold text-text-main hover:bg-gray-100 transition-colors">View Logs</button>
                <button 
                  onClick={() => setRevokingApp(app)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-red-100 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Revoke Access
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
          onConfirm={() => setRevokingApp(null)}
          title="Confirm Disconnect from"
          appName={revokingApp.name}
          description="Revoking access will immediately disconnect this application from your CasperID. You may need to reconnect to use its features again."
          logoSrc={revokingApp.logoSrc}
          logoText={revokingApp.logoIsIcon ? undefined : revokingApp.logo}
          logoBg={revokingApp.logoBg}
        />
      )}

      {/* Audit Log remains same... */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-text-main">Access Audit Log</h2>
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Application</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Data Point</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Type</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Time</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { app: 'Uniswap Protocol', data: 'KYC Status', type: 'Zero-Knowledge', typeColor: 'bg-purple-50 text-purple-700 border-purple-100', time: '2 mins ago', status: 'Approved', statusColor: 'bg-green-500', logo: 'U', logoBg: 'bg-pink-100 text-pink-600' },
                  { app: 'LinkedIn Clone', data: 'Resume Data', type: 'Raw Data', typeColor: 'bg-gray-50 text-gray-600 border-gray-100', time: '45 mins ago', status: 'Approved', statusColor: 'bg-green-500', logo: 'L', logoBg: 'bg-blue-100 text-blue-600' },
                  { app: 'Aave V3', data: 'Credit Score', type: 'Zero-Knowledge', typeColor: 'bg-purple-50 text-purple-700 border-purple-100', time: 'Yesterday, 10:22 AM', status: 'Denied', statusColor: 'bg-red-500', logo: 'A', logoBg: 'bg-indigo-100 text-indigo-600' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${row.logoBg} flex items-center justify-center text-[11px] font-bold shadow-sm`}>{row.logo}</div>
                        <span className="font-bold text-text-main">{row.app}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-text-sub font-semibold">{row.data}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${row.typeColor}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-text-sub font-medium">{row.time}</td>
                    <td className="px-6 py-5">
                      <span className="flex items-center gap-2 text-[11px] font-bold text-text-main">
                        <span className={`h-2 w-2 rounded-full ${row.statusColor} animate-pulse`}></span>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-alerts mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span> Danger Zone
        </h3>
        <div className="bg-red-50/50 border border-red-100 rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <h4 className="text-text-main font-bold text-base">Delete Identity or Export Data</h4>
            <p className="text-sm text-text-sub font-medium leading-relaxed">
              Once you delete your identity, there is no going back. All encrypted local data will be purged.
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-red-100 rounded-2xl text-sm font-bold text-text-main hover:bg-white transition-all shadow-sm">Export Data</button>
            <button className="flex-1 md:flex-none px-6 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">Delete Identity</button>
          </div>
        </div>
      </section>
    </div>
  );
};
