
import React from 'react';
import { Utensils, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  onDemoToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDemoToggle }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        <a href="#home" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-lg">
            <Utensils className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">RestoTech</h2>
        </a>
        <nav className="hidden md:flex items-center gap-10">
          <a className="text-sm font-bold hover:text-primary transition-colors" href="#features">Features</a>
          <a className="text-sm font-bold hover:text-primary transition-colors" href="#analytics">Analytics</a>
          <a className="text-sm font-bold hover:text-primary transition-colors" href="#pricing">Pricing</a>
          <a className="text-sm font-bold hover:text-primary transition-colors" href="#zalo">Zalo Journey</a>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={onDemoToggle}
            className="flex items-center gap-2 bg-midnight text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-midnight/90 transition-all shadow-lg hover:shadow-midnight/20"
          >
            <LayoutDashboard size={16} />
            Book a Demo
          </button>
        </div>
      </div>
    </header>
  );
};
