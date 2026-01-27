
import React from 'react';

export const StatsSection: React.FC = () => {
  return (
    <section className="bg-midnight-darker text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 border-b border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col gap-6">
            <span className="text-7xl font-extrabold text-primary">40%</span>
            <div>
              <h3 className="text-xl font-bold mb-3">Faster Table Turnover</h3>
              <p className="text-gray-400 leading-relaxed">Guests order simultaneously from their own phones. No waiting for menus, no waiting for staff. Turn tables faster during peak hours.</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 md:border-x border-white/10 px-8">
            <span className="text-7xl font-extrabold text-primary">3.5x</span>
            <div>
              <h3 className="text-xl font-bold mb-3">More Repeat Visits</h3>
              <p className="text-gray-400 leading-relaxed">Don’t let guests leave anonymous. CasperID captures their info so you can automatically re-engage them via whatsapp,Zalo, or email and bring them back.</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-7xl font-extrabold text-primary">100%</span>
            <div>
              <h3 className="text-xl font-bold mb-3">Data Ownership</h3>
              <p className="text-gray-400 leading-relaxed">Stop renting your own customers from delivery apps. Build your own database, reclaim the relationship, and keep the commission..</p>
            </div>
          </div>
        </div>
      </div>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Verified Regular Network</span>
            </div>
            <span className="text-xs font-bold text-gray-500">Powered by CasperID</span>
          </div>
          <div className="flex flex-wrap items-center gap-8 lg:gap-12 opacity-40">
            <span className="text-xl font-black italic tracking-tighter">AURORA</span>
            <span className="text-xl font-bold">BISTRO.22</span>
            <span className="text-xl font-black uppercase">THE_LAB</span>
            <span className="text-xl font-extrabold tracking-tight">NOVA_F&B</span>
          </div>
        </div>
      </div>
    </section>
  );
};
