
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { notifyError, notifySuccess } from '../utils/notify';

type Tab = 'General' | 'Wallets' | 'Security' | 'Notifications' | 'Permissions';

/** General Settings Tab */
const GeneralTab = () => {
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    dateOfBirth: ''
  });
  const [copied, setCopied] = useState(false);
  const [systemPrefs, setSystemPrefs] = useState({
    language: 'Detecting...',
    timezone: 'Detecting...'
  });

  useEffect(() => {
    // Detect system preferences
    setSystemPrefs({
      language: navigator.language || 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    });

    const fetchProfile = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await apiService.getUserProfile();
        if (data) {
          setProfile(data);
          setFormData({
            displayName: (data as any).first_name ? `${(data as any).first_name} ${(data as any).last_name || ''}`.trim() : (data as any).display_name || '',
            email: (data as any).email || '',
            dateOfBirth: (data as any).date_of_birth ? new Date((data as any).date_of_birth).toISOString().split('T')[0] : ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchProfile();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [user, isAuthenticated, isLoading]);

  const handleCopyDID = () => {
    if (profile?.did_address) {
      navigator.clipboard.writeText(profile.did_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Split display name into first/last
      const names = formData.displayName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');

      const updates: any = {
        email: formData.email,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: formData.dateOfBirth
      };

      const response = await apiService.updateUserProfile(updates);
      if (response) {
        notifySuccess('Profile updated successfully');
        // Refresh global user state to sync with persona/disclosure modals
        await refreshUser();
        // Local state will be updated by useEffect [user]
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      notifyError('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="app-panel p-8">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-lg font-bold text-text-main">Account Information</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><span className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span> Saving...</>
            ) : 'Save Changes'}
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-border-strong flex flex-col items-center justify-center bg-surface-muted overflow-hidden relative group">
              {profile?.profile_image_url ? (
                <img src={profile.profile_image_url} className="absolute inset-0 w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="material-symbols-outlined text-text-sub text-4xl opacity-20">person</span>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="material-symbols-outlined text-white text-2xl">edit</span>
              </div>
            </div>
            <p className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Profile Photo</p>
          </div>
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  className="app-input w-full h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="app-input w-full h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="app-input w-full h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest">DID Identifier</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={profile?.did_address || 'No DID created'}
                  className="app-input w-full h-11 pl-4 pr-12 rounded-xl text-sm font-mono font-medium text-text-sub"
                />
                <button
                  onClick={handleCopyDID}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub hover:text-primary p-1 transition-colors"
                  title="Copy DID"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-panel p-8">
        <h2 className="text-lg font-bold text-text-main mb-2">System Preferences</h2>
        <p className="text-sm text-text-sub font-medium mb-8">Settings automatically detected from your device.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Language</label>
            <div className="relative">
              <div className="app-input w-full h-11 px-4 rounded-xl text-sm font-bold flex items-center justify-between opacity-70 cursor-not-allowed">
                <span>{systemPrefs.language}</span>
                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded">System Default</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Timezone</label>
            <div className="relative">
              <div className="app-input w-full h-11 px-4 rounded-xl text-sm font-bold flex items-center justify-between opacity-70 cursor-not-allowed">
                <span>{systemPrefs.timezone}</span>
                <span className="text-[10px] font-black uppercase text-text-sub bg-surface px-2 py-1 rounded border border-border-subtle">Auto-Detected</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface Device {
  credentialId: string;
  deviceName?: string;
  userAgent?: string;
  createdAt: string;
  lastUsed?: string;
}

/** Security Settings Tab */
const SecurityTab = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await apiService.getDevices();

        if (response.success) {
          // The API returns { success: true, devices: { devices: [], activeSessions: [], recentPairings: [] } }
          // Extract the actual devices array from the nested structure
          const devicesData = response.devices as any || {};
          const rawList = Array.isArray(devicesData) ? devicesData : (devicesData.devices || []);

          // Map backend snake_case to frontend camelCase
          const mappedList = rawList.map((d: any) => ({
            credentialId: d.credential_id || d._id,
            deviceName: d.device_name || d.name || 'Unknown Device',
            userAgent: d.user_agent,
            createdAt: d.created_at,
            lastUsed: d.last_used || d.last_activity
          }));

          setDevices(mappedList);
        } else {
          console.warn('⚠️  [Settings] No devices in response');
          setDevices([]);
        }
      } catch (err: any) {
        console.error('❌ [Settings] Failed to fetch devices:', err);
        setError(err.message || 'Failed to load devices');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchDevices();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, user, isLoading]);

  const handleRevokeDevice = async (credentialId: string, deviceName: string) => {
    if (!confirm(`Are you sure you want to revoke access for "${deviceName || 'this device'}"? You'll need to register this device again to use it.`)) {
      return;
    }

    setRevoking(credentialId);
    try {
      const response = await apiService.revokeDevice(credentialId);

      if (response.success) {
        // Remove device from list
        setDevices(devices.filter(d => d.credentialId !== credentialId));
        notifySuccess('Device revoked successfully');
      } else {
        notifyError('Failed to revoke device: ' + (response.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('❌ [Settings] Failed to revoke device:', err);
      notifyError('Failed to revoke device: ' + (err.message || 'Unknown error'));
    } finally {
      setRevoking(null);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
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
    } catch (err: any) {
      notifyError('Failed to export data: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to permanently delete your account, profile, credentials, and passkeys? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await apiService.deleteAccount();
      notifySuccess('Account deleted successfully.');
      window.location.href = '/login';
    } catch (err: any) {
      notifyError('Failed to delete account: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">


      {/* NEW: Registered Devices Section */}
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-8">
        <h2 className="text-lg font-bold text-text-main mb-2">Registered Devices</h2>
        <p className="text-sm text-text-sub font-medium mb-8">
          Manage passkey devices that can authenticate to your account.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-text-sub mb-3 block">devices</span>
            <p className="text-text-sub text-sm font-medium">No devices registered</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.credentialId}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">devices</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">
                      {device.deviceName !== 'Unknown Device' ? device.deviceName : (
                        // Basic UA Parser fallback
                        device.userAgent?.includes('Mac') ? 'Mac Device' :
                          device.userAgent?.includes('Win') ? 'Windows Device' :
                            device.userAgent?.includes('iPhone') ? 'iPhone' :
                              device.userAgent?.includes('Android') ? 'Android Device' : 'Unknown Device'
                      )}
                    </p>
                    <p className="text-xs text-text-sub">
                      Added: {device.createdAt ? new Date(device.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Unknown Date'}
                      {device.lastUsed && ` • Last used: ${new Date(device.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeDevice(device.credentialId, device.deviceName || 'Unknown')}
                  disabled={revoking === device.credentialId}
                  className="px-4 py-2 border border-red-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {revoking === device.credentialId ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pt-8 border-t border-gray-100">
        <div className="bg-red-50/50 border border-red-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h4 className="text-alerts font-bold text-base">Danger Zone</h4>
            <p className="text-sm text-text-sub font-medium">
              Export your account data or permanently delete your identity. Deletion removes your account, profile, credentials, and registered passkeys.
            </p>
          </div>
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <button
              onClick={handleExportData}
              disabled={exporting || deleting}
              className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-red-100 rounded-2xl text-sm font-bold text-text-main hover:bg-white transition-all shadow-sm disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || exporting}
              className="flex-1 md:flex-none px-6 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/** Notifications Settings Tab */
const NotificationsTab = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [prefs, setPrefs] = useState({
    security_alerts: true,
    kyc_updates: true,
    marketing_news: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const response = await apiService.getNotificationPreferences();
        if (response.success && response.preferences) {
          setPrefs(response.preferences);
        }
      } catch (e) {
        console.error('Failed to load notification preferences:', e);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadPrefs();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, user, isLoading]);

  const handleToggle = async (key: string) => {
    const newVal = !prefs[key as keyof typeof prefs];
    const newPrefs = { ...prefs, [key]: newVal };
    setPrefs(newPrefs); // Optimistic update

    try {
      await apiService.updateNotificationPreferences({ [key]: newVal });
    } catch (e) {
      console.error('Failed to update preference:', e);
      setPrefs(prefs); // Revert on error
      notifyError('Failed to update setting');
    }
  };

  return (
    <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-8">
      <h2 className="text-lg font-bold text-text-main mb-2">Notifications</h2>
      <p className="text-sm text-text-sub font-medium mb-8">Choose what we get in touch about.</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { key: 'security_alerts', title: 'Security Alerts', sub: 'Get notified about new sign-ins and suspicious activity.' },
            { key: 'kyc_updates', title: 'KYC Status Updates', sub: 'Notifications when your verification status changes.' },
            { key: 'marketing_news', title: 'Marketing & News', sub: 'Receive updates about new features and CasperID ecosystem.' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="max-w-md">
                <p className="text-sm font-bold text-text-main">{item.title}</p>
                <p className="text-[11px] text-text-sub font-medium mt-1 leading-relaxed">{item.sub}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={prefs[item.key as keyof typeof prefs]}
                  onChange={() => handleToggle(item.key)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

/** Permissions Settings Tab */
const PermissionsTab = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, permsRes] = await Promise.all([
          apiService.getUserProfile(),
          apiService.getUserPermissions()
        ]);

        if (profileRes) setProfile(profileRes);
        if (permsRes.success) setGrants(permsRes.userPermissions?.permissions || []);

      } catch (e) {
        console.error('Failed to load permissions data:', e);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadData();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [user, isAuthenticated, isLoading]);

  const handleUnlink = async () => {
    if (!confirm('Are you sure you want to disconnect MetaMask? This will revoke all active permissions.')) return;

    setRevoking(true);
    try {
      if (profile?.metamask_address) {
        await apiService.unlinkWallet(profile.metamask_address);
      } else {
        await apiService.unlinkMetaMaskAccount();
      }
      setProfile({ ...profile, metamask_connected: false, metamask_address: null });
      setGrants([]);
      notifySuccess('MetaMask disconnected successfully.');
    } catch (e: any) {
      notifyError('Failed to disconnect: ' + e.message);
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isConnected = profile?.metamask_connected;
  const address = profile?.metamask_address;

  if (!isConnected) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-text-main tracking-tight">Permissions Settings</h2>
          <p className="text-text-sub text-sm font-medium max-w-2xl leading-relaxed">
            Manage MetaMask permissions for cross-app verification.
          </p>
        </div>
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-12 text-center">
          <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-gray-400">link_off</span>
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No Wallet Connected</h3>
          <p className="text-text-sub font-medium mb-8 max-w-md mx-auto">Link your MetaMask wallet to manage permissions and enable cross-app verification.</p>
          {/* Note: Linking logic usually happens in a modal or separate flow. Logic to open that would go here. */}
          <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors opacity-50 cursor-not-allowed" title="Link via header">
            Link Wallet (Use Header)
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-text-main tracking-tight">Permissions Settings</h2>
        <p className="text-text-sub text-sm font-medium max-w-2xl leading-relaxed">
          Manage MetaMask permissions for cross-app verification.
        </p>
      </div>
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-2.5">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_v7.8.0_Icon.png" className="w-full h-full object-contain" alt="MetaMask" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main">Connected Wallet: MetaMask</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black border border-green-100 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                </span>
                <span className="text-text-sub text-[11px] font-bold">• Ethereum Mainnet</span>
              </div>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-50 mb-1">Connected On</p>
            <p className="text-sm font-bold text-text-main">
              {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
        <div className="p-8 space-y-10">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Wallet Address</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 md:flex-none md:min-w-[400px] h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center px-6">
                <span className="w-2 h-2 rounded-full bg-primary/40 mr-3"></span>
                <span className="text-sm font-mono font-medium text-text-main">
                  {address || 'Unknown Address'}
                </span>
              </div>
              <button
                onClick={() => address && navigator.clipboard.writeText(address)}
                className="size-14 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-text-sub hover:text-primary transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[22px]">content_copy</span>
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Permissions Granted</label>
              {/* <button className="text-xs font-bold text-primary hover:underline">View Policy</button> */}
            </div>

            {grants.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-sm text-text-sub font-medium">No active permissions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {grants.map((grant, i) => (
                  <div key={grant.grantId || i} className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-[24px] text-primary mt-0.5">verified_user</span>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-[15px] font-bold text-text-main leading-tight">{grant.dappName || 'Connected App'}</h4>
                          <p className="text-[13px] text-text-sub font-medium leading-relaxed break-all">
                            {grant.dappOrigin || 'Unknown origin'}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-700 border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {grant.status || 'active'}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {Array.isArray(grant.permissions) && grant.permissions.length > 0 ? grant.permissions.map((permission: any, permissionIndex: number) => (
                        <div key={`${grant.grantId}-${permission.action}-${permissionIndex}`} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                          <p className="text-sm font-black text-text-main">{permission.action}</p>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text-sub">
                            Tier: {permission.scope?.tier || 'n/a'} • Frequency: {permission.scope?.frequency || 'n/a'}
                          </p>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm font-medium text-text-sub">
                          No active permission entries for this grant.
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-text-sub">
                      <span>Usage: {grant.usageCount || 0}</span>
                      <span>Last used: {grant.lastUsed ? new Date(grant.lastUsed).toLocaleDateString() : 'Never'}</span>
                      <span>Expires: {grant.expiresAt ? new Date(grant.expiresAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-gray-50">
            <div className="w-full md:w-auto rounded-2xl border border-gray-100 bg-gray-50 px-6 py-3 text-sm font-bold text-text-sub">
              Detailed permission editing lives in Data Controls.
            </div>
            <div className="flex-1"></div>
            <button
              onClick={handleUnlink}
              disabled={revoking}
              className="w-full md:w-auto px-8 py-3.5 border-2 border-red-50 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              {revoking ? 'Disconnecting...' : 'Revoke Connection'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/** Wallets Settings Tab */
const WalletsTab = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [user, isAuthenticated, isLoading]);

  const handleUnlink = async (address: string) => {
    if (!confirm(`Are you sure you want to unlink wallet ${address}?`)) return;

    setUnlinking(address);
    try {
      await apiService.unlinkWallet(address);
      await fetchProfile();
      notifySuccess('Wallet unlinked successfully');
    } catch (error: any) {
      notifyError('Failed to unlink: ' + error.message);
    } finally {
      setUnlinking(null);
    }
  };

  // Move hooks above conditional returns to comply with Rules of Hooks
  const linkedWallets = profile?.linked_wallets || [];

  // Combine primary wallet with linked wallets
  const allWallets = React.useMemo(() => {
    const wallets: any[] = [];

    // Add primary wallet if exists and not already in linked_wallets
    if (profile?.wallet) {
      const isPrimaryInLinked = linkedWallets.some((w: any) =>
        w.address?.toLowerCase() === profile.wallet?.toLowerCase()
      );
      if (!isPrimaryInLinked) {
        wallets.push({
          chain: 'casper', // Primary passkey-derived wallet
          address: profile.wallet,
          verified: true,
          isPrimary: true
        });
      }
    }

    // Add all linked wallets
    linkedWallets.forEach((w: any) => wallets.push({ ...w, isPrimary: w.address === profile?.wallet }));

    return wallets;
  }, [profile?.wallet, linkedWallets]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-text-main tracking-tight">Multi-Chain Wallets</h2>
        <p className="text-text-sub text-sm font-medium max-w-2xl leading-relaxed">
          Manage your linked wallets across different blockchain ecosystems.
        </p>
      </div>

      <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-main">Linked Wallets</h3>
          <button
            onClick={() => (window as any).dispatchEvent(new CustomEvent('openConnectWallet'))}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg active:scale-95 shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add_link</span>
            Link New Wallet
          </button>
        </div>

        <div className="p-8 space-y-4">
          {allWallets.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200">
              <span className="material-symbols-outlined text-4xl text-text-sub/40 mb-3">account_balance_wallet</span>
              <p className="text-text-sub font-medium">No wallets linked yet.</p>
            </div>
          ) : (
            allWallets.map((wallet: any, i: number) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[24px] border border-gray-100 bg-white hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm ${wallet.chain === 'ethereum' ? 'bg-indigo-50 text-indigo-600' :
                    wallet.chain === 'casper' ? 'bg-red-50 text-red-600' :
                      wallet.chain === 'solana' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                    <span className="material-symbols-outlined text-[26px]">
                      {wallet.chain === 'ethereum' ? 'currency_eth' :
                        wallet.chain === 'casper' ? 'token' : 'wallet'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-text-main capitalize">{wallet.chain} Wallet</h4>
                      {wallet.address === profile?.wallet && (
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">Master</span>
                      )}
                    </div>
                    <p className="text-sm font-mono text-text-sub mt-0.5">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigator.clipboard.writeText(wallet.address)}
                    className="p-3 rounded-xl border border-gray-100 text-text-sub hover:text-primary hover:bg-gray-50 transition-all"
                    title="Copy Address"
                  >
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                  {wallet.address !== profile?.wallet && (
                    <button
                      onClick={() => handleUnlink(wallet.address)}
                      disabled={unlinking === wallet.address}
                      className="px-5 py-3 rounded-xl border border-red-100 text-sm font-bold text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {unlinking === wallet.address ? 'Unlinking...' : 'Unlink'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [counts, setCounts] = useState({ wallets: 0, permissions: 0 });
  const tabs: Tab[] = ['General', 'Wallets', 'Security', 'Notifications', 'Permissions'];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [profile, perms] = await Promise.all([
          apiService.getUserProfile(),
          apiService.getUserPermissions()
        ]);
        setCounts({
          wallets: profile?.linked_wallets?.length || 0,
          permissions: perms.userPermissions?.length || 0
        });
      } catch (e) {
        console.error('Failed to fetch counts:', e);
      }
    };
    fetchCounts();
  }, [activeTab, user]); // Refresh counts when tab changes or initially

  const renderTabContent = () => {
    switch (activeTab) {
      case 'General': return <GeneralTab />;
      case 'Wallets': return <WalletsTab />;
      case 'Security': return <SecurityTab />;
      case 'Notifications': return <NotificationsTab />;
      case 'Permissions': return <PermissionsTab />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-text-main">Settings</h1>
        <p className="text-text-sub text-base font-normal max-w-2xl leading-relaxed">Manage your global preferences, security, and notifications.</p>
      </div>
      <div className="border-b border-gray-100 flex gap-8 overflow-x-auto no-scrollbar relative">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-sub hover:text-text-main'}`}
          >
            {tab}
            {tab === 'Wallets' && counts.wallets > 0 && (
              <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-black">
                {counts.wallets}
              </span>
            )}
            {tab === 'Permissions' && counts.permissions > 0 && (
              <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-black">
                {counts.permissions}
              </span>
            )}
          </button>
        ))}
      </div>
      {renderTabContent()}
    </div>
  );
};
