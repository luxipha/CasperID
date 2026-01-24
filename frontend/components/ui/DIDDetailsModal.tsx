
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { UserProfile } from '../../types';

interface DIDDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    identityName?: string;
}

export const DIDDetailsModal: React.FC<DIDDetailsModalProps> = ({ isOpen, onClose, identityName }) => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

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
            setUserData(profile);
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

    // Helper to get all disclosure items (same as CreatePersonaModal)
    const disclosureItems = [
        { key: 'fullName', label: 'Full Name', icon: 'person' },
        { key: 'dateOfBirth', label: 'Date of Birth', icon: 'calendar_today' },
        { key: 'ageVerification', label: 'Age Verification', icon: 'verified_user' },
        { key: 'headline', label: 'Headline', icon: 'text_fields' },
        { key: 'about', label: 'About/Bio', icon: 'description' },
        { key: 'location', label: 'Location (City/Country)', icon: 'location_on' },
        { key: 'email', label: 'Email Address', icon: 'alternate_email' },
        { key: 'phone', label: 'Phone Number', icon: 'phone' },
        { key: 'experience', label: 'Work Experience', icon: 'work_history' },
        { key: 'education', label: 'Education History', icon: 'school' },
        { key: 'skills', label: 'Skills & Proficiency', icon: 'star' },
        { key: 'certifications', label: 'Certifications', icon: 'verified' },
        { key: 'projects', label: 'Projects', icon: 'rocket_launch' },
        { key: 'awards', label: 'Awards & Honors', icon: 'emoji_events' },
        { key: 'socials', label: 'Social Links', icon: 'public' },
    ];

    // Helper to get active routing and specific identity data
    const getIdentityData = () => {
        const isMaster = !identityName ||
            identityName === (userData?.cns_name ? `${userData.cns_name}.cid` : 'Master Identity') ||
            identityName === userData?.human_id ||
            identityName === userData?.cns_name;

        // 1. Get routing for this specific identity
        let routing = { type: 'Default', target: 'CasperID Profile' };

        if (userData?.cns_routing) {
            const specificRoute = userData.cns_routing.find(r => r.name === identityName && r.active);
            if (specificRoute) {
                routing = {
                    type: specificRoute.target_type.replace(/_/g, ' ').toUpperCase(),
                    target: specificRoute.target_id || specificRoute.redirect_url || 'N/A'
                };
            } else if (isMaster) {
                routing = {
                    type: 'Profile Redirect',
                    target: userData?.cns_name ? `${userData.cns_name}.cid` : 'Master Profile'
                };
            }
        }

        // 2. Get specific DID and disclosures for this identity
        let displayDid = userData?.did_address;
        let identityType = 'Root';
        let activeDisclosures: string[] = [];

        if (!isMaster && userData?.context_dids) {
            // Check if identityName contains a prefix (e.g., 'gaming.abisoye.cid')
            const prefix = identityName?.split('.')[0];
            const persona = userData.context_dids.find(c =>
                c.context === prefix ||
                c.alias === prefix ||
                `${c.alias}.${userData.cns_name}.cid` === identityName ||
                `${c.context}.${userData.cns_name}.cid` === identityName
            );

            if (persona) {
                displayDid = persona.did;
                identityType = (persona.alias || persona.context).toUpperCase();

                if (persona.disclosures) {
                    activeDisclosures = Object.entries(persona.disclosures)
                        .filter(([_, enabled]) => enabled)
                        .map(([key, _]) => key);
                }
            }
        }

        return { routing, displayDid, identityType, isMaster, activeDisclosures };
    };

    const identityData = getIdentityData();

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
                        <h2 className="text-xl font-black text-primary tracking-tight">Identity Settings</h2>
                        <p className="text-[13px] font-bold text-primary/60">{identityName || 'Master Identity'}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-10 bg-[#F8F9FB]">

                    {/* Identity Card */}
                    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-start gap-5">
                            <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                <span className={`material-symbols-outlined text-[32px] ${identityData.isMaster ? 'icon-filled' : ''}`}>
                                    {identityData.isMaster ? 'fingerprint' : 'account_circle'}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">
                                    {identityData.isMaster ? 'Root Identifier (DID)' : 'Persona Identifier (DID)'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[15px] font-mono font-bold text-text-main">
                                        {formatDID(identityData.displayDid)}
                                    </span>
                                    {identityData.displayDid && (
                                        <button onClick={() => {
                                            navigator.clipboard.writeText(identityData.displayDid || '');
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }} className="text-text-sub hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">
                                                {copied ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
                                        {identityData.identityType}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest mb-2 opacity-60">Created</p>
                                <p className="text-[14px] font-bold text-text-main">{formatDate(userData?.account_created_at || userData?.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Selective Disclosure - NEW Section */}
                    {!identityData.isMaster && identityData.activeDisclosures.length > 0 && (
                        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-[15px] font-black text-text-main tracking-tight uppercase tracking-widest">Shared Information</h3>
                                    <p className="text-[12px] text-text-sub font-medium mt-1">Data visible to this persona</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100">
                                    {identityData.activeDisclosures.length} Fields
                                </span>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-3">
                                {disclosureItems.filter(item => identityData.activeDisclosures.includes(item.key)).map((item) => (
                                    <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                                        <div className="size-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                        </div>
                                        <span className="text-[12px] font-bold text-text-main truncate text-ellipsis">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Routing & Endpoints */}
                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-[15px] font-black text-text-main tracking-tight">Routing & Endpoints</h3>
                            <p className="text-[12px] text-text-sub font-medium">Configure resolution points.</p>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">Active Resolution Strategy</p>
                                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[13px] font-bold text-text-main">{identityData.routing.type}</span>
                                            <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest">Active</span>
                                        </div>
                                        <p className="text-[14px] font-mono font-bold text-primary truncate">{identityData.routing.target}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">Linked Wallets ({userData?.linked_wallets?.length || 0})</p>
                                    <div className="space-y-2">
                                        {(userData?.linked_wallets && userData.linked_wallets.length > 0) ? (
                                            userData.linked_wallets.map((w, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-text-main uppercase tracking-tighter">{w.chain}</p>
                                                            <p className="text-[12px] font-mono font-bold text-text-sub">{w.address.slice(0, 8)}...{w.address.slice(-6)}</p>
                                                        </div>
                                                    </div>
                                                    {w.verified && (
                                                        <span className="material-symbols-outlined text-green-500 text-[18px]">verified</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 rounded-xl bg-white border border-gray-100 text-center">
                                                <p className="text-[11px] font-medium text-text-sub">Only primary wallet linked.</p>
                                                <p className="text-[12px] font-mono font-bold text-text-main mt-1">{userData?.wallet?.slice(0, 12)}...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Keys */}
                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-[15px] font-black text-text-main tracking-tight uppercase tracking-widest">Security & Keys</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-extrabold text-text-sub uppercase tracking-widest opacity-60">Active Passkeys ({userData?.passkey_count || 1})</p>

                                <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-primary/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-[20px]">key</span>
                                        </div>
                                        <h4 className="text-[14px] font-bold text-text-main">Primary Controller</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Secure</span>
                                </div>
                            </div>

                            {/* Critical Action Alert */}
                            <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                                <div className="space-y-1">
                                    <h5 className="text-[12px] font-black text-red-600 uppercase tracking-widest">Security Policy</h5>
                                    <p className="text-[11px] text-red-900 font-medium leading-relaxed">
                                        Root identity keys are stored in specialized TEE / Secure Enclave modules. Rotation requires 24h propagation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
