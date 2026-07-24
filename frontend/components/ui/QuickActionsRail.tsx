
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface QuickToolItemProps {
    icon: string;
    label: string;
    onClick: () => void;
    iconClass?: string;
    isCollapsed?: boolean;
}

const QuickToolItem: React.FC<QuickToolItemProps> = ({
    icon,
    label,
    onClick,
    iconClass = "text-[#004D40]",
    isCollapsed
}) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center group w-full px-2 transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-2'}`}
        >
            <div className={`${isCollapsed ? 'size-11' : 'size-14'} rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06)] flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg active:scale-95 border border-gray-50 shrink-0 relative`}>
                <span className={`material-symbols-outlined transition-all ${isCollapsed ? 'text-[22px]' : 'text-[28px]'} ${iconClass}`}>
                    {icon}
                </span>
            </div>
            {!isCollapsed && (
                <span className="text-[11px] font-extrabold text-[#003D33] text-center leading-[1.2] px-1 max-w-[80px] animate-in fade-in duration-500">
                    {label}
                </span>
            )}
        </button>
    );
};

interface QuickActionsRailProps {
    onCreatePersona: () => void;
    onConnectWallet: () => void;
    onRegisterCID: () => void;
    onImportDID: () => void;
    onNavigate: (view: string) => void;
    onOpenQuests: () => void;
}

export const QuickActionsRail: React.FC<QuickActionsRailProps> = ({
    onCreatePersona,
    onConnectWallet,
    onRegisterCID,
    onImportDID,
    onNavigate,
    onOpenQuests
}) => {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [pendingQuests, setPendingQuests] = useState(0);

    // Fetch pending quests on mount
    useEffect(() => {
        const fetchQuests = async () => {
            if (!user?.user_id) return;
            try {
                const res = await apiService.get(`/api/quest/status?userId=${user.user_id}`);
                if (res.success) {
                    const availableCount = res.availableQuests?.length || 0;
                    setPendingQuests(availableCount - res.completedQuests.length);
                }
            } catch (err) {
                console.error('Rail: Failed to fetch quests', err);
            }
        };
        fetchQuests();
    }, [user?.user_id, user?.points]); // Refresh when points change too

    const publicProfileUrl = `/${user?.cns_name || user?.human_id || user?.wallet || ''}`;

    return (
        <div id="tour-quick-actions" className={`hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-[120px]'}`}>
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

                    {/* Identity Quests */}
                    <div className="relative group w-full">
                        <QuickToolItem
                            icon="bolt"
                            label="Identity Quests"
                            onClick={onOpenQuests}
                            iconClass="text-amber-500"
                            isCollapsed={isCollapsed}
                        />
                        {pendingQuests > 0 && (
                            <div className={`absolute ${isCollapsed ? 'top-0 right-3' : 'top-0 right-8'} size-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-all duration-300 pointer-events-none`}>
                                {pendingQuests}
                            </div>
                        )}
                    </div>

                    {/* Create Persona */}
                    <QuickToolItem
                        icon="person_add"
                        label="Create Persona"
                        onClick={onCreatePersona}
                        iconClass="text-primary"
                        isCollapsed={isCollapsed}
                    />

                    <QuickToolItem
                        icon="reviews"
                        label="Reviews"
                        onClick={() => onNavigate('profile-reviews')}
                        isCollapsed={isCollapsed}
                    />

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
