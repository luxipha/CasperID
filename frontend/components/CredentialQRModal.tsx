import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Credential {
    id: string;
    type: string;
    title: string;
    issuer: string;
    status: string;
    date: string;
}

interface CredentialQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    credential: Credential | null;
    verificationUrl: string;
}

export const CredentialQRModal: React.FC<CredentialQRModalProps> = ({
    isOpen,
    onClose,
    credential,
    verificationUrl
}) => {
    if (!isOpen || !credential) return null;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(verificationUrl);
        alert('Verification link copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 size-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-600">close</span>
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                    </div>
                    <h2 className="text-xl font-black text-text-main">Share Credential</h2>
                    <p className="text-sm text-text-sub font-medium mt-1">
                        Scan or share this link to verify
                    </p>
                </div>

                {/* QR Code */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 flex items-center justify-center mb-6">
                    <QRCodeSVG
                        value={verificationUrl}
                        size={200}
                        level="H"
                        includeMargin={false}
                        fgColor="#1A1A2E"
                        bgColor="#FFFFFF"
                    />
                </div>

                {/* Credential Info */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-text-sub uppercase">Credential</span>
                        <span className="text-sm font-bold text-text-main">{credential.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-text-sub uppercase">Type</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                            {credential.type}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-text-sub uppercase">Status</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`size-2 rounded-full ${credential.status === 'Verified' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-bold text-text-main">{credential.status}</span>
                        </div>
                    </div>
                </div>

                {/* Verification URL */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-text-sub uppercase block mb-2">Verification Link</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={verificationUrl}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-main font-medium truncate"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">content_copy</span>
                            Copy
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-text-sub">
                    Anyone with this QR code or link can verify this credential
                </p>
            </div>
        </div>
    );
};
