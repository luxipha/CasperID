
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { label: 'Overview', icon: 'dashboard', id: 'overview' },
  { label: 'Credential Vault', icon: 'wallet', id: 'credentials' },
  { label: 'Profile', icon: 'person', id: 'profile' },
  { label: 'DID Management', icon: 'fingerprint', id: 'did-management' },
  { label: 'Names (.cid)', icon: 'badge', id: 'names' },
  { label: 'Name Management', icon: 'format_list_bulleted', id: 'names-mgmt' },
  { label: 'KYC & Liveness', icon: 'verified_user', id: 'kyc' },
  { label: 'Integrations', icon: 'extension', id: 'integrations' },
  { label: 'Data Controls', icon: 'lock', id: 'data' },
  { label: 'Activity Log', icon: 'history', id: 'activity' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    console.log('🚪 Logging out user...');
    await logout();
    // Navigation back to onboarding will be handled by App.tsx useEffect
  };

  // Map layer status to display names
  const getVerificationLevel = (layerStatus: string) => {
    switch (layerStatus) {
      case 'layer_0':
        return 'Basic';
      case 'layer_1':
        return 'Basic';
      case 'layer_2':
        return 'Layer 2';
      case 'layer_3':
        return 'Layer 3';
      default:
        return 'Basic';
    }
  };

  // Map layer status to indicator color
  const getVerificationColor = (layerStatus: string) => {
    switch (layerStatus) {
      case 'layer_0':
        return 'bg-gray-400';
      case 'layer_1':
        return 'bg-blue-500';
      case 'layer_2':
        return 'bg-green-500';
      case 'layer_3':
        return 'bg-purple-600';
      default:
        return 'bg-gray-400';
    }
  };
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-border-color flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <img src="/logos/logo.png" alt="CasperID logo" className="w-7 h-7 object-contain" />
        </div>
        <div>
          <h1 className="text-text-main text-lg font-bold leading-none tracking-tight">CasperID</h1>
          <p className="text-text-sub text-xs font-medium mt-1">Reusable Identity Layer</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        <div className="px-4 mb-2">
          <p className="text-[10px] font-bold text-text-sub/60 uppercase tracking-widest">Main Menu</p>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium group relative overflow-hidden ${currentView === item.id
              ? 'bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5'
              : 'text-text-sub hover:text-primary hover:bg-gray-50'
              }`}
          >
            {currentView === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full" />
            )}
            <span className={`material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform ${currentView === item.id ? 'icon-filled' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[15px]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border-color space-y-4">
        {/* Hidden sync elements for CasperID Extension */}
        <div
          id="casperid-extension-sync"
          style={{ display: 'none' }}
          data-wallet={user?.wallet || ''}
          data-human-id={user?.human_id || ''}
          data-cns={user?.cns_name || ''}
          data-verified={user?.tier === 'layer_3' ? 'true' : 'false'}
          data-tier={user?.tier || 'layer_0'}
          data-kyc-date={user?.kyc_completed_at || ''}
          data-liveness-date={user?.liveness_completed_at || ''}
          data-token={localStorage.getItem('casperid_session_token') || ''}
        />
        <div
          id="casperid-extension-full-data"
          style={{ display: 'none' }}
          data-json={JSON.stringify(user || {})}
        />

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentView === 'settings'
            ? 'bg-primary/10 text-primary font-bold shadow-sm'
            : 'text-text-sub hover:bg-gray-50 hover:text-text-main'
            }`}
        >
          <span className={`material-symbols-outlined ${currentView === 'settings' ? 'icon-filled' : ''}`}>settings</span>
          <span>Settings</span>
        </button>

        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-text-main truncate">
              {user?.display_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${getVerificationColor(user?.tier || 'layer_0')}`}></span>
              <p className="text-[10px] text-text-sub truncate font-medium">
                {getVerificationLevel(user?.tier || 'layer_0')} Verified
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-text-sub hover:text-primary transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
