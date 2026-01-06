
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border-color flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-text-sub">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-bold text-lg text-text-main">CasperID</span>
      </div>

      <div className="hidden lg:flex items-center gap-4 w-full max-w-xl">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-text-sub group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-bg-light text-text-main placeholder-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all sm:text-sm"
            placeholder="Search connected apps or credentials..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          CasperID Mainnet
        </div>
        <button className="relative p-2 text-text-sub hover:bg-gray-100 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-alerts rounded-full border-2 border-white"></span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">login</span>
          <span className="text-sm">Connect App</span>
        </button>
      </div>
    </header>
  );
};
