
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

interface BusinessApp {
  app_id: string;
  name: string;
  environment: 'sandbox' | 'production';
  allowed_origins: string[];
  active: boolean;
  request_count: number;
  last_used_at?: string;
  created_at: string;
}

const IntegrationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<BusinessApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Form state
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await apiService.get(`/api/business/apps/${id}`);
        if (response.success && response.app) {
          setApp(response.app);
          setName(response.app.name);
          setEnvironment(response.app.environment);
          setAllowedOrigins(response.app.allowed_origins || []);
        } else {
          setError('App not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load app');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      // Use PATCH directly - the backend only supports PATCH for app updates
      const response = await apiService.patch(`/api/business/apps/${id}`, {
        name,
        environment,
        allowed_origins: allowedOrigins,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save');
      }

      setApp(response.app);
      showNotification('Changes saved successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOrigin = () => {
    if (newOrigin && !allowedOrigins.includes(newOrigin)) {
      setAllowedOrigins([...allowedOrigins, newOrigin]);
      setNewOrigin('');
    }
  };

  const handleRemoveOrigin = (origin: string) => {
    setAllowedOrigins(allowedOrigins.filter(o => o !== origin));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <button
          onClick={() => navigate('/business/integrations')}
          className="text-text-muted hover:text-text-main flex items-center gap-1 transition-colors w-fit"
        >
          <span className="material-symbols-outlined">chevron_left</span>
          <span className="text-sm font-medium">Back to Integrations</span>
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
          <p className="text-red-600 font-medium">{error || 'App not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-200 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 ${toastType === 'success' ? 'bg-text-main/90' : 'bg-red-600/90'}`}>
          <span className={`material-symbols-outlined text-xl ${toastType === 'success' ? 'text-green-400' : 'text-white'}`}>
            {toastType === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/business/integrations')}
            className="text-text-muted hover:text-text-main flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            <span className="text-sm font-medium">Back to Integrations</span>
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-text-main text-3xl font-black tracking-tight">{app.name}</h2>
          <div className="flex gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
              {app.active ? 'Active' : 'Inactive'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${environment === 'production' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              {environment === 'production' ? 'Production' : 'Sandbox'}
            </span>
          </div>
        </div>
        <p className="text-text-muted">App ID: <span className="font-mono text-xs bg-background-light px-2 py-1 rounded">{app.app_id}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {/* App Configuration */}
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">App Configuration</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">App Name</label>
                <input
                  className="w-full rounded-lg border border-border-muted bg-background-light/50 focus:border-primary focus:ring-primary text-sm p-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['sandbox', 'production'] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setEnvironment(env)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center gap-1 ${environment === env ? 'border-primary bg-primary/5' : 'border-border-muted hover:border-primary/50'}`}
                    >
                      <span className={`material-symbols-outlined ${environment === env ? 'text-primary' : 'text-text-muted'}`}>
                        {env === 'sandbox' ? 'science' : 'rocket_launch'}
                      </span>
                      <span className={`text-sm font-bold capitalize ${environment === env ? 'text-primary' : 'text-text-main'}`}>
                        {env}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Allowed Origins */}
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">Allowed Origins</h3>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-text-muted">Requests will only be accepted from these origins (CORS).</p>

              {/* Add new origin */}
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-lg border border-border-muted bg-background-light/50 text-sm p-3"
                  placeholder="https://example.com"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOrigin()}
                />
                <button
                  onClick={handleAddOrigin}
                  className="px-4 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90"
                >
                  Add
                </button>
              </div>

              {/* List origins */}
              <div className="flex flex-col gap-2">
                {allowedOrigins.length === 0 ? (
                  <p className="text-sm text-text-muted italic py-4 text-center">No origins configured. Add origins to enable CORS.</p>
                ) : (
                  allowedOrigins.map((origin, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input className="flex-1 rounded-lg border border-border-muted bg-background-light/30 text-sm p-3 text-text-muted" readOnly value={origin} />
                      <button
                        onClick={() => handleRemoveOrigin(origin)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Usage Stats */}
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">Usage Statistics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background-light/50 rounded-xl">
                  <p className="text-xs text-text-muted font-bold uppercase">Total Requests</p>
                  <p className="text-2xl font-black text-text-main mt-1">{app.request_count?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-background-light/50 rounded-xl">
                  <p className="text-xs text-text-muted font-bold uppercase">Last Used</p>
                  <p className="text-sm font-bold text-text-main mt-1">
                    {app.last_used_at ? new Date(app.last_used_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="p-4 bg-background-light/50 rounded-xl col-span-2">
                  <p className="text-xs text-text-muted font-bold uppercase">Created</p>
                  <p className="text-sm font-bold text-text-main mt-1">
                    {new Date(app.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">Quick Actions</h3>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <button
                onClick={() => navigate('/business/api')}
                className="w-full flex items-center gap-3 p-4 border border-border-muted rounded-xl hover:bg-background-light/50 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-primary">key</span>
                <div>
                  <p className="font-bold text-text-main">Manage API Keys</p>
                  <p className="text-xs text-text-muted">View or rotate your API credentials</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/business/webhooks')}
                className="w-full flex items-center gap-3 p-4 border border-border-muted rounded-xl hover:bg-background-light/50 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-primary">webhook</span>
                <div>
                  <p className="font-bold text-text-main">Configure Webhooks</p>
                  <p className="text-xs text-text-muted">Set up event notifications</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/business/docs')}
                className="w-full flex items-center gap-3 p-4 border border-border-muted rounded-xl hover:bg-background-light/50 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-primary">menu_book</span>
                <div>
                  <p className="font-bold text-text-main">View Documentation</p>
                  <p className="text-xs text-text-muted">Integration guides and API reference</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetail;
