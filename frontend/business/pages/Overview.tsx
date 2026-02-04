
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Integration, AppStatus, Activity } from '../types';

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { label: 'Total Verifications', value: '12,450', trend: '+12%', trendUp: true },
    { label: 'Active Apps', value: '3', trend: 'Static', trendUp: null },
    { label: 'API Health', value: '99.9%', trend: 'Success Rate', trendUp: true },
    { label: 'Usage Quota', value: '75%', trend: 'Tier 2', trendUp: null, progress: 75 },
  ];

  const integrations: Integration[] = [
    { id: '1', name: 'Uniswap Clone', type: 'Web3', users: '8k', status: AppStatus.VERIFIED, website: 'https://uniswap.io', logoInitial: 'U', color: 'bg-blue-50 text-blue-600' },
    { id: '2', name: 'Job Board Pro', type: 'Web2', users: '2k', status: AppStatus.MAINTENANCE, website: 'https://jobboard.pro', logoInitial: 'J', color: 'bg-orange-50 text-orange-600' },
  ];

  const activities: Activity[] = [
    { id: 'a1', user: 'alice.cid', action: 'verified Layer 2 via', app: 'Uniswap Clone', time: '2 mins ago', type: 'success' },
    { id: 'a2', user: 'bob.cid', action: 'verified Identity via', app: 'Job Board Pro', time: '15 mins ago', type: 'success' },
    { id: 'a3', user: 'System', action: 'API Keys rotated for', app: 'Uniswap Clone', time: '1 hour ago', type: 'info' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Welcome back, {user?.display_name || user?.cns_name || 'Innovator'}</h2>
        <p className="text-text-muted">Here is what's happening with your platform today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-xl bg-white p-6 border border-border-muted shadow-sm hover:shadow-md transition-shadow">
            <p className="text-text-muted text-sm font-medium">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-text-main text-3xl font-bold">{stat.value}</p>
              <div className={`flex items-center text-sm font-bold pb-1 ${stat.trendUp === true ? 'text-green-600' : stat.trendUp === false ? 'text-red-600' : 'text-text-muted'}`}>
                {stat.trendUp !== null && <span className="material-symbols-outlined !text-sm">{stat.trendUp ? 'trending_up' : 'trending_down'}</span>}
                <span className="ml-1">{stat.trend}</span>
              </div>
            </div>
            {stat.progress !== undefined && (
              <div className="w-full bg-border-muted h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${stat.progress}%` }}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-text-main text-xl font-bold">Your Integrations</h3>
              <button onClick={() => navigate('/business/integrations')} className="text-primary text-sm font-bold hover:underline">View all</button>
            </div>
            <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-muted bg-background-light/50">
                    <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">App Name</th>
                    <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Users</th>
                    <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted">
                  {integrations.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-background-light/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/business/integrations/${app.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${app.color}`}>{app.logoInitial}</div>
                          <span className="font-bold text-text-main">{app.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm font-medium">{app.type}</td>
                      <td className="px-6 py-4 text-text-main text-sm font-bold">{app.users}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === AppStatus.VERIFIED ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-text-main text-xl font-bold">Recent Activity</h3>
            <div className="bg-white rounded-xl border border-border-muted shadow-sm divide-y divide-border-muted">
              {activities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${activity.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      <span className="material-symbols-outlined !text-base">{activity.type === 'success' ? 'check_circle' : 'sync'}</span>
                    </div>
                    <p className="text-text-main">
                      <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-bold">{activity.app}</span>
                    </p>
                  </div>
                  <span className="text-text-muted text-xs whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-text-main text-xl font-bold">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'View API Docs', sub: 'Explore our guide and SDKs', icon: 'menu_book', to: '/business/docs' },
                { label: 'Generate Test Keys', sub: 'Start testing in sandbox', icon: 'key', to: '/business/api-management' },
                { label: 'Set up Webhooks', sub: 'Real-time events to your URL', icon: 'webhook', to: '/business/webhooks' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.to)}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-border-muted shadow-sm hover:border-primary transition-all text-left w-full"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <span className="material-symbols-outlined">{action.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-text-main">{action.label}</span>
                      <span className="text-xs text-text-muted">{action.sub}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-primary to-purple-800 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-1">Developer Support</h4>
              <p className="text-white/80 text-sm mb-4">Need help with your integration? Our team is available 24/7.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform active:scale-95">
                Contact Support
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined !text-[120px]">support_agent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
