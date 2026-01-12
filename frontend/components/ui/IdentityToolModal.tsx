
import React, { useState, useEffect } from 'react';

export interface ToolTip {
    icon: string;
    label: string;
}

interface IdentityToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    icon: string;
    iconBg?: string;
    description: string;
    tips?: ToolTip[];
    actionLabel: string;
    actionIcon?: string;
    onAction: () => void;
    isActionLoading?: boolean;
    isActionDisabled?: boolean;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const IdentityToolModal: React.FC<IdentityToolModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    iconBg = 'bg-primary/10 text-primary',
    description,
    tips,
    actionLabel,
    actionIcon = 'videocam',
    onAction,
    isActionLoading,
    isActionDisabled,
    children,
    footer
}) => {
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
        } else if (shouldRender) {
            // Trigger exit animation
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 400); // Matches slide-out-right duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const handleClose = () => {
        setIsExiting(true);
        // Delay the actual state update to allow animation to play
        setTimeout(onClose, 400);
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-end">
            {/* Immersive Glass Backdrop */}
            <div
                className={`absolute inset-0 bg-text-main/10 backdrop-blur-md transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in'}`}
                onClick={handleClose}
            />

            {/* Floating Modal Container - Reduced height and hanging */}
            <div
                className={`relative h-auto max-h-[calc(100%-120px)] mr-6 w-full max-w-xl bg-white rounded-[44px] shadow-[-24px_0_80px_-12px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border border-gray-100 ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
                    }`}
            >

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-8 right-8 text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50 z-20"
                >
                    <span className="material-symbols-outlined text-[28px]">close</span>
                </button>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-12">
                    {/* Header */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className={`size-14 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm shrink-0`}>
                            <span className="material-symbols-outlined text-[32px]">{icon}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-text-main tracking-tight leading-none">{title}</h2>
                            <p className="text-text-sub text-[13px] font-bold mt-1.5 opacity-60 uppercase tracking-widest">{subtitle}</p>
                        </div>
                    </div>

                    {/* Intro Text */}
                    <p className="text-text-sub text-base font-medium leading-relaxed mb-10 pr-8">
                        {description}
                    </p>

                    {/* Main Action Area (The "Slot") */}
                    <div className="w-full mb-10">
                        {children}
                    </div>

                    {/* Tips Section (Optional) */}
                    {tips && tips.length > 0 && (
                        <div className="bg-[#F8F9FB] rounded-[32px] p-8 space-y-4">
                            <h4 className="text-[11px] font-black text-text-main uppercase tracking-[0.2em] mb-4">Verification Tips</h4>
                            <div className="space-y-4">
                                {tips.map((tip, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="size-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100">
                                            <span className="material-symbols-outlined text-[18px]">{tip.icon}</span>
                                        </div>
                                        <span className="text-sm font-bold text-text-sub">{tip.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Footer - Contained within the rounded panel */}
                <div className="p-8 md:p-10 bg-white border-t border-gray-50 flex flex-col items-center gap-4 shrink-0">
                    <button
                        onClick={onAction}
                        disabled={isActionLoading || isActionDisabled}
                        className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isActionLoading ? (
                            <div className="size-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">{actionIcon}</span>
                                {actionLabel}
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleClose}
                        className="text-text-sub hover:text-text-main font-bold text-[15px] transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {/* Optional Custom Footer */}
                {footer && (
                    <div className="bg-[#F8F9FB] border-t border-gray-50 p-6 flex items-center justify-center gap-2.5">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
