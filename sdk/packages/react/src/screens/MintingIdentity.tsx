import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Network, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MintingIdentityProps {
    requestId: string;
    onNext: (credentialHash?: string) => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
}

type MintingStatus = 'processing' | 'minting' | 'completed' | 'failed';

// Backend response format for verification status
interface VerificationStatusData {
    success: boolean;
    verification?: {
        requestId: string;
        status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
        verificationType: string;
        createdAt?: string;
        completedAt?: string;
        expiresAt?: string;
        progress?: {
            livenessCompleted?: boolean;
            documentCompleted?: boolean;
            livenessScore?: number;
        };
        results?: {
            verified: boolean;
            tier: string;
            proofHash: string;
            signature: string;
        };
        error?: string;
    };
    error?: string;
}

const statusMessages: Record<MintingStatus, { title: string; subtitle: string }> = {
    processing: {
        title: 'Processing Verification...',
        subtitle: 'Validating your documents and biometrics'
    },
    minting: {
        title: 'Minting your Identity...',
        subtitle: 'Securing your decentralized identity on the Casper Network'
    },
    completed: {
        title: 'Identity Minted!',
        subtitle: 'Your CasperID has been successfully created'
    },
    failed: {
        title: 'Verification Failed',
        subtitle: 'There was an issue with your verification'
    }
};

const MintingIdentity: React.FC<MintingIdentityProps> = ({
    requestId,
    onNext,
    onError,
    apiBaseUrl = 'https://apis.casperid.com'
}) => {
    const [status, setStatus] = useState<MintingStatus>('processing');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [credentialHash, setCredentialHash] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollCountRef = useRef(0);

    // Poll verification status
    useEffect(() => {
        const pollStatus = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/v2/verification/${requestId}/status`, {
                    method: 'GET',
                    credentials: 'include'
                });

                const data: VerificationStatusData = await response.json();

                if (data.success && data.verification) {
                    const verificationStatus = data.verification.status;
                    const progressData = data.verification.progress;

                    // Calculate progress percentage from progress object
                    let progressPercent = 0;
                    if (progressData) {
                        if (progressData.livenessCompleted) progressPercent += 50;
                        if (progressData.documentCompleted) progressPercent += 50;
                    }

                    setProgress(progressPercent || progress);

                    switch (verificationStatus) {
                        case 'pending':
                        case 'in_progress':
                            // Update status based on progress
                            if (progressPercent > 70 || (progressData?.documentCompleted)) {
                                setStatus('minting');
                            } else {
                                setStatus('processing');
                            }
                            break;
                        case 'completed':
                            setStatus('completed');
                            setProgress(100);
                            // Get credential hash from results.proofHash
                            if (data.verification.results?.proofHash) {
                                setCredentialHash(data.verification.results.proofHash);
                            }
                            // Stop polling and proceed
                            if (pollIntervalRef.current) {
                                clearInterval(pollIntervalRef.current);
                            }
                            // Auto-proceed after showing success
                            setTimeout(() => {
                                onNext(data.verification?.results?.proofHash);
                            }, 2000);
                            break;
                        case 'failed':
                        case 'cancelled':
                            setStatus('failed');
                            setError(data.verification.error || data.error || 'Verification failed. Please try again.');
                            if (pollIntervalRef.current) {
                                clearInterval(pollIntervalRef.current);
                            }
                            onError?.('Verification failed');
                            break;
                    }
                } else {
                    // Handle error response
                    pollCountRef.current++;

                    // After 60 polls (2 minutes), show error
                    if (pollCountRef.current > 60) {
                        setStatus('failed');
                        setError('Verification timed out. Please try again.');
                        if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                        }
                        onError?.('Verification timeout');
                    }
                }
            } catch (err) {
                console.error('Status poll error:', err);
                pollCountRef.current++;

                // After 60 polls (2 minutes), show error
                if (pollCountRef.current > 60) {
                    setStatus('failed');
                    setError('Connection lost. Please check your network and try again.');
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                    }
                    onError?.('Connection error');
                }
            }
        };

        // Initial poll
        pollStatus();

        // Poll every 2 seconds
        pollIntervalRef.current = setInterval(pollStatus, 2000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [requestId, apiBaseUrl, onNext, onError, progress]);

    // Simulate progress for better UX when waiting
    useEffect(() => {
        if (status === 'processing' || status === 'minting') {
            const timer = setInterval(() => {
                setProgress(prev => {
                    // Slowly increase progress to give feedback
                    const increment = status === 'minting' ? 2 : 1;
                    const max = status === 'minting' ? 95 : 70;
                    return Math.min(prev + increment, max);
                });
            }, 500);

            return () => clearInterval(timer);
        }
    }, [status]);

    const handleRetry = () => {
        // Reset and start polling again
        setStatus('processing');
        setProgress(0);
        setError('');
        pollCountRef.current = 0;

        // Restart polling
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }

        pollIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/v2/verification/${requestId}/status`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data: VerificationStatusData = await response.json();
                // Handle response same as above
                if (data.success && data.verification?.status === 'completed') {
                    setStatus('completed');
                    setProgress(100);
                    if (data.verification.results?.proofHash) {
                        setCredentialHash(data.verification.results.proofHash);
                    }
                    if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                    }
                    setTimeout(() => {
                        onNext(data.verification?.results?.proofHash);
                    }, 2000);
                }
            } catch (err) {
                // Continue polling
            }
        }, 2000);
    };

    const currentMessage = statusMessages[status];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        >
            {/* Rotating card animation */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[var(--casperid-primary,#8651e1)]/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-2 border-[#6DE8EC]/20 animate-[spin_6s_linear_infinite_reverse]" />

                <motion.div
                    animate={status !== 'failed' ? { rotateY: [0, 180, 360], y: [-10, 10, -10] } : {}}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className={`relative w-40 h-56 backdrop-blur-xl border rounded-2xl flex flex-col p-4 ${
                        status === 'completed'
                            ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)]'
                            : status === 'failed'
                            ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]'
                            : 'bg-[var(--casperid-primary,#8651e1)]/10 border-[var(--casperid-primary,#8651e1)]/30 shadow-[0_0_50px_-12px_rgba(114,43,238,0.5)]'
                    }`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${
                            status === 'completed'
                                ? 'bg-green-500/30'
                                : status === 'failed'
                                ? 'bg-red-500/30'
                                : 'bg-[var(--casperid-primary,#8651e1)]/30'
                        }`}>
                            {status === 'completed' ? (
                                <CheckCircle2 className="text-green-500 w-4 h-4" />
                            ) : status === 'failed' ? (
                                <AlertCircle className="text-red-500 w-4 h-4" />
                            ) : (
                                <Shield className="text-[var(--casperid-primary,#8651e1)] w-4 h-4" />
                            )}
                        </div>
                        <div className={`w-6 h-1 rounded-full ${
                            status === 'completed'
                                ? 'bg-green-500/40'
                                : status === 'failed'
                                ? 'bg-red-500/40'
                                : 'bg-[var(--casperid-primary,#8651e1)]/40'
                        }`} />
                    </div>
                    <div className="space-y-3 mb-auto">
                        <div className={`h-2 w-3/4 rounded-full ${
                            status === 'completed'
                                ? 'bg-green-500/20'
                                : status === 'failed'
                                ? 'bg-red-500/20'
                                : 'bg-[var(--casperid-primary,#8651e1)]/20'
                        }`} />
                        <div className={`h-2 w-1/2 rounded-full ${
                            status === 'completed'
                                ? 'bg-green-500/20'
                                : status === 'failed'
                                ? 'bg-red-500/20'
                                : 'bg-[var(--casperid-primary,#8651e1)]/20'
                        }`} />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <div className={`size-6 rounded-full overflow-hidden border border-white/10 ${
                            status === 'completed'
                                ? 'bg-gradient-to-tr from-green-500 to-[#6DE8EC]'
                                : status === 'failed'
                                ? 'bg-gradient-to-tr from-red-500 to-orange-500'
                                : 'bg-gradient-to-tr from-[var(--casperid-primary,#8651e1)] to-[#6DE8EC]'
                        }`} />
                        <div className="flex flex-col items-start">
                            <div className="h-1.5 w-12 bg-white/20 rounded-full mb-1" />
                            <div className="h-1 w-8 bg-white/10 rounded-full" />
                        </div>
                    </div>
                    {status !== 'failed' && status !== 'completed' && (
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--casperid-primary,#8651e1)]/10 to-transparent h-1/2 w-full"
                        />
                    )}
                </motion.div>
            </div>

            <div className="space-y-4">
                <h2 className={`text-2xl font-bold bg-clip-text ${
                    status === 'completed'
                        ? 'text-green-500'
                        : status === 'failed'
                        ? 'text-red-500'
                        : 'dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-400 bg-slate-900 dark:text-transparent text-slate-900'
                }`}>
                    {currentMessage.title}
                </h2>
                <p className="dark:text-slate-400 text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                    {currentMessage.subtitle}
                </p>
            </div>

            {/* Error with retry button */}
            {status === 'failed' && (
                <button
                    onClick={handleRetry}
                    className="mt-6 px-6 py-3 bg-[var(--casperid-primary,#8651e1)] text-white rounded-xl font-bold"
                >
                    Try Again
                </button>
            )}

            {/* Credential hash display */}
            {credentialHash && status === 'completed' && (
                <div className="mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5">
                    <p className="text-[10px] text-muted mb-1">Credential Hash</p>
                    <p className="text-xs font-mono text-main break-all">
                        {credentialHash.slice(0, 20)}...{credentialHash.slice(-20)}
                    </p>
                </div>
            )}

            {/* Transaction status (only show when not failed) */}
            {status !== 'failed' && (
                <div className="w-full mt-12 p-6 dark:bg-[var(--casperid-primary,#8651e1)]/5 bg-[var(--casperid-primary,#8651e1)]/5 border-t dark:border-white/5 border-black/5">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-[var(--casperid-primary,#8651e1)] uppercase tracking-widest">
                            Transaction Status
                        </span>
                        <span className={`text-xs font-bold ${
                            status === 'completed' ? 'text-green-500' : 'text-[#6DE8EC]'
                        }`}>
                            {progress}% Complete
                        </span>
                    </div>
                    <div className="w-full h-1.5 dark:bg-[var(--casperid-primary,#8651e1)]/10 bg-[var(--casperid-primary,#8651e1)]/10 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${
                                status === 'completed'
                                    ? 'bg-gradient-to-r from-green-500 to-[#6DE8EC]'
                                    : 'bg-gradient-to-r from-[var(--casperid-primary,#8651e1)] to-[#6DE8EC]'
                            } shadow-[0_0_10px_rgba(114,43,238,0.5)]`}
                        />
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 dark:bg-[var(--casperid-primary,#8651e1)]/10 bg-[var(--casperid-primary,#8651e1)]/10 rounded-xl border dark:border-[var(--casperid-primary,#8651e1)]/10 border-[var(--casperid-primary,#8651e1)]/5">
                        <Network className={`w-4 h-4 ${
                            status === 'completed' ? 'text-green-500' : 'text-[var(--casperid-primary,#8651e1)]'
                        }`} />
                        <p className="text-[10px] dark:text-slate-300 text-slate-600 font-medium">
                            {status === 'processing' && 'Validating documents...'}
                            {status === 'minting' && 'Broadcasting to Casper Mainnet Node...'}
                            {status === 'completed' && 'Transaction confirmed on Casper Network'}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MintingIdentity;
