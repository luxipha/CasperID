
import React from 'react';

export const MobileHeader: React.FC = () => {
  return (
    <header className="md:hidden pt-12 px-6 pb-4 flex items-center justify-between sticky top-0 z-30 bg-bg-light/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
            src="https://picsum.photos/id/64/100/100"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">Hi, Alex 👋</h1>
          <div className="flex items-center gap-1 text-[10px] font-bold text-text-sub uppercase tracking-wider">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Layer 2 Verified
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl bg-white shadow-soft text-text-sub">
          <span className="material-icons-outlined text-xl">qr_code_scanner</span>
        </button>
        <button className="p-2 rounded-xl bg-white shadow-soft relative text-text-sub">
          <span className="material-icons-outlined text-xl">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
};
