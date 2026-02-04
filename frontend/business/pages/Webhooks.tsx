
import React, { useState } from 'react';
import { WebhookLog } from '../types';

const Webhooks: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const logs: WebhookLog[] = [
    { id: 'evt_1N2M3L4K5J', statusCode: 200, status: '200 OK', timestamp: '2023-10-24 14:22:01', action: 'Redeliver' },
    { id: 'evt_9X8Y7Z6W5V', statusCode: 500, status: '500 Error', timestamp: '2023-10-24 14:15:45', action: 'Redeliver' },
    { id: 'evt_4A5B6C7D8E', statusCode: 201, status: '201 Created', timestamp: '2023-10-24 13:50:12', action: 'Redeliver' },
  ];

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-text-main/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <span className="material-symbols-outlined text-green-400 !text-xl">check_circle</span>
          <p className="text-sm font-bold">Webhook endpoint saved successfully!</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Webhooks & Events</h2>
        <p className="text-text-muted">Manage your real-time event notifications and endpoint configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">settings_input_component</span>
            </div>
            <h3 className="text-lg font-bold text-text-main">New Endpoint</h3>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-muted">Payload URL</label>
              <input className="w-full rounded-xl border-border-muted bg-background-light focus:border-primary focus:ring-primary text-sm p-3" placeholder="https://your-api.com/webhooks" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-muted">Secret Token</label>
              <select className="w-full rounded-xl border-border-muted bg-background-light focus:border-primary focus:ring-primary text-sm p-3">
                <option>Auto-generate (Recommended)</option>
                <option>Custom Secret Key</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-text-muted">Events to Send</label>
              <div className="grid grid-cols-1 gap-2">
                {['user.verified', 'credential.revoked', 'app.status_changed', 'billing.limit_reached'].map((ev, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border-muted hover:bg-background-light cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-border-muted text-primary focus:ring-primary" defaultChecked={idx < 2} />
                    <span className="text-sm font-medium text-text-main">{ev}</span>
                  </label>
                ))}
              </div>
            </div>
            <button 
              onClick={handleSave}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-95"
            >
              Save Endpoint
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-main">Active Endpoints</h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">All systems operational</span>
          </div>
          <div className="bg-white rounded-2xl border border-border-muted shadow-sm overflow-hidden mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-muted bg-background-light/50">
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">URL</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Success</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                <tr className="hover:bg-background-light/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-main text-sm">https://api.innovate.io/v1/webhook</span>
                      <span className="text-xs text-text-muted">2 events subscribed</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Live</span>
                  </td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">99.2%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-main">Event Logs</h3>
            <button className="flex items-center gap-2 text-primary text-sm font-bold hover:underline">
              <span className="material-symbols-outlined !text-sm">filter_alt</span> Filter Logs
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-border-muted shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-muted bg-background-light/50">
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Event ID</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">HTTP Status</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background-light/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-text-muted">{log.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-bold text-text-main">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{log.timestamp}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-bold hover:text-primary/70 transition-colors">{log.action}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Webhooks;
