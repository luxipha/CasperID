
import React, { useState } from 'react';
import { notifyError } from '../utils/notify';

interface DocumentData {
  document_type: string;
  document_number: string;
  nin?: string; // National ID Number
  bvn?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  address: string;
  phone_number: string;
}

interface KYCReviewSubmitProps {
  requestId: string;
  documentData: DocumentData;
  uploadId: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  livenessVerified: boolean;
  verificationContext?: 'nigeria' | 'international';
  verificationMethod?: 'document_upload' | 'nimc' | 'bvn';
  onBack: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const KYCReviewSubmit: React.FC<KYCReviewSubmitProps> = ({
  requestId,
  documentData,
  uploadId,
  frontImageUrl,
  backImageUrl,
  livenessVerified,
  verificationContext,
  verificationMethod,
  onBack,
  onSubmit,
  onCancel
}) => {
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!consent || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Import API service
      const { apiService } = await import('../services/api');

      // Submit verification with image URLs
      await apiService.submitLayer3Verification({
        request_id: requestId,
        document_data: documentData,
        upload_id: uploadId,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        liveness_verified: livenessVerified,
        country_context: verificationContext,
        verification_method: verificationMethod
      });

      onSubmit();
    } catch (error) {
      console.error('[Layer3] Submit failed:', error);
      notifyError(error instanceof Error ? error.message : 'Failed to submit verification. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getDocTypeName = () => {
    switch (documentData.document_type) {
      case 'passport': return 'Passport';
      case 'drivers_license': return "Driver's License";
      case 'national_id': return 'National ID';
      default: return 'Document';
    }
  };

  const methodLabel = documentData.nin
    ? 'NIN + Document Upload'
    : documentData.bvn
      ? 'BVN + Document Upload'
      : 'Document Upload';
  const detailsLabel = (documentData.nin || documentData.bvn) ? 'Edit Identity Details' : 'Edit Document Details';

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 md:pb-20">
      {/* Top Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-6"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back
      </button>

      {/* Page Header */}
      <div className="mb-6 md:mb-10">
        <h1 className="text-[30px] md:text-[40px] font-black text-text-main tracking-tight leading-tight">
          Review & Submit Your Full KYC
        </h1>
        <p className="text-text-sub text-base md:text-lg font-medium leading-relaxed max-w-3xl mt-2">
          Please review all the information you have provided for your Layer 3 verification before final submission.
        </p>
      </div>

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">

        {/* Left: Review Cards Area */}
        <div className="space-y-6">

          {/* Section 1: Identity Verification */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-10 space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </div>
                <h2 className="text-xl font-black text-text-main">Identity Verification</h2>
              </div>
              <button className="text-primary font-black text-sm hover:underline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit Method Choice
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Method</p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-text-main">{methodLabel}</span>
                  <span className="material-symbols-outlined text-green-500 text-[18px] icon-filled">check_circle</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Document Type</p>
                <p className="text-base font-bold text-text-main">{getDocTypeName()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Document Number</p>
                <span className="inline-block px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-sm font-mono font-bold text-text-main uppercase">
                  {documentData.document_number || 'N/A'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Gender</p>
                <p className="text-base font-bold text-text-main">{documentData.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-10 space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </div>
                <h2 className="text-xl font-black text-text-main">Personal Details</h2>
              </div>
              <button className="text-primary font-black text-sm hover:underline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">edit</span>
                {detailsLabel}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Full Name</p>
                <p className="text-base font-bold text-text-main">{documentData.first_name} {documentData.last_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Date of Birth</p>
                <p className="text-base font-bold text-text-main">{documentData.date_of_birth || 'Not provided'}</p>
              </div>
              {documentData.nin && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">National ID Number (NIN)</p>
                  <p className="text-base font-bold text-text-main">{documentData.nin}</p>
                </div>
              )}
              {documentData.bvn && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Bank Verification Number (BVN)</p>
                  <p className="text-base font-bold text-text-main">{documentData.bvn}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Nationality</p>
                <p className="text-base font-bold text-text-main">{documentData.nationality}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Phone</p>
                <p className="text-base font-bold text-text-main">{documentData.phone_number || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Address</p>
                <p className="text-base font-bold text-text-main">{documentData.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Liveness Check */}
          <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-10 space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">face</span>
                </div>
                <h2 className="text-xl font-black text-text-main">Liveness Check</h2>
              </div>
              <button className="text-primary font-black text-sm hover:underline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">refresh</span>
                Redo Liveness Check
              </button>
            </div>

            <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-[20px] md:rounded-[24px] bg-green-50/30 border border-green-100/50">
              <div className="size-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-[24px] font-bold">check</span>
              </div>
              <div>
                <h4 className="text-[17px] font-black text-text-main">{livenessVerified ? 'Passed Successfully' : 'Verification Pending'}</h4>
                <p className="text-[13px] text-text-sub font-medium mt-0.5">Face scan {livenessVerified ? 'verified' : 'completed'}</p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-primary/5 rounded-[20px] md:rounded-[24px] border border-primary/10 p-5 md:p-8 flex gap-4 md:gap-5 group cursor-pointer" onClick={() => setConsent(!consent)}>
            <div className={`size-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${consent ? 'bg-primary border-primary' : 'border-primary/20 bg-white'}`}>
              {consent && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
            </div>
            <p className="text-sm font-bold text-text-main leading-relaxed">
              I confirm all the information provided is accurate and I consent to its processing for Layer 3 KYC verification. I understand that providing false information may result in account restriction.
            </p>
          </div>

          {/* Final Action Button */}
          <button
            disabled={!consent || isSubmitting}
            onClick={handleSubmit}
            className={`w-full min-h-14 md:h-16 px-4 rounded-[18px] md:rounded-[22px] font-black text-base md:text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${(consent && !isSubmitting)
              ? 'bg-primary text-white shadow-primary/30 hover:shadow-primary/40'
              : 'bg-gray-100 text-text-sub shadow-none cursor-not-allowed'
              }`}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm & Submit Full KYC'}
            {!isSubmitting && <span className="material-symbols-outlined text-2xl">arrow_forward</span>}
          </button>
        </div>

        {/* Right: Verification Steps Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

            <div className="space-y-10 relative">
              {/* Vertical Stepper Line */}
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                <div className="absolute top-0 left-0 w-full h-full bg-primary"></div>
              </div>

              {/* Step 1: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 2: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Verification</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 3: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 4: Active */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                  4
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary leading-tight">Review & Submit</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Final confirmation</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 group cursor-pointer hover:bg-gray-50 transition-all">
                <div className="size-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">support_agent</span>
                </div>
                <div>
                  <p className="text-xs font-black text-text-main leading-none mb-1">Need help?</p>
                  <button className="text-[11px] font-bold text-primary hover:underline">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Exit Link */}
      <div className="mt-8 md:mt-12 flex justify-center">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          Cancel Verification
        </button>
      </div>
    </div>
  );
};
