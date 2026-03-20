
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { apiService } from '../services/api';
import { IdentityToolModal } from './ui/IdentityToolModal';

interface SelectiveDisclosureModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSelectedFields?: string[];
}

const fields = [
    { id: 'first_name', label: 'First Name', icon: 'person' },
    { id: 'last_name', label: 'Last Name', icon: 'person' },
    { id: 'age', label: 'Verified Age', icon: 'history_edu' },
    { id: 'email', label: 'Email Address', icon: 'mail' },
    { id: 'phone_number', label: 'Phone Number', icon: 'phone' },
    { id: 'city', label: 'City', icon: 'location_city' },
    { id: 'country', label: 'Country', icon: 'public' },
    { id: 'address', label: 'Home Address', icon: 'home' },
];

export const SelectiveDisclosureModal: React.FC<SelectiveDisclosureModalProps> = ({
    isOpen,
    onClose,
    initialSelectedFields
}) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [sharePackage, setSharePackage] = useState<any>(null);
    const [selectedFields, setSelectedFields] = useState<string[]>(initialSelectedFields || ['first_name', 'last_name']);
    const [copied, setCopied] = useState(false);
    const [showJson, setShowJson] = useState(false);

    useEffect(() => {
        if (isOpen && initialSelectedFields) {
            setSelectedFields(initialSelectedFields);
        }
    }, [isOpen, initialSelectedFields]);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            setSharePackage(null);
            setGenerating(false);
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUserProfile();
            if (response) {
                setProfile(response);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (fieldId: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(f => f !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const response = await apiService.shareKYCData(selectedFields);
            if (response.success) {
                setSharePackage(response.sharePackage);
            }
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Failed to generate share package');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        if (sharePackage) {
            navigator.clipboard.writeText(JSON.stringify(sharePackage, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setSharePackage(null);
        onClose();
    };

    // Render the success state with generated package
    if (sharePackage) {
        const qrData = JSON.stringify(sharePackage);

        return (
            <IdentityToolModal
                isOpen={isOpen}
                onClose={handleClose}
                title="Proof Generated!"
                subtitle="Selective Disclosure"
                icon="verified"
                iconBg="bg-green-50 text-green-500"
                description="Have others scan this QR code to verify your identity data."
                actionLabel="Done"
                actionIcon="check"
                onAction={handleClose}
                footer={
                    <>
                        <span className="material-symbols-outlined text-text-sub text-[18px]">lock</span>
                        <p className="text-[11px] font-bold text-text-sub/70 leading-none">
                            Cryptographically signed with your CasperID keys.
                        </p>
                    </>
                }
            >
                {!showJson ? (
                    // QR Code View (default)
                    <div className="flex flex-col items-center">
                        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-lg">
                            <QRCodeSVG
                                value={qrData}
                                size={220}
                                level="M"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#1A1A2E"
                            />
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-sm text-text-sub">
                            <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                            <span className="font-medium">Scan to verify identity</span>
                        </div>

                        <div className="mt-6 w-full flex gap-3">
                            <button
                                onClick={() => setShowJson(true)}
                                className="flex-1 h-12 border-2 border-gray-100 rounded-[16px] font-bold text-text-sub hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">code</span>
                                View JSON
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex-1 h-12 border-2 border-gray-100 rounded-[16px] font-bold text-text-sub hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'content_copy'}</span>
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // JSON View
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100 relative">
                            <pre className="text-[11px] font-mono font-medium text-text-main overflow-x-auto h-[180px] no-scrollbar">
                                {JSON.stringify(sharePackage, null, 2)}
                            </pre>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent pointer-events-none rounded-[24px]" />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowJson(false)}
                                className="flex-1 h-12 border-2 border-gray-100 rounded-[16px] font-bold text-text-sub hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">qr_code</span>
                                Show QR
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex-1 h-12 bg-primary text-white rounded-[16px] font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'content_copy'}</span>
                                {copied ? 'Copied!' : 'Copy JSON'}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => { setSharePackage(null); setShowJson(false); }}
                    className="w-full h-14 mt-4 border-2 border-gray-100 rounded-[20px] font-bold text-text-main hover:bg-gray-50 transition-all"
                >
                    Modify Selection
                </button>
            </IdentityToolModal>
        );
    }

    // Render the field selection state
    return (
        <IdentityToolModal
            isOpen={isOpen}
            onClose={onClose}
            title="Share KYC Data"
            subtitle="Selective Disclosure"
            icon="share"
            iconBg="bg-[#F5EEFF] text-[#8652E2]"
            description="Choose which verified attributes to include in your signed share package. Only selected fields will be disclosed."
            actionLabel="Generate Share Package"
            actionIcon="security"
            onAction={handleGenerate}
            isActionLoading={generating}
            isActionDisabled={selectedFields.length === 0 || loading}
            tips={[
                { icon: 'verified_user', label: 'Only verified data can be shared' },
                { icon: 'lock', label: 'Cryptographically signed by your keys' },
                { icon: 'visibility_off', label: 'Unselected fields stay private' },
            ]}
            footer={
                <>
                    <span className="material-symbols-outlined text-text-sub text-[18px]">lock</span>
                    <p className="text-[11px] font-bold text-text-sub/70 leading-none">
                        Signed with your CasperID self-custody keys. Only you can reveal this data.
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
                    {fields.map((field) => {
                        const hasValue = profile && (field.id === 'age' ? !!profile.date_of_birth : !!profile[field.id]);
                        const isSelected = selectedFields.includes(field.id);
                        return (
                            <div
                                key={field.id}
                                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`size-9 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-white text-text-sub border border-gray-100'
                                        }`}>
                                        <span className="material-symbols-outlined text-[20px]">{field.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-text-main leading-tight">{field.label}</p>
                                        <p className="text-[11px] text-text-sub font-medium mt-0.5 max-w-[180px] truncate">
                                            {(() => {
                                                if (!hasValue) return field.id === 'age' ? 'Layer 3 Required' : 'Not Provided';

                                                if (field.id === 'age') {
                                                    const dob = new Date(profile.date_of_birth);
                                                    const today = new Date();
                                                    let age = today.getFullYear() - dob.getFullYear();
                                                    const m = today.getMonth() - dob.getMonth();
                                                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                                        age--;
                                                    }
                                                    return `${age} years (Verified)`;
                                                }

                                                if (field.id === 'address') return 'Verified Address';

                                                return profile[field.id];
                                            })()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <label className={`relative inline-flex items-center ${!hasValue ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            disabled={!hasValue}
                                            checked={isSelected}
                                            onChange={() => handleToggle(field.id)}
                                        />
                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-disabled:opacity-40"></div>
                                    </label>
                                    {!hasValue && (
                                        <span className="text-[9px] font-bold text-amber-600 flex items-center gap-0.5 animate-pulse">
                                            <span className="material-symbols-outlined text-[12px]">warning</span>
                                            {field.id === 'age' ? 'Level 3 Req' : 'Missing'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </IdentityToolModal>
    );
};
