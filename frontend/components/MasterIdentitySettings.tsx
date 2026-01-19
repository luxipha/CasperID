
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CreatePersonaModal } from './ui/CreatePersonaModal';

interface MasterIdentitySettingsProps {
    onBack: () => void;
    onViewDIDDetails?: (name: string) => void;
}

interface UserData {
    did_address?: string;
    wallet?: string;
    tier?: string;
    account_created_at?: string;
    passkey_count?: number;
    cns_name?: string;
    human_id?: string;
}

interface CidName {
    name: string;
    type: 'markov' | 'premium' | 'subdomain';
    isPremium: boolean;
    contextType: string;
    did: string;
}

interface Route {
    name: string;
    target_type: string;
    target_id?: string;
    redirect_url?: string;
}

export const MasterIdentitySettings: React.FC<MasterIdentitySettingsProps> = ({ onBack, onViewDIDDetails }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [myNames, setMyNames] = useState<CidName[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user profile
                const profile = await apiService.getUserProfile();
                setUserData(profile as any);

                // Fetch CNS names
                const namesResponse = await fetch('/api/cns/my-names', { credentials: 'include' });
                const namesData = await namesResponse.json();
                if (namesData.success) {
                    setMyNames(namesData.names || []);
                }

                // Fetch routes
                const routesResponse = await fetch('/api/cns/routes', { credentials: 'include' });
                const routesData = await routesResponse.json();
                if (routesData.success) {
                    setRoutes(routesData.routes || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get display name for Primary Identity
    const getPrimaryIdentityName = () => {
        if (userData?.cns_name) return userData.cns_name;
        if (userData?.human_id) return userData.human_id;
        return 'No identity set';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatWallet = (wallet?: string) => {
        if (!wallet) return 'Not connected';
        return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    };

    // Get personas (subdomains)
    const personas = myNames.filter(n => n.type === 'subdomain');

    // Get icon and color for persona context
    const getPersonaStyle = (context: string) => {
        const styles: Record<string, { icon: string; color: string }> = {
            professional: { icon: 'business_center', color: 'text-blue-500' },
            gaming: { icon: 'sports_esports', color: 'text-orange-500' },
            financial: { icon: 'account_balance_wallet', color: 'text-green-500' },
            social: { icon: 'group', color: 'text-pink-500' },
            master: { icon: 'public', color: 'text-primary' },
        };
        return styles[context.toLowerCase()] || { icon: 'badge', color: 'text-gray-500' };
    };

    // Get verification level label
    const getVerificationLevel = () => {
        const tier = userData?.tier;
        if (tier === 'layer_3') return 'Level 3';
        if (tier === 'layer_2') return 'Level 2';
        return 'Level 1';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-text-sub font-medium">Loading identity settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-2"
                >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Back to DID Management
                </button>
                <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">
                    Master Identity Settings - <span className="text-primary">{getPrimaryIdentityName()}</span>
                </h1>
                <p className="text-text-sub text-base font-medium">
                    Configure root parameters, security protocols, and manage contextual personas.
                </p>
            </div>

            {/* Root Identity Summary Card */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="size-20 rounded-[24px] bg-primary/5 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[40px]">public</span>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-[10px] font-black text-text-sub uppercase tracking-[0.2em] opacity-60 mb-0.5">ROOT IDENTITY</p>
                            <h2 className="text-[32px] font-black text-primary leading-none tracking-tight">{getPrimaryIdentityName()}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black border border-primary/5 flex items-center gap-1.5">
                                <div className="size-1.5 rounded-full bg-primary"></div>
                                Root Identity
                            </span>
                            <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[11px] font-black border border-green-100 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                                Active
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-50 mb-1">Created on</p>
                    <p className="text-sm font-black text-text-main">{formatDate(userData?.account_created_at)}</p>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                {/* Left Column */}
                <div className="space-y-8">

                    {/* Sub-domains & Personas */}
                    <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-text-main tracking-tight">Sub-domains & Personas</h3>
                                <p className="text-text-sub text-xs font-medium mt-1">Contextual identities linked to the root</p>
                            </div>
                            <button
                                onClick={() => setIsPersonaModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Create New Persona
                            </button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {personas.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-text-sub">person_add</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-text-main mb-2">No Personas Yet</h4>
                                    <p className="text-sm text-text-sub max-w-sm mx-auto">
                                        Create contextual personas for different aspects of your identity (work, gaming, social).
                                    </p>
                                </div>
                            ) : (
                                personas.map((persona, i) => {
                                    const style = getPersonaStyle(persona.contextType);
                                    return (
                                        <div key={i} className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <div className={`size-12 rounded-2xl bg-gray-50 flex items-center justify-center ${style.color}`}>
                                                    <span className="material-symbols-outlined text-[24px]">{style.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-black text-text-main">{persona.name}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] font-bold text-text-sub">Context: {persona.contextType}</span>
                                                        <span className="size-1 rounded-full bg-gray-300"></span>
                                                        <span className="text-[11px] font-bold text-green-600">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="size-10 rounded-xl hover:bg-white hover:shadow-sm flex items-center justify-center text-text-sub hover:text-primary transition-all">
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                <button className="size-10 rounded-xl hover:bg-white hover:shadow-sm flex items-center justify-center text-text-sub hover:text-red-500 transition-all">
                                                    <span className="material-symbols-outlined">cancel</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Routing & Endpoints */}
                    <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-text-main tracking-tight">Routing & Endpoints</h3>
                            <p className="text-text-sub text-xs font-medium mt-1">Control how {getPrimaryIdentityName()} resolves across the network</p>
                        </div>

                        {/* Public Profile Toggle */}
                        <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                            <div className="space-y-1">
                                <h4 className="text-[15px] font-black text-text-main">Route to Public Profile</h4>
                                <p className="text-[12px] text-text-sub font-medium">Enable automatic resolution to your decentralized landing page</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {/* Wallet Selection */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Route to Primary Wallet</label>
                            <div className="relative">
                                <select className="w-full h-14 pl-6 pr-12 rounded-2xl bg-white border-2 border-gray-100 text-[15px] font-bold text-text-main appearance-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer">
                                    <option>{formatWallet(userData?.wallet)} (Casper Mainnet)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub">expand_more</span>
                            </div>
                        </div>

                        {/* Active Routes */}
                        {routes.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Active Routes</label>
                                <div className="space-y-2">
                                    {routes.map((route, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <span className="text-sm font-bold text-text-main">{route.name}</span>
                                            <span className="text-xs font-medium text-text-sub">{route.target_type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Security & Master Keys */}
                    <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-text-main tracking-tight">Security & Master Keys</h3>
                                <p className="text-text-sub text-xs font-medium mt-1">Manage high-privilege access keys</p>
                            </div>
                            <div className="text-right space-y-1">
                                <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-100 text-red-500 rounded-xl text-xs font-black hover:bg-red-50 transition-all active:scale-95">
                                    <span className="material-symbols-outlined text-sm">refresh</span>
                                    Rotate Master Key
                                </button>
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Critical Action</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="size-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                                        <span className="material-symbols-outlined text-[20px]">key</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-text-main uppercase tracking-widest">Main Controller Key</h4>
                                        <p className="text-sm font-mono text-text-sub mt-0.5">
                                            {userData?.did_address ? `${userData.did_address.slice(0, 8)}...${userData.did_address.slice(-6)}` : 'Not created'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-wider">Master</span>
                                    <button
                                        onClick={() => onViewDIDDetails?.(getPrimaryIdentityName())}
                                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="size-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm">
                                        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-text-main uppercase tracking-widest">Wallet Address</h4>
                                        <p className="text-sm font-mono text-text-sub mt-0.5">
                                            {formatWallet(userData?.wallet)}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-gray-200 text-text-sub text-[10px] font-black uppercase tracking-wider">Primary</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column (Sidebar) */}
                <aside className="space-y-8">

                    {/* Global Controls */}
                    <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-8 space-y-6">
                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Global Controls</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-text-sub">Inherit Master Security</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[18px] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-text-sub">Discovery Visibility</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[18px] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats */}
                    <section className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-8 space-y-8">
                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Quick Stats</h3>
                        <div className="space-y-8">
                            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60 mb-2">Registered Names</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-4xl font-black text-text-main">{myNames.length}</span>
                                    <span className="text-[11px] font-black text-green-600 mb-1">Active</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60 mb-2">Passkeys</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-4xl font-black text-text-main">{userData?.passkey_count || 0}</span>
                                    <span className="text-[11px] font-black text-text-sub mb-1">Registered</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Verified Identity Status Card */}
                    <section className="bg-primary rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl shadow-primary/20">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[100px]">verified</span>
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-secondary border border-white/10 shadow-sm">
                                    <span className="material-symbols-outlined icon-filled">verified</span>
                                </div>
                                <h4 className="text-lg font-black tracking-tight">Verified Identity</h4>
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-80">
                                Your root identity has completed <span className="font-bold">{getVerificationLevel()}</span> verification.
                                {userData?.tier === 'layer_3' && ' You have unlocked unlimited persona creation and priority resolution.'}
                            </p>
                            <button className="w-full h-12 bg-white text-primary rounded-[18px] font-black text-sm shadow-xl shadow-black/10 hover:bg-gray-50 transition-all active:scale-[0.98]">
                                View Credentials
                            </button>
                        </div>
                    </section>

                    <p className="text-center text-[10px] font-bold text-text-sub opacity-30 uppercase tracking-[0.2em] pt-4">
                        © 2024 CasperID. All rights reserved.
                    </p>
                </aside>
            </div>

            {/* Create Persona Modal */}
            <CreatePersonaModal
                isOpen={isPersonaModalOpen}
                onClose={() => setIsPersonaModalOpen(false)}
                primaryIdentity={getPrimaryIdentityName()}
                onSubmit={(data) => {
                    console.log('Creating persona:', data);
                    // TODO: Implement API call to create persona
                    // Modal stays open to show success screen - closes via onClose when user clicks "Back to Identities Hub"
                }}
            />
        </div>
    );
};
