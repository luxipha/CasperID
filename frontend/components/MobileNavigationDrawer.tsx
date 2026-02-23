
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavigationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentView: string;
    onNavigate: (view: string) => void;
}

export const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({
    isOpen,
    onClose,
    currentView,
    onNavigate
}) => {
    const { user, logout } = useAuth();

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);


    const menuItems = [
        { label: 'Personal Profile', icon: 'account_circle', id: 'profile', sub: 'Manage your public identity', color: 'bg-orange-50 text-orange-600' },
        { label: 'Credential Vault', icon: 'wallet', id: 'credentials', sub: 'Securely store and share claims', color: 'bg-indigo-50 text-indigo-600' },
        { label: 'DID Management', icon: 'fingerprint', id: 'did-management', sub: 'Manage decentralized identifiers', color: 'bg-teal-50 text-teal-600' },
        { label: 'Verified Names', icon: 'alternate_email', id: 'names', sub: 'Manage your .cid handles', color: 'bg-amber-50 text-amber-600' },
        { label: 'Identity Verification', icon: 'fact_check', id: 'kyc', sub: 'Liveness and KYC status', color: 'bg-green-50 text-green-600' },
        { label: 'Security & Settings', icon: 'security', id: 'settings', sub: 'Recovery and preferences', color: 'bg-violet-100 text-violet-700' },
    ];

    const handleNavigate = (view: string) => {
        onNavigate(view);
        onClose();
    };

    const handleLogout = async () => {
        await logout();
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-[1000] flex lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop - darker and more blur to isolate the drawer */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Drawer Container (Left Side) - Ensured solid white background and high shadow */}
            <div
                className={`relative mr-auto w-[310px] sm:w-[340px] max-w-[90%] h-full flex flex-col transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ backgroundColor: '#FFFFFF' }}
            >
                {/* Fallback solid background layer */}
                <div className="absolute inset-0 bg-white -z-10" />

                {/* Top Close Button Overlay */}
                <div className="absolute top-5 right-5 z-20">
                    <button
                        onClick={onClose}
                        className="size-10 flex items-center justify-center rounded-full bg-gray-50/90 backdrop-blur-sm text-text-sub active:scale-95 transition-all border border-gray-100 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Profile Header section - Fixed typography and spacing */}
                <div className="pt-16 pb-8 px-6 flex flex-col items-center border-b border-gray-50 relative overflow-hidden bg-white">
                    {/* Subtle Top Gradient */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/[0.05] to-transparent pointer-events-none" />

                    <div className="relative mb-5 scale-110">
                        <div className="size-24 rounded-full p-1.5 ring-4 ring-primary/10 bg-white shadow-xl">
                            <img
                                src={user?.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.wallet}`}
                                alt="Profile"
                                className="size-full rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-1 right-1 size-6 rounded-full bg-green-500 border-4 border-white shadow-md"></div>
                    </div>

                    <h2 className="text-xl font-black text-text-main tracking-tight text-center leading-tight mb-2 break-words max-w-full px-4">
                        {user?.display_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Alex Sterling')}
                    </h2>

                    <div className="flex items-center gap-2 mt-1 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 group active:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                        <code className="text-[10px] font-black text-text-sub opacity-40 truncate max-w-[150px] tracking-tight">
                            {user?.human_id || 'did:ethr:0x7a...4e9'}
                        </code>
                        <span className="material-symbols-outlined text-[15px] text-text-sub opacity-30">content_copy</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl shadow-sm border border-gray-50">
                            <span className={`material-symbols-outlined text-[16px] ${user?.tier !== 'layer_0' ? 'text-primary icon-filled' : 'text-text-sub opacity-20'}`}>verified</span>
                            <span className="text-[10px] font-black text-text-main uppercase tracking-tight">
                                {user?.tier === 'layer_0' ? 'Unverified' : 'Verified'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl shadow-sm border border-gray-50">
                            <span className="material-symbols-outlined text-[16px] text-purple-600 icon-filled">layers</span>
                            <span className="text-[10px] font-black text-text-main uppercase tracking-tight">
                                {user?.tier === 'layer_3' ? 'Layer 3' :
                                    user?.tier === 'layer_2' ? 'Layer 2' : 'Basic'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Identity Tools Section */}
                <div className="flex-1 overflow-y-auto px-5 py-8 space-y-9 no-scrollbar bg-white">
                    <div>
                        <h3 className="text-[10px] font-black text-text-sub/40 uppercase tracking-[0.25em] mb-5 pl-2">Identity Hub Tools</h3>
                        <div className="space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigate(item.id)}
                                    className="w-full flex items-center gap-4 p-3.5 rounded-[28px] hover:bg-gray-50 active:scale-[0.98] transition-all group border border-transparent hover:border-gray-100"
                                >
                                    <div className={`size-12 min-w-[48px] rounded-[18px] flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${item.color}`}>
                                        <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-[15px] font-black text-text-main leading-tight tracking-tight truncate">{item.label}</p>
                                        <p className="text-[12px] font-bold text-text-sub/40 mt-1 leading-tight">{item.sub}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-[20px] text-text-sub/20 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                    <button
                        onClick={handleLogout}
                        className="w-full h-15 flex items-center justify-center gap-3 rounded-3xl bg-white border border-gray-200 text-text-main font-black text-[15px] hover:bg-red-50 hover:text-alerts hover:border-red-100 transition-all active:scale-95 shadow-soft py-4"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Sign Out
                    </button>
                    <p className="text-[10px] text-center mt-4 font-bold text-text-sub uppercase tracking-[0.25em] opacity-30">CasperID Network • v1.2.4</p>
                </div>
            </div>
        </div>
    );
};
