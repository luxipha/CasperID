import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Fingerprint, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { t } from '../utils/i18n';
import type { WalletGenerateResponse, DIDMintResponse } from '../types';

interface L1SetupProps {
    sessionToken: string;
    onSuccess: (wallet: string, didAddress: string) => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
    apiKey?: string;
    previewMode?: boolean;
    language?: string;
}

type SetupStep = 'wallet' | 'did' | 'complete' | 'error';

const L1Setup: React.FC<L1SetupProps> = ({
    sessionToken,
    onSuccess,
    onError,
    apiBaseUrl = 'https://apis.casperid.com',
    apiKey = '',
    previewMode = false,
    language = 'EN'
}) => {
    const [currentStep, setCurrentStep] = useState<SetupStep>('wallet');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [wallet, setWallet] = useState<string | null>(null);
    const [didAddress, setDidAddress] = useState<string | null>(null);

    // Prevent double execution in React StrictMode
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        runSetup();
    }, []);

    const runSetup = async () => {
        setError('');
        setCurrentStep('wallet');
        setProgress(0);

        if (previewMode) {
            // Mock the setup process
            await mockSetup();
            return;
        }

        try {
            // Step 1: Generate wallet (0-50%)
            setProgress(10);
            const walletResult = await generateWallet();
            setWallet(walletResult);
            setProgress(50);

            // Step 2: Mint DID (50-100%)
            setCurrentStep('did');
            setProgress(60);
            const didResult = await mintDID();
            setDidAddress(didResult);
            setProgress(100);

            // Complete
            setCurrentStep('complete');
            setTimeout(() => {
                onSuccess(walletResult, didResult);
            }, 1500);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Setup failed';
            setError(message);
            setCurrentStep('error');
            onError?.(message);
        }
    };

    const mockSetup = async () => {
        // Wallet generation
        setProgress(10);
        await sleep(800);
        setProgress(30);
        await sleep(500);
        setProgress(50);
        setWallet('0x1234...5678');

        // DID minting
        setCurrentStep('did');
        setProgress(60);
        await sleep(800);
        setProgress(80);
        await sleep(500);
        setProgress(100);
        setDidAddress('did:casper:abc123');

        // Complete
        setCurrentStep('complete');
        setTimeout(() => {
            onSuccess('0x1234...5678', 'did:casper:abc123');
        }, 1500);
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const generateWallet = async (): Promise<string> => {
        const response = await fetch(`${apiBaseUrl}/api/passkey/wallet/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                ...(apiKey ? { 'X-App-Id': apiKey } : {})
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to generate wallet');
        }

        const data: WalletGenerateResponse = await response.json();
        if (!data.success || !data.walletInfo?.walletAddress) {
            throw new Error(data.error || 'Wallet generation failed');
        }

        return data.walletInfo.walletAddress;
    };

    const mintDID = async (): Promise<string> => {
        const response = await fetch(`${apiBaseUrl}/api/passkey/did/mint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
                ...(apiKey ? { 'X-App-Id': apiKey } : {})
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to mint DID');
        }

        const data: DIDMintResponse = await response.json();
        if (!data.success || !data.did_address) {
            throw new Error(data.error || 'DID minting failed');
        }

        return data.did_address;
    };

    const getStepIcon = (step: SetupStep) => {
        switch (step) {
            case 'wallet':
                return <Wallet className="w-8 h-8" />;
            case 'did':
                return <Fingerprint className="w-8 h-8" />;
            case 'complete':
                return <CheckCircle2 className="w-8 h-8" />;
            case 'error':
                return <AlertCircle className="w-8 h-8" />;
        }
    };

    const getStepText = () => {
        switch (currentStep) {
            case 'wallet':
                return t('generating_wallet', language);
            case 'did':
                return t('minting_did', language);
            case 'complete':
                return t('l1_complete', language);
            case 'error':
                return t('l1_failed', language);
        }
    };

    const getStepColor = () => {
        switch (currentStep) {
            case 'complete':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-brand';
        }
    };

    const getBgColor = () => {
        switch (currentStep) {
            case 'complete':
                return 'bg-green-500/20 border-green-400';
            case 'error':
                return 'bg-red-500/10 border-red-400';
            default:
                return 'bg-brand/20 border-brand';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
        >
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand/80">
                        {t('verification_step', language)}
                    </span>
                    <span className="text-xs font-bold text-muted">L1 {t('secure_sdk', language)}</span>
                </div>
                <div className="w-full bg-brand/10 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-brand h-full rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
                {/* Animated icon */}
                <motion.div
                    animate={currentStep !== 'complete' && currentStep !== 'error' ? {
                        scale: [1, 1.05, 1],
                        opacity: [1, 0.8, 1]
                    } : {}}
                    transition={{
                        duration: 2,
                        repeat: currentStep !== 'complete' && currentStep !== 'error' ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    className={`w-24 h-24 rounded-full border-2 flex items-center justify-center ${getBgColor()}`}
                >
                    <span className={getStepColor()}>
                        {currentStep !== 'complete' && currentStep !== 'error' ? (
                            <Loader2 className="w-10 h-10 animate-spin" />
                        ) : (
                            getStepIcon(currentStep)
                        )}
                    </span>
                </motion.div>

                {/* Status text */}
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold tracking-tight text-main leading-tight">
                        {t('l1_setup_title', language)}
                    </h1>
                    <p className="text-muted text-base leading-relaxed font-medium">
                        {getStepText()}
                    </p>
                </div>

                {/* Progress details */}
                <div className="w-full max-w-xs space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${
                        currentStep === 'wallet' ? 'bg-brand/10' :
                        progress >= 50 ? 'bg-green-500/10' : 'bg-slate-100/50 dark:bg-white/5'
                    }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            progress >= 50 ? 'bg-green-500/20' :
                            currentStep === 'wallet' ? 'bg-brand/20' : 'bg-slate-200 dark:bg-white/10'
                        }`}>
                            {progress >= 50 ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : currentStep === 'wallet' ? (
                                <Loader2 className="w-4 h-4 text-brand animate-spin" />
                            ) : (
                                <Wallet className="w-4 h-4 text-muted" />
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <p className={`text-sm font-medium ${progress >= 50 ? 'text-green-400' : 'text-main'}`}>
                                {t('generating_wallet', language)}
                            </p>
                            {wallet && <p className="text-xs text-muted truncate">{wallet}</p>}
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 p-3 rounded-xl ${
                        currentStep === 'did' ? 'bg-brand/10' :
                        progress >= 100 ? 'bg-green-500/10' : 'bg-slate-100/50 dark:bg-white/5'
                    }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            progress >= 100 ? 'bg-green-500/20' :
                            currentStep === 'did' ? 'bg-brand/20' : 'bg-slate-200 dark:bg-white/10'
                        }`}>
                            {progress >= 100 ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : currentStep === 'did' ? (
                                <Loader2 className="w-4 h-4 text-brand animate-spin" />
                            ) : (
                                <Fingerprint className="w-4 h-4 text-muted" />
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <p className={`text-sm font-medium ${progress >= 100 ? 'text-green-400' : 'text-main'}`}>
                                {t('minting_did', language)}
                            </p>
                            {didAddress && <p className="text-xs text-muted truncate">{didAddress}</p>}
                        </div>
                    </div>
                </div>

                {/* Error state retry button */}
                {currentStep === 'error' && (
                    <div className="space-y-2">
                        <p className="text-red-500 text-sm">{error}</p>
                        <button
                            onClick={runSetup}
                            className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {t('try_again', language)}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-8">
                <p className="text-center text-xs text-muted">
                    {t('l1_setup_subtitle', language)}
                </p>
            </div>
        </motion.div>
    );
};

export default L1Setup;
