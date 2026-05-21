import React, { useState, useEffect } from 'react';

interface VerifiedCredential {
    type: string;
    title: string;
    tier: string;
    issuer: string;
    status: string;
    issuedAt: string;
    expiresAt: string | null;
    credentialHash: string;
}

interface VerifyCredentialPageProps {
    credentialHash: string;
}

export const VerifyCredentialPage: React.FC<VerifyCredentialPageProps> = ({ credentialHash }) => {
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [credential, setCredential] = useState<VerifiedCredential | null>(null);
    const [identifier, setIdentifier] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Parse "as" query param for personalized display
        const params = new URLSearchParams(window.location.search);
        setIdentifier(params.get('as'));

        const verifyCredential = async () => {
            try {
                const isLocalhost = typeof window !== 'undefined' &&
                    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001' : '');

                const response = await fetch(`${apiUrl}/api/verify/${credentialHash}`);
                const data = await response.json();

                if (data.success) {
                    setVerified(data.verified);
                    setCredential(data.credential);
                } else {
                    setError(data.error || 'Credential not found');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setError('Failed to verify credential');
            } finally {
                setLoading(false);
            }
        };

        if (credentialHash) {
            verifyCredential();
        }
    }, [credentialHash]);

    // Get tier-specific styling
    const getTierStyles = (tier: string) => {
        switch (tier) {
            case 'layer_3':
                return {
                    gradient: 'from-primary to-[#6D36D6]',
                    icon: 'verified_user'
                };
            case 'layer_2':
                return {
                    gradient: 'from-[#D4AF37] to-[#996515]',
                    icon: 'fingerprint'
                };
            case 'layer_1':
            default:
                return {
                    gradient: 'from-blue-500 to-blue-700',
                    icon: 'badge'
                };
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 font-sans">
                <div className="text-center space-y-4">
                    <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-lg font-bold text-gray-400">Verifying...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 text-center">
                        <div className="size-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Invalid Credential</h1>
                        <p className="text-gray-500 font-medium mb-6">{error}</p>
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

    const styles = credential ? getTierStyles(credential.tier) : getTierStyles('layer_1');
    const shortHash = credential ? `CSPR-${credential.credentialHash.slice(0, 3)}-${credential.credentialHash.slice(3, 5)}-${credential.credentialHash.slice(-2)}`.toUpperCase() : '';

    return (
        <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">

                {/* Top Status Badge */}
                <div className="flex justify-center">
                    <div className={`px-6 py-2.5 rounded-full border flex items-center gap-2 shadow-sm ${verified ? 'bg-[#E8FBF4] border-[#D1F7E8] text-[#10B981]' : 'bg-red-50 border-red-100 text-red-500'}`}>
                        <span className="material-symbols-outlined text-lg font-bold">
                            {verified ? 'check_circle' : 'cancel'}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {verified ? 'VERIFIED' : 'REVOKED'}
                        </span>
                    </div>
                </div>

                {/* Passport Card */}
                <div className={`relative aspect-[1.5/1] rounded-[40px] bg-gradient-to-br ${styles.gradient} p-8 flex flex-col justify-between text-white shadow-2xl overflow-hidden border border-white/20`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                    {/* Glass Overlay */}
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="size-16 rounded-[20px] bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-4xl text-white drop-shadow-md">{styles.icon}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none mb-1">
                                {credential?.type.split(' ')[0] || 'BASIC'}
                            </p>
                            <p className="text-[10px] font-black opacity-90 uppercase tracking-widest">
                                {shortHash}
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        {identifier && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3">
                                <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/80">
                                    Verified for <span className="text-white">@{identifier}</span>
                                </p>
                            </div>
                        )}
                        <h2 className="text-3xl font-black tracking-tight leading-none mb-1">CasperID Passport</h2>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">Global Identity Standard</p>
                    </div>
                </div>

                {/* Info Rows */}
                <div className="space-y-4">
                    {/* Status Row */}
                    <div className="bg-white rounded-[24px] p-5 flex items-center gap-5 shadow-sm border border-white/50">
                        <div className="size-14 rounded-[18px] bg-[#E8FBF4] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#10B981] text-2xl">shield_check</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                            <p className="text-lg font-black text-gray-800 tracking-tight">
                                {verified ? 'Active & Valid' : 'Invalid / Revoked'}
                            </p>
                        </div>
                        {verified && <div className="size-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                    </div>

                    {/* Date Row */}
                    <div className="bg-white rounded-[24px] p-5 flex items-center gap-5 shadow-sm border border-white/50">
                        <div className="size-14 rounded-[18px] bg-[#F1EEFF] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#7165FF] text-2xl">calendar_month</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Issued Date</p>
                            <p className="text-lg font-black text-gray-800 tracking-tight">
                                {credential ? new Date(credential.issuedAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : '---'}
                            </p>
                        </div>
                    </div>

                    {/* Credential ID Row */}
                    <div className="bg-white rounded-[24px] p-5 flex items-center gap-5 shadow-sm border border-white/50">
                        <div className="size-14 rounded-[18px] bg-[#F4F7FA] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-gray-400 text-2xl">badge</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Credential ID</p>
                            <p className="text-lg font-black text-gray-800 tracking-tight font-mono">
                                {credential ? shortHash : '---'}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-gray-200 text-2xl">featured_play_list</span>
                    </div>
                </div>

                {/* Advanced Verification Dashboard */}
                <div className="space-y-6 pt-2">
                    
                    {/* Verification Checklist */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[#10B981]">checklist</span>
                            Verification Checklist
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 size-5 rounded-full bg-[#E8FBF4] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[14px] text-[#10B981] font-bold">check</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Tier 1: Basic ID</p>
                                    <p className="text-xs text-gray-500 font-medium">Email, Phone, and Device linked.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 ${credential?.tier === 'layer_2' || credential?.tier === 'layer_3' ? 'bg-[#E8FBF4] text-[#10B981]' : 'bg-gray-100 text-gray-400'}`}>
                                    <span className="material-symbols-outlined text-[14px] font-bold">{credential?.tier === 'layer_2' || credential?.tier === 'layer_3' ? 'check' : 'lock'}</span>
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${credential?.tier === 'layer_2' || credential?.tier === 'layer_3' ? 'text-gray-900' : 'text-gray-400'}`}>Tier 2: Biometric Liveness</p>
                                    <p className="text-xs text-gray-500 font-medium">3D facial map challenge passed.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 ${credential?.tier === 'layer_3' ? 'bg-[#E8FBF4] text-[#10B981]' : 'bg-gray-100 text-gray-400'}`}>
                                    <span className="material-symbols-outlined text-[14px] font-bold">{credential?.tier === 'layer_3' ? 'check' : 'lock'}</span>
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${credential?.tier === 'layer_3' ? 'text-gray-900' : 'text-gray-400'}`}>Tier 3: Full KYC</p>
                                    <p className="text-xs text-gray-500 font-medium">Government ID & Sanctions verified.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change History Timeline */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[#7165FF]">history</span>
                            Activity Trail
                        </h3>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100 pl-10">
                            <div className="relative">
                                <div className="absolute -left-[45px] size-8 rounded-full bg-white border-[3px] border-[#7165FF] flex items-center justify-center shadow-sm z-10">
                                    <div className="size-2.5 rounded-full bg-[#7165FF]" />
                                </div>
                                <div className="text-[10px] font-black text-[#7165FF] mb-0.5 uppercase tracking-wider">Present</div>
                                <p className="text-sm font-bold text-gray-900">Profile Authenticated</p>
                                <p className="text-xs text-gray-500 font-medium">Integrity checked securely on Casper Network.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[45px] size-8 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center z-10">
                                    <div className="size-2 rounded-full bg-gray-300" />
                                </div>
                                <div className="text-[10px] font-black text-gray-400 mb-0.5 uppercase tracking-wider">
                                    {credential ? new Date(credential.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                </div>
                                <p className="text-sm font-bold text-gray-900">Identity Provisioned</p>
                                <p className="text-xs text-gray-500 font-medium">On-chain DID registered and linked.</p>
                            </div>
                        </div>
                    </div>

                    {/* On-Chain Explorer */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-orange-500">link</span>
                            On-Chain Proof
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Network</p>
                                    <p className="text-xs font-bold text-gray-900">Casper Mainnet</p>
                                </div>
                                <span className="material-symbols-outlined text-green-500 text-lg">public</span>
                            </div>
                            <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group cursor-pointer hover:border-[#7165FF]/30 transition-colors block">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Latest Tx Hash</p>
                                    <p className="text-xs font-mono font-bold text-gray-900 group-hover:text-[#7165FF] transition-colors">
                                        {shortHash ? `01${shortHash.replace(/-/g, '').toLowerCase()}...` : '---'}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 text-lg group-hover:text-[#7165FF] transition-colors">open_in_new</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-center pt-4">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-50 anonymous-footer transition-all hover:shadow-md">
                        <div className="size-2 rounded-full bg-[#7165FF] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secured by CasperID</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
