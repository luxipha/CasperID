
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LivenessCheck } from './LivenessCheck';
import { L3LivenessCheck } from './L3LivenessCheck';
import { LivenessSuccess } from './LivenessSuccess';
import { KYCLayer3Method } from './KYCLayer3Method';
import { KYCNIMCSelection } from './KYCNIMCSelection';
import { KYCDocumentSelection } from './KYCDocumentSelection';
import { KYCNIMCNumberEntry } from './KYCNIMCNumberEntry';
import { KYCNIMCOTP } from './KYCNIMCOTP';
import { KYCNIMCSuccess } from './KYCNIMCSuccess';
import { KYCReviewSubmit } from './KYCReviewSubmit';
import { KYCFullSuccess } from './KYCFullSuccess';
import { KYCDocumentUpload } from './KYCDocumentUpload';
import { KYCManualEntry } from './KYCManualEntry';
import { KYCSubmissionReceived } from './KYCSubmissionReceived';
import { KYCProcessing } from './KYCProcessing';
import { KYCNIMCMobileQR } from './KYCNIMCMobileQR';
import { IdentityStatusCard, ReusableKYCCard, TrustScoreCard } from './DashboardCards';
import { ConnectedPlatforms } from './ConnectedPlatforms';
import { ReusableTools } from './ReusableTools';
import { HumanFirstIdentity } from './HumanFirstIdentity';
import { RecentActivity } from './RecentActivity';

type ViewState =
  | 'dashboard'
  | 'liveness'
  | 'success'
  | 'layer3_method'
  | 'layer3_nimc_selection'
  | 'layer3_nimc_qr'
  | 'layer3_doc_selection'
  | 'layer3_doc_upload'
  | 'layer3_manual_entry'
  | 'layer3_nimc_number'
  | 'layer3_nimc_otp'
  | 'layer3_processing'
  | 'layer3_nimc_success'
  | 'layer3_review_submit'
  | 'layer3_submission_received'
  | 'layer3_full_success';

export const KYCHome: React.FC = () => {
  const [activeStep, setActiveStep] = useState<ViewState>('dashboard');
  const [selectedDocType, setSelectedDocType] = useState<string>('passport');
  const [isSubmittingToReview, setIsSubmittingToReview] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [layer3Status, setLayer3Status] = useState<'none' | 'pending' | 'approved'>('none');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [uploadId, setUploadId] = useState<string>('');
  const [isLayer3Flow, setIsLayer3Flow] = useState<boolean>(false); // Track if we're in Layer 3 flow
  const { user } = useAuth();

  // Check for pending Layer 3 verification on mount
  useEffect(() => {
    const checkLayer3Status = async () => {
      if (!user?.wallet) return;

      if (user.tier === 'layer_3') {
        setLayer3Status('approved');
      } else if (user.tier === 'layer_2') {
        // Check API for pending Layer 3 upgrade
        try {
          const data = await apiService.get(`/api/identity-status?wallet=${encodeURIComponent(user.wallet)}`);
          console.log('[KYCHome] Identity status:', data);

          // Check if user has pending Layer 3 upgrade
          if (data.pending_upgrade_tier === 'layer_3' && data.status === 'pending') {
            console.log('[KYCHome] Found pending Layer 3 upgrade');
            setLayer3Status('pending');
            setKycSubmitted(true);
          }
          // Check if user is ALREADY layer_3 or full_kyc but local state is stale
          else if (data.tier === 'layer_3' || data.tier === 'layer_3') {
            console.log('[KYCHome] confirmed layer_3/full_kyc from API');
            setLayer3Status('approved');
          }
        } catch (error) {
          console.error('[KYCHome] Failed to check Layer 3 status:', error);
        }
      }
    };
    checkLayer3Status();
  }, [user]);

  // Helper for dashboard navigation back
  const goToDashboard = () => setActiveStep('dashboard');

  // Map layer status to display names
  const getVerificationLevel = (layerStatus: string) => {
    switch (layerStatus) {
      case 'layer_0':
        return 'Basic';
      case 'layer_1':
        return 'Basic';
      case 'layer_2':
        return 'Layer 2';
      case 'layer_3':
        return 'Layer 3';
      default:
        return 'Basic';
    }
  };

  // Check if layer is completed based on user data
  const isLayerCompleted = (layer: number) => {
    if (!user) return false;

    const tier = user.tier as string;

    if (layer === 1) return user.email_verified || !!user.wallet;
    if (layer === 2) return tier === 'layer_2' || tier === 'layer_3';
    if (layer === 3) return tier === 'layer_3' || layer3Status === 'approved';
    return false;
  };

  // Get current user layer as number
  const getCurrentLayerNumber = () => {
    if (layer3Status === 'approved') return 3;
    if (!user) return 1;
    switch (user.tier) {
      case 'layer_0':
      case 'layer_1':
        return 1;
      case 'layer_2':
        return 2;
      case 'layer_3':
        return 3;
      default:
        return 1;
    }
  };

  // Calculate progress percentage for the stepper
  const getProgressPercentage = () => {
    const currentLayer = getCurrentLayerNumber();
    switch (currentLayer) {
      case 1:
        return 42; // Layer 1 completed
      case 2:
        return 70; // Layer 2 completed
      case 3:
        return 100; // Layer 3 completed
      default:
        return 42;
    }
  };

  if (activeStep === 'liveness') {
    // Use the tracked flow state instead of user status
    const livenessLayer = isLayer3Flow ? 3 : 2;
    console.log('[KYCHome] Liveness step - isLayer3Flow:', isLayer3Flow, 'livenessLayer:', livenessLayer);

    // Layer 3 uses stripped-down component (no sidebar/header)
    if (isLayer3Flow) {
      return (
        <L3LivenessCheck
          onComplete={() => {
            console.log('[KYCHome] L3LivenessCheck onComplete called - routing to layer3_review_submit');
            setActiveStep('layer3_review_submit');
          }}
        />
      );
    }

    // Layer 2 uses full component with sidebar
    return (
      <LivenessCheck
        onBack={goToDashboard}
        onComplete={() => {
          setActiveStep('success');
        }}
        layer={2}
      />
    );
  }

  if (activeStep === 'success') {
    return (
      <LivenessSuccess
        onDashboard={goToDashboard}
        onCancel={goToDashboard}
      />
    );
  }

  if (activeStep === 'layer3_method') {
    return (
      <KYCLayer3Method
        onBack={goToDashboard}
        onSelectMethod={(m) => {
          if (m === 'nimc') {
            setActiveStep('layer3_nimc_selection');
          } else {
            setActiveStep('layer3_doc_selection');
          }
        }}
      />
    );
  }

  if (activeStep === 'layer3_nimc_selection') {
    return (
      <KYCNIMCSelection
        onBack={() => setActiveStep('layer3_method')}
        onCancel={goToDashboard}
        onSelectMode={(mode) => {
          if (mode === 'desktop') {
            setActiveStep('layer3_nimc_number');
          } else {
            setActiveStep('layer3_nimc_qr');
          }
        }}
      />
    );
  }

  if (activeStep === 'layer3_nimc_qr') {
    return (
      <KYCNIMCMobileQR
        onBack={() => setActiveStep('layer3_nimc_selection')}
        onCancel={goToDashboard}
        onScanned={() => setActiveStep('layer3_processing')}
      />
    );
  }

  if (activeStep === 'layer3_nimc_number') {
    return (
      <KYCNIMCNumberEntry
        onBack={() => setActiveStep('layer3_nimc_selection')}
        onCancel={goToDashboard}
        onNext={(num) => {
          setActiveStep('layer3_nimc_otp');
        }}
      />
    );
  }

  if (activeStep === 'layer3_nimc_otp') {
    return (
      <KYCNIMCOTP
        onBack={() => setActiveStep('layer3_nimc_number')}
        onCancel={goToDashboard}
        onVerify={(otp) => {
          setActiveStep('layer3_processing');
        }}
      />
    );
  }

  if (activeStep === 'layer3_processing') {
    return (
      <KYCProcessing
        title="Processing Identity Data"
        subtitle="We're securely analyzing your details to verify authenticity."
        onComplete={() => setActiveStep('layer3_nimc_success')}
      />
    );
  }

  if (activeStep === 'layer3_nimc_success') {
    return (
      <KYCNIMCSuccess
        onProceed={() => setActiveStep('liveness')}
        onCancel={goToDashboard}
      />
    );
  }

  if (activeStep === 'layer3_review_submit') {
    return (
      <KYCReviewSubmit
        documentData={extractedData}
        uploadId={uploadId}
        livenessVerified={true} // We know liveness is verified if we reached this step
        onBack={() => setActiveStep('liveness')}
        onCancel={goToDashboard}
        onSubmit={() => {
          setIsSubmittingToReview(true);
          setActiveStep('layer3_submission_received');
        }}
      />
    );
  }

  if (activeStep === 'layer3_submission_received') {
    return (
      <KYCSubmissionReceived
        onDashboard={() => {
          setKycSubmitted(true);
          goToDashboard();
        }}
      />
    );
  }

  if (activeStep === 'layer3_full_success') {
    return (
      <KYCFullSuccess
        onDashboard={goToDashboard}
        onViewProfile={() => {
          console.log('Navigate to profile from success');
          goToDashboard();
        }}
      />
    );
  }

  if (activeStep === 'layer3_doc_selection') {
    return (
      <KYCDocumentSelection
        onBack={() => setActiveStep('layer3_method')}
        onCancel={goToDashboard}
        onNext={(type) => {
          setSelectedDocType(type);
          setActiveStep('layer3_doc_upload');
        }}
      />
    );
  }

  if (activeStep === 'layer3_doc_upload') {
    return (
      <KYCDocumentUpload
        docType={selectedDocType}
        onBack={() => setActiveStep('layer3_doc_selection')}
        onCancel={goToDashboard}
        onNext={async (frontFile, backFile) => {
          try {
            console.log('[Layer3] Uploading documents for OCR processing...');

            // Import API service
            const { apiService } = await import('../services/api');

            // Call OCR API
            const response = await apiService.uploadDocumentWithOCR(
              frontFile,
              backFile,
              selectedDocType as 'passport' | 'drivers_license' | 'national_id'
            );

            console.log('[Layer3] OCR extraction successful:', response);

            // Set extracted data
            setExtractedData(response.extracted_data);
            setUploadId(response.upload_id);

            // Move to manual entry
            setActiveStep('layer3_manual_entry');
          } catch (error) {
            console.error('[Layer3] OCR upload failed:', error);
            // Fallback to manual entry with empty data
            setExtractedData({
              document_type: selectedDocType,
              document_number: '',
              first_name: '',
              last_name: '',
              date_of_birth: '',
              gender: '',
              nationality: 'Nigerian',
              address: '',
              phone_number: ''
            });
            setUploadId('fallback_' + Date.now());
            setActiveStep('layer3_manual_entry');
          }
        }}
      />
    );
  }

  if (activeStep === 'layer3_manual_entry') {
    return (
      <KYCManualEntry
        extractedData={extractedData}
        uploadId={uploadId}
        onBack={() => setActiveStep('layer3_doc_upload')}
        onNext={(confirmedData) => {
          setExtractedData(confirmedData);
          setIsLayer3Flow(true); // Mark as Layer 3 flow
          setActiveStep('liveness');
        }}
        onCancel={goToDashboard}
      />
    );
  }


  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Page Header & Current Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight leading-tight">
            Identity Verification & <br className="hidden md:block" /> Trust Layers
          </h1>
          <p className="text-text-sub text-lg font-medium leading-relaxed">
            Manage your digital footprint. Upgrade your CasperID to unlock higher limits, prove humanity, and access regulated services.
          </p>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-6 flex items-center gap-6 min-w-[320px]">
          <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">badge</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Current Status</p>
            <h4 className="text-lg font-black text-text-main">
              {getVerificationLevel(layer3Status === 'approved' ? 'layer_3' : user?.tier || 'layer_1')} - Verified
            </h4>
          </div>
          <div className={`size-8 rounded-full flex items-center justify-center text-white ${kycSubmitted ? 'bg-primary animate-pulse' : 'bg-green-500'}`}>
            <span className="material-symbols-outlined text-[20px] font-bold">
              {kycSubmitted ? 'hourglass_empty' : 'check'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="relative pt-8 pb-12">
        <div className="absolute top-[52px] left-0 w-full h-1 bg-gray-100 rounded-full">
          <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>

        <div className="relative flex justify-between">
          {/* Layer 1 */}
          <div className="flex flex-col items-center gap-4">
            <div className={`size-10 rounded-full flex items-center justify-center shadow-lg ring-4 ring-bg-light z-10 transition-all ${isLayerCompleted(1) ? 'bg-primary text-white shadow-primary/20' : 'bg-white border-2 border-gray-200 text-text-sub'
              }`}>
              {isLayerCompleted(1) ? (
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              ) : (
                <span className="font-bold">1</span>
              )}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${isLayerCompleted(1) ? 'text-primary' : 'text-text-sub'}`}>
              Layer 1
            </span>
          </div>

          {/* Layer 2 */}
          <div className="flex flex-col items-center gap-4">
            <div className={`size-10 rounded-full flex items-center justify-center font-black ring-4 ring-bg-light z-10 transition-all ${isLayerCompleted(2) ? 'bg-primary text-white shadow-lg shadow-primary/20' :
              getCurrentLayerNumber() >= 2 ? 'bg-white border-2 border-primary text-primary' :
                'bg-white border-2 border-gray-200 text-text-sub'
              }`}>
              {isLayerCompleted(2) ? (
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              ) : (
                <span className="font-bold">2</span>
              )}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${isLayerCompleted(2) || getCurrentLayerNumber() >= 2 ? 'text-primary' : 'text-text-sub'
              }`}>
              Layer 2
            </span>
          </div>

          {/* Layer 3 */}
          <div className="flex flex-col items-center gap-4">
            <div className={`size-10 rounded-full flex items-center justify-center font-black ring-4 ring-bg-light z-10 transition-all ${isLayerCompleted(3) ? 'bg-primary text-white shadow-lg shadow-primary/20' :
              getCurrentLayerNumber() >= 3 ? 'bg-white border-2 border-primary text-primary' :
                'bg-white border-2 border-gray-200 text-text-sub'
              }`}>
              {isLayerCompleted(3) ? (
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              ) : (
                <span className="font-bold">3</span>
              )}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${isLayerCompleted(3) || getCurrentLayerNumber() >= 3 ? 'text-primary' : 'text-text-sub'
              }`}>
              Layer 3
            </span>
          </div>
        </div>
      </div>

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Card 1: Basic Identity */}
        <div className={`bg-white rounded-[40px] border border-gray-100 shadow-soft p-10 flex flex-col h-full relative overflow-hidden group ${isLayerCompleted(1) ? 'opacity-80' : ''}`}>
          <div className="absolute top-8 right-8 text-gray-100 group-hover:text-primary/5 transition-colors">
            <span className="material-symbols-outlined text-6xl">fingerprint</span>
          </div>
          <div className="mb-8">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${isLayerCompleted(1)
              ? 'bg-green-50 text-green-600 border-green-100'
              : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
              {isLayerCompleted(1) ? (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">check</span> Completed
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">schedule</span> In Progress
                </>
              )}
            </span>
          </div>
          <h3 className="text-2xl font-black text-text-main mb-4 tracking-tight">Layer 1: Basic Identity</h3>
          <p className="text-text-sub text-[15px] font-medium leading-relaxed mb-8">
            Your foundational digital identity. Passkey-bound and automatically verified.
            {isLayerCompleted(1) ? ' Email verified and wallet created.' : ' Includes email verification and wallet generation.'}
          </p>
        </div>

        {/* Card 2: Liveness & Wallet */}
        <div className={`bg-white rounded-[40px] border-2 shadow-soft p-10 flex flex-col h-full relative group transition-all ${kycSubmitted ? 'border-gray-100 opacity-80' :
          isLayerCompleted(2) ? 'border-gray-100 opacity-90' :
            'border-primary/20'
          }`}>
          <div className="absolute top-8 right-8 text-gray-100 group-hover:text-primary/5 transition-colors">
            <span className="material-symbols-outlined text-6xl">face_retouching_natural</span>
          </div>
          <div className="mb-8">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit flex items-center gap-2 ${isLayerCompleted(2) ? 'bg-green-50 text-green-600 border-green-100' :
              kycSubmitted ? 'bg-green-50 text-green-600 border-green-100' :
                'bg-primary/10 text-primary border-primary/10'
              }`}>
              {isLayerCompleted(2) ? (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  Completed
                </>
              ) : kycSubmitted ? 'Completed' : 'Available'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-text-main mb-4 tracking-tight">Layer 2: Liveness & Wallet</h3>
          <p className="text-text-sub text-[15px] font-medium leading-relaxed mb-10">
            Prove you are a real human and link your external wallets. This layer adds strong Sybil resistance.
          </p>
          {!isLayerCompleted(2) && !kycSubmitted && (
            <button onClick={() => setActiveStep('liveness')} className="mt-auto w-full h-14 bg-primary text-white rounded-[18px] font-black text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-primary/90 transition-all">
              Verify Liveness (Layer 2)
            </button>
          )}
          {isLayerCompleted(2) && (
            <div className="mt-auto p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <span className="text-sm font-bold text-green-700">Liveness verification complete</span>
            </div>
          )}
        </div>

        {/* Card 3: Full KYC */}
        <div className={`bg-white rounded-[40px] border shadow-soft p-10 flex flex-col h-full relative group transition-all ${kycSubmitted ? 'border-primary shadow-glow ring-1 ring-primary/20' : 'border-gray-100'}`}>
          <div className="absolute top-[-2px] right-8 px-4 py-1.5 bg-primary text-white rounded-b-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-md z-10">
            Highest Trust
          </div>
          <div className="mb-8">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit flex items-center gap-2 ${isLayerCompleted(3)
              ? 'bg-green-50 text-green-600 border-green-100' // Green for completed
              : kycSubmitted || layer3Status === 'pending'
                ? 'bg-yellow-50 text-yellow-600 border-yellow-100' // Yellow for pending
                : 'bg-primary/10 text-primary border-primary/10' // Purple for available
              }`}>
              {isLayerCompleted(3) ? (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  Verified
                </>
              ) : kycSubmitted || layer3Status === 'pending' ? 'Under Review' : 'Available'}
            </span>
          </div>
          <h3 className="text-2xl font-black text-text-main mb-4 tracking-tight">Layer 3: Full KYC</h3>
          <p className="text-text-sub text-[15px] font-medium leading-relaxed mb-10">
            The highest level of trust. Unlock higher transaction limits and access regulated services.
          </p>
          {isLayerCompleted(3) ? (
            <div className="mt-auto p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4">
              <span className="material-symbols-outlined text-green-600">verified</span>
              <div>
                <p className="text-sm font-bold text-green-700">Full KYC Verified</p>
                <p className="text-xs text-green-600/80 font-medium">You have the highest level of trust.</p>
              </div>
            </div>
          ) : layer3Status === 'pending' ? (
            <>
              <div className="text-center py-6 space-y-3">
                <div className="size-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4 border border-yellow-100">
                  <span className="material-symbols-outlined text-3xl text-yellow-600 animate-pulse">pending</span>
                </div>
                <p className="text-sm font-bold text-text-sub">Your Layer 3 verification is under review by our team.</p>
              </div>
              <button onClick={() => setActiveStep('layer3_submission_received')} className="mt-auto w-full h-14 bg-white text-primary border-2 border-primary rounded-[18px] font-black text-sm flex items-center justify-center gap-3 hover:bg-primary/5 transition-all">
                View Progress
              </button>
            </>
          ) : (
            <button onClick={() => setActiveStep('layer3_method')} className="mt-auto w-full h-14 bg-primary text-white rounded-[18px] font-black text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-primary/90 transition-all">
              Complete Full KYC (Layer 3)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
