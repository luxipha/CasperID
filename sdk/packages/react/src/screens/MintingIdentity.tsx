import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Network, AlertCircle, CheckCircle2, Wallet, Fingerprint } from 'lucide-react';
import { t } from '../utils/i18n';

type VerificationTier = 'layer_1' | 'layer_2' | 'layer_3';

interface MintingIdentityProps {
    tier: VerificationTier;
    sessionToken?: string;
    requestId?: string; // Only needed for L2/L3 submission
    onNext: (result?: { wallet?: string; didAddress?: string; credentialHash?: string }) => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
    apiKey?: string;
    previewMode?: boolean;
    language?: string;
}

type MintingStatus = 'processing' | 'minting' | 'completed' | 'failed';

// Tier-specific status messages
const getStatusMessages = (tier: VerificationTier, language: string) => {
    if (tier === 'layer_1') {
        return {
            processing: {
                title: t('generating_wallet', language),
                subtitle: t('wallet_subtitle', language)
            },
            minting: {
                title: t('minting_did', language),
                subtitle: t('did_subtitle', language)
            },
            completed: {
                title: t('identity_created', language),
                subtitle: t('identity_created_subtitle', language)
            },
            failed: {
                title: t('setup_failed', language),
                subtitle: t('setup_failed_subtitle', language)
            }
        };
    }

    // L2 messages (synchronous - liveness already completed)
    if (tier === 'layer_2') {
        return {
            processing: {
                title: t('processing_liveness', language),
                subtitle: t('processing_subtitle', language)
            },
            minting: {
                title: t('minting_identity', language),
                subtitle: t('minting_subtitle', language)
            },
            completed: {
                title: t('identity_verified', language),
                subtitle: t('identity_verified_subtitle', language)
            },
            failed: {
                title: t('verification_failed', language),
                subtitle: t('verification_failed_subtitle', language)
            }
        };
    }

    // L3 messages (asynchronous - requires admin review)
    return {
        processing: {
            title: t('processing_documents', language),
            subtitle: t('processing_subtitle', language)
        },
        minting: {
            title: t('submitting_for_review', language),
            subtitle: t('submitting_review_subtitle', language)
        },
        completed: {
            title: t('verification_submitted', language),
            subtitle: t('verification_submitted_subtitle', language)
        },
        failed: {
            title: t('verification_failed', language),
            subtitle: t('verification_failed_subtitle', language)
        }
    };
};

const MintingIdentity: React.FC<MintingIdentityProps> = ({
    tier,
    sessionToken,
    requestId,
    onNext,
    onError,
    apiBaseUrl = 'https://apis.casperid.com',
    apiKey = '',
    previewMode = false,
    language = 'EN'
}) => {
    const [status, setStatus] = useState<MintingStatus>('processing');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [wallet, setWallet] = useState<string | null>(null);
    const [didAddress, setDidAddress] = useState<string | null>(null);
    const [credentialHash, setCredentialHash] = useState<string | null>(null);
    const [humanId, setHumanId] = useState<string | null>(null);

    // Prevent double execution in React StrictMode
    const hasStartedRef = useRef(false);

    const statusMessages = getStatusMessages(tier, language);
    const currentMessage = statusMessages[status];

    // Main setup effect
    useEffect(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        if (previewMode) {
            runPreviewMode();
        } else {
            runSetup();
        }
    }, []);

    // Preview mode simulation
    const runPreviewMode = async () => {
        setStatus('processing');
        setProgress(20);
        await sleep(1000);
        setProgress(50);
        await sleep(1000);
        setStatus('minting');
        setProgress(70);
        await sleep(1000);
        setProgress(100);
        setStatus('completed');

        if (tier === 'layer_1') {
            setWallet('account-hash-abc123...');
            setHumanId('casper-user-1234');
            setDidAddress('did:casper:abc123...');
        } else {
            setCredentialHash('mock-credential-hash-xyz');
        }

        await sleep(1500);
        onNext({
            wallet: 'account-hash-abc123...',
            didAddress: 'did:casper:abc123...',
            credentialHash: 'mock-credential-hash-xyz'
        });
    };

    // Real setup based on tier
    const runSetup = async () => {
        try {
            if (tier === 'layer_1') {
                await runL1Setup();
            } else {
                await runL2L3Setup();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Setup failed';
            setError(message);
            setStatus('failed');
            onError?.(message);
        }
    };

    // L1 Setup: Wallet + DID creation (synchronous)
    const runL1Setup = async () => {
        // Step 1: Generate wallet
        setStatus('processing');
        setProgress(10);

        const walletResponse = await fetch(`${apiBaseUrl}/api/passkey/wallet/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                ...(apiKey ? { 'X-App-Id': apiKey } : {})
            },
            credentials: 'include'
        });

        if (!walletResponse.ok) {
            const errorData = await walletResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to generate wallet');
        }

        const walletData = await walletResponse.json();
        if (!walletData.success || !walletData.walletInfo?.walletAddress) {
            throw new Error(walletData.error || 'Wallet generation failed');
        }

        setWallet(walletData.walletInfo.walletAddress);
        if (walletData.walletInfo.humanId) {
            setHumanId(walletData.walletInfo.humanId);
        }
        setProgress(50);

        // Step 2: Mint DID
        setStatus('minting');
        setProgress(60);

        const didResponse = await fetch(`${apiBaseUrl}/api/passkey/did/mint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                ...(apiKey ? { 'X-App-Id': apiKey } : {})
            },
            credentials: 'include'
        });

        if (!didResponse.ok) {
            const errorData = await didResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to mint DID');
        }

        const didData = await didResponse.json();
        if (!didData.success) {
            throw new Error(didData.error || 'DID minting failed');
        }

        setDidAddress(didData.did_address);
        setCredentialHash(didData.transaction_hash);
        setProgress(100);
        setStatus('completed');

        // Auto-proceed after showing success
        await sleep(1500);
        onNext({
            wallet: walletData.walletInfo.walletAddress,
            didAddress: didData.did_address,
            credentialHash: didData.transaction_hash
        });
    };

    // L2 Setup: Poll verification status (liveness already submitted via FaceScan)
    const runL2Setup = async () => {
        setStatus('processing');
        setProgress(20);

        if (!requestId) {
            throw new Error('No verification request ID provided');
        }

        // Poll for L2 completion (should be quick since liveness was already processed)
        const maxAttempts = 10;
        const pollInterval = 1500;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await fetch(`${apiBaseUrl}/api/v2/verification/${requestId}/status`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(apiKey ? { 'X-App-Id': apiKey } : {})
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to check verification status');
                }

                const data = await response.json();
                const verificationStatus = data.verification?.status;

                // Update progress based on attempt
                setProgress(Math.min(20 + (attempt * 8), 80));

                if (verificationStatus === 'completed') {
                    setStatus('minting');
                    setProgress(90);
                    await sleep(500);
                    setProgress(100);
                    setStatus('completed');

                    // Extract credential info if available
                    const proofHash = data.verification?.results?.proofHash;

                    await sleep(1500);
                    onNext({ credentialHash: proofHash || requestId });
                    return;
                }

                if (verificationStatus === 'failed') {
                    throw new Error(data.verification?.error || 'Verification failed');
                }

                // Still pending/in_progress, wait and retry
                await sleep(pollInterval);

            } catch (err) {
                // On last attempt, throw the error
                if (attempt === maxAttempts - 1) {
                    throw err;
                }
                await sleep(pollInterval);
            }
        }

        // If we exhausted attempts, the liveness might still be processing
        // Proceed anyway since liveness was already submitted
        setStatus('minting');
        setProgress(90);
        await sleep(500);
        setProgress(100);
        setStatus('completed');
        await sleep(1500);
        onNext({ credentialHash: requestId });
    };

    // L3 Setup: Show submission confirmation (requires admin review)
    const runL3Setup = async () => {
        setStatus('processing');
        setProgress(30);

        // L3 documents were already submitted via ReviewData
        // This screen just confirms the submission
        await sleep(800);
        setProgress(60);

        setStatus('minting'); // Shows "Submitting for Review" message
        setProgress(80);

        await sleep(800);
        setProgress(100);
        setStatus('completed'); // Shows "Verification Submitted"

        // Auto-proceed after showing success
        // User proceeds with L2 access, L3 will be approved by admin later
        await sleep(2000);
        onNext({ credentialHash: requestId });
    };

    // L2/L3 Setup: Route to appropriate handler
    const runL2L3Setup = async () => {
        if (tier === 'layer_2') {
            await runL2Setup();
        } else {
            await runL3Setup();
        }
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleRetry = () => {
        setStatus('processing');
        setProgress(0);
        setError('');
        hasStartedRef.current = false;

        if (previewMode) {
            runPreviewMode();
        } else {
            runSetup();
        }
    };

    // Get tier-specific icon
    const getTierIcon = () => {
        if (tier === 'layer_1') {
            return status === 'minting' ? <Fingerprint className="text-brand w-4 h-4" /> : <Wallet className="text-brand w-4 h-4" />;
        }
        return <Shield className="text-brand w-4 h-4" />;
    };

    // Get status label for transaction status
    const getStatusLabel = () => {
        if (tier === 'layer_1') {
            if (status === 'processing') return t('creating_wallet', language);
            if (status === 'minting') return t('minting_did_chain', language);
            if (status === 'completed') return t('identity_live', language);
        } else {
            if (status === 'processing') return t('validating_docs', language);
            if (status === 'minting') return t('submitting_verification', language);
            if (status === 'completed') return t('verification_queued', language);
        }
        return '';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        >
            {/* Rotating card animation */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-brand-20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-2 border-[#6DE8EC]/20 animate-[spin_6s_linear_infinite_reverse]" />

                <motion.div
                    animate={status !== 'failed' ? { rotateY: [0, 180, 360], y: [-10, 10, -10] } : {}}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className={`relative w-40 h-56 backdrop-blur-xl border rounded-2xl flex flex-col p-4 ${status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)]'
                        : status === 'failed'
                            ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]'
                            : 'bg-brand/10 border-brand-30 shadow-[0_0_50px_-12px_rgba(114,43,238,0.5)]'
                        }`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${status === 'completed'
                            ? 'bg-green-500/30'
                            : status === 'failed'
                                ? 'bg-red-500/30'
                                : 'bg-brand/30'
                            }`}>
                            {status === 'completed' ? (
                                <CheckCircle2 className="text-green-500 w-4 h-4" />
                            ) : status === 'failed' ? (
                                <AlertCircle className="text-red-500 w-4 h-4" />
                            ) : (
                                getTierIcon()
                            )}
                        </div>
                        <div className={`w-6 h-1 rounded-full ${status === 'completed'
                            ? 'bg-green-500/40'
                            : status === 'failed'
                                ? 'bg-red-500/40'
                                : 'bg-brand/40'
                            }`} />
                    </div>
                    <div className="space-y-3 mb-auto">
                        <div className={`h-2 w-3/4 rounded-full ${status === 'completed'
                            ? 'bg-green-500/20'
                            : status === 'failed'
                                ? 'bg-red-500/20'
                                : 'bg-brand/20'
                            }`} />
                        <div className={`h-2 w-1/2 rounded-full ${status === 'completed'
                            ? 'bg-green-500/20'
                            : status === 'failed'
                                ? 'bg-red-500/20'
                                : 'bg-brand/20'
                            }`} />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <div className={`size-6 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 ${status === 'completed'
                            ? 'bg-gradient-to-tr from-green-500 to-[#6DE8EC]'
                            : status === 'failed'
                                ? 'bg-gradient-to-tr from-red-500 to-orange-500'
                                : 'bg-gradient-to-tr from-brand to-[#6DE8EC]'
                            }`} />
                        <div className="flex flex-col items-start max-w-[80px]">
                            {humanId ? (
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] font-bold text-slate-800 dark:text-white/90 truncate w-full text-left"
                                >
                                    {humanId}
                                </motion.span>
                            ) : (
                                <div className="h-1.5 w-12 bg-white/20 rounded-full mb-1" />
                            )}
                            <div className="h-1 w-8 bg-slate-200 dark:bg-white/10 rounded-full" />
                        </div>
                    </div>
                    {status !== 'failed' && status !== 'completed' && (
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-10 to-transparent h-1/2 w-full"
                        />
                    )}
                </motion.div>
            </div>

            <div className="space-y-4">
                <h2 className={`text-2xl font-bold bg-clip-text ${status === 'completed'
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
                <div className="mt-6 space-y-3">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-brand text-white rounded-2xl font-bold"
                    >
                        {t('try_again', language)}
                    </button>
                </div>
            )}

            {/* Wallet/DID display for L1 */}
            {tier === 'layer_1' && wallet && status === 'completed' && (
                <div className="mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5">
                    <p className="text-[10px] text-muted mb-1">{t('your_wallet', language)}</p>
                    <p className="text-xs font-mono text-main break-all">
                        {wallet.slice(0, 20)}...{wallet.slice(-10)}
                    </p>
                </div>
            )}

            {/* Credential hash display for L2/L3 */}
            {tier !== 'layer_1' && credentialHash && status === 'completed' && (
                <div className="mt-6 p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/10 border-black/5">
                    <p className="text-[10px] text-muted mb-1">{t('verification_id', language)}</p>
                    <p className="text-xs font-mono text-main break-all">
                        {credentialHash.slice(0, 20)}...
                    </p>
                </div>
            )}

            {/* Transaction status (only show when not failed) */}
            {status !== 'failed' && (
                <div className="w-full mt-12 p-6 dark:bg-brand/5 bg-brand/5 border-t dark:border-white/5 border-black/5">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-medium text-brand uppercase tracking-widest">
                            {tier === 'layer_1' ? t('setup_status', language) : t('transaction_status', language)}
                        </span>
                        <span className={`text-xs font-bold ${status === 'completed' ? 'text-green-500' : 'text-[#6DE8EC]'
                            }`}>
                            {t('complete_percent', language).replace('{percent}', progress.toString())}
                        </span>
                    </div>
                    <div className="w-full h-1.5 dark:bg-brand/10 bg-brand/10 rounded-full overflow-hidden mb-4">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${status === 'completed'
                                ? 'bg-gradient-to-r from-green-500 to-[#6DE8EC]'
                                : 'bg-gradient-to-r from-brand to-[#6DE8EC]'
                                } shadow-[0_0_10px_rgba(114,43,238,0.5)]`}
                        />
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 dark:bg-brand/10 bg-brand/10 rounded-xl border dark:border-brand-10 border-brand-5">
                        <Network className={`w-4 h-4 ${status === 'completed' ? 'text-green-500' : 'text-brand'
                            }`} />
                        <p className="text-[10px] dark:text-slate-300 text-slate-600 font-medium">
                            {getStatusLabel()}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MintingIdentity;
