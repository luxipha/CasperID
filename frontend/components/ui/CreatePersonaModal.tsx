
import React, { useState, useEffect } from 'react';

interface CreatePersonaModalProps {
    isOpen: boolean;
    onClose: () => void;
    primaryIdentity: string;
    onSubmit: (data: PersonaData) => void;
}

interface PersonaData {
    handle: string;
    contextType: string;
    disclosures: {
        fullName: boolean;
        ageVerification: boolean;
        nationality: boolean;
        experience: boolean;
        emailAddress: boolean;
    };
}

type ModalStage = 'form' | 'success';

const contextTypes = [
    { id: 'professional', label: 'Professional', icon: 'business_center', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'gaming', label: 'Gaming', icon: 'sports_esports', color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'financial', label: 'Financial', icon: 'account_balance_wallet', color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'social', label: 'Social', icon: 'group', color: 'text-pink-500', bg: 'bg-pink-50' },
];

export const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({
    isOpen,
    onClose,
    primaryIdentity,
    onSubmit
}) => {
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [stage, setStage] = useState<ModalStage>('form');
    const [handle, setHandle] = useState('');
    const [selectedContext, setSelectedContext] = useState('professional');
    const [createdDid, setCreatedDid] = useState('did:casper:73a...9f2');
    const [disclosures, setDisclosures] = useState({
        fullName: true,
        ageVerification: true,
        nationality: false,
        experience: false,
        emailAddress: true,
    });

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
            // Reset state when opening
            setStage('form');
            setHandle('');
            setSelectedContext('professional');
        } else if (shouldRender) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400);
    };

    const handleSubmit = async () => {
        // Simulate API call
        setCreatedDid(`did:casper:${Math.random().toString(36).substring(2, 5)}...${Math.random().toString(36).substring(2, 5)}`);

        // Call the onSubmit prop
        onSubmit({
            handle,
            contextType: selectedContext,
            disclosures
        });

        // Move to success stage
        setStage('success');
    };

    const toggleDisclosure = (key: keyof typeof disclosures) => {
        setDisclosures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const disclosureItems = [
        { key: 'fullName' as const, label: 'Full Name', icon: 'person' },
        { key: 'ageVerification' as const, label: 'Age Verification', icon: 'calendar_today' },
        { key: 'nationality' as const, label: 'Nationality', icon: 'flag' },
        { key: 'experience' as const, label: 'Experience', icon: 'work_history' },
        { key: 'emailAddress' as const, label: 'Email Address', icon: 'alternate_email' },
    ];

    const getContextLabel = () => {
        return contextTypes.find(c => c.id === selectedContext)?.label || 'Professional';
    };

    const getContextIcon = () => {
        return contextTypes.find(c => c.id === selectedContext)?.icon || 'business_center';
    };

    const fullPersonaName = `${handle}.${primaryIdentity}`;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-end">
            {/* Glass Backdrop */}
            <div
                className={`absolute inset-0 bg-text-main/10 backdrop-blur-md transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
                onClick={handleClose}
            />

            {/* Floating Modal Container */}
            <div
                className={`relative h-auto max-h-[calc(100%-80px)] mr-6 w-full max-w-md bg-white rounded-[44px] shadow-[-24px_0_80px_-12px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-gray-100 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50 z-20"
                >
                    <span className="material-symbols-outlined text-[24px]">close</span>
                </button>

                {stage === 'form' ? (
                    <>
                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {/* Header */}
                            <div className="p-8 border-b border-gray-50">
                                <h2 className="text-2xl font-black text-text-main tracking-tight">Create New Persona</h2>
                                <p className="text-text-sub text-sm font-medium mt-1">Contextual sub-domain for specific activities</p>
                            </div>

                            {/* Form Content */}
                            <div className="p-8 space-y-8">
                                {/* Persona Handle */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Persona Handle</label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={handle}
                                            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                                            placeholder="e.g. work"
                                            className="flex-1 h-14 px-5 rounded-l-2xl bg-gray-50 border-2 border-r-0 border-gray-100 text-[15px] font-bold text-text-main placeholder:text-text-sub/40 focus:bg-white focus:border-primary/40 transition-all outline-none"
                                        />
                                        <div className="h-14 px-5 rounded-r-2xl bg-gray-100 border-2 border-l-0 border-gray-100 flex items-center">
                                            <span className="text-sm font-bold text-text-sub">.{primaryIdentity}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] italic text-text-sub font-medium opacity-60">This will resolve to your primary identity.</p>
                                </div>

                                {/* Context Type */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Context Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {contextTypes.map((ctx) => (
                                            <button
                                                key={ctx.id}
                                                onClick={() => setSelectedContext(ctx.id)}
                                                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedContext === ctx.id
                                                    ? 'border-primary bg-primary/[0.02]'
                                                    : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className={`size-12 rounded-xl ${ctx.bg} flex items-center justify-center ${ctx.color}`}>
                                                    <span className="material-symbols-outlined text-[24px]">{ctx.icon}</span>
                                                </div>
                                                <span className={`text-sm font-bold ${selectedContext === ctx.id ? 'text-primary' : 'text-text-main'}`}>
                                                    {ctx.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Data Disclosure */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Data Disclosure</label>
                                    <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                                        {disclosureItems.map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="material-symbols-outlined text-text-sub text-[20px]">{item.icon}</span>
                                                    <span className="text-[14px] font-bold text-text-main">{item.label}</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={disclosures[item.key]}
                                                        onChange={() => toggleDisclosure(item.key)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-8 bg-white border-t border-gray-50 flex flex-col items-center gap-4 shrink-0">
                            <button
                                onClick={handleSubmit}
                                disabled={!handle.trim()}
                                className="w-full h-14 bg-primary text-white rounded-[20px] font-black text-base shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                Create Persona
                            </button>
                            <button
                                onClick={handleClose}
                                className="text-text-sub hover:text-text-main font-bold text-[14px] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    /* Success Stage */
                    <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-50">
                            <h2 className="text-2xl font-black text-text-main tracking-tight">Persona Created</h2>
                            <p className="text-text-sub text-sm font-medium mt-1">Successfully anchored to Casper Network</p>
                        </div>

                        {/* Success Content */}
                        <div className="flex-1 p-8 flex flex-col items-center">
                            {/* Success Icon */}
                            <div className="size-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                                <div className="size-16 rounded-full bg-green-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[32px]">check</span>
                                </div>
                            </div>

                            {/* Persona Name */}
                            <h3 className="text-2xl font-black text-primary tracking-tight mb-8">
                                {fullPersonaName} Created!
                            </h3>

                            {/* Details Card */}
                            <div className="w-full bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Persona</span>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">{getContextIcon()}</span>
                                        <span className="text-sm font-bold text-text-main">{getContextLabel()}</span>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Status</span>
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-green-500"></span>
                                        <span className="text-sm font-bold text-green-600">Active & Anchored</span>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Linked DID</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono font-medium text-text-sub">{createdDid}</span>
                                        <button className="text-text-sub hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-lg">content_copy</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Info Text */}
                            <p className="text-center text-sm text-text-sub font-medium mb-4 max-w-xs">
                                Your new persona is ready to use. You can now connect to apps using <span className="font-bold text-text-main">{fullPersonaName}</span>
                            </p>

                            {/* Explorer Link */}
                            <a
                                href="#"
                                className="flex items-center gap-2 text-primary font-bold text-sm hover:opacity-80 transition-opacity"
                            >
                                View on Casper Explorer
                                <span className="material-symbols-outlined text-lg">open_in_new</span>
                            </a>
                        </div>

                        {/* Action Footer */}
                        <div className="p-8 bg-white border-t border-gray-50 shrink-0">
                            <button
                                onClick={handleClose}
                                className="w-full h-14 bg-primary text-white rounded-[20px] font-black text-base shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98]"
                            >
                                Back to Identities Hub
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
