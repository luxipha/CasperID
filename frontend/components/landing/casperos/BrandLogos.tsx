
import React from 'react';

export const BrandLogos: React.FC = () => {
  return (
    <div className="py-12" style={{ backgroundColor: '#f5f5ff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Trusted by Leading Restaurateurs</p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" style={{ color: '#9CA3AF' }}>
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
