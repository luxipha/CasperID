
import React from 'react';
import { LayoutDashboard, Cake, Calendar, User, Info } from 'lucide-react';

interface DashboardSectionProps {
  onDemoClick?: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ onDemoClick }) => {
  return (
    <div className="py-32 bg-midnight text-white overflow-hidden relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <p className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Command Center
            </p>
            <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">Proactive Management Dashboard</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Why wait for a complaint? Know which tables are waiting too long or browsing the menu without being served.
            </p>
          </div>
          <button 
            onClick={onDemoClick}
            className="bg-white text-midnight font-bold px-10 py-4 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shrink-0 shadow-xl"
          >
            LAUNCH PRODUCT DEMO
          </button>
        </div>

        <div className="bg-dashboard-bg rounded-3xl p-4 lg:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Floor Plan Area */}
            <div className="lg:col-span-8 bg-[#141d26] rounded-2xl p-8 min-h-[550px] relative dashboard-grid border border-white/5 overflow-hidden">
              {/* Bottom Left Stats */}
              <div className="absolute bottom-8 left-8 flex gap-4 z-10">
                <div className="bg-[#0f1720]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 w-40">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Current Revenue</p>
                  <p className="text-xl font-bold text-primary">$12,480</p>
                </div>
                <div className="bg-[#0f1720]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 w-32">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Live Users</p>
                  <p className="text-xl font-bold">42</p>
                </div>
              </div>

              {/* Table Visualization Container */}
              <div className="relative w-full h-full">
                
                {/* T-14: High Intent (Active) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150 animate-pulse"></div>
                    <div className="size-16 bg-primary rounded-xl flex items-center justify-center text-white font-black relative z-10 shadow-lg border-2 border-primary/50">T-14</div>
                    
                    {/* Alert Popover */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl p-5 shadow-2xl text-midnight z-20 animate-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="size-2 bg-primary rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase text-primary tracking-wider">High Intent</span>
                      </div>
                      <p className="text-sm font-bold leading-tight">3 Guests viewing Grilled Lamb for over 4 minutes</p>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
                    </div>
                  </div>
                </div>

                {/* T-08: Celebration (Timi's Birthday) */}
                <div className="absolute top-1/4 right-1/4 group cursor-pointer">
                  <div className="relative">
                    <div className="size-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 font-bold text-xs group-hover:bg-white/10 transition-colors">T-08</div>
                    <div className="absolute -top-2 -right-2 size-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-midnight animate-bounce">
                      <Cake size={12} className="text-white" />
                    </div>
                    
                    {/* Hover Card */}
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 bg-[#1a252f] border border-white/10 rounded-xl p-4 shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                      <div className="flex items-center gap-2 mb-2 text-pink-500">
                        <User size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Guest Profile</span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">Timi is celebrating her birthday!</p>
                      <p className="text-[10px] text-gray-400">Notes: Pre-set champagne service & table confetti requested.</p>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a252f] border-r border-b border-white/10 rotate-45"></div>
                    </div>
                  </div>
                </div>

                {/* T-05: Future Booking */}
                <div className="absolute top-1/3 left-1/4 group cursor-pointer">
                  <div className="relative">
                    <div className="size-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 font-bold text-xs group-hover:bg-white/10 transition-colors">T-05</div>
                    <div className="absolute -bottom-2 -right-2 size-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-midnight">
                      <Calendar size={12} className="text-white" />
                    </div>

                    {/* Hover Card */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-56 bg-[#1a252f] border border-white/10 rounded-xl p-4 shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                      <div className="flex items-center gap-2 mb-2 text-blue-500">
                        <Info size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Upcoming Session</span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">Booked: Friday, 6:00 PM</p>
                      <p className="text-[10px] text-gray-400">Guest: Nguyen Family (8 People)</p>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a252f] border-l border-t border-white/10 rotate-45"></div>
                    </div>
                  </div>
                </div>

                {/* T-22: Background Table */}
                <div className="absolute bottom-1/4 right-1/3 size-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-700 font-bold text-xs opacity-50">T-22</div>
              </div>
            </div>

            {/* Sidebar Alerts / Info */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 h-fit">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Active Intent</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Lamb Browsing</span>
                    <span className="text-sm font-bold text-primary">8 Guests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Menu View Time</span>
                    <span className="text-sm font-bold text-white">4m 12s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Cart Value</span>
                    <span className="text-sm font-bold text-primary">$4,200</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Proactive Alert</h4>
                <p className="text-sm font-medium leading-relaxed text-gray-300">
                  Table 08 (Timi) is due for their celebration dessert in 5 minutes.
                </p>
                <button className="mt-2 w-full bg-primary/20 text-primary border border-primary/30 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                  ACKNOWLEDGE
                </button>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-center gap-4">
                <div className="size-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Next Reservation</p>
                  <p className="text-sm font-bold">T-05 • Fri 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-48 -left-48 size-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};
