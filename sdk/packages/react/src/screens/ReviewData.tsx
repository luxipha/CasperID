import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Calendar, Globe, CheckCircle2, Sparkles, AlertCircle, Users } from 'lucide-react';
import type { ExtractedDocumentData, DocumentType, Layer3SubmitResponse } from '../types';

import { t } from '../utils/i18n';

interface ReviewDataProps {
    requestId: string;
    documentType: DocumentType;
    extractedData: ExtractedDocumentData;
    uploadId: string;
    onNext: (confirmedData: ExtractedDocumentData) => void;
    onRetake?: () => void;
    onError?: (error: string) => void;
    apiBaseUrl?: string;
    previewMode?: boolean;
    language?: string;
}

const getDocumentTypeLabels = (language: string) => ({
    passport: t('passport', language),
    drivers_license: t('drivers_license', language),
    national_id: t('national_id', language)
});

const ReviewData: React.FC<ReviewDataProps> = ({
    requestId,
    documentType,
    extractedData,
    uploadId,
    onNext,
    onRetake,
    onError,
    apiBaseUrl = 'https://apis.casperid.com',
    previewMode = false,
    language = 'EN'
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
            setError(t('error_required_fields', language));
            return;
        }

        setIsSubmitting(true);
        setError('');

        if (previewMode) {
            setTimeout(() => {
                setIsSubmitting(false);
                onNext({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    document_number: formData.documentNumber,
                    date_of_birth: formData.dateOfBirth,
                    nationality: formData.nationality,
                    gender: formData.gender,
                    document_type: documentType
                });
            }, 1500);
            return;
        }

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

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Data submission failed with status ${response.status}`);
            }

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
                        className={`h-1 flex-1 rounded-xl ${fill ? 'bg-brand' : 'bg-brand/20'}`}
                    />
                ))}
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-main mb-2">{t('review_data', language)}</h1>
                <p className="text-muted text-sm leading-relaxed">
                    {t('verify_data_desc', language)}
                </p>
            </div>

            {/* Confidence indicator */}
            {confidence > 0 && (
                <div className="mb-6 p-3 rounded-xl dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted">{t('ocr_confidence', language)}</span>
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
                            {t('verify_data_carefully', language)}
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
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1">
                        {t('full_name', language)}
                    </label>
                    <div className="flex items-center px-1 transition-all">
                        <User className="text-brand mr-4 w-6 h-6 shrink-0" />
                        <div className="flex flex-col w-full">
                            <input
                                className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300"
                                type="text"
                                value={`${formData.firstName} ${formData.lastName}`}
                                onChange={(e) => {
                                    const parts = e.target.value.split(' ');
                                    handleInputChange('firstName', parts[0] || '');
                                    handleInputChange('lastName', parts.slice(1).join(' ') || '');
                                }}
                                placeholder={t('enter_first_name', language)}
                            />
                        </div>
                    </div>
                </div>

                {/* Document Number */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1">
                        {t('id_number', language)}
                    </label>
                    <div className="flex items-center px-1 transition-all">
                        <CreditCard className="text-brand mr-4 w-6 h-6 shrink-0" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300"
                            type="text"
                            value={formData.documentNumber}
                            onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                            placeholder={t('enter_doc_number', language)}
                        />
                    </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1">
                        {t('date_of_birth', language)}
                    </label>
                    <div className="flex items-center px-1 transition-all">
                        <Calendar className="text-brand mr-4 w-6 h-6 shrink-0" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300"
                            type="text"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            placeholder={t('date_format', language)}
                        />
                    </div>
                </div>

                {/* Nationality */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-brand ml-1">
                        {t('nationality', language)}
                    </label>
                    <div className="flex items-center px-1 transition-all">
                        <Globe className="text-brand mr-4 w-6 h-6 shrink-0" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-bold text-lg focus:outline-none placeholder:text-slate-300"
                            type="text"
                            value={formData.nationality}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                            placeholder={t('enter_nationality', language)}
                        />
                    </div>
                </div>

                {/* Document scan thumbnail */}
                <div className="mt-8 relative h-32 w-full rounded-2xl overflow-hidden border border-brand-20 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-20 to-cyan-500/10 blur-sm" />
                    <div className="absolute inset-0 bg-brand/10 flex flex-col items-center justify-center p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-brand w-5 h-5" />
                            <span className="text-xs font-bold dark:text-slate-200 text-slate-700">
                                {t('scanned_successfully', language)}
                            </span>
                        </div>
                        {onRetake && (
                            <button
                                onClick={onRetake}
                                className="mt-2 text-[10px] text-brand underline font-medium"
                                type="button"
                            >
                                {t('retake_photo', language)}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{t('submitting', language)}</span>
                        </>
                    ) : (
                        <>
                            <span>{t('confirm_mint', language)}</span>
                            <Sparkles className="w-5 h-5" />
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] mt-4 text-slate-500">
                    {t('secured_by_casper', language)}
                </p>
            </div>
        </motion.div>
    );
};

export default ReviewData;
