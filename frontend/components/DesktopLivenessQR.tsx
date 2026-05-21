import React, { useState, useEffect } from 'react';

export type DesktopQRStep = 'loading' | 'ready' | 'scanning' | 'success';

interface DesktopLivenessQRProps {
    qrCodeDataUrl: string;
    pairingId: string;
    onComplete: () => void;
    onCancel: () => void;
    step: DesktopQRStep;
    instruction?: string;
}

export const DesktopLivenessQR: React.FC<DesktopLivenessQRProps> = ({
    qrCodeDataUrl,
    pairingId,
    onComplete,
    onCancel,
    step,
    instruction = 'Scan the QR code with your mobile device to continue'
}) => {
    const [displayProgress, setDisplayProgress] = useState(0);

    // Auto-complete on success
    useEffect(() => {
        if (step === 'success') {
            const timer = setTimeout(onComplete, 2500);
            return () => clearTimeout(timer);
        }
    }, [step, onComplete]);

    // Simulate scanning progress
    useEffect(() => {
        if (step === 'scanning') {
            const startTime = Date.now();
            const duration = 8000; // 8 seconds for liveness on mobile

            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min((elapsed / duration) * 100, 98);
                setDisplayProgress(Math.max(displayProgress, progress));
            }, 100);

            return () => clearInterval(interval);
        } else {
            setDisplayProgress(0);
        }
    }, [step, displayProgress]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-[100] flex flex-col items-center justify-center p-6">
            {/* Header with close button */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                <button
                    onClick={onCancel}
                    className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                    Cross-Device Verification
                </div>
                <div className="size-10"></div> {/* Spacer */}
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col items-center justify-center gap-8 max-w-md w-full">
                {/* QR Code Section */}
                <div className="relative">
                    {step === 'loading' ? (
                        /* Loading State */
                        <div className="size-64 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="size-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                                <span className="text-xs text-white/60 font-medium">Generating QR Code...</span>
                            </div>
                        </div>
                    ) : (
                        /* QR Code Display */
                        <div className="relative">
                            <div className="size-64 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                {qrCodeDataUrl && (
                                    <img
                                        src={qrCodeDataUrl}
                                        alt="QR Code"
                                        className="size-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute -top-2 -left-2 size-8 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
                            <div className="absolute -top-2 -right-2 size-8 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
                            <div className="absolute -bottom-2 -left-2 size-8 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
                            <div className="absolute -bottom-2 -right-2 size-8 border-b-2 border-r-2 border-primary rounded-br-lg"></div>

                            {/* Scanning Indicator */}
                            {step === 'scanning' && (
                                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Instructions and Status */}
                <div className="text-center space-y-4 w-full">
                    {/* Main Instruction */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {step === 'success' ? 'Verification Complete' : 'Use Your Phone'}
                        </h2>
                        <p className="text-sm text-white/70 leading-relaxed">
                            {step === 'success'
                                ? 'Your identity has been verified successfully.'
                                : instruction}
                        </p>
                    </div>

                    {/* Step Indicator Badges */}
                    <div className="flex gap-2 justify-center flex-wrap">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                            Mobile Liveness Check
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {step === 'scanning' && (
                        <div className="space-y-2">
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full transition-all duration-500"
                                    style={{ width: `${displayProgress}%` }}
                                />
                            </div>
                            <span className="text-xs text-white/50 font-medium">{Math.floor(displayProgress)}%</span>
                        </div>
                    )}

                    {/* Success Checkmark */}
                    {step === 'success' && (
                        <div className="flex justify-center pt-2">
                            <div className="size-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center animate-in zoom-in duration-500">
                                <span className="material-symbols-outlined text-xl text-green-500">check</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="w-full space-y-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-white/60">
                            <span className="text-white/80 font-semibold">💡 Tip:</span> Make sure your phone has a camera and good lighting for best results.
                        </p>
                    </div>
                </div>
            </div>

            {/* Cancel Button */}
            <div className="absolute bottom-6 w-full max-w-md px-6">
                {step !== 'success' && (
                    <button
                        onClick={onCancel}
                        className="w-full py-3 rounded-lg border border-white/20 text-white/80 font-semibold text-sm hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-20 size-64 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 left-10 size-48 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};
