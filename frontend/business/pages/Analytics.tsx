
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../../services/api';
import ActivityHeatmap from '../components/ActivityHeatmap';

interface BusinessStats {
  total_requests: number;
  total_verifications: number;
  active_apps: number;
  total_apps: number;
  activity: Array<{ date: string; count: number }>;
  top_apps: Array<{ name: string; value: number }>;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/business/stats');
        if (response.success) {
          setStats(response.stats);
        } else {
          setError('Failed to load analytics data');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-main text-3xl font-black tracking-tight">Analytics & Insights</h2>
          <p className="text-text-muted">Monitor verification trends, API usage, and error rates in real-time.</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-main text-3xl font-black tracking-tight">Analytics & Insights</h2>
          <p className="text-text-muted">Monitor verification trends, API usage, and error rates in real-time.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Analytics & Insights</h2>
        <p className="text-text-muted">Monitor verification trends, API usage, and error rates in real-time.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total API Requests', value: stats?.total_requests?.toLocaleString() || '0', icon: 'api', color: 'text-primary' },
          { label: 'Total Verifications', value: stats?.total_verifications?.toLocaleString() || '0', icon: 'verified', color: 'text-violet-600' },
          { label: 'Active Apps', value: stats?.active_apps?.toString() || '0', icon: 'apps', color: 'text-green-600' },
          { label: 'Total Apps', value: stats?.total_apps?.toString() || '0', icon: 'inventory_2', color: 'text-blue-600' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-border-muted shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined ${m.color} text-xl`}>{m.icon}</span>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{m.label}</span>
            </div>
            <span className={`text-3xl font-black ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>

      <ActivityHeatmap
        title="Time-Series Analytics"
        subtitle="Daily verification volume across all your applications over the last 6 months"
        data={stats?.activity || []}
      />

      {/* Top Apps by Usage */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-text-main">Top Apps by API Usage</h3>
            <span className="text-xs text-text-muted font-bold px-2 py-1 bg-background-light rounded">All Time</span>
          </div>
          {stats?.top_apps && stats.top_apps.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_apps} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#716586" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#716586" fontSize={12} axisLine={false} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8651e1" radius={[0, 4, 4, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                <p>No app usage data yet</p>
                <p className="text-sm">Create an app and start making API calls</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* App Usage Breakdown */}
      {stats?.top_apps && stats.top_apps.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-text-main">App Usage Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-muted">
                  <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider">App Name</th>
                  <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Total Requests</th>
                  <th className="pb-3 text-xs font-bold text-text-muted uppercase tracking-wider text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {stats.top_apps.map((app, i) => (
                  <tr key={i} className="hover:bg-background-light/30">
                    <td className="py-3 font-medium text-text-main">{app.name}</td>
                    <td className="py-3 text-right text-text-main">{app.value.toLocaleString()}</td>
                    <td className="py-3 text-right text-text-muted">
                      {stats.total_requests > 0 ? ((app.value / stats.total_requests) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
