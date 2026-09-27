import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Plus, Trash2, Download, ChevronDown, X, Check } from 'lucide-react';
import { apiService } from '../../services/api';

interface BusinessApp {
  app_id: string;
  name: string;
  environment: 'sandbox' | 'production';
  allowed_origins: string[];
  redirect_uris: string[];
  request_count: number;
  last_used_at: string | null;
  created_at: string;
  service_category?: string;
  supported_roles?: Array<'consumer' | 'provider'>;
  trust_events_enabled?: boolean;
  ratings_enabled?: boolean;
  trust_capacity_enabled?: boolean;
}

const APIManagement: React.FC = () => {
  const [apps, setApps] = useState<BusinessApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<BusinessApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewSecret, setShowNewSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppOrigins, setNewAppOrigins] = useState('');
  const [newAppRedirectUris, setNewAppRedirectUris] = useState('');
  const [newAppEnv, setNewAppEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [newAppCategory, setNewAppCategory] = useState('other');
  const [newAppTrustEnabled, setNewAppTrustEnabled] = useState(false);
  const [newAppTrustCapacityEnabled, setNewAppTrustCapacityEnabled] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const loadApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getBusinessApps();
      setApps(data.apps || []);
      if (data.apps?.length > 0 && !selectedApp) {
        setSelectedApp(data.apps[0]);
      }
    } catch (e) {
      showToast('Failed to load apps', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  // Handle ?create=true from Layout redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true') {
      setIsNewAppModalOpen(true);
      // Clean up URL
      window.history.replaceState({}, '', '/business/api-management');
    }
  }, []);

  const handleCreateApp = async () => {
    if (!newAppName.trim()) return;
    setIsCreating(true);
    try {
      const origins = newAppOrigins.split(',').map(s => s.trim()).filter(Boolean);
      const redirectUris = newAppRedirectUris.split(',').map(s => s.trim()).filter(Boolean);
      const data = await apiService.createBusinessApp({
        name: newAppName,
        allowed_origins: origins,
        redirect_uris: redirectUris,
        environment: newAppEnv,
        service_category: newAppCategory,
        supported_roles: (newAppTrustEnabled || newAppTrustCapacityEnabled) ? ['consumer', 'provider'] : [],
        trust_events_enabled: newAppTrustEnabled,
        ratings_enabled: newAppTrustEnabled,
        trust_capacity_enabled: newAppTrustCapacityEnabled
      });
      if (!data.success) throw new Error(data.error);

      setShowNewSecret(data.api_secret);
      setIsNewAppModalOpen(false);
      setNewAppName('');
      setNewAppOrigins('');
      setNewAppRedirectUris('');
      setNewAppCategory('other');
      setNewAppTrustEnabled(false);
      setNewAppTrustCapacityEnabled(false);
      await loadApps();
    } catch (e: any) {
      showToast(e.message || 'Failed to create app', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRotateKey = async () => {
    if (!selectedApp) return;
    if (!confirm('Rotate the API secret? Any services using the current secret will stop working immediately.')) return;
    setIsRotating(true);
    try {
      const data = await apiService.rotateBusinessAppKey(selectedApp.app_id);
      if (!data.success) throw new Error(data.error);
      setShowNewSecret(data.api_secret);
      showToast('Secret rotated. Update your environment variables.');
    } catch (e: any) {
      showToast(e.message || 'Failed to rotate key', 'error');
    } finally {
      setIsRotating(false);
    }
  };

  const handleDeleteApp = async () => {
    if (!selectedApp) return;
    if (!confirm(`Delete "${selectedApp.name}"? This action cannot be undone.`)) return;
    try {
      const data = await apiService.deleteBusinessApp(selectedApp.app_id);
      if (!data.success) throw new Error(data.error);
      showToast('App deleted');
      setSelectedApp(null);
      await loadApps();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete app', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">

      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${toast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 ${toast?.type === 'error' ? 'bg-red-600/90' : 'bg-text-main/90'}`}>
          <Check size={16} className="text-green-400" />
          <p className="text-sm font-bold">{toast?.message}</p>
        </div>
      </div>

      {/* One-time secret reveal modal */}
      {showNewSecret && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Eye size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-text-main text-lg">Save your API Secret</h3>
                <p className="text-sm text-text-sub mt-0.5">This is the only time it will be shown. Copy it now.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background-light rounded-xl border border-border-muted mb-6">
              <code className="text-sm text-text-main flex-1 font-mono break-all">{showNewSecret}</code>
              <button onClick={() => copyToClipboard(showNewSecret, 'new-secret')} className="flex-shrink-0 text-text-sub hover:text-primary transition-colors">
                {copied === 'new-secret' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            <button onClick={() => setShowNewSecret(null)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
              I've saved it — close
            </button>
          </div>
        </div>
      )}

      {/* New App Modal */}
      {isNewAppModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-text-main text-xl">New Application</h3>
              <button onClick={() => setIsNewAppModalOpen(false)} className="text-text-sub hover:text-text-main"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider block mb-1.5">App Name *</label>
                <input
                  value={newAppName}
                  onChange={e => setNewAppName(e.target.value)}
                  placeholder="My Restaurant App"
                  className="w-full p-3 bg-background-light rounded-xl border border-border-muted text-sm text-text-main focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider block mb-1.5">Allowed Origins <span className="font-normal normal-case">(comma-separated)</span></label>
                <p className="mb-1.5 text-[11px] text-text-sub">Browser origins permitted to start SDK authorization, without paths.</p>
                <input
                  value={newAppOrigins}
                  onChange={e => setNewAppOrigins(e.target.value)}
                  placeholder="https://myapp.com, http://localhost:3000"
                  className="w-full p-3 bg-background-light rounded-xl border border-border-muted text-sm text-text-main focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider block mb-1.5">Redirect URIs <span className="font-normal normal-case">(exact, comma-separated)</span></label>
                <p className="mb-1.5 text-[11px] text-text-sub">Exact OAuth callbacks, including paths such as /auth/callback.</p>
                <input
                  value={newAppRedirectUris}
                  onChange={e => setNewAppRedirectUris(e.target.value)}
                  placeholder="http://localhost:3005/auth/callback"
                  className="w-full p-3 bg-background-light rounded-xl border border-border-muted text-sm text-text-main focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="new-app-category" className="text-xs font-bold text-text-sub uppercase tracking-wider block mb-1.5">Service Category</label>
                <select
                  id="new-app-category"
                  value={newAppCategory}
                  onChange={e => {
                    setNewAppCategory(e.target.value);
                    if (e.target.value !== 'mobility') {
                      setNewAppTrustEnabled(false);
                      setNewAppTrustCapacityEnabled(false);
                    }
                  }}
                  className="w-full p-3 bg-background-light rounded-xl border border-border-muted text-sm text-text-main focus:outline-none focus:border-primary"
                >
                  <option value="other">Identity only</option>
                  <option value="mobility">Mobility / ride sharing</option>
                  <option value="commerce">Commerce</option>
                  <option value="delivery">Delivery</option>
                  <option value="appointments">Appointments</option>
                  <option value="rentals">Rentals</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              <label className="flex items-start gap-3 p-3 rounded-xl border border-border-muted bg-background-light cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAppTrustEnabled}
                  disabled={newAppCategory !== 'mobility'}
                  onChange={e => setNewAppTrustEnabled(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-bold text-text-main">Enable portable trust events</span>
                  <span className="block text-[11px] text-text-sub">Available for the mobility policy pilot. Sandbox events never affect live scores.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-xl border border-border-muted bg-background-light cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAppTrustCapacityEnabled}
                  disabled={newAppCategory !== 'mobility'}
                  onChange={e => setNewAppTrustCapacityEnabled(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-bold text-text-main">Request Trust Capacity at sign-in</span>
                  <span className="block text-[11px] text-text-sub">Adds consented <code>read:trust_capacity</code>: provider and consumer score, status, timestamp, and policy version only.</span>
                </span>
              </label>
              <div>
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider block mb-1.5">Environment</label>
                <div className="flex items-center bg-background-light border border-border-muted rounded-xl p-1 w-fit">
                  {(['sandbox', 'production'] as const).map(env => (
                    <button key={env} onClick={() => setNewAppEnv(env)} className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${newAppEnv === env ? 'bg-white shadow-sm border border-border-muted text-text-main' : 'text-text-sub'}`}>
                      {env}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsNewAppModalOpen(false)} className="flex-1 py-3 rounded-xl border border-border-muted text-text-sub font-bold text-sm hover:bg-background-light transition-colors">Cancel</button>
              <button onClick={handleCreateApp} disabled={isCreating || !newAppName.trim()} className="flex-1 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {isCreating ? 'Creating...' : 'Create App'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-text-main tracking-tight">Select a Plan</h3>
                <p className="text-sm text-text-sub">Scale your operations with higher quotas.</p>
              </div>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-text-sub hover:text-text-main"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Standard', price: '$0', desc: 'For individuals', features: ['1,000 requests/mo', 'Basic support'] },
                { name: 'Developer', price: '$45/mo', desc: 'For growing apps', features: ['10k requests/mo', 'Priority support', 'Webhooks'], popular: true },
                { name: 'Enterprise', price: 'Custom', desc: 'Full-scale needs', features: ['Unlimited calls', '24/7 Support', 'Custom tiers'] },
              ].map((p, i) => (
                <div key={i} className={`p-6 rounded-2xl border-2 flex flex-col gap-4 ${p.popular ? 'border-primary bg-primary/5' : 'border-border-muted'}`}>
                  {p.popular && <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit">Most Popular</span>}
                  <div>
                    <h4 className="font-bold text-text-main">{p.name}</h4>
                    <p className="text-2xl font-black text-text-main">{p.price}</p>
                    <p className="text-xs text-text-sub">{p.desc}</p>
                  </div>
                  <ul className="space-y-2 mt-2 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs font-medium text-text-main">
                        <Check size={12} className="text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${p.popular ? 'bg-primary text-white shadow-lg' : 'bg-background-light text-text-sub hover:bg-border-muted'}`}>
                    Select {p.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-main text-3xl font-black tracking-tight">API Management</h2>
          <p className="text-text-sub">Manage your API credentials and app settings.</p>
        </div>
        <button onClick={() => setIsNewAppModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
          <Plus size={16} /> New App
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-2xl border border-border-muted">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Plus size={28} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main">No apps yet</p>
            <p className="text-sm text-text-sub">Create your first app to get API credentials.</p>
          </div>
          <button onClick={() => setIsNewAppModalOpen(true)} className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors">
            Create First App
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: App selector + credentials */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* App selector */}
            <div className="bg-white rounded-xl border border-border-muted shadow-sm p-4">
              <label className="text-xs font-bold text-text-sub uppercase tracking-wider block mb-2">Select Application</label>
              <div className="relative">
                <select
                  className="w-full appearance-none p-3 pr-10 bg-background-light rounded-xl border border-border-muted text-sm font-bold text-text-main focus:outline-none focus:border-primary cursor-pointer"
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

            {/* Credentials card */}
            {selectedApp && (
              <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-muted flex items-center justify-between">
                  <h3 className="font-bold text-text-main flex items-center gap-2">
                    Client Credentials
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${selectedApp.environment === 'production' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {selectedApp.environment}
                    </span>
                  </h3>
                  <button
                    onClick={handleRotateKey}
                    disabled={isRotating}
                    className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isRotating ? 'animate-spin' : 'group-hover:animate-spin'} />
                    Rotate Secret
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  {/* App ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-sub uppercase tracking-wider">App ID (Client ID)</label>
                    <div className="flex items-center gap-2 p-3 bg-background-light rounded-lg border border-border-muted">
                      <code className="text-sm text-text-main flex-1 font-mono">{selectedApp.app_id}</code>
                      <button onClick={() => copyToClipboard(selectedApp.app_id, 'app_id')} className="text-text-sub hover:text-primary transition-colors">
                        {copied === 'app_id' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* API Secret (masked — user must rotate to see new one) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-sub uppercase tracking-wider">API Secret</label>
                    <p className="text-[11px] text-text-sub">Backend-only credential used to exchange OAuth authorization codes. Never expose it in frontend code.</p>
                    <div className="flex items-center gap-2 p-3 bg-background-light rounded-lg border border-border-muted">
                      <code className="text-sm text-text-main flex-1 font-mono">
                        {'•'.repeat(42)}
                      </code>
                      <span className="text-xs text-text-sub">Rotate to reveal a new secret</span>
                    </div>
                  </div>

                  {/* Allowed Origins */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Allowed Origins</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.allowed_origins.length > 0
                        ? selectedApp.allowed_origins.map((o, i) => (
                          <span key={i} className="px-3 py-1 bg-background-light border border-border-muted rounded-full text-xs font-mono text-text-main">{o}</span>
                        ))
                        : <span className="text-sm text-text-sub">All origins allowed (not recommended for production)</span>
                      }
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-sub uppercase tracking-wider">OAuth Redirect URIs</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.redirect_uris?.length > 0
                        ? selectedApp.redirect_uris.map((uri, i) => (
                          <span key={i} className="px-3 py-1 bg-background-light border border-border-muted rounded-full text-xs font-mono text-text-main">{uri}</span>
                        ))
                        : <span className="text-sm text-text-sub">No hosted authorization callbacks configured</span>
                      }
                    </div>
                  </div>

                  {/* JWKS + Docs quick links */}
                  <div className="mt-2 pt-4 border-t border-border-muted grid grid-cols-2 gap-3">
                    <a href="/.well-known/jwks.json" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-background-light rounded-xl border border-border-muted text-sm font-bold text-text-main hover:border-primary hover:text-primary transition-colors">
                      <Download size={14} /> JWKS Endpoint
                    </a>
                    <a href="/business/docs" className="flex items-center gap-2 p-3 bg-background-light rounded-xl border border-border-muted text-sm font-bold text-text-main hover:border-primary hover:text-primary transition-colors">
                      📄 View API Docs
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Danger zone */}
            {selectedApp && (
              <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-text-main text-sm">Delete App</p>
                  <p className="text-xs text-text-sub">Permanently deactivate this app and invalidate all credentials.</p>
                </div>
                <button onClick={handleDeleteApp} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors border border-red-200">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Right: Usage stats */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-border-muted shadow-sm p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-text-main">Monthly Usage</h3>
                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded leading-none">Free</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-text-main">
                      {selectedApp?.request_count ?? 0}
                      <span className="text-text-sub text-base font-normal">/1,000</span>
                    </p>
                    <p className="text-xs text-text-sub">API calls this month</p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {Math.min(100, Math.round(((selectedApp?.request_count ?? 0) / 1000) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-border-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((selectedApp?.request_count ?? 0) / 1000) * 100)}%` }}
                  />
                </div>
                <button onClick={() => setIsUpgradeModalOpen(true)} className="w-full py-2.5 bg-white border border-primary text-primary text-sm font-bold rounded-lg hover:bg-primary/5 transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* All apps list */}
            <div className="bg-white rounded-xl border border-border-muted shadow-sm">
              <div className="p-4 border-b border-border-muted">
                <h3 className="font-bold text-text-main text-sm">All Applications</h3>
              </div>
              <div className="divide-y divide-border-muted">
                {apps.map(app => (
                  <button
                    key={app.app_id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-4 flex items-center justify-between hover:bg-background-light transition-colors ${selectedApp?.app_id === app.app_id ? 'bg-primary/5' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-text-main">{app.name}</p>
                      <p className="text-xs text-text-sub font-mono">{app.app_id.slice(0, 18)}…</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${app.environment === 'production' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {app.environment}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIManagement;
