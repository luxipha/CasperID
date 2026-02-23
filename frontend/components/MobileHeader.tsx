
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { QRScannerModal } from './QRScannerModal';

interface MobileHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenDrawer: () => void;
  onOpenScanner: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenDrawer,
  onOpenScanner
}) => {
  const { user } = useAuth();

  const getTierLabel = () => {
    switch (user?.tier) {
      case 'layer_3': return 'Full KYC Verified';
      case 'layer_2': return 'Liveness Verified';
      case 'layer_1': return 'Email Verified';
      default: return 'Basic Identity';
    }
  };

  const getTierColor = () => {
    switch (user?.tier) {
      case 'layer_3': return 'bg-green-500';
      case 'layer_2': return 'bg-purple-500';
      case 'layer_1': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenDrawer}
          className="relative group outline-none"
        >
          <div className="size-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-light p-[2px] shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <div className="h-full w-full rounded-[14px] bg-white p-[2px]">
              <img
                src={user?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.wallet}`}
                alt="Profile"
                className="h-full w-full rounded-[12px] object-cover"
              />
            </div>
          </div>
          <div className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white ${getTierColor()}`}></div>
        </button>
        <div>
          <h2 className="text-[15px] font-black text-text-main leading-tight mb-0.5">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'My CasperID'}
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-wider opacity-70">
              {user?.human_id || 'Identity Hub'}
            </p>
            <span className="size-1 rounded-full bg-gray-300"></span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md text-white uppercase tracking-wider ${getTierColor()}`}>
              {getTierLabel()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenScanner}
          className="p-2.5 rounded-2xl bg-white shadow-soft text-text-sub hover:text-primary transition-colors active:scale-95 border border-gray-50"
          title="Scan QR Code"
        >
          <span className="material-icons-outlined text-2xl">qr_code_scanner</span>
        </button>
      </div>
    </header>
  );
};
