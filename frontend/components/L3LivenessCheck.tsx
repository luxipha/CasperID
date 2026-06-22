import React, { useState, useEffect, useRef } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { MobileLivenessPage, MobileStep } from './MobileLiveness';
import { apiService } from '../services/api';

const euclideanDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

interface L3LivenessCheckProps {
    onComplete?: () => void;
    verificationSession?: Layer3VerificationSession;
    pairingPayload?: {
        requestId: string;
        pairingId: string;
        pairingToken: string;
    };
}

export interface Layer3VerificationSession {
    requestId: string;
    pairingId: string;
    pairingToken: string;
    qrCodeDataUrl?: string;
}

type VerificationState = "INITIALIZING" | "POSITIONING" | "CHALLENGE" | "VERIFYING" | "SUCCESS";
type ChallengeType = "BLINK" | "OPEN_MOUTH";
const MIN_SUBMISSION_FRAMES = 10;

/**
 * L3LivenessCheck - Liveness component for Layer 3 flow with sidebar
 * NO minting - just verifies liveness and stores result for admin review
 */
export const L3LivenessCheck: React.FC<L3LivenessCheckProps> = ({ onComplete, verificationSession, pairingPayload }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Consider device a mobile if width is less than 768px or if it's actually a mobile device
            const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isMobileViewport = window.innerWidth < 768;
            const result = isMobileDevice || isMobileViewport;
            setIsMobile(result);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [state, setState] = useState<VerificationState>("INITIALIZING");
    const [guidance, setGuidance] = useState("Loading AI Models...");
    const [challenge, setChallenge] = useState<ChallengeType>("BLINK");
    const [progress, setProgress] = useState(0);
    const [ovalColor, setOvalColor] = useState<"white" | "red" | "green">("white");

    // QR Pairing State (for cross-device desktop-to-mobile flow)
    const session = verificationSession || pairingPayload;
    const [requestId] = useState<string>(session?.requestId || "");
    const [pairingId] = useState<string>(session?.pairingId || "");
    const [pairingToken] = useState<string>(session?.pairingToken || "");
    const [qrCodeDataUrl] = useState<string>(verificationSession?.qrCodeDataUrl || "");
    const [desktopQrStep, setDesktopQrStep] = useState<"loading" | "ready" | "scanning" | "success">(
        verificationSession?.qrCodeDataUrl ? "ready" : "loading"
    );
    const qrInitialized = !!session;

    const logicState = useRef({
        positionTimer: 0,
        blinkCount: 0,
        isBlinking: false,
        frames: [] as Blob[],
        lastFrameTime: 0,
        isSubmitting: false,  // Guard against multiple submissions
        isCapturing: false    // Guard against concurrent captures
    });

    // Async frame capture helper (non-blocking) with guard
    const captureFrame = async (canvas: HTMLCanvasElement, st: typeof logicState.current, ignoreLimit: boolean = false): Promise<boolean> => {
        // Synchronous guard - check before starting async operation
        if (!ignoreLimit && st.frames.length >= 20 || st.isCapturing) return false;
        st.isCapturing = true;

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob && (ignoreLimit || st.frames.length < 20)) {
                    st.frames.push(blob);
                    resolve(true);
                } else {
                    resolve(false);
                }
                st.isCapturing = false;
            }, 'image/jpeg', 0.5);
        });
    };

    const resetLivenessState = () => {
        logicState.current.frames = [];
        logicState.current.blinkCount = 0;
        logicState.current.isSubmitting = false;
        logicState.current.isCapturing = false;
        logicState.current.lastFrameTime = 0;
        setProgress(0);
        setChallenge("BLINK");
    };

    useEffect(() => {
        if (isMobile || !requestId || desktopQrStep === 'success') return;
        const poll = window.setInterval(async () => {
            try {
                const result = await apiService.get(`/api/v2/verification/${requestId}/status`);
                if (result.verification?.progress?.livenessCompleted) {
                    window.clearInterval(poll);
                    setDesktopQrStep('success');
                    onComplete?.();
                } else if (result.verification?.status === 'in_progress') {
                    setDesktopQrStep('scanning');
                }
            } catch {
                // Keep polling until the pairing expires or the user cancels.
            }
        }, 1500);
        return () => window.clearInterval(poll);
    }, [desktopQrStep, isMobile, onComplete, requestId]);

    useEffect(() => {
        let camera: any = null;
        let faceMesh: any = null;
        let isActive = true;

        // Desktop Layer 3 verification is phone-first. Do not request the
        // desktop camera while a scoped mobile handoff is active.
        if (!isMobile && qrCodeDataUrl) {
            return;
        }

        if (state === "VERIFYING" || state === "SUCCESS") {
            return;
        }

        const onResults = (results: any) => {
            if (!canvasRef.current || !videoRef.current || !isActive) return;
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;

            ctx.save();
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.translate(canvasRef.current.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.restore();

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                if (state === "INITIALIZING") {
                    setState("POSITIONING");
                }
                processFace(results.multiFaceLandmarks[0]);
            } else {
                if (state !== "INITIALIZING") {
                    setGuidance("Face not found. Look at camera.");
                    setOvalColor("white");
                }
            }
        };

        const processFace = (landmarks: any[]) => {
            const now = Date.now();
            const st = logicState.current;

            if (state === "POSITIONING" || (state === "INITIALIZING" && landmarks)) {
                const nose = landmarks[1];
                const isCentered = nose.x > 0.4 && nose.x < 0.6 && nose.y > 0.4 && nose.y < 0.6;
                const topHead = landmarks[10];
                const chin = landmarks[152];
                const faceHeight = Math.abs(topHead.y - chin.y);

                let instruction = "";
                let valid = false;

                if (!isCentered) {
                    instruction = "Center your face in the oval";
                    setOvalColor("white");
                } else if (faceHeight < 0.40) {
                    instruction = "Move Closer";
                    setOvalColor("white");
                } else if (faceHeight > 0.85) {
                    instruction = "Move Back";
                    setOvalColor("red");
                } else {
                    instruction = "Hold still...";
                    setOvalColor("green");
                    valid = true;
                }
                setGuidance(instruction);

                if (valid) {
                    st.positionTimer += 33;
                    if (st.positionTimer > 1500) {
                        setState("CHALLENGE");
                        setGuidance("Great! Now Blink 3 times");
                        setOvalColor("green");
                    }
                } else {
                    st.positionTimer = 0;
                }
                return;
            }

            if (state === "CHALLENGE") {
                if (challenge === "BLINK") {
                    const leftEyeOpen = euclideanDist(landmarks[159], landmarks[145]);
                    const leftEyeWidth = euclideanDist(landmarks[33], landmarks[133]);
                    const ratio = leftEyeOpen / leftEyeWidth;

                    if (ratio < 0.16) {
                        if (!st.isBlinking) {
                            st.isBlinking = true;
                        }
                    } else {
                        if (st.isBlinking) {
                            st.isBlinking = false;
                            st.blinkCount++;


                            // Capture frame when blink completes (async, non-blocking)
                            if (canvasRef.current && st.frames.length < 20) {
                                captureFrame(canvasRef.current, st);
                            }

                            setProgress((st.blinkCount / 3) * 100);
                            if (st.blinkCount >= 3) {
                                setChallenge("OPEN_MOUTH");
                                setGuidance("Now open your mouth wide");
                                setProgress(0);
                                st.lastFrameTime = now;
                            }
                        }
                    }
                }

                if (challenge === "OPEN_MOUTH") {
                    // Mouth landmarks: upper lip (13), lower lip (14)
                    const upperLip = landmarks[13];
                    const lowerLip = landmarks[14];
                    const mouthOpen = euclideanDist(upperLip, lowerLip);

                    // Normalize by face height for scale independence
                    const topHead = landmarks[10];
                    const chin = landmarks[152];
                    const faceHeight = euclideanDist(topHead, chin);
                    const mouthOpenRatio = mouthOpen / faceHeight;

                    // Capture frames periodically during mouth opening (async, non-blocking)
                    if (now - st.lastFrameTime > 100 && st.frames.length < 25 && canvasRef.current && !st.isCapturing) {
                        st.lastFrameTime = now;
                        captureFrame(canvasRef.current, st);
                    }

                    // Once the mouth challenge begins, progress represents captured evidence.
                    setProgress(Math.min(100, (st.frames.length / MIN_SUBMISSION_FRAMES) * 100));

                    // Mouth is considered "wide open" when ratio > 0.12
                    if (mouthOpenRatio > 0.12) {
                        if (st.frames.length < MIN_SUBMISSION_FRAMES) {
                            setGuidance("Hold it open...");
                            setProgress(Math.min(100, (st.frames.length / MIN_SUBMISSION_FRAMES) * 100));
                            return;
                        }

                        if (!st.isSubmitting) {
                            // Immediately set guard to prevent duplicate submissions
                            st.isSubmitting = true;

                            // CAPTURE THE PEAK FRAME
                            if (canvasRef.current) {
                                captureFrame(canvasRef.current, st, true).then(() => {
                                    submitLiveness([...st.frames]); // Pass a copy to prevent mutation
                                });
                            } else {
                                submitLiveness([...st.frames]);
                            }
                        }
                    }
                }
            }
        };

        const init = async () => {
            // Wait for refs to be available (max 2 seconds)
            let attempts = 0;
            while ((!videoRef.current || !canvasRef.current) && attempts < 20) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }

            if (!videoRef.current || !canvasRef.current || !isActive) {
                return;
            }

            try {
                faceMesh = new FaceMesh({
                    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
                });

                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMesh.onResults(onResults);

                if (videoRef.current && isActive) {
                    camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (videoRef.current && faceMesh && isActive) {
                                try {
                                    await faceMesh.send({ image: videoRef.current });
                                } catch (error) {
                                    // Silent fail
                                }
                            }
                        },
                        width: 640,
                        height: 480
                    });
                    await camera.start();
                }
            } catch {
                setGuidance("Camera access denied");
            }
        };

        init();

        return () => {
            isActive = false;
            if (camera) camera.stop();
            if (faceMesh) faceMesh.close();
        };
    }, [state, challenge, isMobile, qrCodeDataUrl]);

    const submitLiveness = async (frames: Blob[]) => {
        if (state === "VERIFYING") return;

        if (frames.length < MIN_SUBMISSION_FRAMES) {
            setGuidance("Not enough frames captured. Please try again.");
            setState("POSITIONING");
            return;
        }

        try {
            setState("VERIFYING");
            setGuidance("Verifying liveness...");

            if (!requestId || !pairingId || !pairingToken) {
                throw new Error('Layer 3 verification session is missing. Restart the Layer 3 flow.');
            }
            const result = await apiService.submitLivenessCheckV2(
                requestId,
                frames,
                pairingId,
                pairingToken,
                ['blink', 'open_mouth']
            );

            if (result.success || result.passed) {
                // Layer 3 doesn't change user status, so no need to refresh
                // Call onComplete immediately to prevent App.tsx from routing to dashboard
                setState("SUCCESS");
                setGuidance("Verification complete!");
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 1500);
            } else {
                setGuidance(result.error || "Verification failed. Please try again.");
                resetLivenessState();
                setState("POSITIONING");
            }
        } catch (error: any) {
            if (error.message?.includes('503') || error.details?.includes('503') || error.message?.includes('high demand')) {
                setGuidance("Our Neural engine is busy. retry again later.");
            } else {
                setGuidance("Error. Try again.");
            }
            resetLivenessState();
            setState("POSITIONING");
        }
    };


    const getMobileStep = (): MobileStep => {
        if (state === "SUCCESS") return "success";
        if (state === "VERIFYING") return "processing";
        if (state === "CHALLENGE" && challenge === "OPEN_MOUTH") return "smile"; // "smile" step shows mouth icon
        if (state === "CHALLENGE" && challenge === "BLINK") return "blink";
        return "position";
    };

    if (isMobile) {
        return (
            <MobileLivenessPage
                onCancel={() => window.location.reload()}
                onComplete={() => { if (onComplete) onComplete(); }}
                videoRef={videoRef}
                canvasRef={canvasRef}
                step={getMobileStep()}
                progress={progress}
                instruction={guidance}
                isApiComplete={state === "SUCCESS"}
                pairingId={pairingId}
            />
        );
    }

    const showDesktopQr = !isMobile && qrInitialized && qrCodeDataUrl && desktopQrStep !== 'success';

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
                    {showDesktopQr
                        ? 'Cross-Device Verification'
                        : 'Liveness Verification'}
                </h1>
                <p className="text-text-sub text-lg font-medium leading-relaxed max-w-3xl mt-2">
                    {showDesktopQr
                        ? 'Scan the QR code with your mobile device to complete the liveness verification.'
                        : 'Position your face within the frame and follow the on-screen prompts to confirm you are a real human.'}
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

                {/* Left: Camera or QR Code */}
                <div className={`bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 md:p-12 space-y-8 ${showDesktopQr ? 'lg:min-h-0' : ''}`}>
                    <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 flex items-center justify-center ${showDesktopQr ? 'min-h-[420px] md:min-h-[460px] w-full max-w-3xl mx-auto' : 'aspect-[3/4]'}`}>

                        {/* Desktop QR Code Display */}
                        {showDesktopQr && (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
                                {/* QR Code Image */}
                                <div className="bg-white p-4 rounded-xl">
                                    <img
                                        src={qrCodeDataUrl}
                                        alt="Verification QR Code"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>

                                {/* Instructions */}
                                <div className="text-center space-y-2">
                                    <h3 className="text-white text-lg font-bold">Scan with Your Phone</h3>
                                    <p className="text-white/70 text-sm">
                                        Open your mobile device and scan this QR code to complete liveness verification
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-wider">
                                    <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                                    Waiting for Mobile
                                </div>
                            </div>
                        )}

                        {/* Mobile Camera Feed */}
                        {(isMobile || !qrInitialized || !qrCodeDataUrl || desktopQrStep === 'success') && (
                            <>
                                <video ref={videoRef} className="hidden" playsInline muted />
                                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" width={640} height={480} />

                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <mask id="oval-mask">
                                    <rect width="100%" height="100%" fill="white" />
                                    <ellipse cx="50" cy="45" rx="25" ry="35" fill="black" />
                                </mask>
                            </defs>
                            <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#oval-mask)" />
                            <ellipse
                                cx="50" cy="45" rx="25" ry="35"
                                fill="none"
                                stroke={ovalColor === 'green' ? '#4ade80' : ovalColor === 'red' ? '#ef4444' : 'white'}
                                strokeWidth="1.5"
                                style={{ transition: 'stroke 0.3s ease' }}
                                strokeDasharray={ovalColor === 'white' ? "4 2" : "none"}
                            />
                        </svg>

                        <div className="absolute top-8 inset-x-0 text-center px-4">
                            <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg backdrop-blur-md shadow-lg transition-colors duration-300 ${ovalColor === 'green' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                                ovalColor === 'red' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                                    'bg-slate-900/60 text-white border border-white/20'
                                }`}>
                                {guidance}
                            </span>
                        </div>

                        {state === "CHALLENGE" && (
                            <div className="absolute bottom-6 inset-x-12 h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        )}

                        {state === "INITIALIZING" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-gray-300 font-medium tracking-wide">Initializing Secure Camera...</p>
                                </div>
                            </div>
                        )}

                        {state === "SUCCESS" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-900/90 z-30 animate-in fade-in duration-500">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
                                        <span className="material-symbols-outlined text-white text-[40px]">check</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Verified!</h2>
                                </div>
                            </div>
                        )}
                            </>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-text-main">Ready to scan?</h3>
                            <p className="text-text-sub text-base font-medium">Ensure good lighting. Blink 3 times, then open your mouth wide.</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="h-16 px-12 rounded-[22px] font-black text-lg flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.98] min-w-[280px] bg-red-500 text-white shadow-red-500/30 hover:shadow-red-500/40"
                        >
                            <span className="material-symbols-outlined text-[24px]">refresh</span>
                            Restart
                        </button>
                    </div>
                </div>

                {/* Right: Layer 3 Sidebar */}
                <aside className="space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
                        <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

                        <div className="space-y-10 relative">
                            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                                <div className="absolute top-0 left-0 w-full h-[75%] bg-primary"></div>
                            </div>

                            {/* Step 1: Completed */}
                            <div className="flex gap-6 items-start relative z-10">
                                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Choose Method</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                                </div>
                            </div>

                            {/* Step 2: Completed */}
                            <div className="flex gap-6 items-start relative z-10">
                                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Document Upload</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Data extracted</span>
                                </div>
                            </div>

                            {/* Step 3: Completed */}
                            <div className="flex gap-6 items-start relative z-10">
                                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Verify Data</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                                </div>
                            </div>

                            {/* Step 4: Active */}
                            <div className="flex gap-6 items-start relative z-10">
                                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                                    4
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-primary leading-tight">Liveness Check</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Face scan in progress</span>
                                </div>
                            </div>

                            {/* Step 5: Pending */}
                            <div className="flex gap-6 items-start relative z-10 opacity-30">
                                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                                    5
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-text-main leading-tight">Review & Submit</span>
                                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Final confirmation</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 group cursor-pointer hover:bg-gray-50 transition-all">
                                <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-lg">support_agent</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-text-main leading-none mb-1">Need help?</p>
                                    <button className="text-[11px] font-bold text-primary hover:underline">Contact Support</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};
