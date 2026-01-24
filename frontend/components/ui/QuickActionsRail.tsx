
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface QuickToolItemProps {
    icon: string;
    label: string;
    onClick: () => void;
    iconClass?: string;
    isCollapsed?: boolean;
    hasSubMenu?: boolean;
    isSubMenuOpen?: boolean;
    onSubMenuToggle?: () => void;
}

const QuickToolItem: React.FC<QuickToolItemProps> = ({
    icon,
    label,
    onClick,
    iconClass = "text-[#004D40]",
    isCollapsed,
    hasSubMenu,
    isSubMenuOpen,
    onSubMenuToggle
}) => {
    return (
        <button
            onClick={hasSubMenu ? onSubMenuToggle : onClick}
            className={`flex flex-col items-center group w-full px-2 transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-2'}`}
        >
            <div className={`${isCollapsed ? 'size-11' : 'size-14'} rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06)] flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg active:scale-95 border border-gray-50 shrink-0 relative`}>
                <span className={`material-symbols-outlined transition-all ${isCollapsed ? 'text-[22px]' : 'text-[28px]'} ${iconClass}`}>
                    {icon}
                </span>
                {hasSubMenu && (
                    <span className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-primary flex items-center justify-center transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}>
                        <span className="material-symbols-outlined text-white text-[12px]">expand_more</span>
                    </span>
                )}
            </div>
            {!isCollapsed && (
                <span className="text-[11px] font-extrabold text-[#003D33] text-center leading-[1.2] px-1 max-w-[80px] animate-in fade-in duration-500">
                    {label}
                </span>
            )}
        </button>
    );
};

interface DIDItem {
    did: string;
    alias?: string;
    context?: string;
}

interface QuickActionsRailProps {
    onCreatePersona: () => void;
    onConnectWallet: () => void;
    onRegisterCID: () => void;
    onImportDID: () => void;
    onNavigate: (view: string) => void;
}

export const QuickActionsRail: React.FC<QuickActionsRailProps> = ({
    onCreatePersona,
    onConnectWallet,
    onRegisterCID,
    onImportDID,
    onNavigate
}) => {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isDIDMenuOpen, setIsDIDMenuOpen] = useState(false);
    const [copiedDID, setCopiedDID] = useState<string | null>(null);

    // Get user's DIDs
    const masterDID = user?.did_address;
    const contextDIDs: DIDItem[] = user?.context_dids || [];
    const publicProfileUrl = `/${user?.cns_name || user?.human_id || user?.wallet || ''}`;

    const handleCopyDID = (did: string) => {
        navigator.clipboard.writeText(did);
        setCopiedDID(did);
        setTimeout(() => setCopiedDID(null), 2000);
    };

    const formatDID = (did: string) => {
        if (!did) return '';
        if (did.length > 24) {
            return `${did.slice(0, 12)}...${did.slice(-8)}`;
        }
        return did;
    };

    return (
        <div className={`hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-[120px]'}`}>
            <div className={`w-full bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center py-6 overflow-hidden transition-all duration-500 ${isCollapsed ? 'h-fit' : 'max-h-[75vh]'}`}>

                {/* Top Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="size-12 rounded-full bg-[#CCE2A3] flex items-center justify-center text-[#4A6D00] mb-6 hover:brightness-95 transition-all shadow-sm shrink-0"
                >
                    <span className={`material-symbols-outlined font-black transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}>
                        chevron_right
                    </span>
                </button>

                {/* Quick Actions */}
                <div className={`w-full overflow-y-auto no-scrollbar flex flex-col items-center transition-all duration-500 ${isCollapsed ? 'gap-5' : 'gap-6'} py-2`}>

                    {/* Create Persona */}
                    <QuickToolItem
                        icon="person_add"
                        label="Create Persona"
                        onClick={onCreatePersona}
                        iconClass="text-primary"
                        isCollapsed={isCollapsed}
                    />

                    {/* My DIDs with Sub-menu */}
                    <div className="w-full flex flex-col items-center">
                        <QuickToolItem
                            icon="fingerprint"
                            label="My DIDs"
                            onClick={() => { }}
                            isCollapsed={isCollapsed}
                            hasSubMenu={true}
                            isSubMenuOpen={isDIDMenuOpen}
                            onSubMenuToggle={() => setIsDIDMenuOpen(!isDIDMenuOpen)}
                        />

                        {/* DID Sub-menu */}
                        {isDIDMenuOpen && !isCollapsed && (
                            <div className="mt-2 w-full px-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-2 space-y-1 max-h-48 overflow-y-auto">
                                    {/* Master DID */}
                                    {masterDID && (
                                        <button
                                            onClick={() => handleCopyDID(masterDID)}
                                            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <span className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-primary text-[14px]">shield</span>
                                            </span>
                                            <span className="text-[10px] font-mono text-text-sub truncate flex-1 text-left">
                                                {formatDID(masterDID)}
                                            </span>
                                            <span className="material-symbols-outlined text-[14px] text-text-sub group-hover:text-primary transition-colors">
                                                {copiedDID === masterDID ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    )}

                                    {/* Context DIDs */}
                                    {contextDIDs.map((ctx, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleCopyDID(ctx.did)}
                                            className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                                        >
                                            <span className="size-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-blue-500 text-[14px]">badge</span>
                                            </span>
                                            <span className="text-[10px] font-bold text-text-main truncate flex-1 text-left">
                                                {ctx.alias || ctx.context || 'Persona'}
                                            </span>
                                            <span className="material-symbols-outlined text-[14px] text-text-sub group-hover:text-primary transition-colors">
                                                {copiedDID === ctx.did ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    ))}

                                    {!masterDID && contextDIDs.length === 0 && (
                                        <p className="text-[10px] text-text-sub text-center py-2">No DIDs yet</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Public Profile */}
                    <QuickToolItem
                        icon="person"
                        label="Public Profile"
                        onClick={() => window.open(publicProfileUrl, '_blank')}
                        isCollapsed={isCollapsed}
                    />

                    {/* Connect Wallet */}
                    <QuickToolItem
                        icon="account_balance_wallet"
                        label="Connect Wallet"
                        onClick={onConnectWallet}
                        iconClass="text-amber-600"
                        isCollapsed={isCollapsed}
                    />

                    {/* Register .CID */}
                    <QuickToolItem
                        icon="stars"
                        label="Register .CID"
                        onClick={onRegisterCID}
                        iconClass="text-emerald-600"
                        isCollapsed={isCollapsed}
                    />

                    {/* Import DIDs */}
                    <QuickToolItem
                        icon="download"
                        label="Import DIDs"
                        onClick={onImportDID}
                        isCollapsed={isCollapsed}
                    />
                </div>
            </div>
        </div>
    );
};
