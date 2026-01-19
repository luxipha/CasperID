
import React from 'react';

export const BrandLogos: React.FC = () => {
  return (
    <div className="bg-white dark:bg-background-dark py-12 border-y border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Trusted by Leading Restaurateurs</p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-2xl font-black italic">BistroNoir</span>
          <span className="text-2xl font-black">LUMEN</span>
          <span className="text-2xl font-serif">Aura Dining</span>
          <span className="text-2xl font-black uppercase tracking-tighter">Velocity</span>
          <span className="text-2xl font-bold">SAVOR</span>
        </div>
      </div>
    </div>
  );
};
