
import React from 'react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-40">
      <div className="flex justify-between items-center h-16 pb-2">
        <button 
          onClick={() => onNavigate('overview')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'overview' ? 'text-primary' : 'text-text-sub'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'overview' ? 'icon-filled' : ''}`}>dashboard</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
          onClick={() => onNavigate('activity')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'activity' ? 'text-primary' : 'text-text-sub'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'activity' ? 'icon-filled' : ''}`}>history</span>
          <span className="text-[10px] font-bold">History</span>
        </button>
        <div className="relative -top-6">
          <button className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center transform transition hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
          </button>
        </div>
        <button 
          onClick={() => onNavigate('integrations')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'integrations' ? 'text-primary' : 'text-text-sub'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'integrations' ? 'icon-filled' : ''}`}>link</span>
          <span className="text-[10px] font-bold">Apps</span>
        </button>
        <button 
          onClick={() => onNavigate('data')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'data' ? 'text-primary' : 'text-text-sub'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'data' ? 'icon-filled' : ''}`}>lock</span>
          <span className="text-[10px] font-bold">Privacy</span>
        </button>
      </div>
    </nav>
  );
};
