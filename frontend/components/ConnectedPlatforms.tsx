import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

interface ConnectedPlatformsProps {
  onAddNew?: () => void;
}

export const ConnectedPlatforms: React.FC<ConnectedPlatformsProps> = ({ onAddNew }) => {
  const { user, isAuthenticated } = useAuth();
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPlatforms();
    } else if (!isAuthenticated) {
      setLoading(false);
      setPlatforms([]);
    }
  }, [isAuthenticated, user]);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserPermissions();
      const rawPermissions = response.userPermissions?.permissions || [];

      const mapped = rawPermissions.map((grant: any) => {
        const isWeb3 = grant.dappOrigin.startsWith('http') || grant.dappOrigin.includes('.');
        return {
          title: grant.dappName,
          badge: isWeb3 ? "WEB3" : "WEB2",
          badgeColor: isWeb3 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700",
          id: grant.grantId.slice(0, 8) + '...',
          lastActive: formatTimeAgo(grant.updatedAt || grant.createdAt),
          icon: isWeb3 ? 'account_balance_wallet' : 'bolt',
          status: grant.status === 'active' ? 'online' : 'offline'
        };
      });

      setPlatforms(mapped);
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-text-main">Connected Platforms</h3>
        <button
          onClick={onAddNew}
          className="flex items-center gap-1 text-primary text-[10px] font-extrabold bg-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-widest transition-all hover:bg-primary/20"
        >
          <span className="material-icons-outlined text-sm">add</span> Add New
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : platforms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-100 p-8 text-center text-text-sub">
          <span className="material-icons-outlined text-3xl mb-2 opacity-30">link_off</span>
          <p className="text-sm">No connected platforms found.</p>
        </div>
      ) : (
        <>
          {/* Mobile List View */}
          <div className="md:hidden space-y-3">
            {platforms.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-soft flex items-center justify-between group border border-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden bg-indigo-50 text-indigo-500`}>
                    <span className="material-icons-outlined text-lg">{p.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-main flex items-center gap-2">
                      {p.title}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </h4>
                    <p className="text-xs text-text-sub font-medium truncate w-32">{p.id}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${p.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            ))}
          </div>

          {/* Desktop Card Grid */}
          <div className="hidden md:grid grid-cols-2 gap-6">
            {platforms.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all relative flex flex-col h-full group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-3xl opacity-50"></div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 bg-indigo-50 text-indigo-500`}>
                      <span className="material-icons-outlined text-2xl">{p.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-main text-lg leading-tight">{p.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                        <span className="text-[10px] text-text-sub font-bold">{p.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${p.status === 'online' ? 'bg-green-500 shadow-green-200' : 'bg-gray-300 shadow-gray-100'} shadow-sm mt-1`}></div>
                </div>
                <p className="text-text-sub text-sm leading-relaxed mb-6">Last active {p.lastActive}. Permissions managed via Integrations.</p>
                <div className="pt-4 border-t border-gray-50 mt-auto flex justify-between items-center">
                  <p className="text-[11px] font-mono text-gray-400">{p.id}</p>
                  <span className="material-icons-outlined text-primary/40 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && platforms.length > 0 && (
        <div className="hidden md:block mt-6">
          <div onClick={() => window.location.href = '/integrations'} className="bg-white/40 rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center gap-3 group hover:border-primary/40 hover:bg-white/60 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-all">
              <span className="material-symbols-outlined text-2xl">add_link</span>
            </div>
            <h4 className="font-bold text-text-main">Login with Casper</h4>
            <p className="text-xs text-text-sub font-medium">Manage all application connections</p>
          </div>
        </div>
      )}
    </section>
  );
};
