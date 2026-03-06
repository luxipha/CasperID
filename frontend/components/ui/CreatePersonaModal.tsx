
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useAccount, useChainId } from '../../contexts/WalletConnectProvider';
import { TIER_LEVELS, getPersonaLimit } from '../../constants/tier-levels';

interface CreatePersonaModalProps {
    isOpen: boolean;
    onClose: () => void;
    primaryIdentity: string;
    onSubmit: (data: PersonaData) => void;
    userTier?: 'layer_1' | 'layer_2' | 'layer_3' | string;
}

interface PersonaData {
    handle: string;
    contextType: string;
    disclosures: Record<string, boolean>;
}

type ModalStage = 'form' | 'success';

// Layer 2 users cannot create these contexts (requires Layer 3)
const LAYER_3_ONLY_CONTEXTS = ['professional', 'government', 'banking'];

const contextTypes = [
    { id: 'professional', label: 'Professional', icon: 'business_center', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'gaming', label: 'Gaming', icon: 'sports_esports', color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'financial', label: 'Financial', icon: 'account_balance_wallet', color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'social', label: 'Social', icon: 'group', color: 'text-pink-500', bg: 'bg-pink-50' },
];

const disclosureCategories = [
    {
        id: 'personal',
        label: 'Personal Information',
        items: [
            { key: 'firstName', label: 'Full Name', icon: 'person' },
            { key: 'dateOfBirth', label: 'Date of Birth', icon: 'calendar_today' },
            { key: 'ageVerification', label: 'Age Verification', icon: 'verified_user' },
            { key: 'headline', label: 'Headline', icon: 'text_fields' },
            { key: 'about', label: 'About/Bio', icon: 'description' },
            { key: 'location', label: 'Location (City/Country)', icon: 'location_on' },
        ]
    },
    {
        id: 'contact',
        label: 'Contact Details',
        items: [
            { key: 'email', label: 'Email Address', icon: 'alternate_email' },
            { key: 'phone', label: 'Phone Number', icon: 'phone' },
        ]
    },
    {
        id: 'professional_data',
        label: 'Professional & Academic',
        items: [
            { key: 'experience', label: 'Work Experience', icon: 'work_history' },
            { key: 'education', label: 'Education History', icon: 'school' },
            { key: 'skills', label: 'Skills & Proficiency', icon: 'star' },
            { key: 'certifications', label: 'Certifications', icon: 'verified' },
        ]
    },
    {
        id: 'other',
        label: 'Other Details',
        items: [
            { key: 'projects', label: 'Projects', icon: 'rocket_launch' },
            { key: 'awards', label: 'Awards & Honors', icon: 'emoji_events' },
            { key: 'languages', label: 'Languages', icon: 'translate' },
            { key: 'volunteer', label: 'Volunteer Work', icon: 'volunteer_activism' },
            { key: 'socials', label: 'Social Links', icon: 'public' },
        ]
    }
];

export const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({
    isOpen,
    onClose,
    primaryIdentity,
    onSubmit,
    userTier = 'layer_2'
}) => {
    const { user, refreshUser } = useAuth();
    const { address: connectedAddress, connector } = useAccount();
    const chainId = useChainId();
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [stage, setStage] = useState<ModalStage>('form');
    const [handle, setHandle] = useState('');
    const [routingType, setRoutingType] = useState<'identity' | 'wallet'>('identity');
    const [selectedWallet, setSelectedWallet] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [createdDid, setCreatedDid] = useState('');
    const [createdSubdomain, setCreatedSubdomain] = useState(''); // human-readable: gig.vawa-bitu-sabo
    const [selectedContext, setSelectedContext] = useState<string>('professional');
    const [disclosures, setDisclosures] = useState<Record<string, boolean>>({
        firstName: true,
        lastName: true,
        dateOfBirth: false,
        ageVerification: true,
        email: true,
        headline: false,
        location: false,
        experience: false,
    });

    const personaCount = user?.context_dids?.length || 0;
    const personaLimit = getPersonaLimit(user?.tier);
    const isLimitReached = personaCount >= personaLimit;

    // Determine what tiers are allowed for current context
    const isContextRestricted = (ctxId: string) => {
        const restricted = ['professional', 'government', 'banking'];
        return restricted.includes(ctxId) && (user?.tier === TIER_LEVELS.LAYER_1 || user?.tier === TIER_LEVELS.LAYER_2);
    };

    // Track if a persona was just created (for refresh on close)
    const [personaCreated, setPersonaCreated] = useState(false);

    // Track previous isOpen state to detect transitions
    const prevIsOpenRef = React.useRef(isOpen);

    useEffect(() => {
        // Only reset form when modal OPENS (transitions from closed to open)
        if (isOpen && !prevIsOpenRef.current) {
            setShouldRender(true);
            setIsExiting(false);
            setStage('form');
            setHandle('');
            setRoutingType('identity');
            setPersonaCreated(false);
            const defaultContext = (userTier === 'layer_3') ? 'professional' : 'gaming';
            setSelectedContext(defaultContext);

            // Prefer current connected wallet, fallback to first linked wallet
            if (connectedAddress) {
                setSelectedWallet(connectedAddress);
            } else if (user?.linked_wallets?.length) {
                setSelectedWallet(user.linked_wallets[0].address);
            }
        } else if (!isOpen && shouldRender) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 400);
            return () => clearTimeout(timer);
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, connectedAddress, shouldRender, userTier]);

    // Helper to get all unique wallets (connected + linked)
    // MUST be called before any early return to satisfy Rules of Hooks
    const availableWallets = React.useMemo(() => {
        const wallets: { address: string; chain: string; label: string; isCurrent: boolean }[] = [];

        // Add currently connected wallet if available
        if (connectedAddress) {
            // Map common chain IDs to readable names
            let chainName = 'ethereum';
            if (chainId === 1) chainName = 'ethereum';
            else if (chainId === 137) chainName = 'polygon';
            else if (chainId === 56) chainName = 'bsc';
            else if (chainId === 42161) chainName = 'arbitrum';

            wallets.push({
                address: connectedAddress,
                chain: chainName,
                label: 'Currently Connected',
                isCurrent: true
            });
        }

        // Add linked wallets from backend, avoiding duplicates
        if (user?.linked_wallets) {
            user.linked_wallets.forEach(linked => {
                if (linked?.address && !wallets.find(w => w.address.toLowerCase() === linked.address.toLowerCase())) {
                    wallets.push({
                        address: linked.address,
                        chain: linked.chain || 'casper',
                        label: 'Linked Account',
                        isCurrent: false
                    });
                }
            });
        }

        return wallets;
    }, [connectedAddress, chainId, user?.linked_wallets]);

    // Early return AFTER all hooks
    if (!shouldRender) return null;

    const handleClose = async () => {
        setIsExiting(true);
        // Refresh user data if a persona was created
        if (personaCreated) {
            await refreshUser();
        }
        setTimeout(onClose, 400);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.createContextDID(
                selectedContext,
                handle,
                routingType === 'identity' ? disclosures : {},
                routingType,
                routingType === 'wallet' ? selectedWallet : undefined
            );

            if (response.success) {
                // Safely extract DID, fallback to specific warning if missing
                const did = response.context_did?.did || response.did || 'did:casper:unknown';
                setCreatedDid(did);
                // Use human-readable subdomain URL if the backend returned full_name
                // full_name example: "gig.vawa-bitu-sabo.cid" → strip .cid → "gig.vawa-bitu-sabo"
                const fullName = response.context_did?.full_name || '';
                setCreatedSubdomain(fullName.replace(/\.cid$/, ''));
                setStage('success');
                setPersonaCreated(true); // Mark that persona was created, will trigger refresh on close

                // Call onSubmit for parent logging/tracking
                onSubmit({
                    handle,
                    contextType: selectedContext,
                    disclosures: routingType === 'identity' ? disclosures : {}
                });
            }
        } catch (error) {
            console.error('Failed to create persona:', error);
            alert('Failed to create persona. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isDataAvailable = (key: string): boolean => {
        if (!user) return false;
        switch (key) {
            case 'firstName': return !!(user.first_name || user.last_name);
            case 'lastName': return !!(user.first_name || user.last_name);
            case 'dateOfBirth': return !!user.date_of_birth;
            case 'ageVerification': return !!user.date_of_birth || user.tier !== 'layer_0';
            case 'email': return !!user.email;
            case 'phone': return !!user.phone_number;
            case 'headline': return !!user.headline;
            case 'about': return !!user.about;
            case 'location': return !!(user.city || user.country);
            // Professional & Other Detail Categories
            case 'experience': return !!user.data_availability?.experience;
            case 'education': return !!user.data_availability?.education;
            case 'skills': return !!user.data_availability?.skills;
            case 'certifications': return !!user.data_availability?.certifications;
            case 'projects': return !!user.data_availability?.projects;
            case 'awards': return !!user.data_availability?.awards;
            case 'languages': return !!user.data_availability?.languages;
            case 'volunteer': return !!user.data_availability?.volunteer;
            case 'socials': return !!(user.socials && Object.values(user.socials).some(v => !!v));
            case 'website': return !!user.website;
            // Default to true for any unmapped keys
            default: return true;
        }
    };

    const toggleDisclosure = (key: string) => {
        if (routingType === 'wallet') return; // Cannot toggle in wallet mode
        if (!disclosures[key] && !isDataAvailable(key)) {
            // Trying to turn ON but data is missing
            return;
        }
        setDisclosures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getContextLabel = () => {
        return contextTypes.find(c => c.id === selectedContext)?.label || 'Professional';
    };

    const getContextIcon = () => {
        return contextTypes.find(c => c.id === selectedContext)?.icon || 'business_center';
    };

    const fullPersonaName = `${handle}.${primaryIdentity}`;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-end">
            <div
                className={`absolute inset-0 bg-text-main/10 backdrop-blur-md transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
                onClick={handleClose}
            />

            <div
                className={`relative h-auto max-h-[calc(100%-80px)] mr-6 w-full max-w-md bg-white rounded-[44px] shadow-[-24px_0_80px_-12px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-gray-100 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
                    }`}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50 z-20"
                >
                    <span className="material-symbols-outlined text-[24px]">close</span>
                </button>

                {stage === 'form' ? (
                    <>
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="p-8 pb-4">
                                <h2 className="text-2xl font-black text-text-main tracking-tight">Create New Persona</h2>
                                <p className="text-text-sub text-sm font-medium mt-1">Contextual sub-domain for specific activities</p>
                            </div>

                            <div className="px-8 space-y-8 pb-32">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Persona Handle</label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={handle}
                                            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                                            placeholder="e.g. pay"
                                            className="flex-1 h-14 px-5 rounded-l-2xl bg-gray-50 border-2 border-r-0 border-gray-100 text-[15px] font-bold text-text-main placeholder:text-text-sub/40 focus:bg-white focus:border-primary/40 transition-all outline-none"
                                        />
                                        <div className="h-14 px-5 rounded-r-2xl bg-gray-100 border-2 border-l-0 border-gray-100 flex items-center">
                                            <span className="text-sm font-bold text-text-sub">.{primaryIdentity}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Simplified Routing Toggle Section */}
                                <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-[15px] font-black text-text-main tracking-tight">Route to External Wallet</h4>
                                            <p className="text-[11px] text-text-sub font-medium mt-0.5">Redirect payments directly to a specific wallet.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={routingType === 'wallet'}
                                                onChange={(e) => setRoutingType(e.target.checked ? 'wallet' : 'identity')}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    {routingType === 'wallet' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60 ml-1">Destination Wallet</label>
                                            <div className="relative">
                                                <select
                                                    value={selectedWallet}
                                                    onChange={(e) => setSelectedWallet(e.target.value)}
                                                    className="w-full h-14 pl-12 pr-10 rounded-2xl bg-white border-2 border-gray-100 text-[14px] font-bold text-text-main appearance-none focus:border-primary/40 transition-all outline-none"
                                                >
                                                    {availableWallets.length > 0 ? (
                                                        availableWallets.map((wallet) => (
                                                            <option key={wallet.address} value={wallet.address}>
                                                                {wallet.label}: {(wallet.chain || 'ETH').toUpperCase()} ({(wallet.address || '').slice(0, 6)}...{(wallet.address || '').slice(-4)})
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>No wallets connected</option>
                                                    )}
                                                </select>
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                                                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                                                </div>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub">
                                                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                                </div>
                                            </div>

                                            {availableWallets.length === 0 && (
                                                <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5 px-1">
                                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                                    Connect a wallet or link one in Settings.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Context Type - Always visible for both identity and wallet routing */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Context Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {contextTypes.map((ctx) => {
                                            const isRestricted = isContextRestricted(ctx.id);
                                            return (
                                                <button
                                                    key={ctx.id}
                                                    onClick={() => !isRestricted && setSelectedContext(ctx.id)}
                                                    disabled={isRestricted}
                                                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all relative ${isRestricted
                                                        ? 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-50'
                                                        : selectedContext === ctx.id
                                                            ? 'border-primary bg-primary/[0.02]'
                                                            : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    {isRestricted && (
                                                        <div className="absolute top-2 right-2">
                                                            <span className="material-symbols-outlined text-amber-500 text-[16px]">lock</span>
                                                        </div>
                                                    )}
                                                    <div className={`size-12 rounded-xl ${isRestricted ? 'bg-gray-100' : ctx.bg} flex items-center justify-center ${isRestricted ? 'text-gray-400' : ctx.color}`}>
                                                        <span className="material-symbols-outlined text-[24px]">{ctx.icon}</span>
                                                    </div>
                                                    <span className={`text-sm font-bold ${isRestricted
                                                        ? 'text-text-sub/50'
                                                        : selectedContext === ctx.id
                                                            ? 'text-primary'
                                                            : 'text-text-main'
                                                        }`}>
                                                        {ctx.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Data Disclosure - Only for identity routing */}
                                <div className={`space-y-8 transition-all duration-500 ${routingType === 'wallet' ? 'opacity-40 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest border-l-4 border-primary pl-3">Selective Data Disclosure</h3>

                                        {disclosureCategories.map((cat) => {
                                            const categoryStyles: Record<string, string> = {
                                                personal: 'text-indigo-500 bg-indigo-50',
                                                contact: 'text-emerald-500 bg-emerald-50',
                                                professional_data: 'text-sky-500 bg-sky-50',
                                                other: 'text-purple-500 bg-purple-50',
                                            };
                                            const style = categoryStyles[cat.id] || 'text-text-sub bg-gray-50';

                                            return (
                                                <div key={cat.id} className="space-y-3">
                                                    <label className="text-[10px] font-black text-text-sub uppercase tracking-[0.15em] opacity-40 ml-1">{cat.label}</label>
                                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-sm">
                                                        {cat.items.map((item) => (
                                                            <div key={item.key} className="flex items-center justify-between p-4 px-5 group hover:bg-white transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`size-8 rounded-lg flex items-center justify-center transition-all ${disclosures[item.key] ? style : 'bg-white text-text-sub/40'}`}>
                                                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                                                    </div>
                                                                    <span className={`text-[13px] font-bold transition-colors ${disclosures[item.key] ? 'text-text-main' : 'text-text-sub'}`}>{item.label}</span>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <label className={`relative inline-flex items-center ${!isDataAvailable(item.key) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="sr-only peer"
                                                                            checked={disclosures[item.key] || false}
                                                                            onChange={() => toggleDisclosure(item.key)}
                                                                            disabled={!isDataAvailable(item.key)}
                                                                        />
                                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                                    </label>
                                                                    {!isDataAvailable(item.key) && (
                                                                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 animate-pulse">
                                                                            <span className="material-symbols-outlined text-[12px]">warning</span>
                                                                            Missing Info
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-8 pt-4 bg-gradient-to-t from-white via-white to-white/0 border-t border-gray-50 flex flex-col items-center gap-4 z-10">
                            {isLimitReached ? (
                                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center gap-3 text-center animate-in zoom-in-95 duration-300">
                                    <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        <span className="material-symbols-outlined text-[28px]">lock</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Persona Limit Reached</h4>
                                        <p className="text-xs text-amber-700 mt-1 max-w-[240px]">
                                            You've used your {personaCount}/{personaLimit} persona slots. Upgrade your identity tier to unlock more.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('openKYC'))}
                                        className="mt-2 px-6 py-2 bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-all shadow-md active:scale-95"
                                    >
                                        Upgrade Identity
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !handle.trim() || handle.trim().length < 3 || (routingType === 'wallet' && !selectedWallet)}
                                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 border-b-4 ${isLoading || !handle.trim() || handle.trim().length < 3 || (routingType === 'wallet' && !selectedWallet)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 shadow-none translate-y-1'
                                        : 'bg-primary text-white hover:bg-primary/90 border-[#00382E] hover:shadow-primary/20'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Anchoring Identity...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>
                                                {routingType === 'wallet' ? 'Setup Payment Persona' : 'Create Identity Persona'}
                                            </span>
                                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            )}

                            <div className="flex justify-between items-center w-full px-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider opacity-60">Status:</span>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isLimitReached ? 'text-amber-600' : 'text-primary'}`}>
                                        {personaCount}/{personaLimit} Used
                                    </span>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-[11px] font-black text-text-sub uppercase tracking-widest hover:text-text-main transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="p-8 border-b border-gray-50 text-center space-y-2">
                            <div className="size-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 border border-green-100">
                                <div className="size-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                                    <span className="material-symbols-outlined text-white text-[32px]">check</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-text-main tracking-tight">Persona Created!</h2>
                            <p className="text-text-sub text-sm font-medium">
                                {routingType === 'wallet' ? 'Payment routing active.' : 'Successfully anchored to the Casper Network.'}
                            </p>
                        </div>

                        <div className="flex-1 p-8 space-y-6">
                            <div className="text-center">
                                <p className="text-xs font-black text-text-sub uppercase tracking-widest mb-1 opacity-60">
                                    {routingType === 'wallet' ? 'Payment Handle' : 'Identity Name'}
                                </p>
                                <h3 className="text-[32px] font-black text-primary leading-tight tracking-tight">
                                    {fullPersonaName}
                                </h3>
                            </div>

                            <div className="w-full bg-gray-50 rounded-[32px] border border-gray-100 p-6 space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-text-sub uppercase tracking-widest">Type</span>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">
                                            {routingType === 'wallet' ? 'payments' : getContextIcon()}
                                        </span>
                                        <span className="text-sm font-black text-text-main">
                                            {routingType === 'wallet' ? 'Wallet Routing' : getContextLabel()}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200/60"></div>

                                {routingType === 'wallet' ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-text-sub uppercase tracking-widest">Destination</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-text-main font-mono">
                                                {selectedWallet ? `${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-4)}` : 'No wallet selected'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-text-sub uppercase tracking-widest">Shared Data</span>
                                        <span className="text-sm font-black text-primary">{Object.values(disclosures).filter(Boolean).length} Fields</span>
                                    </div>
                                )}

                                <div className="h-px bg-gray-200/60"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-text-sub uppercase tracking-widest">DID Address</span>
                                    <div className="flex items-center gap-2 max-w-[170px]">
                                        <span className="text-xs font-mono font-bold text-text-sub truncate">
                                            {createdSubdomain || createdDid}
                                        </span>
                                        <button
                                            onClick={() =>
                                                navigator.clipboard.writeText(
                                                    createdSubdomain
                                                        ? `${window.location.origin}/did/${createdSubdomain}`
                                                        : `${window.location.origin}/did/${createdDid}`
                                                )
                                            }
                                            className="text-text-sub hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">content_copy</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-xs text-text-sub font-medium leading-relaxed px-4">
                                {routingType === 'wallet'
                                    ? `This persona is now a live payment pointer. Anyone sending funds to ${fullPersonaName} will reach your selected wallet.`
                                    : `This persona acts as a privacy filter. Only the shared data fields will be visible when connecting with this identity.`
                                }
                            </p>
                        </div>

                        <div className="p-8 bg-white border-t border-gray-50 flex flex-col gap-4">
                            <a
                                href={`/did/${createdSubdomain || createdDid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-14 bg-white text-text-main border-2 border-gray-100 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">public</span>
                                View Profile
                            </a>
                            <button
                                onClick={handleClose}
                                className="w-full h-14 bg-primary text-white rounded-[20px] font-black text-base shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
