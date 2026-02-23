
import React, { useState, useEffect } from 'react';
import { RevokeModal } from './RevokeModal';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Helper to map backend actions to UI labels
const PERMISSION_MAP: Record<string, { label: string; sub: string; icon: string }> = {
  'verify:identity': { label: 'Identity Profile', sub: 'Basic info (ZK-Proof)', icon: 'account_circle' },
  'verify:kyc': { label: 'KYC Status', sub: 'Verified Credential', icon: 'verified' },
  'verify:liveness': { label: 'Liveness Check', sub: 'Biometric Verification', icon: 'face' },
  'spend:verification_fee': { label: 'Wallet Spend', sub: 'Verification Fees', icon: 'account_balance_wallet' },
};

const getPermissionDetails = (action: string) => {
  return PERMISSION_MAP[action] || { label: action, sub: 'Custom Permission', icon: 'security' };
};

export const DataControls: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingApp, setRevokingApp] = useState<any | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeConnections: 0,
    totalGrants: 0,
    privacyScore: 100
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserPermissions();
      const data = response.userPermissions || { permissions: [], totalGrants: 0, activeGrants: 0 };

      // Transform backend data to UI format
      const transformedApps = data.permissions.map((grant: any) => ({
        grantId: grant.grantId,
        name: grant.dappName,
        type: 'Web3', // Default
        category: 'Connected DApp',
        logo: grant.dappName.charAt(0),
        logoBg: 'bg-indigo-100 text-indigo-600',
        logoIsIcon: false,
        permissions: grant.permissions.map((p: any) => ({
          id: p.action,
          ...getPermissionDetails(p.action),
          enabled: true, // If present in active grant, it's enabled
          scope: p.scope // Keep scope for updates
        })),
        usageCount: grant.usageCount
      }));

      // Flatten and sort audit log from recent usage
      const allUsage = data.permissions.flatMap((grant: any) =>
        grant.recentUsage.map((usage: any) => ({
          app: grant.dappName,
          data: getPermissionDetails(usage.action).label,
          type: 'Zero-Knowledge',
          typeColor: 'bg-purple-50 text-purple-700 border-purple-100', // Default
          time: new Date(usage.createdAt).toLocaleString(),
          status: usage.result === 'success' ? 'Approved' : usage.result,
          statusColor: usage.result === 'success' ? 'bg-green-500' : 'bg-red-500',
          logo: grant.dappName.charAt(0),
          logoBg: 'bg-indigo-100 text-indigo-600'
        }))
      ).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setApps(transformedApps);
      setAuditLog(allUsage);
      setStats({
        activeConnections: data.activeGrants,
        totalGrants: data.totalGrants,
        privacyScore: Math.max(0, 100 - (data.activeGrants * 5))
      });

    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (appIndex: number, permId: string, enabled: boolean) => {
    // If disabling, we remove it from the list sent to backend
    // If enabling, we currently can't add it back as we lose scope. 
    // UI behavior: Once unchecked, it effectively revokes.
    if (!enabled) {
      const app = apps[appIndex];
      const newPermissions = app.permissions
        .filter((p: any) => p.id !== permId)
        .map((p: any) => ({ action: p.id, scope: p.scope }));

      try {
        await apiService.updatePermission(app.grantId, newPermissions);
        // Optimistic update
        const newApps = [...apps];
        newApps[appIndex].permissions = newApps[appIndex].permissions.map((p: any) =>
          p.id === permId ? { ...p, enabled: false, revoked: true } : p
        );
        setApps(newApps);
      } catch (error) {
        console.error('Failed to update permission:', error);
        alert('Failed to update permission');
      }
    }
  };

  const handleRevokeApp = async () => {
    if (!revokingApp) return;
    try {
      await apiService.revokePermission(revokingApp.grantId, "User revoked via Data Controls");
      setRevokingApp(null);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to revoke app:', error);
      alert('Failed to revoke access');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await apiService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `casperid-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const statCards = [
    { label: 'Privacy Score', value: stats.privacyScore.toString(), total: '100', trend: '+0% vs last week', icon: 'shield', color: 'text-green-600', progress: stats.privacyScore },
    { label: 'Active Connections', value: stats.activeConnections.toString(), sub: 'Apps connected', icon: 'hub', color: 'text-primary' },
    { label: 'Recent Requests', value: auditLog.length.toString(), sub: 'Total activity', icon: 'history', color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Heading */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.03em] text-text-main">Data Controls & Privacy</h1>
        <p className="text-text-sub text-base font-normal max-w-2xl leading-relaxed">
          Manage your consent, view permissions granted to connected Web2 and Web3 applications, and control your digital footprint with Zero-Knowledge proofs.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((s, idx) => (
          <div key={idx} className="bg-white p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-gray-100 shadow-soft flex flex-col gap-3 md:gap-4">
            <div className="flex items-center justify-between">
              <p className="text-text-sub text-[10px] md:text-[11px] font-black uppercase tracking-widest opacity-60">{s.label}</p>
              <span className={`material-symbols-outlined ${s.color} text-[20px] md:text-[22px] ${idx === 0 ? 'icon-filled' : ''}`}>{s.icon}</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-text-main text-2xl md:text-3xl font-black leading-none tracking-tight">
                {s.value}{s.total && <span className="text-base md:text-lg text-text-sub font-bold">/{s.total}</span>}
              </p>
              {s.trend && <span className="text-green-600 text-[9px] md:text-[10px] font-black mb-1 uppercase tracking-tight">{s.trend}</span>}
              {s.sub && <span className="text-text-sub text-[10px] md:text-[11px] font-black mb-1 uppercase tracking-tight">{s.sub}</span>}
            </div>
            {s.progress !== undefined ? (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 md:mt-2">
                <div className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${s.progress}%` }}></div>
              </div>
            ) : (
              <div className="h-1.5 mt-1 md:mt-2"></div>
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-100 p-12 text-center text-text-sub">
            <span className="material-symbols-outlined text-4xl mb-4">apps</span>
            <p>No connected applications found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {apps.map((app, idx) => (
              <div key={idx} className="bg-white rounded-[28px] md:rounded-[32px] border border-gray-100 p-5 md:p-7 shadow-soft flex flex-col gap-5 md:gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 md:gap-4">
                    <div className={`size-12 md:size-14 rounded-2xl ${app.logoBg} flex items-center justify-center shadow-sm border border-white/20`}>
                      {app.logoIsIcon ? (
                        <span className="material-symbols-outlined text-2xl md:text-[32px]">{app.logo}</span>
                      ) : (
                        <span className="font-black text-xl md:text-2xl">{app.logo}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <h3 className="text-base md:text-lg font-black text-text-main tracking-tight leading-tight">{app.name}</h3>
                        <span className="w-fit bg-blue-50 text-blue-600 text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-100/50">
                          {app.type}
                        </span>
                      </div>
                      <p className="text-[12px] md:text-[13px] text-text-sub font-bold opacity-60">{app.category}</p>
                    </div>
                  </div>
                  <button className="text-text-sub hover:text-primary transition-colors p-1">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>

                <div className="space-y-0.5 md:space-y-1">
                  {app.permissions.map((p: any) => (
                    <div key={p.id} className={`flex items-center justify-between py-3 md:py-3.5 border-b border-gray-50 last:border-0 ${p.revoked ? 'opacity-40' : ''}`}>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-9 md:size-10 rounded-xl bg-gray-50 flex items-center justify-center text-text-sub shadow-sm border border-gray-100">
                          <span className="material-symbols-outlined text-[18px] md:text-[20px]">{p.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] md:text-sm font-black text-text-main leading-tight">{p.label}</span>
                          <span className={`text-[10px] md:text-[11px] font-bold flex items-center gap-1 leading-tight mt-0.5 ${p.revoked ? 'text-red-500' : 'text-text-sub/60'}`}>
                            {p.sub} {p.revoked && '(Revoked)'}
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer scale-90 md:scale-100">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={p.enabled && !p.revoked}
                          onChange={(e) => handleTogglePermission(idx, p.id, e.target.checked)}
                          disabled={p.revoked}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button className="flex-1 h-11 rounded-2xl bg-gray-50 text-[13px] font-black text-text-main hover:bg-gray-100 transition-all active:scale-95 shadow-sm border border-gray-100">View Logs</button>
                  <button
                    onClick={() => setRevokingApp(app)}
                    className="flex-1 h-11 rounded-2xl border border-red-100 text-[13px] font-black text-red-600 hover:bg-red-50 transition-all active:scale-95"
                  >
                    Revoke
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
          onConfirm={handleRevokeApp}
          title={`Disconnect ${revokingApp.name}?`}
          appName={revokingApp.name}
          description="Revoking access will immediately disconnect this application from your CasperID. You may need to reconnect to use its features again."
          logoText={!revokingApp.logoIsIcon ? revokingApp.logo : undefined}
          logoBg={revokingApp.logoBg}
        />
      )}

      {/* Audit Log */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-text-main">Access Audit Log</h2>
        <div className="bg-white rounded-[28px] md:rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            {auditLog.length === 0 ? (
              <div className="p-8 text-center text-text-sub text-sm">No recent access activity.</div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px] md:min-w-0">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Application</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Data Point</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60 hidden sm:table-cell">Type</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60 hidden md:table-cell">Time</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLog.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${row.logoBg} flex items-center justify-center text-[11px] font-black shadow-sm`}>{row.logo}</div>
                          <div>
                            <span className="font-black text-text-main block">{row.app}</span>
                            <span className="text-[10px] text-text-sub font-bold opacity-60 md:hidden">{row.time.split(',')[0]}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-text-sub font-bold text-[13px]">{row.data}</td>
                      <td className="px-6 py-5 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${row.typeColor}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-text-sub font-bold text-[13px] hidden md:table-cell">{row.time}</td>
                      <td className="px-6 py-5">
                        <span className="flex items-center gap-2 text-[11px] font-black text-text-main uppercase tracking-tight">
                          <span className={`h-1.5 w-1.5 rounded-full ${row.statusColor} animate-pulse`}></span>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
            <button
              onClick={handleExportData}
              className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-red-100 rounded-2xl text-sm font-bold text-text-main hover:bg-white transition-all shadow-sm"
            >
              Export Data
            </button>
            <button className="flex-1 md:flex-none px-6 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">Delete Identity</button>
          </div>
        </div>
      </section>
    </div>
  );
};
