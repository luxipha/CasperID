import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Activity, Check, AlertTriangle, Play, ChevronDown, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface BusinessApp {
  app_id: string;
  name: string;
  environment: 'sandbox' | 'production';
}

interface WebhookSubscription {
  _id: string;
  app_id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  signing_secret?: string; // Only on creation
}

async function fetchWithAuth(path: string, opts: RequestInit = {}) {
  const cookie = document.cookie;
  const sessionToken = cookie.match(/casperid_session=([^;]+)/)?.[1]
    || localStorage.getItem('casperid_token')
    || '';

  return fetch(`${API_BASE}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...opts.headers
    }
  });
}

const Webhooks: React.FC = () => {
  const [apps, setApps] = useState<BusinessApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<BusinessApp | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Form State
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['user.verified']);
  const [isCreating, setIsCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  // Test State
  const [testResult, setTestResult] = useState<any>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const AVAILABLE_EVENTS = ['user.verified', 'user.registered', 'kyc.completed', 'session.revoked'];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadApps = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/business/apps');
      if (res.ok) {
        const data = await res.json();
        setApps(data.apps || []);
        if (data.apps?.length > 0 && !selectedApp) {
          setSelectedApp(data.apps[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load apps');
    } finally {
      setIsLoading(false);
    }
  }, [selectedApp]); // selectedApp dependency to avoid infinite loop when setting it

  const loadWebhooks = useCallback(async () => {
    if (!selectedApp) return;
    try {
      const res = await fetchWithAuth(`/api/business/webhooks?app_id=${selectedApp.app_id}`);
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (e) {
      console.error('Failed to load webhooks');
    }
  }, [selectedApp]);

  useEffect(() => {
    loadApps();
  }, []); // Only run once on mount

  useEffect(() => {
    if (selectedApp) {
      loadWebhooks();
      setTestResult(null);
      setNewSecret(null);
    }
  }, [selectedApp, loadWebhooks]);

  const handleCreate = async () => {
    if (!selectedApp || !newUrl) return;
    setIsCreating(true);
    try {
      const res = await fetchWithAuth('/api/business/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          app_id: selectedApp.app_id,
          url: newUrl,
          events: selectedEvents
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setNewSecret(data.webhook.signing_secret);
      setNewUrl('');
      setSelectedEvents(['user.verified']);
      await loadWebhooks();
      showToast('Webhook created successfully');
    } catch (e: any) {
      showToast(e.message || 'Failed to create webhook', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      const res = await fetchWithAuth(`/api/business/webhooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWebhooks(prev => prev.filter(w => w._id !== id));
        showToast('Webhook deleted');
      } else {
        throw new Error('Failed');
      }
    } catch (e) {
      showToast('Failed to delete webhook', 'error');
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetchWithAuth(`/api/business/webhooks/${id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
      if (data.success) showToast('Test event sent!', 'success');
      else showToast('Test failed', 'error');
    } catch (e) {
      showToast('Network error during test', 'error');
    } finally {
      setTestingId(null);
    }
  };

  const toggleEvent = (ev: string) => {
    setSelectedEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${toast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 ${toast?.type === 'error' ? 'bg-red-600/90' : 'bg-green-600/90'}`}>
          {toast?.type === 'success' && <Check size={16} />}
          {toast?.type === 'error' && <AlertTriangle size={16} />}
          <p className="text-sm font-bold">{toast?.message}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Webhooks & Events</h2>
        <p className="text-text-muted">Manage your real-time event notifications and endpoint configurations.</p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="animate-spin text-primary" />
        </div>
      ) : apps.length === 0 ? (
        <div className="p-8 bg-white border border-border-muted rounded-2xl text-center">
          <p className="font-bold text-text-main">No Apps Found</p>
          <p className="text-sm text-text-sub">Create an app in API Management first.</p>
        </div>
      ) : (
        <>
          {/* App Selector */}
          <div className="bg-white p-4 rounded-xl border border-border-muted shadow-sm flex items-center gap-4">
            <span className="text-sm font-bold text-text-sub uppercase tracking-wider">Select App:</span>
            <div className="relative">
              <select
                className="appearance-none bg-background-light border border-border-muted rounded-lg py-2 pl-4 pr-10 font-bold text-text-main focus:outline-none focus:border-primary cursor-pointer w-64"
                value={selectedApp?.app_id || ''}
                onChange={e => setSelectedApp(apps.find(a => a.app_id === e.target.value) || null)}
              >
                {apps.map(app => (
                  <option key={app.app_id} value={app.app_id}>{app.name} ({app.environment})</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Create Webhook */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <Activity size={20} />
                </div>
                <h3 className="text-lg font-bold text-text-main">New Endpoint</h3>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Payload URL</label>
                  <input
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    className="w-full rounded-xl border border-border-muted bg-background-light focus:border-primary focus:ring-primary text-sm p-3 focus:outline-none"
                    placeholder="https://api.yoursite.com/webhooks"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Events to Send</label>
                  <div className="grid grid-cols-1 gap-2">
                    {AVAILABLE_EVENTS.map((ev) => (
                      <label key={ev} className="flex items-center gap-3 p-3 rounded-xl border border-border-muted hover:bg-background-light cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          className="rounded border-border-muted text-primary focus:ring-primary h-4 w-4"
                          checked={selectedEvents.includes(ev)}
                          onChange={() => toggleEvent(ev)}
                        />
                        <span className="text-sm font-medium text-text-main">{ev}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={isCreating || !newUrl}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  {isCreating ? 'Saving...' : 'Save Endpoint'}
                </button>

                {newSecret && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-xs font-bold text-green-800 uppercase mb-1">Signing Secret (Save Now)</p>
                    <code className="text-xs break-all font-mono text-green-700 block mb-2">{newSecret}</code>
                    <p className="text-[10px] text-green-600">This secret will not be shown again.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Webhooks */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-main">Active Endpoints</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  {webhooks.length} Active
                </span>
              </div>

              {webhooks.length === 0 ? (
                <div className="p-12 text-center bg-white border border-border-muted rounded-2xl flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-background-light flex items-center justify-center text-text-muted">
                    <Activity size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-text-main">No Data</p>
                    <p className="text-sm text-text-sub">No webhooks configured for this app yet.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border-muted shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-muted bg-background-light/50">
                        <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider">URL</th>
                        <th className="px-6 py-4 text-text-muted text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-muted">
                      {webhooks.map((hook) => (
                        <tr key={hook._id} className="hover:bg-background-light/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-text-main text-sm truncate max-w-sm block" title={hook.url}>{hook.url}</span>
                              <span className="text-xs text-text-muted">{hook.events.length} events subscribed</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleTest(hook._id)}
                                disabled={testingId === hook._id}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Send Test Ping"
                              >
                                <Play size={16} className={testingId === hook._id ? 'animate-pulse' : ''} />
                              </button>
                              <button
                                onClick={() => handleDelete(hook._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Webhook"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Test Result Log */}
              {testResult && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-lg font-bold text-text-main mb-2">Test Result</h3>
                  <div className={`p-4 rounded-xl border text-sm font-mono overflow-auto max-h-64 shadow-sm ${testResult.success ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <div className="flex justify-between items-start mb-2 opacity-50 text-xs uppercase font-bold">
                      <span>Response Payload</span>
                      <button onClick={() => setTestResult(null)} className="hover:text-black">Close</button>
                    </div>
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Webhooks;
