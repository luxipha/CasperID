"use client";

import { useEffect, useRef, useState } from "react";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface LivenessCheckProps {
    onSuccess: (videoFrames: string[]) => void;
    onCancel: () => void;
}

type VerificationState = "INITIALIZING" | "POSITIONING" | "CHALLENGE" | "SUCCESS";
type ChallengeType = "BLINK" | "TURN_LEFT";

export default function LivenessCheck({ onSuccess, onCancel }: LivenessCheckProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // High-level state
    const [state, setState] = useState<VerificationState>("INITIALIZING");
    const [guidance, setGuidance] = useState("Loading AI Models...");
    const [challenge, setChallenge] = useState<ChallengeType>("BLINK");
    const [progress, setProgress] = useState(0);
    const [ovalColor, setOvalColor] = useState<"white" | "red" | "green">("white");

    // Logic refs
    const logicState = useRef({
        positionTimer: 0,
        blinkCount: 0,
        isBlinking: false,
        frames: [] as string[],
        lastFrameTime: 0
    });

    useEffect(() => {
        let camera: Camera | null = null;
        let faceMesh: FaceMesh | null = null;

        const onResults = (results: Results) => {
            if (!canvasRef.current || !videoRef.current) return;
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;

            // Draw mirrored video
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

            // --- PHASE 1: POSITIONING ---
            if (state === "POSITIONING" || (state === "INITIALIZING" && landmarks)) {
                // 1. Center Check (Nose Tip #1)
                const nose = landmarks[1];
                const isCentered = nose.x > 0.4 && nose.x < 0.6 && nose.y > 0.4 && nose.y < 0.6;

                // 2. Distance Check (Top Head #10 to Chin #152)
                const topHead = landmarks[10];
                const chin = landmarks[152];
                const faceHeight = Math.abs(topHead.y - chin.y); // Relative to 0..1

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
                    st.positionTimer += 33; // Approx time per frame
                    if (st.positionTimer > 1500) { // 1.5 seconds of valid holding
                        setState("CHALLENGE");
                        setGuidance("Great! Now Blink 3 times");
                        setOvalColor("green");
                    }
                } else {
                    st.positionTimer = 0;
                }
                return; // Don't process blink/turn if positioning
            }

            // --- PHASE 2: CHALLENGES ---
            if (state === "CHALLENGE") {
                // Record frame logic (simplified)
                if (now - st.lastFrameTime > 500 && st.frames.length < 5) {
                    st.frames.push(canvasRef.current?.toDataURL('image/jpeg', 0.6) || "");
                    st.lastFrameTime = now;
                }

                if (challenge === "BLINK") {
                    const leftEyeOpen = euclideanDist(landmarks[159], landmarks[145]);
                    const leftEyeWidth = euclideanDist(landmarks[33], landmarks[133]);
                    const ratio = leftEyeOpen / leftEyeWidth;

                    if (ratio < 0.16) { // Closed
                        if (!st.isBlinking) st.isBlinking = true;
                    } else { // Open
                        if (st.isBlinking) {
                            st.isBlinking = false;
                            st.blinkCount++;
                            setProgress((st.blinkCount / 3) * 100);
                            if (st.blinkCount >= 3) {
                                setChallenge("TURN_LEFT");
                                setGuidance("Slowly turn head to the LEFT");
                                setProgress(0);
                            }
                        }
                    }
                }

                if (challenge === "TURN_LEFT") {
                    const nose = landmarks[1];
                    const leftCheek = landmarks[234];
                    const rightCheek = landmarks[454];
                    const faceWidth = rightCheek.x - leftCheek.x;

                    // Nose percent from left cheek (0.0 to 1.0)
                    // Normal ~0.5. Looking Left < 0.3. Looking Right > 0.7.
                    const nosePos = (nose.x - leftCheek.x) / faceWidth;

                    if (nosePos < 0.3) {
                        setState("SUCCESS");
                        setGuidance("Verification Complete!");
                        setTimeout(() => onSuccess(st.frames), 800);
                    }
                }
            }
        };

        const init = async () => {
            faceMesh = new FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            faceMesh.onResults(onResults);

            if (videoRef.current) {
                camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current && faceMesh) await faceMesh.send({ image: videoRef.current });
                    },
                    width: 640,
                    height: 480
                });
                await camera.start();
            }
        };
        init();

        return () => {
            camera?.stop();
            faceMesh?.close();
        };
    }, [state, challenge]);
    // Dependency note: Effects usually shouldn't depend on fast-changing state (like progress), 
    // but 'state' and 'challenge' switch rarely.

    const euclideanDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    return (
        <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
            <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
                {/* Hidden Source */}
                <video ref={videoRef} className="hidden" playsInline muted />

                {/* Output */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" width={640} height={480} />

                {/* Oval Overlay (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <mask id="oval-mask">
                            <rect width="100%" height="100%" fill="white" />
                            <ellipse cx="50" cy="45" rx="30" ry="40" fill="black" />
                        </mask>
                    </defs>
                    {/* Dimmed Background */}
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#oval-mask)" />

                    {/* Oval Border Ring */}
                    <ellipse
                        cx="50" cy="45" rx="30" ry="40"
                        fill="none"
                        stroke={ovalColor === 'green' ? '#4ade80' : ovalColor === 'red' ? '#ef4444' : 'white'}
                        strokeWidth="1.5"
                        style={{ transition: 'stroke 0.3s ease' }}
                        strokeDasharray={ovalColor === 'white' ? "4 2" : "none"}
                    />
                </svg>

                {/* Dynamic Guidance Text */}
                <div className="absolute top-8 inset-x-0 text-center px-4">
                    <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg backdrop-blur-md shadow-lg transition-colors duration-300 ${ovalColor === 'green' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                            ovalColor === 'red' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                                'bg-slate-900/60 text-white border border-white/20'
                        }`}>
                        {guidance}
                    </span>
                </div>

                {/* Progress Bar (During Challenge) */}
                {state === "CHALLENGE" && (
                    <div className="absolute bottom-6 inset-x-12 h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                )}

                {/* Initial Loader */}
                {state === "INITIALIZING" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-3" />
                            <p className="text-gray-300 font-medium tracking-wide">Initializing Secure Camera...</p>
                        </div>
                    </div>
                )}

                {/* Success Overlay */}
                {state === "SUCCESS" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-900/90 z-30 animate-in fade-in duration-500">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Verified</h2>
                        </div>
                    </div>
                )}
            </div>

            <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white hover:bg-white/5">
                Cancel Verification
            </Button>
        </div>
    );
}
