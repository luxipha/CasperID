import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { VerificationRequest } from '@/lib/api-client';

// Dynamically import LivenessCheck to prevent SSR issues with MediaPipe/navigator
const LivenessCheck = dynamic(() => import('@/components/liveness-check'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center p-8">
            <div className="text-sm text-gray-500">Loading camera...</div>
        </div>
    )
});

interface StepLivenessProps {
    data: Partial<VerificationRequest>;
    onUpdate: (data: Partial<VerificationRequest>) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepLiveness({ data, onUpdate, onNext, onBack }: StepLivenessProps) {
    const [livenessCompleted, setLivenessCompleted] = useState(false);
    const [showLivenessCheck, setShowLivenessCheck] = useState(false);

    const handleLivenessSuccess = (videoFrames: string[]) => {
        // Store liveness verification data
        onUpdate({
            ...data,
            metadata: {
                ...data.metadata,
                liveness_verified: true,
                liveness_frames: videoFrames,
                liveness_completed_at: Date.now()
            }
        });
        setLivenessCompleted(true);
        setShowLivenessCheck(false);
    };

    const handleStartLiveness = () => {
        setShowLivenessCheck(true);
    };

    const handleCancelLiveness = () => {
        setShowLivenessCheck(false);
    };

    if (showLivenessCheck) {
        return (
            <div className="w-full flex justify-center">
                <LivenessCheck 
                    onSuccess={handleLivenessSuccess}
                    onCancel={handleCancelLiveness}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">Liveness Verification</h3>
                <p className="text-sm text-gray-400">
                    Complete automated liveness verification to prove you're a real person.
                </p>
            </div>

            {livenessCompleted ? (
                <div className="text-center space-y-4 py-8">
                    <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-green-400 mb-2">Liveness Verified!</h4>
                        <p className="text-gray-300">Your identity has been successfully verified through automated liveness detection.</p>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-4 py-8">
                    <div className="w-20 h-20 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-white mb-2">Ready for Liveness Check</h4>
                        <p className="text-gray-300 mb-4">You'll be guided through automated movements to verify you're a real person:</p>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Blink detection</li>
                            <li>• Head movement verification</li>  
                            <li>• Expression changes</li>
                            <li>• Anti-spoofing protection</li>
                        </ul>
                    </div>
                    <Button
                        onClick={handleStartLiveness}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        Start Liveness Verification
                    </Button>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onBack} className="w-1/3 border-slate-600 text-white hover:bg-slate-700">
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!livenessCompleted}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    Next: Claim Domain
                </Button>
            </div>
        </div>
    );
}
