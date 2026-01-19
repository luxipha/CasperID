
import React, { useState } from 'react';
import {
    BarChart3, QrCode, UserCheck,
    Settings, LogOut, Search, Bell,
    ArrowUpRight, Users, DollarSign, Clock
} from 'lucide-react';

interface DashboardViewProps {
    onExit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onExit }) => {
    const [activeTab, setActiveTab] = useState('Analytics');

    const menuItems = [
        { name: 'Analytics', icon: BarChart3 },
        { name: 'Live Sessions', icon: Clock },
        { name: 'Zalo Integration', icon: QrCode },
        { name: 'Loyalty Engine', icon: UserCheck },
        { name: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen overflow-hidden animate-in fade-in duration-700 bg-background-dark text-white font-display">
            {/* Sidebar */}
            <aside className="w-64 dark:bg-background-dark-darker border-r border-white/5 flex flex-col shrink-0">
                <div className="p-8">
                    <div className="flex items-center gap-3 text-os-primary mb-12">
                        <div className="bg-os-primary p-2 rounded-lg">
                            <BarChart3 className="text-white w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white">RestoTech</span>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.name
                                        ? 'bg-os-primary text-white shadow-lg shadow-os-primary/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-white/5">
                    <button
                        onClick={onExit}
                        className="flex items-center gap-3 text-gray-400 hover:text-os-primary font-bold text-sm transition-colors"
                    >
                        <LogOut size={18} />
                        Back to Site
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-grow flex flex-col bg-background-dark">
                {/* Top bar */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-background-dark/50 backdrop-blur-md">
                    <h1 className="text-xl font-black">{activeTab}</h1>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 size-4" />
                            <input
                                placeholder="Search tables..."
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-os-primary focus:border-os-primary outline-none"
                            />
                        </div>
                        <button className="relative size-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 size-2 bg-os-primary rounded-full"></span>
                        </button>
                        <div className="size-10 rounded-full bg-os-primary flex items-center justify-center font-black">AN</div>
                    </div>
                </header>

                {/* Content View */}
                <div className="p-10 overflow-y-auto no-scrollbar">
                    {activeTab === 'Analytics' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Revenue', value: '$42,480', change: '+12.5%', icon: DollarSign },
                                    { label: 'Active Guests', value: '142', change: '+18.2%', icon: Users },
                                    { label: 'Loyalty Conv.', value: '64%', change: '+5.4%', icon: UserCheck },
                                    { label: 'Avg. Table Time', value: '42m', change: '-4m', icon: Clock },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-os-primary/10 text-os-primary rounded-xl">
                                                <stat.icon size={20} />
                                            </div>
                                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-os-primary'}`}>{stat.change}</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Main Chart Simulation */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 min-h-[400px]">
                                    <div className="flex justify-between items-center mb-10">
                                        <h3 className="font-bold text-lg">Peak Hour Revenue</h3>
                                        <button className="flex items-center gap-2 text-xs font-bold bg-white/5 px-4 py-2 rounded-xl">This Week <ArrowUpRight size={14} /></button>
                                    </div>
                                    <div className="flex items-end gap-3 h-56 justify-between">
                                        {[40, 60, 45, 90, 65, 80, 50, 70, 85, 95, 40, 60].map((h, i) => (
                                            <div key={i} className="flex-grow flex flex-col gap-2 items-center group">
                                                <div
                                                    className="w-full bg-os-primary/20 rounded-t-lg group-hover:bg-os-primary transition-all duration-700"
                                                    style={{ height: `${h}%` }}
                                                ></div>
                                                <span className="text-[8px] font-bold text-gray-500">{i + 10}h</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                                    <h3 className="font-bold text-lg mb-8">Popular Items</h3>
                                    <div className="space-y-6">
                                        {[
                                            { name: 'Wagyu Ribeye', sales: 48, growth: '+12%' },
                                            { name: 'Lobster Pasta', sales: 32, growth: '+8%' },
                                            { name: 'Malbec Reserva', sales: 29, growth: '+15%' },
                                            { name: 'Truffle Fries', sales: 24, growth: '+4%' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center font-bold text-gray-500">{i + 1}</div>
                                                <div className="flex-grow">
                                                    <p className="text-sm font-bold">{item.name}</p>
                                                    <div className="w-full h-1 bg-white/5 rounded-full mt-2">
                                                        <div className="h-full bg-os-primary rounded-full" style={{ width: `${(item.sales / 50) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold">{item.sales}</p>
                                                    <p className="text-[10px] text-green-500 font-bold">{item.growth}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'Analytics' && (
                        <div className="flex flex-col items-center justify-center h-96 text-center">
                            <div className="size-20 bg-white/5 rounded-3xl flex items-center justify-center text-os-primary mb-6 animate-pulse">
                                <BarChart3 size={32} />
                            </div>
                            <h2 className="text-2xl font-black mb-2">{activeTab} Settings</h2>
                            <p className="text-gray-500 max-w-sm">This section is currently being simulated. Use the sidebar to explore the Revenue Analytics.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
