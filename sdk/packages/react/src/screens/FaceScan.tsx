import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    'Position your face in the frame',
    'Blink 3 times naturally',
    'Open your mouth',
    'Hold still',
    'Processing verification...',
];

// Helper function to calculate Euclidean distance
const euclideanDist = (p1: any, p2: any) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

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
    const faceMeshRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    const [step, setStep] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
    const [blinkCount, setBlinkCount] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);
    const [mouthOpenProgress, setMouthOpenProgress] = useState(0);

    // Use refs for values accessed in MediaPipe callback to avoid stale closures
    const stepRef = useRef(0);
    const blinkCountRef = useRef(0);
    const isBlinkingRef = useRef(false);
    const mouthOpenProgressRef = useRef(0);
    const submissionStartedRef = useRef(false);

    // Helper functions to update both state and ref together
    const updateStep = (value: number) => {
        stepRef.current = value;
        setStep(value);
    };

    const updateBlinkCount = (value: number) => {
        blinkCountRef.current = value;
        setBlinkCount(value);
    };

    const updateIsBlinking = (value: boolean) => {
        isBlinkingRef.current = value;
        setIsBlinking(value);
    };

    const updateMouthOpenProgress = (value: number) => {
        mouthOpenProgressRef.current = value;
        setMouthOpenProgress(value);
    };

    // Calculate progress percentage
    const progress = step === 0 ? 0 :
                     step === 1 ? (blinkCount / 3) * 100 :
                     step === 2 ? mouthOpenProgress :
                     step === 3 ? 100 :
                     Math.min(100, Math.round((step / (instructions.length - 1)) * 100));

    // Load MediaPipe FaceMesh
    useEffect(() => {
        const loadFaceMesh = async () => {
            try {
                // Dynamically import MediaPipe (cast as any - no TS types available)
                const { FaceMesh } = await import('@mediapipe/face_mesh' as any);
                const { Camera } = await import('@mediapipe/camera_utils' as any);

                const faceMesh = new FaceMesh({
                    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
                });

                faceMesh.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.3,
                    minTrackingConfidence: 0.3
                });

                console.log('✅ MediaPipe FaceMesh loaded successfully');

                faceMesh.onResults(onFaceMeshResults);
                faceMeshRef.current = faceMesh;

                // Initialize camera
                if (videoRef.current) {
                    const camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (faceMeshRef.current && videoRef.current) {
                                await faceMeshRef.current.send({ image: videoRef.current });
                            }
                        },
                        width: 640,
                        height: 480
                    });

                    await camera.start();
                    cameraRef.current = camera;
                    setCameraReady(true);
                    console.log('📹 Camera started successfully');
                }
            } catch (err: any) {
                console.error('FaceMesh initialization error:', err);
                if (err.name === 'NotAllowedError') {
                    setCameraPermissionDenied(true);
                    setError('Camera permission denied. Please enable camera access.');
                } else {
                    setError('Unable to initialize face detection. Please try again.');
                }
                onError?.('FaceMesh initialization failed');
            }
        };

        loadFaceMesh();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Process face landmarks from MediaPipe
    const onFaceMeshResults = (results: any) => {
        if (!canvasRef.current || isProcessing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx || !results.image) return;

        // Draw video frame to canvas (mirrored)
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            processFaceLandmarks(landmarks);
        } else {
            console.log('⚠️ No face detected in frame');
        }
    };

    // Process face landmarks for blink and mouth detection
    const processFaceLandmarks = (landmarks: any[]) => {
        // Use ref values to avoid stale closures
        const currentStep = stepRef.current;
        const currentBlinkCount = blinkCountRef.current;
        const currentIsBlinking = isBlinkingRef.current;

        if (currentStep === 0) {
            // Positioning step - check if face is centered
            const nose = landmarks[1];
            const isCentered = nose.x > 0.35 && nose.x < 0.65 && nose.y > 0.35 && nose.y < 0.65;

            // Log positioning info occasionally
            if (Math.random() < 0.05) {
                console.log(`📍 Face position: x=${nose.x.toFixed(2)}, y=${nose.y.toFixed(2)} (centered: ${isCentered})`);
            }

            if (isCentered) {
                console.log('✅ Face centered! Advancing to blink detection...');
                // Auto-advance to blink step after positioned
                setTimeout(() => updateStep(1), 500);
            }
        } else if (currentStep === 1) {
            // Blink detection
            const leftEyeOpen = euclideanDist(landmarks[159], landmarks[145]);
            const leftEyeWidth = euclideanDist(landmarks[33], landmarks[133]);
            const eyeRatio = leftEyeOpen / leftEyeWidth;

            // Log eye ratio every few frames for debugging
            if (Math.random() < 0.1) { // Log ~10% of frames to avoid spam
                console.log(`👁️ Eye ratio: ${eyeRatio.toFixed(3)} (threshold: 0.16, ${eyeRatio < 0.16 ? 'CLOSED' : 'OPEN'})`);
            }

            if (eyeRatio < 0.16) {
                // Eye is closed
                if (!currentIsBlinking) {
                    console.log('👁️ Blink started (eye closed)');
                    updateIsBlinking(true);
                }
            } else {
                // Eye is open
                if (currentIsBlinking) {
                    const newBlinkCount = currentBlinkCount + 1;
                    console.log(`✅ Blink detected! Count: ${newBlinkCount}/3`);
                    updateIsBlinking(false);
                    updateBlinkCount(newBlinkCount);

                    // Capture frame after blink
                    captureFrame();

                    if (newBlinkCount >= 3) {
                        console.log('🎉 All 3 blinks completed! Moving to mouth opening step...');
                        // Move to mouth opening step
                        setTimeout(() => {
                            updateStep(2);
                            updateMouthOpenProgress(0);
                        }, 300);
                    }
                }
            }
        } else if (currentStep === 2) {
            // Mouth opening detection
            const upperLip = landmarks[13];
            const lowerLip = landmarks[14];
            const mouthOpen = euclideanDist(upperLip, lowerLip);

            const topHead = landmarks[10];
            const chin = landmarks[152];
            const faceHeight = euclideanDist(topHead, chin);
            const mouthOpenRatio = mouthOpen / faceHeight;

            // Update progress based on mouth opening
            const openProgress = Math.min((mouthOpenRatio / 0.15) * 100, 100);
            updateMouthOpenProgress(openProgress);

            // Capture frames during mouth opening
            if (framesRef.current.length < 15) {
                captureFrame();
            }

            // Check if mouth is wide open and we haven't started submitting yet
            if (mouthOpenRatio > 0.12 && framesRef.current.length >= 10 && !submissionStartedRef.current) {
                // Mark as started to avoid double submission during the timeout
                submissionStartedRef.current = true;
                
                // Capture final frame and submit
                captureFrame();
                setTimeout(() => {
                    updateStep(3);
                    submitLiveness();
                }, 500);
            }
        }
    };

    // Capture frame from canvas
    const captureFrame = () => {
        if (!canvasRef.current || framesRef.current.length >= 25) return;

        canvasRef.current.toBlob((blob) => {
            if (blob) {
                framesRef.current.push(blob);
            }
        }, 'image/jpeg', 0.8);
    };

    // Submit liveness check
    const submitLiveness = async () => {
        setIsProcessing(true);
        updateStep(4); // "Processing..."

        if (previewMode) {
            setTimeout(() => {
                setIsProcessing(false);
                onNext(true);
            }, 2000);
            return;
        }

        try {
            const formData = new FormData();
            const isV2Flow = !!requestId;
            const endpoint = isV2Flow 
                ? `${apiBaseUrl}/api/v2/verification/liveness`
                : `${apiBaseUrl}/api/ai/verify-liveness-sequence`;

            // Order matters for Multer: append text fields BEFORE files
            if (isV2Flow) {
                formData.append('requestId', requestId);
                
                // V2 server expects all metadata in a single JSON string
                const metadata = {
                    totalFrames: framesRef.current.length,
                    stepSequence: ['blink', 'open_mouth'],
                    timestamp: Date.now()
                };
                formData.append('metadata', JSON.stringify(metadata));

                // Limit to 10 frames for V2
                const relevantFrames = framesRef.current.slice(-10);
                relevantFrames.forEach((frame, index) => {
                    formData.append('imageFrames', frame, `frame_${index}.jpg`);
                });
            } else {
                // Legacy flow
                framesRef.current.forEach((frame, index) => {
                    formData.append(`frame_${index}`, frame, `frame_${index}.jpg`);
                });
                formData.append('totalFrames', framesRef.current.length.toString());
                formData.append('stepSequence', JSON.stringify(['blink', 'open_mouth']));
            }

            const response = await fetch(endpoint, {
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

            const data = await response.json();

            // Handle response format for both endpoints
            // AI flow: data.passed
            // V2 flow: data.liveness.status === 'completed'
            const passed = isV2Flow 
                ? (data.success && (data.liveness?.success || data.liveness?.status === 'completed' || data.liveness?.status === 'approved'))
                : (data.success && data.passed);

            if (passed) {
                // Stop camera
                if (cameraRef.current) {
                    cameraRef.current.stop();
                }
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                onNext(true);
            } else {
                const errorMsg = data.error || data.liveness?.error || 'Liveness check failed. Please try again.';
                setError(errorMsg);
                // Reset for retry
                updateStep(0);
                updateBlinkCount(0);
                updateMouthOpenProgress(0);
                framesRef.current = [];
                setIsProcessing(false);
                submissionStartedRef.current = false;
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
            updateStep(0);
            updateBlinkCount(0);
            updateMouthOpenProgress(0);
            framesRef.current = [];
            setIsProcessing(false);
            onError?.('Liveness submission failed');
        }
    };

    // Retry handler
    const handleRetry = () => {
        setError('');
        updateStep(0);
        updateBlinkCount(0);
        updateMouthOpenProgress(0);
        framesRef.current = [];
        setIsProcessing(false);
        submissionStartedRef.current = false;
    };

    if (cameraPermissionDenied) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-black"
            >
                <div className="w-16 h-16 text-red-500 mb-6 text-5xl">⚠️</div>
                <h2 className="text-xl font-bold text-white mb-3">Camera Access Required</h2>
                <p className="text-gray-400 text-sm mb-6">
                    Please enable camera access in your browser settings to continue with face verification.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#8651e1] text-white rounded-2xl font-bold"
                >
                    Try Again
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative bg-black overflow-hidden"
        >
            {/* Hidden video for MediaPipe */}
            <video
                ref={videoRef}
                className="hidden"
                playsInline
                muted
            />

            {/* Immersive Atmosphere */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#8651e1]/5 to-[#8651e1]/10 pointer-events-none" />

            {/* Main Scanner Area */}
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center pt-8">
                <div className="relative w-72 h-96 flex items-center justify-center">
                    {/* Portrait Mask with Live Video */}
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-2xl">
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#8651e1]/10 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent h-1/3 mt-auto" />
                    </div>

                    {/* Biometric Point Grid */}
                    <div className="absolute inset-0 z-30 pointer-events-none">
                        {[
                            { t: '30%', l: '50%' }, { t: '35%', l: '40%' }, { t: '35%', l: '60%' },
                            { t: '45%', l: '50%' }, { t: '52%', l: '35%' }, { t: '52%', l: '65%' },
                            { t: '60%', l: '45%' }, { t: '60%', l: '55%' }, { t: '70%', l: '50%' },
                        ].map((pos, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.5, 1],
                                    opacity: progress > (i * 11) ? 1 : 0
                                }}
                                className="absolute w-2 h-2 bg-[#6DE8EC] rounded-full shadow-[0_0_12px_#6DE8EC]"
                                style={{ top: pos.t, left: pos.l }}
                            />
                        ))}
                    </div>

                    {/* Glowing Brackets */}
                    <div className="absolute -inset-6 z-40">
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#14b8a6] rounded-tl-[3.5rem]"
                        />
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-[#14b8a6] rounded-tr-[3.5rem]"
                        />
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-[#14b8a6] rounded-bl-[3.5rem]"
                        />
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#14b8a6] rounded-br-[3.5rem]"
                        />
                    </div>

                    {/* Scanning Line */}
                    <motion.div
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent shadow-[0_0_15px_#6DE8EC] z-50 pointer-events-none"
                        style={{ borderRadius: '100%' }}
                    />
                </div>
            </div>

            {/* Instructions Area */}
            <div className="relative z-50 px-8 pb-20 pt-4 flex flex-col items-center gap-6">
                {error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-900/30 border border-red-500/50 p-6 rounded-3xl w-full text-center"
                    >
                        <p className="text-red-400 font-bold text-lg mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step === 1 ? `${instructions[step]}-${blinkCount}` : instructions[step]}
                            initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                            className="text-white text-center font-bold text-xl leading-tight min-h-[3rem] flex items-center justify-center drop-shadow-lg flex-col gap-2"
                        >
                            {isProcessing && step === 4 ? (
                                <span className="flex items-center gap-3">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {instructions[step]}
                                </span>
                            ) : (
                                <>
                                    <span>{instructions[step]}</span>
                                    {step === 1 && <span className="text-[#6DE8EC] text-2xl">({blinkCount}/3)</span>}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

                <div className="w-full max-w-[240px] h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#8651e1] to-[#6DE8EC]"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {!error && (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-[#6DE8EC] shadow-[0_0_8px_#6DE8EC]' : 'bg-yellow-500 animate-pulse'}`} />
                        <span className="uppercase tracking-widest font-bold">
                            {cameraReady ? 'LIVE CAMERA' : 'INITIALIZING...'}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FaceScan;
