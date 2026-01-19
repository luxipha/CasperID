
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface DIDDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    identityName?: string;
}

interface UserData {
    did_address?: string;
    wallet?: string;
    email?: string;
    tier?: string;
    created_at?: string;
}

export const DIDDetailsModal: React.FC<DIDDetailsModalProps> = ({ isOpen, onClose, identityName }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    // Toggle States
    const [routeToPublic, setRouteToPublic] = useState(true);
    const [inheritSecurity, setInheritSecurity] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
            fetchUserData();
        } else if (shouldRender) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const profile = await apiService.getUserProfile();
            setUserData(profile as any);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400);
    };

    const handleCopyDID = () => {
        if (userData?.did_address) {
            navigator.clipboard.writeText(userData.did_address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatDID = (did?: string) => {
        if (!did) return 'Not created';
        return `${did.slice(0, 12)}...${did.slice(-6)}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-end">
            {/* Glass Backdrop */}
            <div
                className={`absolute inset-0 bg-text-main/10 backdrop-blur-md transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
                onClick={handleClose}
            />

            {/* Floating Modal Container */}
            <div
                className={`relative h-auto max-h-[calc(100%-40px)] mr-8 w-full max-w-md bg-white rounded-[40px] shadow-[-24px_0_80px_-12px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-gray-100 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
                    }`}
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-black text-primary tracking-tight">Primary Identity Settings</h2>
                        <p className="text-[13px] font-bold text-primary/60">{identityName || 'alice.cid'}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-10 bg-[#F8F9FB]">

                    {/* Root Identity Card */}
                    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-start gap-5">
                            <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[32px] icon-filled">fingerprint</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">Root Identifier (DID)</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[15px] font-mono font-bold text-text-main">
                                        {formatDID(userData?.did_address)}
                                    </span>
                                    <button onClick={handleCopyDID} className="text-text-sub hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">Root</span>
                                    <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Created</p>
                                <p className="text-[14px] font-bold text-text-main">{formatDate(userData?.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Routing & Endpoints */}
                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-[15px] font-black text-text-main tracking-tight">Routing & Endpoints</h3>
                            <p className="text-[12px] text-text-sub font-medium">Configure resolution points.</p>
                        </div>
                        <div className="p-8 space-y-8">
                            {/* Toggle 1 */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="text-[14px] font-bold text-text-main">Route to Public Profile</h4>
                                    <p className="text-[11px] text-text-sub font-medium leading-relaxed">Redirect lookups to CasperID profile.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={routeToPublic} onChange={() => setRouteToPublic(!routeToPublic)} />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-1 after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {/* Dropdown 1 */}
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">Primary Wallet</label>
                                <div className="relative group">
                                    <select className="w-full h-14 pl-5 pr-12 rounded-2xl bg-gray-50 border border-gray-100 text-[14px] font-bold text-text-main appearance-none cursor-pointer focus:ring-2 focus:ring-primary/10 transition-all">
                                        <option>Casper Wallet (0x123...456)</option>
                                        <option>MetaMask (0x789...012)</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub group-hover:text-primary transition-colors">expand_more</span>
                                </div>
                            </div>

                            {/* Dropdown 2: Custom Endpoint */}
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">Custom Endpoint</label>
                                <div className="relative group">
                                    <select className="w-full h-14 pl-5 pr-12 rounded-2xl bg-gray-50 border border-gray-100 text-[14px] font-bold text-text-main appearance-none cursor-pointer focus:ring-2 focus:ring-primary/10 transition-all">
                                        <option>https://alice.id/did</option>
                                        <option>https://casper.network/did</option>
                                        <option>https://custom-resolver.com/api</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub group-hover:text-primary transition-colors">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-domain Control */}
                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-[15px] font-black text-text-main tracking-tight">Sub-domain Control</h3>
                            <button className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline">Add Exception</button>
                        </div>
                        <div className="p-8 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-text-sub">
                                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[14px] font-bold text-text-main">Inherit Master Security</h4>
                                    <p className="text-[11px] text-text-sub font-medium">Sub-domains require Master Key.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={inheritSecurity} onChange={() => setInheritSecurity(!inheritSecurity)} />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-1 after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>

                    {/* Security & Keys */}
                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-[15px] font-black text-text-main tracking-tight uppercase tracking-widest">Security & Keys</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">Active Keys (2)</p>

                                <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-primary/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-[20px]">key</span>
                                        </div>
                                        <h4 className="text-[14px] font-bold text-text-main">Primary Root Key</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Current</span>
                                </div>
                            </div>

                            {/* Critical Action Alert */}
                            <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                                <div className="space-y-1">
                                    <h5 className="text-[12px] font-black text-red-600 uppercase tracking-widest">Critical Action</h5>
                                    <p className="text-[11px] text-red-900 font-medium leading-relaxed">
                                        Rotating your Master Key invalidates current DID documents and requires 24h propagation.
                                    </p>
                                </div>
                            </div>

                            {/* Rotate Button */}
                            <button className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-200 text-[13px] font-black text-text-main flex items-center justify-center gap-2 hover:border-primary/30 hover:text-primary transition-all">
                                <span className="material-symbols-outlined text-[20px]">autorenew</span>
                                Rotate Master Key
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
