import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Camera, AlertCircle, Loader2 } from 'lucide-react';
import type { LivenessResponse } from '../types';

import { t } from '../utils/i18n';

interface FaceScanProps {
    requestId: string;
    onNext: (livenessVerified: boolean) => Promise<void>;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
    apiKey?: string;
    previewMode?: boolean;
    language?: string;
}

const instructions = [
    'position_face',
    'blink_slowly',
    'turn_head_left',
    'turn_head_right',
    'processing',
];

const FaceScan: React.FC<FaceScanProps> = ({
    requestId,
    onNext,
    onError,
    apiBaseUrl = 'https://apis.casperid.com',
    apiKey = '',
    previewMode = false,
    language = 'EN'
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const framesRef = useRef<Blob[]>([]);

    const [step, setStep] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

    // Initialize camera
    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 640, height: 480 }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setCameraReady(true);
                    };
                }
            } catch (err: any) {
                if (err.name === 'NotAllowedError') {
                    setCameraPermissionDenied(true);
                    setError(t('camera_permission_denied', language));
                } else {
                    setError(t('unable_access_camera', language));
                }
                onError?.('Camera access failed');
            }
        };

        initCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onError]);

    // Capture frame from video
    const captureFrame = useCallback((): Blob | null => {
        if (!videoRef.current || !canvasRef.current) return null;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
        }) as unknown as Blob;
    }, []);

    // Progress through instructions and capture frames
    useEffect(() => {
        if (!cameraReady || isProcessing) return;

        const captureAndAdvance = async () => {
            // Capture frame at each step
            const frame = await new Promise<Blob | null>((resolve) => {
                if (!videoRef.current || !canvasRef.current) {
                    resolve(null);
                    return;
                }
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
            });

            if (frame) {
                framesRef.current.push(frame);
            }

            if (step < instructions.length - 1) {
                setStep(prev => prev + 1);
            } else {
                // Last step - submit for verification
                submitLiveness();
            }
        };

        const timer = setTimeout(captureAndAdvance, 2500);
        return () => clearTimeout(timer);
    }, [step, cameraReady, isProcessing]);

    // Submit liveness check
    const submitLiveness = async () => {
        setIsProcessing(true);
        setStep(4); // "Processing..."

        if (previewMode) {
            setTimeout(() => {
                setIsProcessing(false);
                onNext(true);
            }, 2000);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('requestId', requestId);

            // Add captured frames
            framesRef.current.forEach((frame, index) => {
                formData.append('imageFrames', frame, `frame_${index}.jpg`);
            });

            formData.append('metadata', JSON.stringify({
                capturedAt: new Date().toISOString(),
                frameCount: framesRef.current.length,
                instructions: instructions.slice(0, -1)
            }));

            const response = await fetch(`${apiBaseUrl}/api/v2/verification/liveness`, {
                method: 'POST',
                headers: {
                    ...(apiKey ? { 'X-App-Id': apiKey } : {})
                },
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Liveness check failed with status ${response.status}`);
            }

            const data: LivenessResponse = await response.json();

            if (data.success && data.liveness?.passed) {
                // Stop camera
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                onNext(true);
            } else {
                setError(data.error || 'Liveness check failed. Please try again.');
                // Reset for retry
                setStep(0);
                framesRef.current = [];
                setIsProcessing(false);
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
            setStep(0);
            framesRef.current = [];
            setIsProcessing(false);
            onError?.('Liveness submission failed');
        }
    };

    // Retry handler
    const handleRetry = () => {
        setError('');
        setStep(0);
        framesRef.current = [];
        setIsProcessing(false);
    };

    if (cameraPermissionDenied) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center px-8 text-center"
            >
                <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-xl font-bold text-main mb-3">Camera Access Required</h2>
                <p className="text-muted text-sm mb-6">
                    Please enable camera access in your browser settings to continue with face verification.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-brand text-white rounded-2xl font-bold"
                >
                    Try Again
                </button>
            </motion.div >
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative dark:bg-[#050a0a] bg-slate-50 overflow-hidden"
        >
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Ambient glow */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6fe8ec]/30 via-transparent to-transparent" />
            </div>

            {/* Top badge */}
            <div className="relative z-40 pt-12 pb-4 flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-1.5 dark:bg-black/40 bg-white/40 backdrop-blur-md rounded-xl border dark:border-white/5 border-black/5">
                    <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-[#6fe8ec] shadow-[0_0_8px_#6fe8ec]' : 'bg-yellow-500 animate-pulse'}`} />
                    <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold">
                        {cameraReady ? t('live_camera', language) : t('initializing', language)}
                    </span>
                </div>
            </div>

            {/* Scan area with video */}
            <div className="relative z-20 flex-1 flex items-center justify-center">
                {/* Frosted mask with oval hole */}
                <div
                    className="absolute inset-0 z-10 dark:bg-[#050a0a]/80 bg-white/80 backdrop-blur-[2px]"
                    style={{
                        mask: 'radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)',
                        WebkitMask: 'radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)',
                    }}
                />

                <div className="relative z-30 flex items-center justify-center">
                    {/* Oval biometric frame with video */}
                    <div className="w-[200px] h-[290px] flex-shrink-0 rounded-full border-[3px] border-[#6fe8ec] shadow-[0_0_40px_rgba(111,232,236,0.4),inset_0_0_20px_rgba(111,232,236,0.2)] relative overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                        />
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border-[1px] border-white/30"
                        />
                        <motion.div
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#6fe8ec] to-transparent shadow-[0_0_20px_#6fe8ec] z-10"
                        />
                    </div>

                    {/* Corner brackets */}
                    <div className="absolute w-[280px] h-[380px] pointer-events-none flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#6fe8ec]/30 rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#6fe8ec]/30 rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#6fe8ec]/30 rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#6fe8ec]/30 rounded-br-2xl" />
                    </div>
                </div>
            </div>

            {/* Instruction card */}
            <footer className="relative z-40 p-8 flex flex-col items-center gap-6">
                {error ? (
                    <div className="dark:bg-red-900/30 bg-red-50 backdrop-blur-2xl border border-red-500/30 w-full p-6 rounded-[2.5rem] text-center">
                        <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="dark:bg-[#0a1515]/95 bg-white/90 backdrop-blur-2xl border dark:border-white/10 border-black/5 w-full p-6 rounded-2xl text-center shadow-2xl">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-[#6fe8ec] font-bold text-2xl tracking-tight mb-2"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Verifying...
                                    </span>
                                ) : (
                                    t(instructions[step], language)
                                )}
                            </motion.p>
                        </AnimatePresence>
                        <div className="flex items-center justify-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest">
                            <Lock className="w-3 h-3" />
                            {t('secure_face_scan_desc', language)}
                        </div>
                    </div>
                )}

                {/* Progress dots */}
                <div className="flex gap-2 w-full max-w-[140px]">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i <= Math.floor((step / (instructions.length - 1)) * 2)
                                ? 'bg-[#6fe8ec] shadow-[0_0_15px_#6fe8ec]'
                                : 'dark:bg-slate-800 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                <div className="px-6 py-2.5 dark:bg-black/60 bg-white/60 backdrop-blur-md rounded-xl border dark:border-white/5 border-black/5 flex items-center gap-3">
                    <div
                        className={`w-2 h-2 rounded-full ${isProcessing
                            ? 'bg-yellow-400 animate-pulse'
                            : step === instructions.length - 1
                                ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                                : 'bg-[#6fe8ec] animate-pulse'
                            }`}
                    />
                    <span className="text-[10px] dark:text-slate-400 text-slate-600 uppercase tracking-[0.25em] font-black">
                        {isProcessing ? t('analyzing_liveness', language) : step === instructions.length - 1 ? t('calibration_complete', language) : t('awaiting_calibration', language)}
                    </span>
                </div>
            </footer>
        </motion.div>
    );
};

export default FaceScan;
