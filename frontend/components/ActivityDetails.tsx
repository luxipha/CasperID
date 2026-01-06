
import React from 'react';

interface ActivityDetailsProps {
  onBack: () => void;
}

export const ActivityDetails: React.FC<ActivityDetailsProps> = ({ onBack }) => {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Activity Log
          </button>
          
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main">
              Activity Details - Login Attempt
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-alerts text-[10px] font-black border border-red-100 uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm icon-filled">error</span>
              Failed
            </span>
          </div>
          <div className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-[11px] font-mono text-text-sub border border-gray-200">
            ID: c237ffeb74d142359404fe7c1c7c4aa1
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-text-main hover:bg-gray-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">upload</span>
            Export
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">report_problem</span>
            Report Issue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Event Summary */}
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Event Summary</h2>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Event Type</p>
                <p className="text-base font-bold text-text-main">Login Attempt</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Action</p>
                <p className="text-base font-bold text-text-main">Authentication Request</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Date & Time</p>
                <p className="text-base font-bold text-text-main">Oct 24, 2023, 14:30:05 UTC</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-1.5 opacity-60">Involved Entity</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-pink-100 flex items-center justify-center text-[10px] font-bold text-pink-600">U</div>
                  <p className="text-base font-bold text-text-main">Uniswap Protocol</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contextual Details */}
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
              <span className="material-symbols-outlined text-primary text-xl">fingerprint</span>
              <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Contextual Details</h2>
            </div>
            <div className="p-8 space-y-8">
              {/* Alert Banner */}
              <div className="bg-orange-50 border border-orange-100 rounded-[24px] p-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-orange-500">warning</span>
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 text-sm mb-1">Suspicious Activity Detected</h4>
                  <p className="text-xs text-orange-800 leading-relaxed font-medium">
                    This login attempt originated from an unrecognized IP address and location mismatch compared to your typical activity patterns.
                  </p>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">IP Address</p>
                  <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-text-main border border-gray-200">192.158.1.38</span>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Location</p>
                  <div className="flex items-center gap-2 text-text-main font-bold">
                    <span className="material-symbols-outlined text-blue-500">public</span>
                    Lagos, Nigeria
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Device Type</p>
                  <div className="flex items-center gap-2 text-text-main font-bold">
                    <span className="material-symbols-outlined text-text-sub">desktop_windows</span>
                    Desktop - Windows 10
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Browser</p>
                  <div className="flex items-center gap-2 text-text-main font-bold font-sans">
                    Chrome 118.0.0
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="relative w-full aspect-[2/1] bg-gray-100 rounded-[24px] overflow-hidden border border-gray-200 group">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200&h=600" 
                  className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt="Location Map"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
                {/* Map Marker Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="relative">
                      <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-ping"></div>
                      <div className="bg-white shadow-xl rounded-full px-4 py-2 border border-orange-100 flex items-center gap-2 whitespace-nowrap">
                         <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                         <span className="text-[11px] font-extrabold text-text-main uppercase tracking-widest">Login Origin</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Recommended Actions */}
        <div className="space-y-6">
          <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden sticky top-28">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
              <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Recommended Actions</h2>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-[13px] text-text-sub font-medium leading-relaxed">
                Since this activity was flagged as suspicious, we recommend reviewing your security settings immediately.
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Review Apps', sub: 'Check connected integrations', icon: 'apps' },
                  { label: 'Change Password', sub: 'Secure your account', icon: 'lock_reset' },
                  { label: 'Contact Support', sub: 'Get help with this issue', icon: 'support_agent' },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    className="w-full flex items-center justify-between p-5 rounded-[24px] border border-gray-100 hover:border-primary/20 hover:bg-gray-50/50 transition-all group shadow-sm text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-text-sub group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">{action.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main">{action.label}</p>
                        {/* Fixed: Use action.sub instead of non-existent action.subText */}
                        <p className="text-[11px] text-text-sub font-medium">{action.sub}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-sub group-hover:text-primary transition-all">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/20 text-center">
              <p className="text-[10px] text-text-sub font-bold uppercase tracking-[0.2em] opacity-40">Activity ID: c237ffeb...4aa1</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
