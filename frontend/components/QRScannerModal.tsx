import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;

        if (isOpen) {
            // Small delay to ensure the container is rendered
            const timeoutId = setTimeout(async () => {
                try {
                    html5QrCode = new Html5Qrcode("qr-reader");
                    const config = {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    };

                    await html5QrCode.start(
                        { facingMode: "environment" },
                        config,
                        (decodedText) => {
                            console.log(`Scan result: ${decodedText}`);
                            handleScanSuccess(decodedText);
                        },
                        undefined // silent on error
                    );
                } catch (err) {
                    console.error("Scanner initialization failed", err);
                    setError("Failed to initialize camera. Please ensure permissions are granted.");
                }
            }, 300);

            return () => {
                clearTimeout(timeoutId);
                if (html5QrCode && html5QrCode.isScanning) {
                    html5QrCode.stop()
                        .then(() => html5QrCode?.clear())
                        .catch(err => console.error("Failed to stop scanner", err));
                }
            };
        }
    }, [isOpen]);

    const handleScanSuccess = (text: string) => {
        try {
            // Check if it's a URL
            let url: URL;
            try {
                const url = new URL(text);

                // Handle both absolute URLs for this origin and specific CasperID domains
                const isLocalOrigin = url.origin === window.location.origin;
                const isCasperDomain = url.hostname.includes('casperid.com') ||
                    url.hostname.includes('ngrok-free.dev') ||
                    url.hostname.includes('netlify.app') ||
                    url.hostname.includes('onrender.com');

                if (isLocalOrigin || isCasperDomain) {
                    const path = url.pathname + url.search;
                    navigate(path);
                    onClose();
                    return;
                } else {
                    setError("External sites not supported: " + url.hostname);
                    setTimeout(() => setError(null), 5000);
                    return;
                }
            } catch {
                // Not a valid absolute URL, let's try other formats
            }

            // Check if it's a CasperID JSON package
            try {
                if (text.startsWith('{')) {
                    const data = JSON.parse(text);
                    if (data.type === 'casperid_zk_claims') {
                        const proofEncoded = encodeURIComponent(text);
                        navigate(`/verify-zk?proof=${proofEncoded}`);
                        onClose();
                        return;
                    }
                    if (data.type === 'casperid_share_data' || data.share_id) {
                        const dataEncoded = encodeURIComponent(text);
                        navigate(`/share-view?data=${dataEncoded}`);
                        onClose();
                        return;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse scanned JSON:', e);
            }

            // Handle relative paths or simple identifiers (legacy / fallback)
            // BUT: Don't treat JSON as an identifier/slug
            if (!text.includes(' ') && text.length > 0 && !text.startsWith('{')) {
                navigate(`/${text}`);
                onClose();
                return;
            }

            // If none of the above matched, it's an invalid format
            throw new Error("Invalid format");

        } catch (e) {
            setError("Invalid CasperID code");
            setTimeout(() => setError(null), 3000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0A0A0A]/90 backdrop-blur-2xl text-white animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-8">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full active:scale-90 transition-transform bg-white/5 border border-white/10"
                >
                    <span className="material-icons-outlined text-2xl">close</span>
                </button>

                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-xl">
                    <span className="material-icons-outlined text-xl text-primary-light">qr_code_2</span>
                    <span className="text-sm font-black tracking-tight uppercase">My QR code</span>
                </div>

                <div className="size-11"></div> {/* Spacer */}
            </div>

            {/* Instruction Panel */}
            <div className="flex flex-col items-center pt-8 px-6 text-center">
                <h2 className="text-xl font-bold mb-2 tracking-tight">Scan all QR codes</h2>
                <div className="h-0.5 w-12 bg-primary rounded-full opacity-50 mb-12"></div>
            </div>

            {/* Main Scanning Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                <div className="relative size-[280px]">
                    {/* HTML5 Qr Reader Viewport */}
                    <div id="qr-reader" className="w-full h-full overflow-hidden rounded-[48px] bg-black/40 border border-white/5"></div>

                    {/* Animated Scan Beam */}
                    <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan shadow-[0_0_20px_rgba(134,82,226,1)] z-10 blur-[1px]"></div>

                    {/* Premium Corner Guides */}
                    <div className="absolute -top-1 -left-1 size-16 border-t-[5px] border-l-[5px] border-white/90 rounded-tl-[48px]"></div>
                    <div className="absolute -top-1 -right-1 size-16 border-t-[5px] border-r-[5px] border-white/90 rounded-tr-[48px]"></div>
                    <div className="absolute -bottom-1 -left-1 size-16 border-b-[5px] border-l-[5px] border-white/90 rounded-bl-[48px]"></div>
                    <div className="absolute -bottom-1 -right-1 size-16 border-b-[5px] border-r-[5px] border-white/90 rounded-br-[48px]"></div>
                </div>

                {error && (
                    <div className="mt-10 px-6 py-3 bg-red-500/20 border border-red-500/30 backdrop-blur-xl text-red-100 text-[13px] font-bold rounded-2xl animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="pb-16 pt-8 flex justify-center bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(134,82,226,0.5)] border-4 border-white/20 active:scale-95 transition-transform cursor-pointer relative group">
                        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <span className="material-icons-outlined text-4xl text-white">fingerprint</span>
                    </div>
                    <span className="text-[11px] font-black tracking-[0.2em] text-white/50 uppercase">Identity</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
                #qr-reader video {
                    object-fit: cover !important;
                    border-radius: 48px !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #qr-reader { 
                    border: none !important; 
                }
                #qr-reader__scan_region { 
                    background: transparent !important; 
                }
                #qr-reader__dashboard_section_csr button { 
                    display: none !important; 
                }
                #qr-reader__status_span { 
                    display: none !important; 
                }
            `}} />
        </div>
    );
};
