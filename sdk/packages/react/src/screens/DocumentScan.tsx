import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, HelpCircle, Flashlight, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import type { DocumentType, DocumentUploadResponse, ExtractedDocumentData } from '../types';

import { t } from '../utils/i18n';

interface DocumentScanProps {
    requestId: string;
    documentType: DocumentType;
    onNext: (extractedData: ExtractedDocumentData, docUploadId: string, imageUrls: { frontImageUrl?: string; frontImageFileId?: string; backImageUrl?: string; backImageFileId?: string }) => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
    apiKey?: string;
    previewMode?: boolean;
    language?: string;
}

const getDocumentTypeLabels = (language: string) => ({
    passport: t('passport', language),
    drivers_license: t('drivers_license', language),
    national_id: t('national_id', language)
});

const DocumentScan: React.FC<DocumentScanProps> = ({
    requestId,
    documentType,
    onNext,
    onError,
    apiBaseUrl = 'https://apis.casperid.com',
    apiKey = '',
    previewMode = false,
    language = 'EN'
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
    const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [scanSide, setScanSide] = useState<'front' | 'back'>('front');
    const [frontImage, setFrontImage] = useState<Blob | null>(null);

    // Initialize camera
    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment', // Use back camera for documents
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setCameraReady(true);
                    };
                }
            } catch (err: any) {
                // Fallback to front camera
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
                    });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            setCameraReady(true);
                        };
                    }
                } catch (fallbackErr) {
                    setError(t('unable_access_camera', language));
                    onError?.('Camera access failed');
                }
            }
        };

        initCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (capturedImageUrl) {
                URL.revokeObjectURL(capturedImageUrl);
            }
        };
    }, [onError]);

    // Capture photo
    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                setCapturedImage(blob);
                setCapturedImageUrl(URL.createObjectURL(blob));
            }
        }, 'image/jpeg', 0.9);
    };

    // Retake photo
    const handleRetake = () => {
        if (capturedImageUrl) {
            URL.revokeObjectURL(capturedImageUrl);
        }
        setCapturedImage(null);
        setCapturedImageUrl(null);
        setError('');
    };

    // Confirm and proceed
    const handleConfirm = async () => {
        setIsUploading(true);

        if (previewMode) {
            setTimeout(() => {
                setIsUploading(false);
                onNext({
                    first_name: 'JOHN',
                    last_name: 'DOE',
                    date_of_birth: '01 JAN 1990',
                    nationality: ''
                }, 'mock-upload-id-789', {
                    frontImageUrl: 'mock-front-url',
                    frontImageFileId: 'mock-front-id',
                    backImageUrl: 'mock-back-url',
                    backImageFileId: 'mock-back-id'
                });
            }, 2000);
            return;
        }

        if (!capturedImage) {
            setIsUploading(false); // Ensure loading state is reset if no image
            return;
        }

        if (scanSide === 'front' && documentType !== 'passport') {
            // For non-passport documents, need back side too
            setFrontImage(capturedImage);
            setCapturedImage(null);
            setCapturedImageUrl(null);
            setScanSide('back');
            setIsUploading(false); // Reset loading state after setting side
            return;
        }

        // Upload document(s)
        setIsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('document_type', documentType);

            if (frontImage) {
                formData.append('front_image', frontImage, 'front.jpg');
                formData.append('back_image', capturedImage, 'back.jpg');
            } else {
                formData.append('front_image', capturedImage, 'document.jpg');
            }

            const response = await fetch(`${apiBaseUrl}/api/v2/verification/layer3/documents/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    'X-Request-Id': requestId,
                    ...(apiKey ? { 'X-App-Id': apiKey } : {})
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Document upload failed with status ${response.status}`);
            }

            const data: DocumentUploadResponse = await response.json();

            if (data.success && data.extracted_data) {
                // Stop camera
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                onNext(data.extracted_data, data.upload_id || '', {
                    frontImageUrl: data.front_image_url,
                    frontImageFileId: data.front_image_file_id,
                    backImageUrl: data.back_image_url,
                    backImageFileId: data.back_image_file_id
                });
            } else {
                setError(data.error || 'Failed to process document. Please try again.');
                setIsUploading(false);
            }
        } catch (err) {
            setError('Upload failed. Please try again.');
            setIsUploading(false);
            onError?.('Document upload failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative"
        >
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Simulated dark camera background */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-main opacity-10 flex items-center justify-center">
                    <div className="w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6DE8EC]/20 via-transparent to-transparent" />
                </div>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            </div>

            {/* Top label */}
            <div className="relative z-10 p-6 flex flex-col items-center">
                <div className="text-center px-4 py-2 bg-brand-10 backdrop-blur-xl rounded-full border border-brand-10">
                    <h3 className="text-main text-sm font-medium tracking-wide uppercase">
                        {t('scan_instruction', language)
                            .replace('{side}', t(scanSide, language))
                            .replace('{docType}', getDocumentTypeLabels(language)[documentType])}
                    </h3>
                </div>
            </div>

            {/* ID frame with video or captured image */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-6">
                <div className="w-full aspect-[1.58/1] relative">
                    {/* Video or captured image */}
                    {capturedImageUrl ? (
                        <img
                            src={capturedImageUrl}
                            alt="Captured document"
                            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                        />
                    )}

                    {/* Frame overlay */}
                    <div className="absolute inset-0 border border-[#6DE8EC] rounded-2xl shadow-[0_0_20px_rgba(109,232,236,0.3),inset_0_0_15px_rgba(109,232,236,0.2)]" />
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#6DE8EC] rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#6DE8EC] rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#6DE8EC] rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#6DE8EC] rounded-br-2xl" />

                    {/* Scanning line (only when video is active) */}
                    {!capturedImageUrl && cameraReady && (
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent opacity-50"
                        />
                    )}

                    {/* Loading overlay */}
                    {!cameraReady && !capturedImageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                            <Loader2 className="w-8 h-8 text-[#6DE8EC] animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="relative z-10 mx-6 mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Bottom controls */}
            <div className="relative z-10 p-8 glass-container backdrop-blur-2xl border-t border-brand-10 rounded-t-3xl">
                <p className="text-muted text-xs text-center mb-6 font-medium">
                    {capturedImageUrl
                        ? t('review_capture', language)
                        : t('align_document', language)}
                </p>

                <div className="flex items-center justify-between gap-4">
                    {capturedImageUrl ? (
                        <>
                            <button
                                onClick={handleRetake}
                                disabled={isUploading}
                                className="w-12 h-12 rounded-xl bg-brand-5 flex items-center justify-center text-muted disabled:opacity-50"
                            >
                                <RotateCcw className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isUploading}
                                className="flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-70"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>{t('processing', language)}</span>
                                    </>
                                ) : (
                                    <span>{scanSide === 'front' && documentType !== 'passport' ? t('next_back_side', language) : t('confirm', language)}</span>
                                )}
                            </button>
                            <div className="w-12 h-12" /> {/* Spacer for alignment */}
                        </>
                    ) : (
                        <>
                            <button className="w-12 h-12 rounded-xl bg-brand-5 flex items-center justify-center text-muted">
                                <Flashlight className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleCapture}
                                disabled={!cameraReady}
                                className="flex-1 bg-brand hover:bg-brand/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)] disabled:opacity-50"
                            >
                                <Camera className="w-6 h-6" />
                                <span>{t('capture', language)}</span>
                            </button>
                            <button className="w-12 h-12 rounded-xl bg-brand-5 flex items-center justify-center text-muted">
                                <HelpCircle className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>
                <div className="w-32 h-1.5 bg-brand-10 rounded-full mx-auto mt-8" />
            </div>
        </motion.div>
    );
};

export default DocumentScan;
