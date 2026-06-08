import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

type CnsStatus = 'loading' | 'polling' | 'success' | 'error';

export const CnsSuccess: React.FC = () => {
    const { refreshUser } = useAuth();
    const [searchParams] = useSearchParams();
    const reference = searchParams.get('reference');

    const [status, setStatus] = useState<CnsStatus>('loading');
    const [domainName, setDomainName] = useState<string>('');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // No reference param — just show a generic success page
    useEffect(() => {
        if (!reference) {
            setStatus('success');
            refreshUser();
        }
    }, [reference, refreshUser]);

    // Poll payment status when reference is present
    useEffect(() => {
        if (!reference) return;

        let mounted = true;
        let pollCount = 0;
        const MAX_POLLS = 60; // 3 minutes at 3s intervals

        const poll = async () => {
            if (!mounted) return;

            setStatus('polling');
            pollCount++;

            try {
                const data = await apiService.getPaymentStatus(reference);

                if (!mounted) return;

                if (data.status === 'pending' || data.status === 'confirming') {
                    if (pollCount >= MAX_POLLS) {
                        setStatus('error');
                        setErrorMessage('Payment is taking longer than expected. Check your email for confirmation or contact support.');
                    }
                    return; // Keep polling (interval continues)
                }

                if (data.status === 'completed' && data.minted) {
                    setDomainName(data.name || '');
                    setTxHash(data.txHash || null);
                    setStatus('success');
                    await refreshUser();
                    return; // Stop polling — success
                }

                if (data.status === 'completed' && !data.minted) {
                    // Payment completed but minting failed — let user know
                    setStatus('error');
                    setErrorMessage(data.error || 'Payment confirmed but domain registration failed. Please contact support.');
                    return;
                }

                if (data.status === 'failed' || data.status === 'expired') {
                    setStatus('error');
                    setErrorMessage('Payment was not completed. Please try registering your domain again.');
                    return;
                }

                if (data.status === 'not_found') {
                    setStatus('error');
                    setErrorMessage('Payment reference not found. Please try registering your domain again.');
                    return;
                }

                // Unknown status — keep polling
                if (pollCount >= MAX_POLLS) {
                    setStatus('error');
                    setErrorMessage('Unable to confirm payment status. Check your email for confirmation or contact support.');
                }
            } catch (err: any) {
                if (!mounted) return;
                console.error('[CnsSuccess] Poll error:', err);
                if (pollCount >= MAX_POLLS) {
                    setStatus('error');
                    setErrorMessage('Unable to reach the server. Check your email for confirmation or contact support.');
                }
            }
        };

        // Initial poll immediately
        poll();
        const interval = setInterval(poll, 3000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [reference, refreshUser]);

    // Redirect to dashboard after success
    useEffect(() => {
        if (status !== 'success') return;
        const timer = setTimeout(() => {
            window.location.href = '/dashboard';
        }, 4000);
        return () => clearTimeout(timer);
    }, [status]);

    // Polling view
    if (status === 'polling' || status === 'loading') {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
                <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-soft p-12 md:p-16 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary w-1/2 animate-[loading_2s_infinite_linear]"></div>
                    </div>
                    <div className="relative size-32 mb-10">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-[spin_8s_linear_infinite]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">account_balance_wallet</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-text-main mb-4 tracking-tight">Confirming Payment</h2>
                    <p className="text-text-sub text-base font-medium leading-relaxed max-w-sm mb-10">
                        Checking your payment status and registering your domain. This should only take a moment.
                    </p>
                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Checking Payment Status</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error view
    if (status === 'error') {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
                <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.15)] p-12 md:p-16 flex flex-col items-center text-center">
                    <div className="size-24 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-8">
                        <div className="size-14 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-[36px] font-bold">close</span>
                        </div>
                    </div>
                    <h2 className="text-[32px] font-black text-text-main mb-4 tracking-tight leading-none">Something Went Wrong</h2>
                    <p className="text-text-sub text-lg font-medium leading-relaxed max-w-sm mb-10">
                        {errorMessage}
                    </p>
                    <button
                        onClick={() => { window.location.href = '/dashboard?view=names'; }}
                        className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary/95 transition-all active:scale-[0.98]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Success view
    return (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
            <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.15)] p-12 md:p-16 flex flex-col items-center text-center">
                <div className="size-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-8 relative">
                    <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping"></div>
                    <div className="size-14 rounded-full bg-green-500 flex items-center justify-center text-white relative z-10 shadow-lg">
                        <span className="material-symbols-outlined text-[36px] font-bold">check</span>
                    </div>
                </div>
                <h2 className="text-[32px] font-black text-text-main mb-4 tracking-tight leading-none">Domain Registered!</h2>
                <p className="text-text-sub text-lg font-medium leading-relaxed max-w-sm mb-10">
                    {reference ? (
                        <>Your payment was successful and your new <span className="text-primary font-black">.CID</span> is officially yours and linked to your primary identity.</>
                    ) : (
                        <>Your new <span className="text-primary font-black">.CID</span> is officially yours and linked to your primary identity.</>
                    )}
                </p>

                {domainName && (
                    <div className="w-full bg-[#F8F9FB] rounded-[32px] p-8 mb-10 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Domain</span>
                            <span className="text-lg font-black text-primary">{domainName}</span>
                        </div>
                        <div className="h-px bg-gray-200/50"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Registry TX</span>
                            <span className="text-xs font-mono font-medium text-text-sub">
                                {txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : 'Confirmed'}
                            </span>
                        </div>
                    </div>
                )}

                <p className="text-sm font-medium text-text-sub mb-6">Redirecting to dashboard...</p>

                <button
                    onClick={() => { window.location.href = '/dashboard'; }}
                    className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary/95 transition-all active:scale-[0.98]"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};
