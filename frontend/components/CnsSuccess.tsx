import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const CnsSuccess: React.FC = () => {
    const { refreshUser } = useAuth();

    // Refresh user data to pick up the newly registered premium name
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
            <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.15)] p-12 md:p-16 flex flex-col items-center text-center">
                <div className="size-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-8 relative">
                    <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping"></div>
                    <div className="size-14 rounded-full bg-green-500 flex items-center justify-center text-white relative z-10 shadow-lg">
                        <span className="material-symbols-outlined text-[36px] font-bold">check</span>
                    </div>
                </div>
                <h2 className="text-[32px] font-black text-text-main mb-4 tracking-tight leading-none">Domain Registered!</h2>
                <p className="text-text-sub text-lg font-medium leading-relaxed max-w-sm mb-10">
                    Your payment was successful and your new <span className="text-primary font-black">.CID</span> is officially yours and linked to your primary identity.
                </p>

                <button
                    onClick={() => { window.location.href = '/dashboard'; }}
                    className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary/95 transition-all active:scale-[0.98]"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};
