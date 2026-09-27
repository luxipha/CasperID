import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { apiService } from '../services/api';
import { IdentityToolModal } from './ui/IdentityToolModal';
import { notifyError } from '../utils/notify';

interface ZKClaimsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Claim {
    id: string;
    label: string;
    description: string;
    icon: string;
    available: boolean;
    verified: boolean;
    verificationSource: string | null;
    value: string | null;
}

interface ProofPackage {
    proof_id: string;
    claims: Array<{
        id: string;
        label: string;
        icon: string;
        valid: boolean;
        verified: boolean;
        verificationSource: string | null;
    }>;
    proof: string;
    proof_hash: string;
    timestamp: number;
    verification_url?: string;
    expires_at: number;
    qr_data: string;
}

export const ZKClaimsModal: React.FC<ZKClaimsModalProps> = ({
    isOpen,
    onClose
}) => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [proofPackage, setProofPackage] = useState<ProofPackage | null>(null);
    const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAvailableClaims();
            setProofPackage(null);
            setGenerating(false);
            setSelectedClaims([]);
        }
    }, [isOpen]);

    const fetchAvailableClaims = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAvailableZKClaims();
            if (response.success && response.claims) {
                setClaims(response.claims);
            }
        } catch (error) {
            console.error('Failed to fetch claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (claimId: string) => {
        const claim = claims.find(c => c.id === claimId);
        if (!claim?.available) return;

        setSelectedClaims(prev =>
            prev.includes(claimId)
                ? prev.filter(c => c !== claimId)
                : [...prev, claimId]
        );
    };

    const handleGenerate = async () => {
        if (selectedClaims.length === 0) return;

        try {
            setGenerating(true);
            const response = await apiService.generateZKClaimProof(selectedClaims);
            if (response.success && response.proofPackage) {
                setProofPackage(response.proofPackage);
            }
        } catch (error) {
            console.error('Generation failed:', error);
            notifyError('Failed to generate private claim');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        if (proofPackage) {
            const url = getVerificationUrl();
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setProofPackage(null);
        setSelectedClaims([]);
        onClose();
    };

    const getVerificationUrl = () => {
        const baseUrl = window.location.origin;
        // Use simple URL with proof ID (stored server-side)
        return `${baseUrl}${proofPackage?.verification_url || `/verify-zk/${proofPackage?.proof_id}`}`;
    };

    // Render the success state with generated proof
    if (proofPackage) {
        const qrData = getVerificationUrl();

        return (
            <IdentityToolModal
                isOpen={isOpen}
                onClose={handleClose}
                title="Private Claim Generated!"
                subtitle="Selective Disclosure"
                icon="verified_user"
                iconBg="bg-green-50 text-green-500"
                description="Have others scan this QR code to verify only the claims you selected."
                actionLabel="Done"
                actionIcon="check"
                onAction={handleClose}
                footer={
                    <>
                        <span className="material-symbols-outlined text-text-sub text-[18px]">lock</span>
                        <p className="text-[11px] font-bold text-text-sub/70 leading-none">
                            Only selected claim results and displayed values are shared.
                        </p>
                    </>
                }
            >
                <div className="flex flex-col items-center">
                    {/* QR Code */}
                    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-lg">
                        <QRCodeSVG
                            value={qrData}
                            size={200}
                            level="M"
                            includeMargin={true}
                            bgColor="#ffffff"
                            fgColor="#1A1A2E"
                        />
                    </div>

                    <div className="mt-6 flex items-center gap-3 text-sm text-text-sub">
                        <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                        <span className="font-medium">Scan to verify claims</span>
                    </div>

                    {/* Claims included in proof */}
                    <div className="w-full mt-8 space-y-3">
                        <h4 className="text-[11px] font-black text-text-sub uppercase tracking-[0.15em]">Claims in this proof</h4>
                        {proofPackage.claims.map((claim) => (
                            <div
                                key={claim.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{claim.icon}</span>
                                    <span className="text-sm font-bold text-text-main">{claim.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {claim.verified ? (
                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Copy button */}
                    <div className="mt-6 w-full">
                        <button
                            onClick={handleCopy}
                            className="w-full h-12 border-2 border-gray-100 rounded-[16px] font-bold text-text-sub hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'content_copy'}</span>
                            {copied ? 'Copied!' : 'Copy Verification Link'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => { setProofPackage(null); }}
                    className="w-full h-14 mt-4 border-2 border-gray-100 rounded-[20px] font-bold text-text-main hover:bg-gray-50 transition-all"
                >
                    Generate New Proof
                </button>
            </IdentityToolModal>
        );
    }

    // Render the claim selection state
    return (
        <IdentityToolModal
            isOpen={isOpen}
            onClose={onClose}
            title="Private Claims"
            subtitle="Selective Disclosure"
            icon="shield_lock"
            iconBg="bg-[#F0E6FF] text-[#8652E2]"
            description="Select the claims to share. Verifiers see their signed results and any value explicitly shown for a selected claim."
            actionLabel="Generate Private Claim"
            actionIcon="verified_user"
            onAction={handleGenerate}
            isActionLoading={generating}
            isActionDisabled={selectedClaims.length === 0 || loading}
            tips={[
                { icon: 'visibility_off', label: 'Your source identity records stay private' },
                { icon: 'verified', label: 'Verified claims are backed by KYC' },
                { icon: 'warning', label: 'Unverified claims are self-declared' },
            ]}
            footer={
                <>
                    <span className="material-symbols-outlined text-text-sub text-[18px]">lock</span>
                    <p className="text-[11px] font-bold text-text-sub/70 leading-none">
                        Share only the verified claims you select.
                    </p>
                </>
            }
        >
            {loading ? (
                <div className="py-16 flex justify-center">
                    <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {claims.map((claim) => {
                        const isSelected = selectedClaims.includes(claim.id);
                        const isAvailable = claim.available;

                        return (
                            <div
                                key={claim.id}
                                onClick={() => handleToggle(claim.id)}
                                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                    !isAvailable
                                        ? 'bg-gray-50/30 border-gray-100 opacity-50 cursor-not-allowed'
                                        : isSelected
                                            ? 'bg-primary/5 border-primary/20'
                                            : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
                                        isSelected ? 'bg-primary/10' : 'bg-white border border-gray-100'
                                    }`}>
                                        {claim.icon}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-text-main leading-tight">{claim.label}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {claim.verified ? (
                                                <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                                    {claim.verificationSource}
                                                </span>
                                            ) : claim.available ? (
                                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">info</span>
                                                    Self-declared
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    Not available
                                                </span>
                                            )}
                                            {claim.value && (
                                                <span className="text-[10px] font-medium text-text-sub">
                                                    ({claim.value})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isAvailable && (
                                        <div className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                            isSelected
                                                ? 'bg-primary border-primary text-white'
                                                : 'border-gray-200 bg-white'
                                        }`}>
                                            {isSelected && (
                                                <span className="material-symbols-outlined text-[16px]">check</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {claims.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-text-sub font-medium">No claims available</p>
                            <p className="text-sm text-text-sub/60 mt-1">Complete verification to unlock claims</p>
                        </div>
                    )}
                </div>
            )}
        </IdentityToolModal>
    );
};
