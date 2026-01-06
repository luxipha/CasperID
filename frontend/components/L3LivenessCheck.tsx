import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

interface L3LivenessCheckProps {
    onComplete?: () => void;
}

type VerificationState = "INITIALIZING" | "POSITIONING" | "CHALLENGE" | "VERIFYING" | "SUCCESS";
type ChallengeType = "BLINK" | "TURN_LEFT";

/**
 * L3LivenessCheck - Liveness component for Layer 3 flow with sidebar
 * NO minting - just verifies liveness and stores result for admin review
 */
export const L3LivenessCheck: React.FC<L3LivenessCheckProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [state, setState] = useState<VerificationState>("INITIALIZING");
    const [guidance, setGuidance] = useState("Loading AI Models...");
    const [challenge, setChallenge] = useState<ChallengeType>("BLINK");
    const [progress, setProgress] = useState(0);
    const [ovalColor, setOvalColor] = useState<"white" | "red" | "green">("white");

    const { refreshUser } = useAuth();

    const logicState = useRef({
        positionTimer: 0,
        blinkCount: 0,
        isBlinking: false,
        frames: [] as string[],
        lastFrameTime: 0
    });

    useEffect(() => {
        let camera: any = null;
        let faceMesh: any = null;
        let isActive = true;

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
                        if (!st.isBlinking) st.isBlinking = true;
                    } else {
                        if (st.isBlinking) {
                            st.isBlinking = false;
                            st.blinkCount++;

                            if (canvasRef.current && st.frames.length < 15) {
                                st.frames.push(canvasRef.current.toDataURL('image/jpeg', 0.6));
                            }

                            setProgress((st.blinkCount / 3) * 100);
                            if (st.blinkCount >= 3) {
                                setChallenge("TURN_LEFT");
                                setGuidance("Slowly turn head to the LEFT");
                                setProgress(0);
                                st.lastFrameTime = now;
                            }
                        }
                    }
                }

                if (challenge === "TURN_LEFT") {
                    const nose = landmarks[1];
                    const leftCheek = landmarks[234];
                    const rightCheek = landmarks[454];
                    const faceWidth = rightCheek.x - leftCheek.x;
                    const nosePos = (nose.x - leftCheek.x) / faceWidth;

                    if (now - st.lastFrameTime > 300 && st.frames.length < 15) {
                        st.frames.push(canvasRef.current?.toDataURL('image/jpeg', 0.6) || "");
                        st.lastFrameTime = now;
                    }

                    if (nosePos < 0.3) {
                        if (canvasRef.current && st.frames.length < 15) {
                            st.frames.push(canvasRef.current.toDataURL('image/jpeg', 0.6));
                        }
                        submitLiveness(st.frames);
                    }
                }
            }
        };

        const init = async () => {
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
            } catch (error) {
                console.error('Camera initialization failed:', error);
                setGuidance("Camera access denied");
            }
        };

        init();

        return () => {
            isActive = false;
            if (camera) camera.stop();
            if (faceMesh) faceMesh.close();
        };
    }, [state, challenge]);

    const submitLiveness = async (frames: string[]) => {
        if (state === "VERIFYING") return; // Prevent double submission

        try {
            setState("VERIFYING");
            setGuidance("Verifying liveness...");

            const formData = new FormData();
            frames.forEach((frame, index) => {
                const byteString = atob(frame.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: 'image/jpeg' });
                formData.append(`frame_${index}`, blob, `frame_${index}.jpg`);
            });
            formData.append('totalFrames', frames.length.toString());
            formData.append('stepSequence', JSON.stringify(['blink', 'turn_left']));

            const response = await fetch('/api/ai/verify-liveness-sequence', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.passed) {
                    await refreshUser();
                    setState("SUCCESS");
                    setGuidance("Verification complete!");
                    // Wait briefly then proceed
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 1500);
                } else {
                    setGuidance("Verification failed. Please try again.");
                    setState("POSITIONING");
                }
            } else {
                throw new Error('Verification failed');
            }
        } catch (error) {
            console.error('Liveness error:', error);
            setGuidance("Error. Try again.");
            setState("POSITIONING");
        }
    };

    const euclideanDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    return (
        <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
                    Liveness Verification
                </h1>
                <p className="text-text-sub text-lg font-medium leading-relaxed max-w-3xl mt-2">
                    Position your face within the frame and follow the on-screen prompts to confirm you are a real human.
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

                {/* Left: Camera */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 md:p-12 space-y-10">
                    <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
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
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-text-main">Ready to scan?</h3>
                            <p className="text-text-sub text-base font-medium">Ensure good lighting and no accessories.</p>
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
