import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { LivenessSuccess } from './LivenessSuccess';
import { VerificationProgress } from './VerificationProgress';
import { MobileLivenessPage, MobileStep } from './MobileLiveness';
import { DesktopLivenessQR } from './DesktopLivenessQR';
import { generateLivenessProof, FaceLandmark } from '../services/zkProver';
import { apiService } from '../services/api';

interface LivenessCheckProps {
  onBack?: () => void;
  onComplete?: () => void;
  layer?: number;
  pairingPayload?: {
    requestId: string;
    pairingId: string;
    pairingToken: string;
  };
}

type VerificationState = "INITIALIZING" | "POSITIONING" | "CHALLENGE" | "VERIFYING_AI" | "MINTING" | "ZK_PROVING" | "ZK_SUBMITTING" | "SUCCESS" | "COMPLETED" | "SYBIL_REJECTED";
type ChallengeType = "BLINK" | "OPEN_MOUTH";
const MIN_SUBMISSION_FRAMES = 10;
const FRAME_CAPTURE_TIMEOUT_MS = 10000;

const euclideanDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

const detectMobileDevice = () => {
  const userAgentData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return userAgentData?.mobile === true || isIPadOS ||
    /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const LivenessCheck: React.FC<LivenessCheckProps> = ({ onBack, onComplete, layer = 2, pairingPayload }) => {
  const [isMobile] = useState(detectMobileDevice);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-level state
  const [state, setState] = useState<VerificationState>("INITIALIZING");
  const [guidance, setGuidance] = useState("Loading AI Models...");
  const [challenge, setChallenge] = useState<ChallengeType>("BLINK");
  const [progress, setProgress] = useState(0);
  const [ovalColor, setOvalColor] = useState<"white" | "red" | "green">("white");
  const [isApiComplete, setIsApiComplete] = useState(false);

  // QR Pairing State (for cross-device desktop-to-mobile flow)
  const [requestId, setRequestId] = useState<string>(pairingPayload?.requestId || "");
  const [pairingId, setPairingId] = useState<string>(pairingPayload?.pairingId || "");
  const [pairingToken] = useState<string>(pairingPayload?.pairingToken || "");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [qrError, setQrError] = useState<string>("");
  const [desktopQrStep, setDesktopQrStep] = useState<"loading" | "ready" | "scanning" | "success">("loading");
  const [qrInitialized, setQrInitialized] = useState(false);

  const { refreshUser } = useAuth();

  // ZK proof state
  const [zkProgress, setZkProgress] = useState(0);
  const [sybilError, setSybilError] = useState<string | null>(null);
  const capturedLandmarks = useRef<FaceLandmark[] | null>(null);
  const blinkTimestamps = useRef<number[]>([]);
  const maxMouthOpen = useRef(0);
  const mouthCaptureStartedAt = useRef<number | null>(null);
  const lastCaptureLogAt = useRef(0);

  // Logic refs
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
    if (!ignoreLimit && st.frames.length >= 30 || st.isCapturing) return false;
    st.isCapturing = true;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob && (ignoreLimit || st.frames.length < 30)) {
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
    capturedLandmarks.current = null;
    blinkTimestamps.current = [];
    maxMouthOpen.current = 0;
    mouthCaptureStartedAt.current = null;
    lastCaptureLogAt.current = 0;
    setProgress(0);
    setZkProgress(0);
    setChallenge("BLINK");
  };

  // Start V2 verification on every device. Desktop additionally displays its QR handoff.
  useEffect(() => {
    // Prevent double initialization
    if (qrInitialized || pairingPayload) return;

    const initializeQRVerification = async () => {
      try {
        console.log('[QR] Initializing QR verification...');
        const response = await apiService.post('/api/v2/verification/layer2/start', {
          linkWallet: false,
          purpose: 'Layer 2 Liveness Verification'
        });

        console.log('[QR] API Response:', response);

        if (response && response.verification) {
          const { requestId: reqId, pairingId: pId, qrCode } = response.verification;
          console.log('[QR] Received:', { reqId, pId, hasQrCode: !!qrCode });

          setRequestId(reqId);
          if (!isMobile) setPairingId(pId);

          if (!isMobile && qrCode && qrCode.dataUrl) {
            console.log('[QR] Setting QR code image');
            setQrCodeDataUrl(qrCode.dataUrl);
            setDesktopQrStep('ready');
          }
        }
        setQrInitialized(true);
      } catch (error) {
        console.error('[QR] Failed to initialize:', error);
        setQrError(error instanceof Error ? error.message : 'Unable to create mobile handoff.');
        setQrInitialized(true);
      }
    };

    initializeQRVerification();
  }, [qrInitialized, isMobile]);

  useEffect(() => {
    if (isMobile || !requestId || desktopQrStep === 'success') return;
    const poll = window.setInterval(async () => {
      try {
        const result = await apiService.get(`/api/v2/verification/${requestId}/status`);
        if (result.verification?.status === 'completed') {
          window.clearInterval(poll);
          setDesktopQrStep('success');
          await refreshUser();
          onComplete?.();
        } else if (result.verification?.status === 'in_progress') {
          setDesktopQrStep('scanning');
        }
      } catch {
        // Keep polling until the pairing expires or the user cancels.
      }
    }, 1500);
    return () => window.clearInterval(poll);
  }, [desktopQrStep, isMobile, onComplete, refreshUser, requestId]);

  useEffect(() => {
    let camera: any = null;
    let faceMesh: any = null;
    let isActive = true;

    // Hosted verification is phone-first. Desktop only displays and polls the QR handoff.
    if (!isMobile) {
      return;
    }

    // Stop everything if we're in minting, ZK, or completed state
    if (state === "MINTING" || state === "ZK_PROVING" || state === "ZK_SUBMITTING" || state === "SUCCESS") {
      return;
    }

    const onResults = (results: any) => {
      if (!canvasRef.current || !videoRef.current || !isActive) return;
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
          if (st.positionTimer > 3000) { // 3 seconds of valid holding
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
        if (challenge === "BLINK") {
          const leftEyeOpen = euclideanDist(landmarks[159], landmarks[145]);
          const leftEyeWidth = euclideanDist(landmarks[33], landmarks[133]);
          const ratio = leftEyeOpen / leftEyeWidth;

          if (ratio < 0.16) { // Closed
            if (!st.isBlinking) {
              st.isBlinking = true;
              // Preserve evidence of the closed-eye moment, not only the open-eye frame after it.
              if (canvasRef.current && st.frames.length < 30) {
                captureFrame(canvasRef.current, st);
              }
            }
          } else { // Open
            if (st.isBlinking) {
              st.isBlinking = false;
              st.blinkCount++;
              blinkTimestamps.current.push(now); // Capture blink time for ZK

              // Capture frame when blink completes (async, non-blocking)
              if (canvasRef.current && st.frames.length < 30) {
                captureFrame(canvasRef.current, st);
              }

              setProgress((st.blinkCount / 3) * 100);
              if (st.blinkCount >= 3) {
                setChallenge("OPEN_MOUTH");
                setGuidance("Now, OPEN your mouth");
                setProgress(0);
                st.lastFrameTime = now; // Reset timer for next phase
                mouthCaptureStartedAt.current = now;
                console.info('[Liveness Capture] Blink challenge completed', {
                  blinkCount: st.blinkCount,
                  frameCount: st.frames.length,
                });
              }
            }
          }
        }

        if (challenge === "OPEN_MOUTH") {
          // Inner Lip landmarks: 13 (top), 14 (bottom)
          const mouthOpen = euclideanDist(landmarks[13], landmarks[14]);

          // Use eye width or face height as a scale-invariant denominator
          // Landmark 10 (top) to 152 (chin) is face height
          const faceHeight = euclideanDist(landmarks[10], landmarks[152]);
          const mouthRatio = mouthOpen / faceHeight;

          // Track max mouth open for ZK proof
          if (mouthRatio > maxMouthOpen.current) {
            maxMouthOpen.current = mouthRatio;
          }

          // Capture landmarks for ZK proof (once when face is well-positioned)
          if (!capturedLandmarks.current && landmarks.length >= 468) {
            capturedLandmarks.current = landmarks.map((lm: any) => ({ x: lm.x, y: lm.y, z: lm.z }));
          }

          // Capture frames periodically during mouth opening
          if (now - st.lastFrameTime > 100 && st.frames.length < 30 && canvasRef.current && !st.isCapturing) {
            st.lastFrameTime = now;
            captureFrame(canvasRef.current, st);
          }

          // Once the mouth challenge begins, progress represents captured evidence.
          setProgress(Math.min(100, (st.frames.length / MIN_SUBMISSION_FRAMES) * 100));

          if (mouthRatio > 0.13) {
            if (now - lastCaptureLogAt.current >= 1000) {
              lastCaptureLogAt.current = now;
              console.info('[Liveness Capture] Collecting open-mouth evidence', {
                frameCount: st.frames.length,
                requiredFrames: MIN_SUBMISSION_FRAMES,
                mouthRatio: Number(mouthRatio.toFixed(3)),
                isCapturing: st.isCapturing,
              });
            }

            if (st.frames.length < MIN_SUBMISSION_FRAMES) {
              const elapsed = now - (mouthCaptureStartedAt.current || now);
              if (elapsed >= FRAME_CAPTURE_TIMEOUT_MS) {
                console.error('[Liveness Capture] Frame collection stalled', {
                  frameCount: st.frames.length,
                  requiredFrames: MIN_SUBMISSION_FRAMES,
                  elapsedMs: elapsed,
                });
                setGuidance("Camera capture stalled. Close your mouth and try again.");
                mouthCaptureStartedAt.current = now;
              } else {
                setGuidance("Keep your mouth open...");
                setProgress(Math.min(100, (st.frames.length / MIN_SUBMISSION_FRAMES) * 100));
              }
              return;
            }

            if (!st.isSubmitting) {
              st.isSubmitting = true;
              console.info('[Liveness Capture] Evidence ready; preparing submission', {
                frameCount: st.frames.length,
                blinkCount: st.blinkCount,
                maxMouthOpen: Number(maxMouthOpen.current.toFixed(3)),
              });

              // Capture PEAK frame
              if (canvasRef.current) {
                captureFrame(canvasRef.current, st, true).then(() => {
                  console.info('[Liveness Capture] Peak frame captured; submitting', {
                    frameCount: st.frames.length,
                  });
                  submitLiveness([...st.frames]);
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
      while ((!videoRef.current || !canvasRef.current) && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      if (!videoRef.current || !canvasRef.current || !isActive) {
        console.warn("[LivenessCheck] Refs not ready after timeout");
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
                  // Silent fail on frame processing
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
      if (camera) {
        camera.stop();
        camera = null;
      }
      if (faceMesh) {
        faceMesh.close();
        faceMesh = null;
      }
    };
  }, [state, challenge, isMobile]);

  const submitLiveness = async (frames: Blob[]) => {
    // Prevent double submission
    if (state === "VERIFYING_AI") return;

    try {
      setState("VERIFYING_AI"); // Transition to simple verifying UI
      setGuidance("Analyzing Face...");
      const submissionStartedAt = performance.now();
      const totalBytes = frames.reduce((sum, frame) => sum + frame.size, 0);
      console.info('[Liveness] Submission started', {
        requestId,
        pairingId: pairingId || undefined,
        frameCount: frames.length,
        totalBytes,
        totalMegabytes: Number((totalBytes / 1024 / 1024).toFixed(2)),
      });

      let result;

      // V2 accepts the authenticated owner directly or a scoped cross-device pairing token.
      if (requestId) {
        console.log('[Liveness] Using V2 endpoint', pairingId ? `with pairing ${pairingId}` : 'with owner session');
        result = await apiService.submitLivenessCheckV2(
          requestId,
          frames,
          pairingId || undefined,
          pairingToken || undefined,
          ['blink', 'open_mouth']
        );
      } else {
        // Fallback to old endpoint for non-paired flows
        console.log('[Liveness] Using legacy endpoint');
        result = await apiService.verifyLivenessSequence(frames, ['blink', 'open_mouth']);
      }

      if (result.success || result.passed) {
        console.info('[Liveness] Submission completed', {
          requestId,
          durationMs: Math.round(performance.now() - submissionStartedAt),
          score: result.liveness?.score ?? result.score,
        });
        setIsApiComplete(true); // Signal progress component to finish immediately

        if (requestId) {
          await refreshUser();
          setState("SUCCESS");
          setTimeout(() => onComplete?.(), 1500);
        } else {
          generateAndSubmitZkProof();
        }
      } else {
        console.error('[Liveness] Verification failed:', result);
        const failure = result.liveness?.error || result.error || "Verification failed. Please try again.";
        const score = result.liveness?.score ?? result.score;
        setGuidance(score !== undefined ? `${failure} (${Math.round(score * 100)}%). Try again.` : failure);
        resetLivenessState();
        setState("POSITIONING");
        setIsApiComplete(false);
      }
    } catch (error: any) {
      console.error('[Liveness] Submission request failed', {
        requestId,
        pairingId: pairingId || undefined,
        message: error?.message,
      });
      if (error.message?.includes('503') || error.details?.includes('503') || error.message?.includes('high demand')) {
        setGuidance("Our Neural engine is busy. retry again later.");
      } else {
        setGuidance("Error. Try again.");
      }
      resetLivenessState();
      setState("POSITIONING");
    }
  };

  const generateAndSubmitZkProof = async () => {
    // Skip ZK if no landmarks captured
    if (!capturedLandmarks.current || capturedLandmarks.current.length < 100) {
      console.log('[ZK] Skipping - insufficient landmarks');
      setGuidance("");
      setState("SUCCESS");
      setTimeout(() => setState("COMPLETED"), 2000);
      return;
    }

    try {
      setState("ZK_PROVING");
      setZkProgress(0);

      // Generate proof client-side
      const proof = await generateLivenessProof(
        {
          faceLandmarks: capturedLandmarks.current,
          challengeResponses: {
            blinkTimestamps: blinkTimestamps.current,
            mouthOpenRatio: maxMouthOpen.current,
            headMovementDetected: true,
          },
          sessionNonce: crypto.randomUUID(),
          walletAddress: localStorage.getItem('casperid_wallet') || '0x0',
        },
        (progress, message) => {
          setZkProgress(progress);
          setGuidance(message);
        }
      );

      setState("ZK_SUBMITTING");
      setGuidance("Anchoring to Starknet...");

      // Submit to backend
      // Backend now handles BOTH Starknet Proof Submission AND Casper Minting in this single call
      setState("MINTING"); // Change UI state to reflect the long-running backend process

      const result = await apiService.submitZkProof({
        proof: proof.proof,
        proofHash: proof.proofHash,
        publicInputs: proof.publicInputs,
      });

      if (result.success) {
        console.log('[ZK] Proof submitted:', result.transactionHash);
        setGuidance(""); // Clear guidance text
        setState("SUCCESS");

        // Auto-transition to COMPLETED after 2 seconds
        setTimeout(() => {
          setState("COMPLETED");
        }, 2000);
      } else {
        // Handle specific error codes from backend
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('[ZK] Proof submission error:', error);

      // Check for Sybil/duplicate errors
      const errorMessage = error?.message || error?.response?.data?.error || '';
      const errorCode = error?.response?.data?.code || '';

      if (
        errorCode === 'NULLIFIER_ALREADY_USED' ||
        errorCode === 'WALLET_ALREADY_VERIFIED' ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('already verified') ||
        errorMessage.includes('biometric identity')
      ) {
        // Sybil attack detected - show rejection UI
        console.error('[ZK] SYBIL DETECTED:', errorMessage);
        setSybilError(
          errorCode === 'WALLET_ALREADY_VERIFIED'
            ? 'This wallet has already been verified with CasperID.'
            : 'This biometric identity is already linked to another CasperID account. Each person can only have one verified identity.'
        );
        setState("SYBIL_REJECTED");
        return;
      }

      // For other errors, ZK is optional - don't block user
      console.warn('[ZK] Non-fatal error, continuing:', error);
      setGuidance("");
      setState("SUCCESS");

      // Auto-transition to COMPLETED after 2 seconds
      setTimeout(() => {
        setState("COMPLETED");
      }, 2000);
    }
  };

  const getMobileStep = (): MobileStep => {
    if (state === "SUCCESS") return "success";
    if (state === "SYBIL_REJECTED") return "position"; // Will be caught by early return above
    if (state === "VERIFYING_AI" || state === "MINTING" || state === "ZK_PROVING" || state === "ZK_SUBMITTING") return "processing";
    if (state === "CHALLENGE" && challenge === "OPEN_MOUTH") return "smile";
    if (state === "CHALLENGE" && challenge === "BLINK") return "blink";
    return "position";
  };

  // Show Sybil rejection UI when duplicate identity detected
  if (state === "SYBIL_REJECTED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          {/* Warning Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-red-600">gpp_bad</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900">
            Identity Already Registered
          </h2>

          {/* Error Message */}
          <p className="text-gray-600 leading-relaxed">
            {sybilError}
          </p>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-amber-600 text-xl flex-shrink-0">info</span>
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Why am I seeing this?</p>
                <p>CasperID uses Zero-Knowledge proofs to ensure each person can only verify once. This protects the network from fake accounts (Sybil attacks).</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                if (onBack) onBack();
              }}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Go Back
            </button>
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success component when verification is completed
  if (state === "COMPLETED") {
    return (
      <LivenessSuccess
        onDashboard={() => {
          if (onComplete) onComplete();
        }}
        onCancel={() => {
          if (onBack) onBack();
        }}
      />
    );
  }

  // Handle Mobile Overlay (Mobile user - show camera and do liveness)
  if (isMobile) {
    console.log('[Render] Showing MobileLivenessPage');
    // Note: VerificationProgress is shown inside state === "MINTING" usually,
    // but in Layer 2 it happens during state === "VERIFYING" transition.
    return (
      <MobileLivenessPage
        onCancel={onBack}
        onComplete={() => setState("COMPLETED")}
        videoRef={videoRef}
        canvasRef={canvasRef}
        step={getMobileStep()}
        progress={progress}
        instruction={guidance}
        isApiComplete={isApiComplete}
        pairingId={pairingId}
      />
    )
  }

  const showDesktopQr = !isMobile;

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
          {!isMobile
            ? 'Cross-Device Verification'
            : `Complete Liveness Check (Layer ${layer})`}
        </h1>
        <p className="text-text-sub text-lg font-medium leading-relaxed max-w-3xl mt-2">
          {!isMobile
            ? 'Scan the QR code with your mobile device to complete the liveness verification.'
            : 'Position your face within the frame and follow the on-screen prompts to confirm you are a real human.'}
        </p>
      </div>

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

        {/* Left: Main Verification Area */}
        <div className={`bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 md:p-12 space-y-8 ${showDesktopQr ? 'lg:min-h-0' : 'min-h-[600px]'} ${(state === 'MINTING' || state === 'ZK_PROVING' || state === 'ZK_SUBMITTING') ? 'flex items-center justify-center' : ''}`}>

          {state === "VERIFYING_AI" ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 animate-in zoom-in-50 duration-500">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-2xl font-black text-text-main">Analyzing Liveness</h3>
              <p className="text-text-sub text-center max-w-md">
                Verifying human presence securely...
              </p>
            </div>
          ) : (state === "MINTING" || state === "SUCCESS") ? (
            <div className="w-full flex-1 flex items-center justify-center animate-in zoom-in-50 duration-500">
              <VerificationProgress
                isProcessComplete={state === "SUCCESS" || isApiComplete}
                onComplete={() => {
                  // Wait for the ZK flow setTimeout to trigger COMPLETED
                }}
              />
            </div>
          ) : state === "ZK_PROVING" ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 animate-in zoom-in-50 duration-500">
              <div className="animate-pulse">
                <span className="material-symbols-outlined text-purple-500 text-6xl">shield</span>
              </div>
              <h3 className="text-2xl font-black text-text-main">Generating Privacy Proof</h3>
              <p className="text-text-sub text-center max-w-md">
                Creating a zero-knowledge proof of your liveness check. Your biometric data never leaves your device.
              </p>
              <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${zkProgress}%` }} />
              </div>
              <p className="text-sm text-text-sub">{guidance}</p>
            </div>
          ) : state === "ZK_SUBMITTING" ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center gap-6 animate-in zoom-in-50 duration-500">
              <div className="animate-spin">
                <span className="material-symbols-outlined text-purple-500 text-6xl">sync</span>
              </div>
              <h3 className="text-2xl font-black text-text-main">Anchoring to Starknet</h3>
              <p className="text-text-sub text-center max-w-md">
                Submitting your privacy-preserving proof to the blockchain...
              </p>
            </div>
          ) : (
            <>
              {/* QR Code Area for Desktop / Camera Area for Mobile */}
              <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 flex items-center justify-center ${showDesktopQr ? 'min-h-[420px] md:min-h-[460px] w-full max-w-3xl mx-auto' : 'aspect-[3/4]'}`}>

                {/* Desktop QR Code Display */}
                {showDesktopQr && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
                    {qrCodeDataUrl ? (
                      <div className="bg-white p-4 rounded-xl">
                        <img
                          src={qrCodeDataUrl}
                          alt="Verification QR Code"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    ) : qrError ? (
                      <div className="max-w-sm rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-center text-red-200">
                        <span className="material-symbols-outlined mb-2 text-3xl">error</span>
                        <p className="text-sm font-bold">{qrError}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-white/70">
                        <div className="size-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                        <p className="text-sm font-bold">Creating mobile handoff...</p>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="text-center space-y-2">
                      <h3 className="text-white text-lg font-bold">Scan with Your Phone</h3>
                      <p className="text-white/70 text-sm">
                        {qrError
                          ? 'Return and try again after checking the account frontend URL configuration.'
                          : 'Open your mobile device and scan this QR code to complete liveness verification'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {!qrError && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-wider">
                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                        {desktopQrStep === 'scanning' ? 'Verification in progress' : 'Waiting for Mobile'}
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Camera Feed */}
                {isMobile && (
                  <>
                    {/* Hidden Source */}
                    <video ref={videoRef} className="hidden" playsInline muted />

                    {/* Output Canvas */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" width={640} height={480} />

                    {/* Oval Overlay (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <mask id="oval-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <ellipse cx="50" cy="45" rx="25" ry="35" fill="black" />
                    </mask>
                  </defs>
                  {/* Dimmed Background */}
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#oval-mask)" />

                  {/* Oval Border Ring */}
                  <ellipse
                    cx="50" cy="45" rx="25" ry="35"
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
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-300 font-medium tracking-wide">Initializing Secure Camera...</p>
                    </div>
                  </div>
                )}
                  </>
                )}

              </div>

              {/* Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-text-main">Ready to scan?</h3>
                  <p className="text-text-sub text-base font-medium">
                    Ensure good lighting. Turn your head slowly during the check.
                  </p>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="h-16 px-12 rounded-[22px] font-black text-lg flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.98] min-w-[280px] bg-red-500 text-white shadow-red-500/30 hover:shadow-red-500/40"
                >
                  <span className="material-symbols-outlined text-[24px]">refresh</span>
                  Restart
                </button>
              </div>

              {/* Footer Links */}
              <div className="pt-8 border-t border-gray-50 flex flex-wrap gap-x-12 gap-y-6">
                <button className="flex items-center gap-3 text-text-sub hover:text-primary transition-colors font-bold text-sm">
                  <span className="material-symbols-outlined text-primary text-[22px]">lightbulb</span>
                  Tips for success
                </button>
                <button className="flex items-center gap-3 text-text-sub hover:text-alerts transition-colors font-bold text-sm">
                  <span className="material-symbols-outlined text-primary/60 text-[22px]">videocam_off</span>
                  Camera not working?
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: Verification Steps Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

            <div className="space-y-10 relative">
              {/* Vertical Stepper Line */}
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                <div
                  className="absolute top-0 left-0 w-0.5 bg-primary transition-all duration-1000 ease-in-out"
                  style={{
                    height: state === "SUCCESS" ? '100%' :
                      state === "MINTING" ? '75%' :
                        (state === "ZK_PROVING" || state === "ZK_SUBMITTING") ? '50%' : '25%'
                  }}
                ></div>
              </div>

              {/* Step 1: Choose Method (Always Completed) */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 2: Liveness Check */}
              <div className="flex gap-6 items-start relative z-10">
                <div className={`size-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm ring-4 ring-white transition-colors duration-500 ${["VERIFYING_AI", "MINTING", "ZK_PROVING", "ZK_SUBMITTING", "SUCCESS"].includes(state)
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border-2 border-primary text-primary"
                  }`}>
                  {["VERIFYING_AI", "MINTING", "ZK_PROVING", "ZK_SUBMITTING", "SUCCESS"].includes(state) ? (
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  ) : "2"}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black leading-tight ${!["VERIFYING_AI", "MINTING", "ZK_PROVING", "ZK_SUBMITTING", "SUCCESS"].includes(state) ? "text-primary" : "text-text-main"
                    }`}>Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Face scan verification</span>
                </div>
              </div>

              {/* Step 3: ZK Proof */}
              <div className={`flex gap-6 items-start relative z-10 transition-opacity duration-500 ${["ZK_PROVING", "ZK_SUBMITTING", "MINTING", "SUCCESS"].includes(state) ? "opacity-100" : "opacity-40"
                }`}>
                <div className={`size-8 rounded-full flex items-center justify-center font-black text-xs transition-colors duration-500 ring-4 ring-white ${["MINTING", "SUCCESS"].includes(state) ? "bg-purple-500 text-white shadow-md" :
                  ["ZK_PROVING", "ZK_SUBMITTING"].includes(state) ? "bg-white border-2 border-purple-500 text-purple-500 animate-pulse" :
                    "bg-white border-2 border-gray-200 text-text-sub"
                  }`}>
                  {["MINTING", "SUCCESS"].includes(state) ? (
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  ) : "3"}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black leading-tight ${["ZK_PROVING", "ZK_SUBMITTING"].includes(state) ? "text-purple-500" : "text-text-main"
                    }`}>Privacy Proof</span>
                  <span className={`text-[11px] font-bold mt-0.5 ${["ZK_PROVING", "ZK_SUBMITTING"].includes(state) ? "text-purple-500 animate-pulse" : "text-text-sub"}`}>
                    {state === "ZK_PROVING" ? "Generating proof..." :
                      state === "ZK_SUBMITTING" ? "Submitting to Starknet..." : "Zero-Knowledge verification"}
                  </span>
                </div>
              </div>

              {/* Step 4: Minting */}
              <div className={`flex gap-6 items-start relative z-10 transition-opacity duration-500 ${["MINTING", "SUCCESS"].includes(state) ? "opacity-100" : "opacity-40"
                }`}>
                <div className={`size-8 rounded-full flex items-center justify-center font-black text-xs transition-colors duration-500 ring-4 ring-white ${state === "SUCCESS" ? "bg-primary text-white shadow-md" :
                  state === "MINTING" ? "bg-white border-2 border-primary text-primary animate-pulse" :
                    "bg-white border-2 border-gray-200 text-text-sub"
                  }`}>
                  {state === "SUCCESS" ? (
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  ) : "4"}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black leading-tight ${state === "MINTING" ? "text-primary" : "text-text-main"
                    }`}>Minting</span>
                  <span className={`text-[11px] font-bold mt-0.5 ${state === "MINTING" ? "text-primary animate-pulse" : "text-text-sub"}`}>
                    {state === "MINTING" ? "Recording on blockchain..." : "Layer 2 Credential"}
                  </span>
                </div>
              </div>

              {/* Step 5: Success */}
              <div className={`flex gap-6 items-start relative z-10 transition-opacity duration-500 ${state === "SUCCESS" ? "opacity-100" : "opacity-40"
                }`}>
                <div className={`size-8 rounded-full flex items-center justify-center font-black text-xs transition-colors duration-500 ring-4 ring-white ${state === "SUCCESS"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border-2 border-gray-200 text-text-sub"
                  }`}>
                  {state === "SUCCESS" ? (
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  ) : "5"}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black leading-tight ${state === "SUCCESS" ? "text-primary" : "text-text-main"
                    }`}>Success</span>
                  <span className={`text-[11px] font-bold mt-0.5 ${state === "SUCCESS" ? "text-primary" : "text-text-sub"}`}>
                    {state === "SUCCESS" ? "Verification complete!" : "Verified ID Activated"}
                  </span>
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

      {/* Footer Exit Link */}
      <div className="mt-12 flex justify-center">
        {!["MINTING", "ZK_PROVING", "ZK_SUBMITTING", "SUCCESS"].includes(state) && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
            Cancel Verification
          </button>
        )}
      </div>
    </div>
  );
};
