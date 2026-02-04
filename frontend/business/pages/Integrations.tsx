
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Integration, AppStatus } from '../types';

const Integrations: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const integrations: Integration[] = [
    { id: 'uniswap-clone', name: 'Uniswap Clone', type: 'Web3', users: '8.4k', status: AppStatus.VERIFIED, website: 'https://uniswap-clone.io', logoInitial: 'U', color: 'bg-blue-50 text-blue-600' },
    { id: 'job-board-pro', name: 'Job Board Pro', type: 'Web2', users: '2.1k', status: AppStatus.MAINTENANCE, website: 'https://jobboard.pro', logoInitial: 'J', color: 'bg-orange-50 text-orange-600' },
    { id: 'dao-dashboard', name: 'DAO Dashboard', type: 'Web3', users: '1.2k', status: AppStatus.ACTIVE, website: 'https://daodash.io', logoInitial: 'D', color: 'bg-purple-50 text-primary' },
    { id: 'nft-marketplace', name: 'NFT Marketplace', type: 'Web3', users: '15.2k', status: AppStatus.ACTIVE, website: 'https://nft.market', logoInitial: 'N', color: 'bg-pink-50 text-pink-600' },
  ];

  const handleCreate = () => {
    setIsModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-text-main/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <span className="material-symbols-outlined text-green-400 !text-xl">rocket_launch</span>
          <p className="text-sm font-bold">New integration registered successfully!</p>
        </div>
      </div>

      {/* Local Modal Fix */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="text-xl font-black text-text-main">New Integration</h3>
              <p className="text-sm text-text-muted">Fill in details to register your application.</p>
            </div>
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">App Name</label>
                <input className="w-full rounded-xl border-border-muted bg-background-light p-3 text-sm focus:ring-primary focus:border-primary" placeholder="e.g. CasperSwap" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Website URL</label>
                <input className="w-full rounded-xl border-border-muted bg-background-light p-3 text-sm focus:ring-primary focus:border-primary" placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-text-muted">Discard</button>
              <button onClick={handleCreate} className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all">Confirm Creation</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-main text-3xl font-black tracking-tight">Your Integrations</h2>
          <p className="text-text-muted">Manage and configure your application connections.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          + Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((app) => (
          <div
            key={app.id}
            onClick={() => navigate(`/business/integrations/${app.id}`)}
            className="bg-white p-6 rounded-2xl border border-border-muted shadow-sm hover:border-primary cursor-pointer transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${app.color}`}>
                {app.logoInitial}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${app.status === AppStatus.VERIFIED ? 'bg-green-100 text-green-700' :
                  app.status === AppStatus.MAINTENANCE ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                {app.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors">{app.name}</h3>
              <p className="text-sm text-text-muted">{app.website}</p>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-border-muted">
              <div className="flex flex-col">
                <span className="text-xs text-text-muted font-medium uppercase">Type</span>
                <span className="text-sm font-bold text-text-main">{app.type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-text-muted font-medium uppercase">Users</span>
                <span className="text-sm font-bold text-text-main">{app.users}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
