import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { apiService } from '../../services/api';

interface AndroidDigitalAsset {
  package_name: string;
  sha256_fingerprints: string[];
  created_at?: string;
}

interface BusinessApp {
  app_id: string;
  name: string;
  environment: 'sandbox' | 'production';
  requested_scopes?: string[];
  allowed_origins: string[];
  redirect_uris: string[];
  android_digital_assets?: AndroidDigitalAsset[];
  active: boolean;
  request_count: number;
  last_used_at?: string;
  created_at: string;
  website_url?: string;
  listing_status?: 'listed' | 'unlisted';
  service_category?: string;
  supported_roles?: Array<'consumer' | 'provider'>;
  trust_events_enabled?: boolean;
  trust_capacity_enabled?: boolean;
  trust_production_approved?: boolean;
  ratings_enabled?: boolean;
  sdk_config?: {
    requiredTier?: string;
    proofs?: string[];
    logo_url?: string;
    primary_color?: string;
    border_radius?: string;
    font_family?: string;
  };
}

const TIER_ORDER: Array<'L1' | 'L2' | 'L3'> = ['L1', 'L2', 'L3'];
const PROOF_MINIMUM_TIER: Record<string, 'L1' | 'L2' | 'L3'> = {
  email: 'L1',
  phone: 'L1',
  liveness: 'L2',
  age: 'L3'
};

const proofAllowedForTier = (proofId: string, tier: string): boolean => {
  const minimumTier = PROOF_MINIMUM_TIER[proofId];
  if (!minimumTier) return true;
  return TIER_ORDER.indexOf(tier as 'L1' | 'L2' | 'L3') >= TIER_ORDER.indexOf(minimumTier);
};

const sanitizeProofsForTier = (proofIds: string[], tier: string): string[] => {
  return proofIds.filter((proofId) => proofAllowedForTier(proofId, tier));
};

const deriveProofsFromScopes = (scopes: string[] = []): string[] => {
  const nextProofs: string[] = [];

  if (scopes.includes('verify:liveness')) nextProofs.push('liveness');
  if (scopes.includes('verify:age') || scopes.includes('verify:kyc')) nextProofs.push('age');
  if (scopes.includes('read:email')) nextProofs.push('email');
  if (scopes.includes('read:phone')) nextProofs.push('phone');

  return nextProofs;
};

const IntegrationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<BusinessApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [listingStatus, setListingStatus] = useState<'listed' | 'unlisted'>('unlisted');
  const [serviceCategory, setServiceCategory] = useState('other');
  const [supportedRoles, setSupportedRoles] = useState<Array<'consumer' | 'provider'>>([]);
  const [trustEventsEnabled, setTrustEventsEnabled] = useState(false);
  const [trustCapacityEnabled, setTrustCapacityEnabled] = useState(false);
  const [ratingsEnabled, setRatingsEnabled] = useState(false);
  const [tier, setTier] = useState('L1');
  const [proofs, setProofs] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState('');
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  // Hosted authorization callback state
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([]);
  const [redirectUris, setRedirectUris] = useState<string[]>([]);
  const [showAllowedOriginModal, setShowAllowedOriginModal] = useState(false);
  const [newAllowedOrigin, setNewAllowedOrigin] = useState('');
  const [showRedirectUriModal, setShowRedirectUriModal] = useState(false);
  const [newRedirectUri, setNewRedirectUri] = useState('');

  // Android Digital Asset Links state
  const [androidAssets, setAndroidAssets] = useState<AndroidDigitalAsset[]>([]);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');
  const [newFingerprints, setNewFingerprints] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await apiService.get(`/api/business/apps/${id}`);
        if (response.success && response.app) {
          const a = response.app;
          setApp(a);
          setName(a.name);
          setWebsite(a.website_url || '');
          setEnvironment(a.environment || 'sandbox');
          setListingStatus(a.listing_status || 'unlisted');
          setServiceCategory(a.service_category || 'other');
          setSupportedRoles(a.supported_roles || []);
          setTrustEventsEnabled(Boolean(a.trust_events_enabled));
          setTrustCapacityEnabled(Boolean(a.trust_capacity_enabled));
          setRatingsEnabled(Boolean(a.ratings_enabled));
          setTier(a.sdk_config?.requiredTier || 'L1');
          setProofs(a.sdk_config?.proofs || deriveProofsFromScopes(a.requested_scopes || []));
          setLogoUrl(a.sdk_config?.logo_url || '');
          setAllowedOrigins(a.allowed_origins || []);
          setRedirectUris(a.redirect_uris || []);
          setAndroidAssets(a.android_digital_assets || []);
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

  const handleSave = async () => {
    if (!id) return;
    if ((trustEventsEnabled || trustCapacityEnabled) && supportedRoles.length === 0) {
      setToastMessage('Select at least one consumer or provider role before enabling Trust Capacity or trust events.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    try {
      setSaving(true);
      const response = await apiService.patch(`/api/business/apps/${id}`, {
        name,
        website_url: website,
        environment,
        listing_status: listingStatus,
        service_category: serviceCategory,
        supported_roles: supportedRoles,
        trust_events_enabled: trustEventsEnabled,
        trust_capacity_enabled: trustCapacityEnabled,
        ratings_enabled: ratingsEnabled,
        allowed_origins: allowedOrigins,
        redirect_uris: redirectUris,
        android_digital_assets: androidAssets,
        sdk_config: {
          requiredTier: tier,
          proofs: proofs
        }
      });

      if (response.success) {
        setToastMessage('Changes saved successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        if (response.app) {
          const updatedApp = response.app as BusinessApp;
          setApp(updatedApp);
          setEnvironment(updatedApp.environment || environment);
          setListingStatus(updatedApp.listing_status || listingStatus);
          setServiceCategory(updatedApp.service_category || serviceCategory);
          setSupportedRoles(updatedApp.supported_roles || supportedRoles);
          setTrustEventsEnabled(Boolean(updatedApp.trust_events_enabled));
          setTrustCapacityEnabled(Boolean(updatedApp.trust_capacity_enabled));
          setRatingsEnabled(Boolean(updatedApp.ratings_enabled));
          setTier(updatedApp.sdk_config?.requiredTier || tier);
          setProofs(updatedApp.sdk_config?.proofs || deriveProofsFromScopes(updatedApp.requested_scopes || []));
          setLogoUrl(updatedApp.sdk_config?.logo_url || '');
          setAllowedOrigins(updatedApp.allowed_origins || []);
          setRedirectUris(updatedApp.redirect_uris || []);
          setAndroidAssets(updatedApp.android_digital_assets || []);
          setWebsite(updatedApp.website_url || '');
          setName(updatedApp.name || name);
        }
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to save changes');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleTierChange = (nextTier: 'L1' | 'L2' | 'L3') => {
    setTier(nextTier);
    setProofs((prev) => sanitizeProofsForTier(prev, nextTier));
  };

  const toggleProof = (proofId: string) => {
    if (!proofAllowedForTier(proofId, tier)) {
      return;
    }

    setProofs(prev =>
      prev.includes(proofId)
        ? prev.filter(p => p !== proofId)
        : [...prev, proofId]
    );
  };

  const toggleTrustRole = (role: 'consumer' | 'provider') => {
    setSupportedRoles((current) => current.includes(role)
      ? current.filter((item) => item !== role)
      : [...current, role]);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    try {
      setSaving(true);
      const response = await apiService.uploadAppLogo(id, file);
      if (response.success && response.logo_url) {
        setLogoUrl(response.logo_url);
        setToastMessage('Logo uploaded successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err: any) {
      setToastMessage(err.message || 'Logo upload failed');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllowedOrigin = () => {
    if (!newAllowedOrigin.trim()) {
      setToastMessage('URL is required');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      const originUrl = new URL(newAllowedOrigin);
      const isLocalhost = originUrl.hostname === 'localhost' && originUrl.protocol === 'http:';
      if (originUrl.protocol !== 'https:' && !isLocalhost) throw new Error('Invalid protocol');
      if (originUrl.pathname !== '/' || originUrl.search || originUrl.hash) {
        throw new Error('Origin must not include a path');
      }
    } catch {
      setToastMessage('Use an HTTPS origin without a path, or HTTP localhost for development');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const normalizedOrigin = new URL(newAllowedOrigin).origin;
    if (allowedOrigins.includes(normalizedOrigin)) {
      setToastMessage('Origin already added');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setAllowedOrigins(prev => [...prev, normalizedOrigin]);
    setNewAllowedOrigin('');
    setShowAllowedOriginModal(false);
  };

  const handleRemoveAllowedOrigin = (index: number) => {
    setAllowedOrigins(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRedirectUri = () => {
    if (!newRedirectUri.trim()) {
      setToastMessage('URL is required');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      const redirectUri = new URL(newRedirectUri);
      const isLocalhost = redirectUri.hostname === 'localhost' && redirectUri.protocol === 'http:';
      if (redirectUri.protocol !== 'https:' && !isLocalhost) throw new Error('Invalid protocol');
    } catch {
      setToastMessage('Use an HTTPS callback URL, or HTTP localhost for development');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const normalizedRedirectUri = new URL(newRedirectUri).toString();
    if (redirectUris.includes(normalizedRedirectUri)) {
      setToastMessage('Redirect URI already added');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setRedirectUris(prev => [...prev, normalizedRedirectUri]);
    setNewRedirectUri('');
    setShowRedirectUriModal(false);
  };

  const handleRemoveRedirectUri = (index: number) => {
    setRedirectUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAndroidAsset = () => {
    if (!newPackageName.trim()) {
      setToastMessage('Package name is required');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const fingerprints = newFingerprints
      .split(',')
      .map(fp => fp.trim().toUpperCase())
      .filter(Boolean);

    const newAsset: AndroidDigitalAsset = {
      package_name: newPackageName.trim(),
      sha256_fingerprints: fingerprints,
      created_at: new Date().toISOString()
    };

    setAndroidAssets(prev => [...prev, newAsset]);
    setNewPackageName('');
    setNewFingerprints('');
    setShowAndroidModal(false);
  };

  const handleRemoveAndroidAsset = (index: number) => {
    setAndroidAssets(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500 font-bold">{error || 'App not found'}</p>
        <button onClick={() => navigate('/business/integrations')} className="text-primary font-bold hover:underline">
          Back to Integrations
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-text-main/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <span className={`material-symbols-outlined ${toastMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'} !text-xl`}>
            {toastMessage.includes('Failed') ? 'error' : 'check_circle'}
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.environment === 'production' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              {app.environment === 'production' ? 'Production' : 'Sandbox'}
            </span>
          </div>

        </div>
        <p className="text-text-muted">Unique ID: <span className="font-mono text-xs bg-background-light px-2 py-1 rounded">{app.app_id}</span></p>
      </div>

      <ActivityHeatmap
        title="Verification Volume"
        subtitle="Daily identity verifications for this application over the last 6 months"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">App Configuration</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">App Name</label>
                <input 
                  className="w-full rounded-lg border-border-muted bg-background-light/50 focus:border-primary focus:ring-primary text-sm p-3" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">App Website</label>
                <input 
                  className="w-full rounded-lg border-border-muted bg-background-light/50 focus:border-primary focus:ring-primary text-sm p-3" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-background-light/50 border border-border-muted">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-text-main">Production Mode</span>
                  <span className="text-xs text-text-muted">Enable production environment to list in public directory</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={environment === 'production'}
                    onChange={(e) => setEnvironment(e.target.checked ? 'production' : 'sandbox')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background-light/50 border border-border-muted">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-text-main">List in Public Directory</span>
                  <span className="text-xs text-text-muted">Show this app in the CasperID integrations marketplace</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={listingStatus === 'listed'}
                    onChange={(e) => setListingStatus(e.target.checked ? 'listed' : 'unlisted')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">App Logo</label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-dashed border-primary overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined !text-3xl text-primary">image</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                    />
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      disabled={saving}
                      className="text-sm font-bold text-primary hover:underline text-left disabled:opacity-50"
                    >
                      {saving ? 'Uploading...' : 'Upload new logo'}
                    </button>
                    <p className="text-xs text-text-muted">SVG, PNG or JPG (max. 500x500px)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">Portable Trust</h3>
              <p className="text-xs text-text-muted mt-1">Configure factual service events separately from profile recommendations.</p>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="service-category" className="text-sm font-bold text-text-main">Service category</label>
                <select
                  id="service-category"
                  value={serviceCategory}
                  onChange={(event) => {
                    const category = event.target.value;
                    setServiceCategory(category);
                    if (category !== 'mobility') {
                      setTrustEventsEnabled(false);
                      setTrustCapacityEnabled(false);
                      setRatingsEnabled(false);
                    }
                  }}
                  className="w-full rounded-lg border-border-muted bg-background-light/50 focus:border-primary focus:ring-primary text-sm p-3"
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

              <div>
                <p className="text-sm font-bold text-text-main mb-2">Roles represented by this app</p>
                <div className="flex gap-3">
                  {(['consumer', 'provider'] as const).map((role) => (
                    <label key={role} className="flex-1 flex items-center gap-2 p-3 rounded-lg border border-border-muted bg-background-light/50 cursor-pointer capitalize">
                      <input type="checkbox" checked={supportedRoles.includes(role)} onChange={() => toggleTrustRole(role)} />
                      <span className="text-sm font-medium">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-4 rounded-xl bg-background-light/50 border border-border-muted">
                <span>
                  <span className="block text-sm font-bold text-text-main">Accept trust events</span>
                  <span className="block text-xs text-text-muted">Mobility pilot only. Sandbox events never change live scores.</span>
                </span>
                <input
                  type="checkbox"
                  checked={trustEventsEnabled}
                  disabled={serviceCategory !== 'mobility'}
                  onChange={(event) => {
                    setTrustEventsEnabled(event.target.checked);
                    if (!event.target.checked) setRatingsEnabled(false);
                  }}
                />
              </label>

              <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-background-light/50 border border-border-muted">
                <span>
                  <span className="block text-sm font-bold text-text-main">Request Trust Capacity at sign-in</span>
                  <span className="block text-xs text-text-muted">Adds consented <code>read:trust_capacity</code>. The business JWT receives provider and consumer score, status, timestamp, and policy version—never events or review text.</span>
                </span>
                <input
                  type="checkbox"
                  checked={trustCapacityEnabled}
                  disabled={serviceCategory !== 'mobility'}
                  onChange={(event) => setTrustCapacityEnabled(event.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-background-light/50 border border-border-muted">
                <span>
                  <span className="block text-sm font-bold text-text-main">Verified numeric ratings</span>
                  <span className="block text-xs text-text-muted">Maximum 5% influence; written reviews remain on the service platform.</span>
                </span>
                <input
                  type="checkbox"
                  checked={ratingsEnabled}
                  disabled={!trustEventsEnabled}
                  onChange={(event) => setRatingsEnabled(event.target.checked)}
                />
              </label>

              {trustEventsEnabled && environment === 'production' ? (
                <p className={`text-xs rounded-xl p-3 ${app.trust_production_approved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {app.trust_production_approved
                    ? 'Production trust events are approved to affect scores.'
                    : 'Production approval is pending. Events are accepted for testing but cannot affect user scores.'}
                </p>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">Allowed Origins</h3>
              <button
                onClick={() => setShowAllowedOriginModal(true)}
                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined !text-sm">add</span> Add Origin
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-text-muted">Browser origins allowed to start CasperID hosted authorization. Do not include paths.</p>
              <div className="flex flex-col gap-2">
                {allowedOrigins.map((origin, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className="flex-1 rounded-lg border-border-muted bg-background-light/30 text-sm p-3 text-text-main" readOnly value={origin} />
                    <button
                      onClick={() => handleRemoveAllowedOrigin(i)}
                      className="p-2 text-text-muted hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined !text-xl">delete</span>
                    </button>
                  </div>
                ))}
                {allowedOrigins.length === 0 && (
                  <p className="text-xs text-text-muted italic">No allowed origins configured.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">OAuth Redirect URIs</h3>
              <button 
                onClick={() => setShowRedirectUriModal(true)}
                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined !text-sm">add</span> Add URL
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-text-muted">Exact callback URLs allowed after hosted authorization. Include the callback path, for example /auth/callback.</p>
              <div className="flex flex-col gap-2">
                {redirectUris.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className="flex-1 rounded-lg border-border-muted bg-background-light/30 text-sm p-3 text-text-main" readOnly value={url} />
                    <button 
                      onClick={() => handleRemoveRedirectUri(i)}
                      className="p-2 text-text-muted hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined !text-xl">delete</span>
                    </button>
                  </div>
                ))}
                {redirectUris.length === 0 && (
                  <p className="text-xs text-text-muted italic">No redirect URIs configured.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">Android Configuration</h3>
              <button
                onClick={() => setShowAndroidModal(true)}
                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined !text-sm">add</span> Add Android App
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-text-muted">Configure Android apps that can use passkeys with CasperID. Each app requires a package name and SHA256 certificate fingerprints.</p>
              <div className="flex flex-col gap-3">
                {androidAssets.map((asset, i) => (
                  <div key={i} className="border border-border-muted rounded-lg p-4 bg-background-light/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-main">{asset.package_name}</p>
                        <p className="text-xs text-text-muted mt-1">
                          {asset.sha256_fingerprints.length} fingerprint{asset.sha256_fingerprints.length !== 1 ? 's' : ''} configured
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveAndroidAsset(i)}
                        className="p-1 text-text-muted hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined !text-lg">delete</span>
                      </button>
                    </div>
                    {asset.sha256_fingerprints.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {asset.sha256_fingerprints.map((fp, fpIndex) => (
                          <code key={fpIndex} className="text-[10px] text-text-muted bg-background-light/50 px-2 py-1 rounded font-mono break-all">
                            {fp}
                          </code>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {androidAssets.length === 0 && (
                  <p className="text-xs text-text-muted italic">No Android apps configured.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">Verification Requirements</h3>
            </div>
            <div className="p-6 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-sm font-bold text-text-main">Required Trust Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {['L1', 'L2', 'L3'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTierChange(t as 'L1' | 'L2' | 'L3')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center gap-1 ${tier === t ? 'border-primary bg-primary/5' : 'border-border-muted hover:border-primary/50'
                        }`}
                    >
                      <span className={`text-lg font-black ${tier === t ? 'text-primary' : 'text-text-main'}`}>{t}</span>
                      <span className={`text-[10px] uppercase font-bold ${tier === t ? 'text-primary' : 'text-text-muted'}`}>
                        {t === 'L1' ? 'Basic' : t === 'L2' ? 'Verified' : 'Premium'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted italic">Higher tiers provide more robust identity assurance but may reduce conversion.</p>
              </div>
              <hr className="border-border-muted" />
              <div className="flex flex-col gap-4">
                <label className="text-sm font-bold text-text-main">Specific Proofs Required</label>
                <div className="flex flex-col gap-4">
                  {[
                    { id: 'liveness', label: 'Verify Liveness', sub: 'Biometric face-matching check' },
                    { id: 'age', label: 'Verify Age', sub: 'Confirm user is 18+ years old' },
                    { id: 'email', label: 'Email Verification', sub: 'Require verified primary email' },
                    { id: 'phone', label: 'Share Contact Phone', sub: 'Request the user’s phone number with their consent' },
                  ].map((proof) => (
                    <div key={proof.id} className={`flex items-center justify-between ${!proofAllowedForTier(proof.id, tier) ? 'opacity-50' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-main">{proof.label}</span>
                        <span className="text-xs text-text-muted">
                          {proof.sub}
                          {!proofAllowedForTier(proof.id, tier) ? ` Requires ${PROOF_MINIMUM_TIER[proof.id]}.` : ''}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={proofs.includes(proof.id)} 
                          disabled={!proofAllowedForTier(proof.id, tier)}
                          onChange={() => toggleProof(proof.id)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer disabled:cursor-not-allowed peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:bg-gray-100"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allowed Origin Modal */}
      {showAllowedOriginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">Add Allowed Origin</h3>
              <button
                onClick={() => {
                  setShowAllowedOriginModal(false);
                  setNewAllowedOrigin('');
                }}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">Browser Origin</label>
                <input
                  type="text"
                  autoFocus
                  value={newAllowedOrigin}
                  onChange={(e) => setNewAllowedOrigin(e.target.value)}
                  placeholder="https://myapp.com"
                  className="rounded-lg border border-border-muted bg-background-light/30 text-sm p-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllowedOrigin()}
                />
                <p className="text-xs text-text-muted">Enter only the origin, such as `https://myapp.com` or `http://localhost:3000`.</p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowAllowedOriginModal(false);
                    setNewAllowedOrigin('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border-muted text-text-main font-bold text-sm hover:bg-background-light/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAllowedOrigin}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Add Origin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redirect URL Modal */}
      {showRedirectUriModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">Add OAuth Redirect URI</h3>
              <button
                onClick={() => {
                  setShowRedirectUriModal(false);
                  setNewRedirectUri('');
                }}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">Exact Callback URL</label>
                <input
                  type="text"
                  autoFocus
                  value={newRedirectUri}
                  onChange={(e) => setNewRedirectUri(e.target.value)}
                  placeholder="https://myapp.com/auth/callback"
                  className="rounded-lg border border-border-muted bg-background-light/30 text-sm p-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRedirectUri()}
                />
                <p className="text-xs text-text-muted">Enter the complete redirect URI, including protocol, host, optional port, and callback path.</p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowRedirectUriModal(false);
                    setNewRedirectUri('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border-muted text-text-main font-bold text-sm hover:bg-background-light/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRedirectUri}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Android Asset Modal */}
      {showAndroidModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">Add Android App</h3>
              <button
                onClick={() => {
                  setShowAndroidModal(false);
                  setNewPackageName('');
                  setNewFingerprints('');
                }}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">Package Name</label>
                <input
                  type="text"
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                  placeholder="com.example.app"
                  className="rounded-lg border border-border-muted bg-background-light/30 text-sm p-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-muted">Your Android app's package name (e.g., com.orb.app)</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">SHA256 Certificate Fingerprints</label>
                <textarea
                  value={newFingerprints}
                  onChange={(e) => setNewFingerprints(e.target.value)}
                  placeholder="AA:BB:CC:DD:EE:FF:..., XX:YY:ZZ:..."
                  rows={3}
                  className="rounded-lg border border-border-muted bg-background-light/30 text-sm p-3 text-text-main font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-text-muted">Comma-separated SHA256 fingerprints. Include both debug and release keys.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1">
                  <p className="text-xs font-bold text-blue-900 mb-1">Get your fingerprints:</p>
                  <code className="text-[10px] text-blue-800 block mb-1">keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android</code>
                  <code className="text-[10px] text-blue-800 block">keytool -list -v -keystore /path/to/release.keystore -alias your-alias</code>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowAndroidModal(false);
                    setNewPackageName('');
                    setNewFingerprints('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border-muted text-text-main font-bold text-sm hover:bg-background-light/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAndroidAsset}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Add App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationDetail;
