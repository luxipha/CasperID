
import React from 'react';
import { Store, Network, Smartphone } from 'lucide-react';

export const IntegrationHub: React.FC = () => {
  return (
    <div className="py-32 bg-integration-dark text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold mb-24 tracking-tight">
          Works with your current stack, <span className="text-primary">not against it.</span>
        </h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 relative">
          {/* Legacy POS */}
          <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center gap-6 relative z-10 hover:bg-white/10 hover:-translate-y-2 transition-all duration-500">
            <div className="size-20 bg-white/5 rounded-2xl flex items-center justify-center mb-2">
              <Store className="text-gray-400 w-10 h-10" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Legacy POS</h3>
              <p className="text-sm text-gray-400 font-medium">Oracle / Micros / iPOS</p>
            </div>
          </div>

          {/* Central Hub */}
          <div className="relative flex items-center justify-center">
            <div className="hidden md:block absolute w-[400px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl group-hover:bg-primary/60 transition-all duration-700 animate-pulse-slow"></div>
              <div className="size-48 lg:size-56 rounded-full bg-primary flex flex-col items-center justify-center gap-3 relative z-20 glow-orange border-4 border-integration-dark cursor-pointer transform group-hover:scale-110 transition-all duration-500">
                <Network className="text-white w-12 h-12" strokeWidth={2.5} />
                <span className="text-xs font-black tracking-[0.2em] text-white">ROYAL SYNC</span>
              </div>
            </div>
          </div>

          {/* Digital Interface */}
          <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center gap-6 relative z-10 hover:bg-white/10 hover:-translate-y-2 transition-all duration-500">
            <div className="size-20 bg-white/5 rounded-2xl flex items-center justify-center mb-2">
              <Smartphone className="text-primary w-10 h-10" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-primary">Digital Interface</h3>
              <p className="text-sm text-gray-400 font-medium">ZaloPay / CasperID</p>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <p className="text-gray-400 text-sm font-medium tracking-wide animate-pulse">
            Zero hardware replacement. 100% cloud-based deployment.
          </p>
        </div>
      </div>
      
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
};
