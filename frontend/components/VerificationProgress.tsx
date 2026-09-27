import React, { useState, useEffect } from 'react';

interface VerificationProgressProps {
    onComplete: () => void;
    // Optional flag to hold completion until external process finishes
    isProcessComplete: boolean;
}

export const VerificationProgress: React.FC<VerificationProgressProps> = ({ onComplete, isProcessComplete }) => {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0); // 0: Verifying, 1: Minting, 2: Finalizing

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                // If we hit 90% and process isn't done, hold at 90%
                if (prev >= 90 && !isProcessComplete) {
                    return 90;
                }

                // If process is done, quickly finish
                if (isProcessComplete && prev >= 90) {
                    const fastNext = prev + 5;
                    if (fastNext >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            onComplete();
                        }, 800);
                        return 100;
                    }
                    return fastNext;
                }

                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        console.log('[VerificationProgress] Calling onComplete NOW');
                        onComplete();
                    }, 800);
                    return 100;
                }

                const next = prev + 0.8; // Slightly slower than onboarding

                // Update steps based on progress
                if (next < 40) {
                    setStep(0);
                } else if (next < 80) {
                    setStep(1);
                } else {
                    setStep(2);
                }

                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [onComplete, isProcessComplete]);

    const steps = [
        { label: 'Confirming Liveness...', id: 0 },
        { label: 'Updating Casper Tier...', id: 1 },
        { label: 'Issuing Layer 2 Credential...', id: 2 },
    ];

    return (
        <div className="min-h-[500px] w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white rounded-[40px] border border-gray-100 shadow-soft">

            {/* Background Dots Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#8652E2_1px,transparent_1px)] [background-size:24px_24px]"></div>

            <div className="w-full max-w-[480px] flex flex-col items-center text-center relative z-10">

                {/* Animated Icon Area */}
                <div className="relative size-32 mb-10">
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
                    <div className="absolute inset-4 rounded-full border border-primary/40 animate-[spin_3s_linear_infinite]">
                        <div className="size-2 bg-[#00F0FF] rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#00F0FF]"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-inner">
                        <div className="size-16 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-gray-100">
                            <span className="material-symbols-outlined text-[40px]">deployed_code</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    <h2 className="text-2xl md:text-3xl font-black text-[#1A1A2E] tracking-tight">
                        Upgrading your Identity
                    </h2>
                    <p className="text-[#626D85] text-[15px] font-medium leading-relaxed">
                        Please wait while we secure your Layer 2 status on the blockchain.
                    </p>
                </div>

                {/* Progress Bar Section */}
                <div className="w-full space-y-3 mb-10">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Minting</span>
                        <span className="text-sm font-black text-[#1A1A2E]">{Math.floor(progress)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-[#00F0FF] via-primary to-purple-800 transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_90%,rgba(255,255,255,0.4)_100%)] [background-size:12px_100%] opacity-30"></div>
                        </div>
                    </div>
                </div>

                {/* Checklist */}
                <div className="w-full bg-[#F8F9FB] rounded-2xl p-6 space-y-4 text-left">
                    {steps.map((s) => (
                        <div key={s.id} className="flex items-center gap-4 transition-all duration-500">
                            <div className={`size-6 rounded-full flex items-center justify-center transition-all ${step > s.id
                                ? 'bg-[#E7F9ED] text-[#28A745]'
                                : step === s.id
                                    ? 'text-primary animate-pulse'
                                    : 'bg-white border md:border-2 border-gray-100 text-gray-300'
                                }`}>
                                {step > s.id ? (
                                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                                ) : step === s.id ? (
                                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                ) : (
                                    <div className="size-3 rounded-full bg-gray-50 border border-gray-200"></div>
                                )}
                            </div>
                            <span className={`text-[14px] font-bold transition-all ${step > s.id
                                ? 'text-[#626D85] line-through opacity-50'
                                : step === s.id
                                    ? 'text-primary'
                                    : 'text-[#626D85] opacity-50'
                                }`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
