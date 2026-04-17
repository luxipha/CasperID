import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface BusinessApp {
  app_id: string;
  name: string;
  environment: 'sandbox' | 'production';
  active: boolean;
  allowed_origins: string[];
  created_at: string;
}


const Integrations: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<BusinessApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const data = await apiService.getBusinessApps();
        setApps(data.apps || []);
      } catch (e) {
        console.error('Failed to load apps');
      } finally {
        setIsLoading(false);
      }
    };
    loadApps();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-main text-3xl font-black tracking-tight">Your Integrations</h2>
          <p className="text-text-muted">Manage the applications connected to your CasperID account.</p>
        </div>
        <button
          onClick={() => navigate('/business/api-management?create=true')}
          className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={18} /> Create New
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-primary" />
        </div>
      ) : apps.length === 0 ? (
        <div className="p-12 text-center bg-white border border-border-muted rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-background-light flex items-center justify-center text-text-muted">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="font-bold text-text-main">No Apps Found</p>
            <p className="text-sm text-text-muted">You haven't created any integrations yet.</p>
          </div>
          <button
            onClick={() => navigate('/business/api-management')}
            className="px-6 py-2.5 bg-background-light text-text-main font-bold text-sm rounded-xl hover:bg-border-muted transition-colors"
          >
            Go to API Management
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.app_id}
              onClick={() => navigate(`/business/integrations/${app.app_id}`)}
              className="bg-white p-6 rounded-2xl border border-border-muted shadow-sm hover:border-primary cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${app.environment === 'production' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${app.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {app.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors">{app.name}</h3>
                <p className="text-sm text-text-muted font-mono truncate">
                  {app.allowed_origins && app.allowed_origins.length > 0
                    ? app.allowed_origins.join(', ')
                    : 'No Restricted Origins'}
                </p>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-border-muted">
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted font-medium uppercase">Environment</span>
                  <span className="text-sm font-bold text-text-main capitalize">{app.environment}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted font-medium uppercase">Origins</span>
                  <span className="text-sm font-bold text-text-main">{app.allowed_origins.length > 0 ? app.allowed_origins.length : 'All'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Integrations;
