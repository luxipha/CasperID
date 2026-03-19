
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface BusinessStats {
  total_requests: number;
  active_apps: number;
  total_apps: number;
  top_apps: Array<{ name: string; value: number }>;
}

const Billing: React.FC = () => {
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.get('/api/business/stats');
        if (response.success) {
          setStats(response.stats);
        }
      } catch (err) {
        console.error('Failed to load usage stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Billing & Usage</h2>
        <p className="text-text-muted">Manage your subscription plan, payment methods, and monitor usage metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <div className="lg:col-span-1 flex flex-col justify-between rounded-xl bg-white p-6 border border-border-muted shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-text-muted text-sm font-medium">Current Plan</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Free Beta</span>
            </div>
            <h3 className="text-text-main text-2xl font-bold">Developer Access</h3>
            <div className="flex flex-col gap-1 mt-4">
              <p className="text-text-muted text-xs uppercase font-bold tracking-wider">Current Price</p>
              <p className="text-text-main text-3xl font-black">$0 <span className="text-sm font-medium text-text-muted">/ month</span></p>
              <p className="text-xs text-text-muted mt-1">Free during beta period</p>
            </div>
            <div className="mt-4 p-3 bg-background-light rounded-lg">
              <p className="text-xs text-text-muted">
                <span className="font-bold text-text-main">Includes:</span> Up to 10 apps, unlimited API requests, webhook integrations
              </p>
            </div>
          </div>
          <button
            disabled
            className="mt-8 w-full py-2.5 bg-gray-200 text-gray-500 rounded-lg text-sm font-bold cursor-not-allowed"
          >
            Upgrade Coming Soon
          </button>
        </div>

        {/* Usage Metrics */}
        <div className="lg:col-span-2 flex flex-col gap-6 rounded-xl bg-white p-6 border border-border-muted shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-text-main font-bold">Usage Metrics</h3>
            <span className="text-xs text-text-muted font-medium italic">All time</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3 p-4 bg-background-light/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">api</span>
                  <span className="text-sm font-semibold text-text-main">API Requests</span>
                </div>
                <p className="text-2xl font-black text-text-main">{stats?.total_requests?.toLocaleString() || 0}</p>
                <p className="text-xs text-text-muted">Total requests made</p>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-background-light/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-xl">apps</span>
                  <span className="text-sm font-semibold text-text-main">Active Apps</span>
                </div>
                <p className="text-2xl font-black text-text-main">{stats?.active_apps || 0}</p>
                <p className="text-xs text-text-muted">Currently active</p>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-background-light/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-xl">inventory_2</span>
                  <span className="text-sm font-semibold text-text-main">Total Apps</span>
                </div>
                <p className="text-2xl font-black text-text-main">{stats?.total_apps || 0}</p>
                <p className="text-xs text-text-muted">Apps created</p>
              </div>
            </div>
          )}

          {/* Limits Info */}
          <div className="mt-4 p-4 border border-border-muted rounded-xl">
            <h4 className="text-sm font-bold text-text-main mb-3">Beta Plan Limits</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Apps</span>
                <span className="text-sm font-medium text-text-main">{stats?.total_apps || 0} / 10</span>
              </div>
              <div className="w-full bg-border-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.min(((stats?.total_apps || 0) / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-text-muted">API requests are unlimited during beta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Plans Preview */}
      <div className="bg-white rounded-xl border border-border-muted shadow-sm p-6">
        <h3 className="text-text-main font-bold mb-4">Upcoming Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: '$29', features: ['5 Apps', '50K requests/mo', 'Email support'] },
            { name: 'Pro', price: '$99', features: ['25 Apps', '500K requests/mo', 'Priority support', 'Analytics'] },
            { name: 'Enterprise', price: 'Custom', features: ['Unlimited Apps', 'Unlimited requests', 'SLA', 'Dedicated support'] },
          ].map((plan, i) => (
            <div key={i} className="p-4 border border-border-muted rounded-xl opacity-60">
              <h4 className="font-bold text-text-main">{plan.name}</h4>
              <p className="text-2xl font-black text-primary mt-1">{plan.price}<span className="text-sm font-normal text-text-muted">/mo</span></p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-xs text-text-muted flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-text-muted mt-4">Pricing is subject to change. Subscribe to updates for launch announcements.</p>
      </div>
    </div>
  );
};

export default Billing;
