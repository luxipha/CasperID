import React, { useState, useEffect } from 'react';

interface Claim {
    id: string;
    label: string;
    icon: string;
    valid: boolean;
    verified: boolean;
    verificationSource: string | null;
    value: string | null;
}

interface VerificationResult {
    valid: boolean;
    proof_id?: string;
    claims?: Claim[];
    issuer?: {
        id: string;
        wallet: string;
        human_id: string | null;
    };
    timestamp?: number;
    expires_at?: number;
    verified_at?: number;
    error?: string;
    expired?: boolean;
}

export const VerifyZKClaimsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<VerificationResult | null>(null);

    useEffect(() => {
        verifyProof();
    }, []);

    const verifyProof = async () => {
        try {
            // Get proof from URL query parameter
            const params = new URLSearchParams(window.location.search);
            const proof = params.get('proof');

            if (!proof) {
                setResult({ valid: false, error: 'No proof provided' });
                setLoading(false);
                return;
            }

            const isLocalhost = typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001' : '');

            const response = await fetch(`${apiUrl}/api/zk-claims/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proof })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Verification error:', error);
            setResult({ valid: false, error: 'Failed to verify proof' });
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 font-sans">
                <div className="text-center space-y-4">
                    <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg font-bold text-gray-400">Verifying ZK Proof...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (!result || result.error) {
        return (
            <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 text-center">
                        <div className="size-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-red-500 text-5xl">
                                {result?.expired ? 'schedule' : 'warning'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">
                            {result?.expired ? 'Proof Expired' : 'Invalid Proof'}
                        </h1>
                        <p className="text-gray-500 font-medium mb-6">
                            {result?.error || 'Unable to verify this proof'}
                        </p>
                    </div>

                    <div className="text-center mt-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm border border-gray-50">
                            <div className="size-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secured by CasperID</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const shortProofId = result.proof_id ? `ZK-${result.proof_id.slice(0, 4).toUpperCase()}-${result.proof_id.slice(-4).toUpperCase()}` : '';
    const allVerified = result.claims?.every(c => c.verified) || false;
    const someUnverified = result.claims?.some(c => !c.verified) || false;

    return (
        <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

                {/* Top Status Badge */}
                <div className="flex justify-center">
                    <div className={`px-6 py-2.5 rounded-full border flex items-center gap-2 shadow-sm ${
                        result.valid
                            ? 'bg-[#E8FBF4] border-[#D1F7E8] text-[#10B981]'
                            : 'bg-red-50 border-red-100 text-red-500'
                    }`}>
                        <span className="material-symbols-outlined text-lg font-bold">
                            {result.valid ? 'verified_user' : 'cancel'}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {result.valid ? 'ZK PROOF VALID' : 'INVALID PROOF'}
                        </span>
                    </div>
                </div>

                {/* ZK Claims Card */}
                <div className="relative aspect-[1.5/1] rounded-[40px] bg-gradient-to-br from-[#8652E2] to-[#6D36D6] p-8 flex flex-col justify-between text-white shadow-2xl overflow-hidden border border-white/20">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="size-16 rounded-[20px] bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-4xl text-white drop-shadow-md">shield_lock</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none mb-1">
                                PRIVACY PROOF
                            </p>
                            <p className="text-[10px] font-black opacity-90 uppercase tracking-widest">
                                {shortProofId}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3">
                            <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">
                                Zero-Knowledge Verified
                            </p>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-none mb-1">CasperID ZK Claims</h2>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">No Personal Data Revealed</p>
                    </div>
                </div>

                {/* Claims List */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2">Verified Claims</h3>

                    {result.claims?.map((claim) => (
                        <div
                            key={claim.id}
                            className="bg-white rounded-[24px] p-5 flex items-center gap-5 shadow-sm border border-white/50"
                        >
                            <div className={`size-14 rounded-[18px] flex items-center justify-center shrink-0 text-2xl ${
                                claim.verified
                                    ? 'bg-[#E8FBF4]'
                                    : 'bg-amber-50'
                            }`}>
                                {claim.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                    {claim.label}
                                </p>
                                <div className="flex items-center gap-2">
                                    {claim.valid ? (
                                        <p className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                                            {claim.verified ? (
                                                <>
                                                    <span className="text-green-600">Verified</span>
                                                    <span className="material-symbols-outlined text-green-500 text-xl">verified</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-amber-600">Unverified</span>
                                                    <span className="material-symbols-outlined text-amber-500 text-xl">info</span>
                                                </>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-lg font-black text-red-600 tracking-tight">
                                            Not Valid
                                        </p>
                                    )}
                                </div>
                                {claim.verificationSource && (
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                        Source: {claim.verificationSource}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Privacy Notice */}
                <div className="bg-[#F0E6FF] rounded-[24px] p-5 border border-[#E0D0F5]">
                    <div className="flex items-start gap-4">
                        <div className="size-10 rounded-full bg-white flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#8652E2] text-xl">visibility_off</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#8652E2] mb-1">Privacy Protected</p>
                            <p className="text-xs font-medium text-[#8652E2]/70">
                                No personal data was revealed in this proof. You only see whether each claim is true, not the actual values behind them.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Verification Legend */}
                {someUnverified && (
                    <div className="bg-amber-50 rounded-[24px] p-5 border border-amber-100">
                        <div className="flex items-start gap-4">
                            <div className="size-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-amber-600 text-xl">info</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-800 mb-1">About Unverified Claims</p>
                                <p className="text-xs font-medium text-amber-700/80">
                                    Unverified claims are self-declared by the user and have not been confirmed through official KYC verification.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timestamp Info */}
                <div className="bg-white rounded-[24px] p-5 flex items-center gap-5 shadow-sm border border-white/50">
                    <div className="size-14 rounded-[18px] bg-[#F1EEFF] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#7165FF] text-2xl">schedule</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proof Generated</p>
                        <p className="text-lg font-black text-gray-800 tracking-tight">
                            {result.timestamp
                                ? new Date(result.timestamp).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : '---'
                            }
                        </p>
                        {result.expires_at && (
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                Expires: {new Date(result.expires_at).toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-center pt-4">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-50 transition-all hover:shadow-md">
                        <div className="size-2 rounded-full bg-[#8652E2] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Zero-Knowledge by CasperID</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
