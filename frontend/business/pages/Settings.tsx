
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface UserProfile {
  email?: string;
  display_name?: string;
  wallet?: string;
}

const Settings: React.FC = () => {
  const [showProfileToast, setShowProfileToast] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = () => {
    // Note: Organization profile saving is not yet implemented in backend
    setShowProfileToast(true);
    setTimeout(() => setShowProfileToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Toast for profile save */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-200 transition-all duration-300 transform ${showProfileToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-text-main/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <span className="material-symbols-outlined text-amber-400 text-xl">info</span>
          <p className="text-sm font-bold">Organization settings are not yet connected to backend.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Organization Settings</h2>
        <p className="text-text-muted">Manage your organization profile, team members, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organization Profile */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">corporate_fare</span>
                <h3 className="text-lg font-bold text-text-main">Organization Profile</h3>
              </div>
              <span className="text-xs text-amber-600 font-bold px-2 py-1 bg-amber-50 rounded">Coming Soon</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Account Email</label>
                  <input
                    className="w-full rounded-lg border border-border-muted bg-background-light/50 px-4 py-2 text-sm"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Display Name</label>
                  <input
                    className="w-full rounded-lg border border-border-muted bg-background-light/50 px-4 py-2 text-sm"
                    type="text"
                    value={profile?.display_name || ''}
                    disabled
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mt-2">
                  <p className="text-xs text-amber-700">
                    <span className="font-bold">Note:</span> Organization profile management is coming soon. For now, your account profile is shown.
                  </p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled
                  className="mt-4 w-full py-2.5 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed"
                >
                  Save Profile (Coming Soon)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Team Management - Coming Soon */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-text-main">Team Management</h3>
                <span className="text-xs text-amber-600 font-bold px-2 py-1 bg-amber-50 rounded">Coming Soon</span>
              </div>
              <p className="text-sm text-text-muted">Manage your team members and their access levels.</p>
            </div>
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">person_add</span> Invite Member
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">groups</span>
              </div>
              <h4 className="text-lg font-bold text-text-main mb-2">Team Collaboration Coming Soon</h4>
              <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
                Invite team members, assign roles, and collaborate on your integrations. This feature is currently under development.
              </p>

              {/* Preview of what's coming */}
              <div className="mt-8 border-t border-border-muted pt-6">
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-4">Planned Features</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: 'person_add', title: 'Invite Members', desc: 'Add teammates via email' },
                    { icon: 'admin_panel_settings', title: 'Role-Based Access', desc: 'Admin, Developer, Viewer roles' },
                    { icon: 'history', title: 'Activity Logs', desc: 'Track team actions' },
                  ].map((feature, i) => (
                    <div key={i} className="p-4 bg-background-light/50 rounded-xl border border-border-muted">
                      <span className="material-symbols-outlined text-primary mb-2">{feature.icon}</span>
                      <h5 className="font-bold text-text-main text-sm">{feature.title}</h5>
                      <p className="text-xs text-text-muted mt-1">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-border-muted shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            <h3 className="text-lg font-bold text-text-main">Security Settings</h3>
          </div>
          <span className="text-xs text-amber-600 font-bold px-2 py-1 bg-amber-50 rounded">Coming Soon</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: 'key', title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your organization', enabled: false },
            { icon: 'vpn_key', title: 'SSO Integration', desc: 'Connect with your identity provider (Okta, Auth0, etc.)', enabled: false },
            { icon: 'domain_verification', title: 'Domain Verification', desc: 'Verify your organization domain for enhanced trust', enabled: false },
            { icon: 'policy', title: 'IP Allowlisting', desc: 'Restrict API access to specific IP addresses', enabled: false },
          ].map((setting, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border border-border-muted rounded-xl opacity-60">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">{setting.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-text-main">{setting.title}</h4>
                <p className="text-xs text-text-muted mt-1">{setting.desc}</p>
              </div>
              <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
