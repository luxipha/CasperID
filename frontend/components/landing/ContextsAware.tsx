
import React, { useState, useEffect } from 'react';

const ContextualSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    // Simulate search logic
    useEffect(() => {
        if (searchQuery.length > 2) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                setIsSearching(false);
                // Randomly decide availability for demo purposes
                setIsAvailable(searchQuery.length % 2 === 0);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            setIsAvailable(null);
            setIsSearching(false);
        }
    }, [searchQuery]);

    const displayName = searchQuery || 'alice';

    const satelliteNodes = [
        {
            label: 'Job Portal',
            icon: 'work',
            sub: 'work',
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            pos: 'top-10 left-0 sm:left-10'
        },
        {
            label: 'Crypto Wallet',
            icon: 'account_balance_wallet',
            sub: 'wallet',
            bgColor: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            pos: 'top-1/4 right-0 sm:right-10'
        },
        {
            label: 'Gov Services',
            icon: 'account_balance',
            sub: 'gov',
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
            pos: 'bottom-10 left-10 sm:left-20'
        }
    ];

    return (
        <section className="py-24 md:py-32 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Visual Side: The Identity Constellation */}
                    <div className="lg:w-1/2 relative min-h-[500px] md:min-h-[600px] w-full flex items-center justify-center">
                        {/* Pulsing Glow Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse"></div>
                        </div>

                        {/* Connection Lines (SVG) - Dynamic Path */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500" fill="none">
                            <path
                                d="M140 180 L230 240 M360 300 L270 360 M140 420 L230 360"
                                stroke="currentColor"
                                className="text-indigo-300 opacity-50"
                                strokeWidth="2"
                                strokeDasharray="8 8"
                            >
                                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="10s" repeatCount="indefinite" />
                            </path>
                        </svg>

                        {/* Main Identity Card (The "Sun") */}
                        <div className="relative z-10">
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(99,102,241,0.25)] border border-slate-100 w-64 md:w-72 text-center transform transition-all hover:scale-105 duration-700">
                                <div className="relative inline-block mb-4 md:mb-6 group">
                                    <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white bg-slate-100 p-1 relative z-10">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-6 h-6 md:w-7 md:h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg z-20">
                                        <span className="material-symbols-outlined text-[12px] md:text-[14px]">check</span>
                                    </div>
                                </div>
                                <h4 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
                                    <span className="truncate">{displayName}.cid</span>
                                    <span className="material-symbols-outlined text-indigo-600 text-lg md:text-xl">verified</span>
                                </h4>
                                <div className="mt-3 md:mt-4 flex flex-col items-center">
                                    <div className="h-1 w-12 bg-indigo-200 rounded-full mb-2"></div>
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                        Root Identity
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Satellite Cards: Contextual Nodes */}
                        {satelliteNodes.map((node, i) => (
                            <div key={i} className={`absolute ${node.pos} z-20 group/node`}>
                                <div className="bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 w-40 md:w-48 transform hover:-translate-y-2 transition-all duration-500">
                                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl ${node.bgColor} flex items-center justify-center group-hover/node:scale-110 transition-transform`}>
                                            <span className={`material-symbols-outlined ${node.iconColor} text-base md:text-lg`}>{node.icon}</span>
                                        </div>
                                        <span className="font-black text-[10px] md:text-xs text-slate-900 uppercase tracking-wider">{node.label}</span>
                                    </div>
                                    <div className="bg-slate-100/80 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-2.5 font-mono text-[10px] md:text-[11px] text-slate-600 truncate border border-transparent group-hover/node:border-indigo-200 transition-colors">
                                        <span className="text-indigo-500">{node.sub}.</span>{displayName}.cid
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Side: Acquisition Flow */}
                    <div className="lg:w-1/2 flex flex-col justify-center">
                        <span className="text-xs md:text-sm font-black text-indigo-600 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 block">
                            Contextual Identities
                        </span>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 md:mb-8 leading-[0.95] tracking-tight">
                            One ID.<br />
                            <span className="text-slate-400">Every Context.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 mb-8 md:mb-12 font-medium leading-relaxed max-w-xl">
                            Tired of multiple logins? Create your root <span className="text-slate-900 font-bold">.cid</span> and deploy context-aware subdomains for work, finance, and government apps instantly.
                        </p>

                        {/* Interactive Search Container */}
                        <div className="relative max-w-lg">
                            <div className={`group relative flex items-center transition-all duration-500 p-2 rounded-full border-2 ${isAvailable === true ? 'border-emerald-400 bg-emerald-50/50' :
                                    isAvailable === false ? 'border-red-400 bg-red-50/50' :
                                        'border-slate-200 bg-white'
                                } shadow-xl focus-within:ring-4 focus-within:ring-indigo-100`}>

                                <div className="pl-4 md:pl-6 text-indigo-600 flex items-center">
                                    {isSearching ? (
                                        <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="material-symbols-outlined text-xl md:text-2xl">search</span>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                                    placeholder="find your unique name"
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none px-3 md:px-4 py-3 md:py-4 text-lg md:text-xl font-bold placeholder:text-slate-300 text-slate-900"
                                />

                                <div className="pr-3 md:pr-4 hidden sm:block">
                                    <span className="text-lg md:text-xl font-black text-slate-300">.cid</span>
                                </div>

                                {isAvailable === true && (
                                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 md:px-8 py-3 md:py-4 rounded-full transition-all shadow-lg shadow-emerald-500/30 whitespace-nowrap text-sm md:text-base">
                                        Acquire
                                    </button>
                                )}
                            </div>

                            {/* Real-time Status Messages */}
                            <div className="mt-4 md:mt-6 min-h-[40px] px-4 md:px-6">
                                {isSearching && (
                                    <p className="text-sm font-bold text-indigo-600 animate-pulse flex items-center gap-2">
                                        Scanning the registry...
                                    </p>
                                )}
                                {isAvailable === true && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black text-emerald-600 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            {searchQuery}.cid is available for 1.25 CSPR / Year
                                        </p>
                                    </div>
                                )}
                                {isAvailable === false && (
                                    <p className="text-sm font-black text-red-500 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                        Already claimed. Try another name?
                                    </p>
                                )}
                                {!searchQuery && (
                                    <p className="text-sm font-medium text-slate-400 italic">
                                        Example: alice, titan, developer, company
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ContextualSection;
