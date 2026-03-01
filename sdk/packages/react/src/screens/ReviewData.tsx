import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Calendar, Globe, CheckCircle2, Sparkles, AlertCircle, Users } from 'lucide-react';
import type { ExtractedDocumentData, DocumentType, Layer3SubmitResponse } from '../types';

interface ReviewDataProps {
    requestId: string;
    documentType: DocumentType;
    extractedData: ExtractedDocumentData;
    uploadId: string;
    onNext: (confirmedData: ExtractedDocumentData) => void;
    onRetake?: () => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
}

const documentTypeLabels: Record<DocumentType, string> = {
    passport: 'Passport',
    drivers_license: 'Driver License',
    national_id: 'ID Card'
};

const ReviewData: React.FC<ReviewDataProps> = ({
    requestId,
    documentType,
    extractedData,
    uploadId,
    onNext,
    onRetake,
    onError,
    apiBaseUrl = 'https://apis.casperid.com'
}) => {
    // Editable fields state - initialize with extracted data
    const [formData, setFormData] = useState({
        firstName: extractedData.first_name || '',
        lastName: extractedData.last_name || '',
        documentNumber: extractedData.document_number || '',
        dateOfBirth: extractedData.date_of_birth || '',
        nationality: extractedData.nationality || '',
        gender: extractedData.gender || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleConfirm = async () => {
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.documentNumber) {
            setError('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Submit confirmed data to the backend using /layer3/submit endpoint
            const response = await fetch(`${apiBaseUrl}/api/v2/verification/layer3/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    upload_id: uploadId,
                    liveness_verified: true,
                    document_data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        document_number: formData.documentNumber,
                        date_of_birth: formData.dateOfBirth,
                        nationality: formData.nationality,
                        gender: formData.gender,
                        document_type: documentType
                    }
                })
            });

            const data: Layer3SubmitResponse = await response.json();

            if (data.success) {
                // Pass confirmed data to parent
                onNext({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    document_number: formData.documentNumber,
                    date_of_birth: formData.dateOfBirth,
                    nationality: formData.nationality,
                    gender: formData.gender,
                    document_type: documentType
                });
            } else {
                setError(data.error || 'Failed to submit data. Please try again.');
                setIsSubmitting(false);
            }
        } catch (err) {
            setError('Failed to submit data. Please try again.');
            setIsSubmitting(false);
            onError?.('Data submission failed');
        }
    };

    const confidence = extractedData.confidence || 0;
    const confidencePercent = Math.round(confidence * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-y-auto px-6 pb-6"
        >
            {/* Progress bar */}
            <div className="flex gap-1 mb-6">
                {[1, 2, 3, 0].map((fill, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${fill ? 'bg-[var(--casperid-primary,#8651e1)]' : 'bg-[var(--casperid-primary,#8651e1)]/20'}`}
                    />
                ))}
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-main mb-2">Review Data</h1>
                <p className="text-muted text-sm leading-relaxed">
                    Verify your extracted identity information. This data will be used to mint your CasperID.
                </p>
            </div>

            {/* Confidence indicator */}
            {confidence > 0 && (
                <div className="mb-6 p-3 rounded-xl dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted">OCR Confidence</span>
                        <span className={`text-xs font-bold ${confidencePercent >= 80 ? 'text-green-500' : confidencePercent >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {confidencePercent}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 dark:bg-white/10 bg-black/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${confidencePercent >= 80 ? 'bg-green-500' : confidencePercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${confidencePercent}%` }}
                        />
                    </div>
                    {confidencePercent < 80 && (
                        <p className="text-[10px] text-yellow-500 mt-2">
                            Please verify the extracted data carefully.
                        </p>
                    )}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-5">
                {/* First Name */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--casperid-primary,#8651e1)]/80 ml-1">
                        First Name *
                    </label>
                    <div className="dark:bg-white/5 bg-black/5 rounded-2xl flex items-center px-4 py-3 border dark:border-white/10 border-black/5 focus-within:ring-2 focus-within:ring-[var(--casperid-primary,#8651e1)]/40 transition-all">
                        <User className="text-[var(--casperid-primary,#8651e1)]/60 mr-3 w-5 h-5" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-medium focus:outline-none"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Enter first name"
                        />
                    </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--casperid-primary,#8651e1)]/80 ml-1">
                        Last Name *
                    </label>
                    <div className="dark:bg-white/5 bg-black/5 rounded-2xl flex items-center px-4 py-3 border dark:border-white/10 border-black/5 focus-within:ring-2 focus-within:ring-[var(--casperid-primary,#8651e1)]/40 transition-all">
                        <Users className="text-[var(--casperid-primary,#8651e1)]/60 mr-3 w-5 h-5" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-medium focus:outline-none"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Enter last name"
                        />
                    </div>
                </div>

                {/* Document Number */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--casperid-primary,#8651e1)]/80 ml-1">
                        {documentTypeLabels[documentType]} Number *
                    </label>
                    <div className="dark:bg-white/5 bg-black/5 rounded-2xl flex items-center px-4 py-3 border dark:border-white/10 border-black/5 focus-within:ring-2 focus-within:ring-[var(--casperid-primary,#8651e1)]/40 transition-all">
                        <CreditCard className="text-[var(--casperid-primary,#8651e1)]/60 mr-3 w-5 h-5" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-medium focus:outline-none"
                            type="text"
                            value={formData.documentNumber}
                            onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                            placeholder="Enter document number"
                        />
                    </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--casperid-primary,#8651e1)]/80 ml-1">
                        Date of Birth
                    </label>
                    <div className="dark:bg-white/5 bg-black/5 rounded-2xl flex items-center px-4 py-3 border dark:border-white/10 border-black/5 focus-within:ring-2 focus-within:ring-[var(--casperid-primary,#8651e1)]/40 transition-all">
                        <Calendar className="text-[var(--casperid-primary,#8651e1)]/60 mr-3 w-5 h-5" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-medium focus:outline-none"
                            type="text"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>
                </div>

                {/* Nationality */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--casperid-primary,#8651e1)]/80 ml-1">
                        Nationality
                    </label>
                    <div className="dark:bg-white/5 bg-black/5 rounded-2xl flex items-center px-4 py-3 border dark:border-white/10 border-black/5 focus-within:ring-2 focus-within:ring-[var(--casperid-primary,#8651e1)]/40 transition-all">
                        <Globe className="text-[var(--casperid-primary,#8651e1)]/60 mr-3 w-5 h-5" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-medium focus:outline-none"
                            type="text"
                            value={formData.nationality}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                            placeholder="Enter nationality"
                        />
                    </div>
                </div>

                {/* Document scan thumbnail */}
                <div className="mt-8 relative h-32 w-full rounded-2xl overflow-hidden border border-[var(--casperid-primary,#8651e1)]/20 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--casperid-primary,#8651e1)]/20 to-cyan-500/10 blur-sm" />
                    <div className="absolute inset-0 bg-[var(--casperid-primary,#8651e1)]/10 flex flex-col items-center justify-center p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-[var(--casperid-primary,#8651e1)] w-5 h-5" />
                            <span className="text-xs font-bold dark:text-slate-200 text-slate-700">
                                {documentTypeLabels[documentType]} Scanned Successfully
                            </span>
                        </div>
                        {onRetake && (
                            <button
                                onClick={onRetake}
                                className="mt-2 text-[10px] text-[var(--casperid-primary,#8651e1)] underline font-medium"
                                type="button"
                            >
                                Retake Photo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[var(--casperid-primary,#8651e1)]/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <>
                            <span>Confirm & Mint</span>
                            <Sparkles className="w-5 h-5" />
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] mt-4 text-slate-500">
                    Secured by CasperID Protocol.
                </p>
            </div>
        </motion.div>
    );
};

export default ReviewData;
