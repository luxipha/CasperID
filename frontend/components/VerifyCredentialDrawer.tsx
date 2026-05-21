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

interface VerifyCredentialDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    credentialHash: string;
    identifier?: string; // e.g. "alice.cid" or "@alice"
}

export const VerifyCredentialDrawer: React.FC<VerifyCredentialDrawerProps> = ({
    isOpen,
    onClose,
    credentialHash,
    identifier,
}) => {
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [credential, setCredential] = useState<VerifiedCredential | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Fetch credential when drawer opens
    useEffect(() => {
        if (!isOpen || !credentialHash) return;

        setLoading(true);
        setError(null);
        setCredential(null);

        const verify = async () => {
            try {
                const isLocalhost =
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';
                const apiUrl =
                    import.meta.env.VITE_API_URL ||
                    (isLocalhost ? 'http://localhost:3001' : '');

                const res = await fetch(`${apiUrl}/api/verify/${credentialHash}`);
                const data = await res.json();

                if (data.success) {
                    setVerified(data.verified);
                    setCredential(data.credential);
                } else {
                    setError(data.error || 'Credential not found');
                }
            } catch {
                setError('Failed to verify credential');
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [isOpen, credentialHash]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const getTierStyles = (tier: string) => {
        switch (tier) {
            case 'layer_3': return { gradient: 'from-primary to-[#6D36D6]', icon: 'verified_user' };
            case 'layer_2': return { gradient: 'from-[#D4AF37] to-[#996515]', icon: 'fingerprint' };
            default:        return { gradient: 'from-blue-500 to-blue-700', icon: 'badge' };
        }
    };

    const styles   = credential ? getTierStyles(credential.tier) : getTierStyles('layer_1');
    const shortHash = credential
        ? `CSPR-${credential.credentialHash.slice(0, 3)}-${credential.credentialHash.slice(3, 5)}-${credential.credentialHash.slice(-2)}`.toUpperCase()
        : '';

    return (
        <div className={`fixed inset-0 z-[9000] flex justify-end ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>

            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`relative h-full w-full max-w-md bg-[#F4F7FA] flex flex-col shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[#7165FF]/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-[#7165FF]">verified_user</span>
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 leading-none">Verify Authenticity</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">Powered by CasperID</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
                        aria-label="Close verification panel"
                    >
                        <span className="material-symbols-outlined text-[20px] text-gray-500">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="size-12 border-4 border-[#7165FF] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold text-gray-400">Verifying credential…</p>
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="bg-white rounded-[24px] p-8 text-center shadow-sm border border-gray-100">
                            <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-1">Invalid Credential</h3>
                            <p className="text-sm text-gray-500 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Success State */}
                    {!loading && credential && (
                        <>
                            {/* Top Status Badge */}
                            <div className="flex justify-center pt-1">
                                <div className={`px-5 py-2 rounded-full border flex items-center gap-2 shadow-sm text-sm font-black ${verified ? 'bg-[#E8FBF4] border-[#D1F7E8] text-[#10B981]' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                    <span className="material-symbols-outlined text-lg">{verified ? 'check_circle' : 'cancel'}</span>
                                    <span className="text-[11px] uppercase tracking-widest">{verified ? 'VERIFIED' : 'REVOKED'}</span>
                                </div>
                            </div>

                            {/* Passport Card */}
                            <div className={`relative rounded-[32px] bg-gradient-to-br ${styles.gradient} p-7 flex flex-col justify-between text-white shadow-xl overflow-hidden border border-white/20`}>
                                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                                <div className="absolute inset-0 bg-white/5" />

                                <div className="relative z-10 flex justify-between items-start mb-6">
                                    <div className="size-14 rounded-[18px] bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                                        <span className="material-symbols-outlined text-3xl text-white">{styles.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-0.5">{credential.type.split(' ')[0]}</p>
                                        <p className="text-[10px] font-black opacity-90 uppercase tracking-widest font-mono">{shortHash}</p>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    {identifier && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-2">
                                            <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/80">
                                                Verified for <span className="text-white">@{identifier}</span>
                                            </p>
                                        </div>
                                    )}
                                    <h2 className="text-2xl font-black tracking-tight leading-none mb-1">CasperID Passport</h2>
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">Global Identity Standard</p>
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-3">
                                <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-white/50">
                                    <div className="size-12 rounded-[14px] bg-[#E8FBF4] flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#10B981] text-xl">shield_check</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Current Status</p>
                                        <p className="text-base font-black text-gray-800">{verified ? 'Active & Valid' : 'Invalid / Revoked'}</p>
                                    </div>
                                    {verified && <div className="size-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                </div>

                                <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-white/50">
                                    <div className="size-12 rounded-[14px] bg-[#F1EEFF] flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#7165FF] text-xl">calendar_month</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Issued Date</p>
                                        <p className="text-base font-black text-gray-800">
                                            {new Date(credential.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-white/50">
                                    <div className="size-12 rounded-[14px] bg-[#F4F7FA] flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-gray-400 text-xl">badge</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Credential ID</p>
                                        <p className="text-base font-black text-gray-800 font-mono">{shortHash}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Checklist */}
                            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-[16px] text-[#10B981]">checklist</span>
                                    Verification Checklist
                                </h3>
                                <div className="space-y-3.5">
                                    {[
                                        { label: 'Tier 1: Basic ID', sub: 'Email, phone, and device linked.', active: true },
                                        {
                                            label: 'Tier 2: Biometric Liveness',
                                            sub: '3D facial map challenge passed.',
                                            active: credential.tier === 'layer_2' || credential.tier === 'layer_3'
                                        },
                                        {
                                            label: 'Tier 3: Full KYC',
                                            sub: 'Government ID & sanctions verified.',
                                            active: credential.tier === 'layer_3'
                                        },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-start gap-3">
                                            <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 ${item.active ? 'bg-[#E8FBF4]' : 'bg-gray-100'}`}>
                                                <span className={`material-symbols-outlined text-[12px] font-bold ${item.active ? 'text-[#10B981]' : 'text-gray-400'}`}>
                                                    {item.active ? 'check' : 'lock'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                                                <p className="text-xs text-gray-500 font-medium">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Trail */}
                            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-[16px] text-[#7165FF]">history</span>
                                    Activity Trail
                                </h3>
                                <div className="space-y-5 relative pl-9 before:absolute before:left-[14px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    <div className="relative">
                                        <div className="absolute -left-[35px] size-7 rounded-full bg-white border-[3px] border-[#7165FF] flex items-center justify-center shadow-sm z-10">
                                            <div className="size-2 rounded-full bg-[#7165FF]" />
                                        </div>
                                        <p className="text-[9px] font-black text-[#7165FF] uppercase tracking-wider mb-0.5">Now</p>
                                        <p className="text-sm font-bold text-gray-900">Profile Authenticated</p>
                                        <p className="text-xs text-gray-500 font-medium">Integrity verified on Casper Network.</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[35px] size-7 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center z-10">
                                            <div className="size-1.5 rounded-full bg-gray-300" />
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">
                                            {new Date(credential.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">Identity Provisioned</p>
                                        <p className="text-xs text-gray-500 font-medium">On-chain DID registered and linked.</p>
                                    </div>
                                </div>
                            </div>

                            {/* On-Chain Proof */}
                            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-[16px] text-orange-500">link</span>
                                    On-Chain Proof
                                </h3>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Network</p>
                                            <p className="text-xs font-bold text-gray-900">Casper Mainnet</p>
                                        </div>
                                        <span className="material-symbols-outlined text-green-500 text-lg">public</span>
                                    </div>
                                    <a
                                        href="#"
                                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:border-[#7165FF]/30 transition-colors"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Credential Hash</p>
                                            <p className="text-xs font-mono font-bold text-gray-900 group-hover:text-[#7165FF] transition-colors">
                                                {shortHash || '---'}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-300 text-lg group-hover:text-[#7165FF] transition-colors">open_in_new</span>
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="shrink-0 px-5 py-4 bg-white border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2">
                        <div className="size-1.5 rounded-full bg-[#7165FF] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secured by CasperID</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
