
import React, { useState, useEffect } from 'react';

export type MobileStep = 'position' | 'blink' | 'smile' | 'processing' | 'success';

interface MobileLivenessPageProps {
    onComplete: () => void;
    onCancel: () => void;
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    step: MobileStep;
    progress: number;
    instruction: string;
    isApiComplete?: boolean;
    pairingId?: string; // Optional: links to desktop QR pairing session
}

export const MobileLivenessPage: React.FC<MobileLivenessPageProps> = ({
    onComplete,
    onCancel,
    videoRef,
    canvasRef,
    step,
    progress: externalProgress,
    instruction,
    isApiComplete,
    pairingId
}) => {
    const [internalProgress, setInternalProgress] = useState(0);

    // Unified progress and completion logic
    useEffect(() => {
        if (step !== 'processing') {
            setInternalProgress(step === 'success' ? 100 : 0);
            // Handle success auto-complete
            if (step === 'success') {
                const timer = setTimeout(onComplete, 2500);
                return () => clearTimeout(timer);
            }
            return;
        }

        // --- Step is 'processing' ---
        const startTime = Date.now();
        const duration = 6000; // Simulating analysis phase

        const interval = setInterval(() => {
            setInternalProgress(prev => {
                if (isApiComplete) {
                    const next = prev + 3; // Fast-track to 100%
                    if (next >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return next;
                }

                const elapsed = Date.now() - startTime;
                const simulated = Math.min((elapsed / duration) * 100, 98);
                return Math.max(prev, simulated);
            });
        }, 50);

        return () => clearInterval(interval);
    }, [step, isApiComplete, onComplete]);

    // Handle final transition to success component
    useEffect(() => {
        if (step === 'processing' && internalProgress >= 100) {
            const timer = setTimeout(onComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [step, internalProgress, onComplete]);

    const displayProgress = step === 'processing' ? internalProgress : externalProgress;
    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
            {/* Camera Feed - Shared from parent */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Hidden canvas for AI engine processing & frame capture */}
                <canvas ref={canvasRef} className="hidden" width={640} height={480} />
            </div>

            {/* Overlay UI */}
            <div className="relative z-10 flex-1 flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                    <button
                        onClick={onCancel}
                        className="size-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                        Liveness Check
                    </div>
                    <div className="size-10"></div> {/* Spacer */}
                </div>

                {/* Face Frame */}
                <div className="flex-1 flex items-center justify-center relative">
                    <div className={`relative w-[80vw] aspect-[3/4] max-h-[65vh] transition-all duration-700 ${step === 'processing' || step === 'success' ? 'opacity-0 scale-95' : 'opacity-100'}`}>

                        {/* SVG Face Frame with Scanning Lines */}
                        <svg className="absolute inset-0 size-full pointer-events-none overflow-visible" viewBox="0 0 100 133">
                            <defs>
                                <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#8652E2" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#8652E2" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#8652E2" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Base Oval */}
                            <path
                                d="M50,5 C25,5 5,30 5,66.5 C5,103 25,128 50,128 C75,128 95,103 95,66.5 C95,30 75,5 50,5 Z"
                                fill="none"
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="0.5"
                            />

                            {/* Animated Segments around the face */}
                            <path
                                d="M50,5 C25,5 5,30 5,66.5 C5,103 25,128 50,128 C75,128 95,103 95,66.5 C95,30 75,5 50,5 Z"
                                fill="none"
                                stroke="#8652E2"
                                strokeWidth="1.5"
                                strokeDasharray="60 300"
                                className="animate-[dash_4s_linear_infinite]"
                            />
                            <path
                                d="M50,5 C25,5 5,30 5,66.5 C5,103 25,128 50,128 C75,128 95,103 95,66.5 C95,30 75,5 50,5 Z"
                                fill="none"
                                stroke="#00F0FF"
                                strokeWidth="1"
                                strokeDasharray="30 200"
                                className="animate-[dash_6s_linear_infinite_reverse]"
                            />

                            {/* Corner Brackets */}
                            <path d="M15,10 L5,10 L5,25" fill="none" stroke="#8652E2" strokeWidth="2" strokeLinecap="round" />
                            <path d="M85,10 L95,10 L95,25" fill="none" stroke="#8652E2" strokeWidth="2" strokeLinecap="round" />
                            <path d="M15,123 L5,123 L5,108" fill="none" stroke="#8652E2" strokeWidth="2" strokeLinecap="round" />
                            <path d="M85,123 L95,123 L95,108" fill="none" stroke="#8652E2" strokeWidth="2" strokeLinecap="round" />

                            {/* Scanning "Laser" Line within the oval */}
                            {step !== 'position' && step !== 'processing' && step !== 'success' && (
                                <rect
                                    x="10" y="0" width="80" height="20"
                                    fill="url(#scanGradient)"
                                    className="animate-[laser_3s_infinite_ease-in-out]"
                                />
                            )}
                        </svg>

                        {/* HUD Elements */}
                        <div className="absolute -left-8 top-1/4 flex flex-col gap-4 opacity-40">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-primary uppercase tracking-tighter">Biometric</span>
                                <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-primary animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-secondary uppercase tracking-tighter">Liveness</span>
                                <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-1/2 h-full bg-secondary animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-8 bottom-1/4 flex flex-col items-end gap-2 opacity-40">
                            <span className="text-[8px] font-mono text-white/50">FR_SYS_v2.4</span>
                            <span className="text-[8px] font-mono text-white/50">LAT: 6.5244</span>
                            <span className="text-[8px] font-mono text-white/50">LNG: 3.3792</span>
                        </div>
                    </div>

                    {/* Processing/Success State */}
                    {(step === 'processing' || step === 'success') && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-white">
                            <div className="relative size-40 mb-8">
                                {/* Double Ring Loader */}
                                <svg className="size-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(134,82,226,0.1)" strokeWidth="1" />
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="#8652E2" strokeWidth="2" strokeDasharray="30 270" strokeLinecap="round" />
                                </svg>
                                <svg className="absolute inset-0 size-full animate-[spin_6s_linear_infinite_reverse]" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,240,255,0.1)" strokeWidth="1" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#00F0FF" strokeWidth="2" strokeDasharray="60 190" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    {step === 'success' ? (
                                        <span className="material-symbols-outlined text-4xl text-green-500 animate-in zoom-in duration-500">check</span>
                                    ) : (
                                        <>
                                            <span className="font-black text-3xl leading-none">{Math.floor(displayProgress)}%</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">Analyzing</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black mb-2 tracking-tight">
                                {step === 'success' ? 'Identity Verified' : 'Verifying Identity'}
                            </h3>
                            <p className="text-white/60 font-medium text-sm max-w-[240px]">
                                {step === 'success' ? 'Biometric capture complete. Finalizing your signature.' : 'Our neural engine is analyzing your biometric signature.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Instructions */}
                <div className="p-10 pb-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <div className="max-w-xs mx-auto text-center space-y-5">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/90 text-[10px] font-black uppercase tracking-widest">
                            <span className="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></span>
                            Secure Biometric Link
                        </div>
                        <div className="h-16 flex items-center justify-center">
                            <h2 className="text-3xl font-black text-white leading-none tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {instruction}
                            </h2>
                        </div>
                        <div className="flex justify-center gap-1.5">
                            {['position', 'blink', 'smile', 'processing'].map((s, idx) => {
                                const stepIdx = ['position', 'blink', 'smile', 'processing', 'success'].indexOf(step);
                                const currentIdx = ['position', 'blink', 'smile', 'processing'].indexOf(s);
                                return (
                                    <div
                                        key={s}
                                        className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-primary' : stepIdx > currentIdx ? 'w-4 bg-green-500' : 'w-2 bg-white/20'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanning Line Animation */}
            {step !== 'processing' && step !== 'success' && (
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-20">
                    <div className="w-full h-[1px] bg-white/30 absolute top-0 left-0 animate-[scan_6s_infinite_linear]"></div>
                    <div className="w-full h-[1px] bg-white/30 absolute top-0 left-0 animate-[scan_6s_infinite_linear_1s]"></div>
                </div>
            )}

            <style>
                {`
          @keyframes scan {
            0% { transform: translateY(-10vh); }
            100% { transform: translateY(110vh); }
          }
          @keyframes laser {
            0% { transform: translateY(10px); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(110px); opacity: 0; }
          }
          @keyframes dash {
            to {
              stroke-dashoffset: -400;
            }
          }
        `}
            </style>
        </div>
    );
};
