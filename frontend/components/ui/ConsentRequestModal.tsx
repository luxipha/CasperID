
import React, { useState, useEffect } from 'react';

interface ConsentRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    appName: string;
    appLogo: string;
    onApprove: () => void;
    onDeny: () => void;
}

export const ConsentRequestModal: React.FC<ConsentRequestModalProps> = ({
    isOpen,
    onClose,
    appName,
    appLogo,
    onApprove,
    onDeny
}) => {
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
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

    const handleApprove = () => {
        onApprove();
        handleClose();
    };

    const handleDeny = () => {
        onDeny();
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-end">
            {/* Immersive Glass Backdrop */}
            <div
                className={`absolute inset-0 bg-text-main/10 backdrop-blur-md transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
                onClick={handleClose}
            />

            {/* Floating Modal Container */}
            <div
                className={`relative h-auto max-h-[calc(100%-80px)] mr-6 w-full max-w-xl bg-white rounded-[44px] shadow-[-24px_0_80px_-12px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-gray-100 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50 z-20"
                >
                    <span className="material-symbols-outlined text-[28px]">close</span>
                </button>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {/* Header */}
                    <div className="p-10 text-center border-b border-gray-50 bg-gray-50/30">
                        <div className="flex items-center justify-center gap-6 mb-6">
                            <div className="size-20 rounded-3xl bg-white shadow-xl flex items-center justify-center border border-gray-100 overflow-hidden p-3">
                                <img src={appLogo} className="w-full h-full object-contain" alt={appName} />
                            </div>
                            <div className="size-8 text-text-sub">
                                <span className="material-symbols-outlined text-[32px]">sync_alt</span>
                            </div>
                            <div className="size-20 rounded-[22px] bg-primary text-white shadow-xl flex items-center justify-center transform rotate-12">
                                <img src="/logos/logo.png" alt="CasperID" className="w-10 h-10 -rotate-12 object-contain" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-text-main tracking-tight">
                            Connect to <span className="text-primary">{appName}</span>?
                        </h2>
                        <p className="text-text-sub text-sm font-medium mt-2 max-w-sm mx-auto">
                            This application is requesting access to your verified identity data.
                        </p>
                    </div>

                    {/* Data Points List */}
                    <div className="p-10 space-y-6">
                        <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Requested Permissions</p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="size-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[24px]">verified</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-text-main">KYC Verification Status</h4>
                                        <p className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                            Private claim: Only 'Yes/No' will be shared
                                        </p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="size-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-text-main">Wallet Address</h4>
                                        <p className="text-[11px] text-text-sub font-medium">Public key for Casper Mainnet</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="size-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                        <span className="material-symbols-outlined text-[24px]">badge</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-bold text-text-main">Display Name</h4>
                                        <p className="text-[11px] text-text-sub font-medium">Raw data from profile</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                            <span className="material-symbols-outlined text-blue-600 text-[22px]">verified_user</span>
                            <p className="text-[13px] text-blue-900 font-bold leading-relaxed">
                                Privacy Shield Active. Your full legal document (Passport/NIN) will <span className="text-primary underline">never</span> be shared with the app.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="p-8 md:p-10 bg-white border-t border-gray-50 flex flex-col items-center gap-4 shrink-0">
                    <button
                        onClick={handleApprove}
                        className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        Approve Connection
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <button
                        onClick={handleDeny}
                        className="text-text-sub hover:text-alerts font-bold text-[15px] transition-colors"
                    >
                        Deny Access
                    </button>
                </div>

                {/* Security Footer */}
                <div className="bg-[#F8F9FB] border-t border-gray-50 p-4 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-text-sub text-[16px]">shield</span>
                    <p className="text-[10px] font-bold text-text-sub/70 uppercase tracking-widest">
                        Secured by Casper Encryption Standard (v2.0)
                    </p>
                </div>
            </div>
        </div>
    );
};
