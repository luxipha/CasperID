import React, { useState, useEffect } from 'react';
import { Activity, Users, Box, ArrowUpRight, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import ActivityHeatmap from '../components/ActivityHeatmap';

const Overview: React.FC = () => {
  const [stats, setStats] = useState({
    total_requests: 0,
    active_apps: 0,
    total_apps: 0,
    activity: [] as { date: string, count: number }[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiService.getBusinessStats();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Dashboard Overview</h2>
        <p className="text-text-muted">Welcome back. Here's what's happening with your applications.</p>
      </div>

      <ActivityHeatmap
        title="Global Verification Activity"
        subtitle="Verification volume across all your applications over the last 6 months"
        data={stats.activity}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Verifications',
            value: loading ? '...' : stats.total_requests.toLocaleString(),
            change: '+12%',
            icon: <Activity size={20} className="text-primary" />,
            bg: 'bg-primary/5 border-primary/20'
          },
          {
            label: 'Active Apps',
            value: loading ? '...' : stats.active_apps.toString(),
            change: 'Stable',
            icon: <Box size={20} className="text-orange-600" />,
            bg: 'bg-orange-50 border-orange-200'
          },
          {
            label: 'System Status',
            value: 'Operational',
            change: '99.9% Uptime',
            icon: <Zap size={20} className="text-green-600" />,
            bg: 'bg-green-50 border-green-200'
          }
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${stat.bg} flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start z-10">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.label}</span>
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">{stat.icon}</div>
            </div>
            <div className="flex items-end gap-2 z-10">
              <h3 className="text-3xl font-black text-text-main tracking-tight">{stat.value}</h3>
              <span className="text-xs font-bold text-green-600 mb-1.5 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Activity Feed (Mock for now until event storage) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-border-muted shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-main flex items-center gap-2">
                Recent Activity
                <span className="px-2 py-0.5 bg-background-light rounded-full text-[10px] text-text-muted">Last 24h</span>
              </h3>
              <button className="text-sm font-bold text-primary hover:underline">View All</button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Only show placeholder if no requests ever made */}
              {stats.total_requests === 0 && !loading ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  No activity yet. Make your first API call!
                </div>
              ) : (
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-background-light/50 rounded-xl transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm group-hover:scale-105 transition-transform">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main">Verification Successful</p>
                        <p className="text-xs text-text-muted">User verified via Passkey • 2m ago</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-text-muted bg-background-light px-2 py-1 rounded">req_{Math.random().toString(36).substr(2, 6)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#1e1e2e] to-[#2d2d44] rounded-2xl p-6 text-white shadow-xl shadow-primary/5 flex flex-col justify-between h-64 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-primary/30 transition-all duration-700"></div>

            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-md">
                <Zap size={20} className="text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold mb-1">Integration Guide</h3>
              <p className="text-white/60 text-sm">Connect your first app in less than 5 minutes with our SDK.</p>
            </div>

            <Link to="/business/docs" className="relative z-10 flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all cursor-pointer border border-white/5 group/btn">
              <span className="text-sm font-bold">Read Documentation</span>
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-border-muted shadow-sm p-6">
            <h3 className="font-bold text-text-main mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/business/api-management" className="flex items-center justify-between p-3 rounded-xl hover:bg-background-light text-text-sub hover:text-text-main transition-colors text-sm font-medium">
                Manage API Keys <ArrowRight size={14} />
              </Link>
              <Link to="/business/webhooks" className="flex items-center justify-between p-3 rounded-xl hover:bg-background-light text-text-sub hover:text-text-main transition-colors text-sm font-medium">
                Configure Webhooks <ArrowRight size={14} />
              </Link>
              <Link to="/business/settings" className="flex items-center justify-between p-3 rounded-xl hover:bg-background-light text-text-sub hover:text-text-main transition-colors text-sm font-medium">
                Team Settings <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
