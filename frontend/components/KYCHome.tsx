
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LivenessCheck } from './LivenessCheck';
import { L3LivenessCheck, type Layer3VerificationSession } from './L3LivenessCheck';
import { LivenessSuccess } from './LivenessSuccess';
import { KYCDocumentSelection } from './KYCDocumentSelection';
import { KYCNIMCNumberEntry } from './KYCNIMCNumberEntry';
import { KYCReviewSubmit } from './KYCReviewSubmit';
import { KYCFullSuccess } from './KYCFullSuccess';
import { KYCDocumentUpload } from './KYCDocumentUpload';
import { KYCManualEntry } from './KYCManualEntry';
import { KYCSubmissionReceived } from './KYCSubmissionReceived';
import { KYCVerificationContext } from './KYCVerificationContext';
import { KYCNINConfirmation } from './KYCNINConfirmation';
import { IdentityStatusCard, ReusableKYCCard, TrustScoreCard } from './DashboardCards';
import { ConnectedPlatforms } from './ConnectedPlatforms';
import { ReusableTools } from './ReusableTools';
import { RecentActivity } from './RecentActivity';
import { notifyError } from '../utils/notify';

const VERIFICATION_PAYMENT_STORAGE_PREFIX = 'casperid:verification-payment';

type ViewState =
  | 'dashboard'
  | 'liveness'
  | 'success'
  | 'layer3_context'
  | 'layer3_method'
  | 'layer3_doc_selection'
  | 'layer3_doc_upload'
  | 'layer3_manual_entry'
  | 'layer3_nimc_number'
  | 'layer3_nin_confirm'
  | 'layer3_review_submit'
  | 'layer3_submission_received'
  | 'layer3_full_success';

type VerificationContext = 'nigeria' | 'international';
type NigerianIdentityMethod = 'nimc' | 'bvn';

interface KYCHomeProps {
  initialStep?: ViewState;
  onExit?: () => void;
  onLayer3Submitted?: () => void;
}

export const KYCHome: React.FC<KYCHomeProps> = ({
  initialStep = 'dashboard',
  onExit,
  onLayer3Submitted,
}) => {
  const getFriendlyLayer3IdentityError = (error: unknown, method: 'nimc' | 'bvn') => {
    const fallback = method === 'bvn'
      ? 'BVN verification is temporarily unavailable. Please try again shortly or use NIN instead.'
      : 'NIN verification is temporarily unavailable. Please try again shortly.';

    if (!(error instanceof Error) || !error.message) {
      return fallback;
    }

    const normalized = error.message.toLowerCase();

    if (normalized.includes('monnify api keys are not configured')) {
      return 'Identity verification is temporarily unavailable. Please try again shortly.';
    }

    if (normalized.includes('live-only') || normalized.includes('live mode')) {
      return method === 'bvn'
        ? 'BVN verification is temporarily unavailable right now. Please use NIN or try again later.'
        : 'NIN verification is temporarily unavailable right now. Please try again later.';
    }

    return error.message;
  };

  const [activeStep, setActiveStep] = useState<ViewState>(initialStep);
  const [selectedDocType, setSelectedDocType] = useState<string>('passport');
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [layer3Status, setLayer3Status] = useState<'none' | 'pending' | 'approved'>('none');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [uploadId, setUploadId] = useState<string>('');
  const [frontImageUrl, setFrontImageUrl] = useState<string>('');
  const [backImageUrl, setBackImageUrl] = useState<string>('');
  const [isLayer3Flow, setIsLayer3Flow] = useState<boolean>(false); // Track if we're in Layer 3 flow
  const [layer3Session, setLayer3Session] = useState<Layer3VerificationSession | null>(null);
  const [layer3Method, setLayer3Method] = useState<'document_upload' | 'nimc' | 'bvn'>('document_upload');
  const [verificationContext, setVerificationContext] = useState<VerificationContext | null>(null);
  const [identityMethod, setIdentityMethod] = useState<NigerianIdentityMethod>('nimc');
  const [ninValue, setNinValue] = useState<string>('');
  const [bvnValue, setBvnValue] = useState<string>('');
  const [identityVerifiedData, setIdentityVerifiedData] = useState<any>(null);
  const [layer3IdentityError, setLayer3IdentityError] = useState<string>('');
  const [isResumingVerificationPayment, setIsResumingVerificationPayment] = useState(false);
  const [layer3IdentityDraft, setLayer3IdentityDraft] = useState<{
    method: NigerianIdentityMethod;
    nin?: string;
    bvn?: string;
    account_number?: string;
    bank_code?: string;
  } | null>(null);
  const [layer3PaymentNotice, setLayer3PaymentNotice] = useState<string>('');
  const { user } = useAuth();
  const hasHandledVerificationPaymentReturn = useRef(false);

  const getVerificationPaymentStorageKey = (requestId: string, method: NigerianIdentityMethod) =>
    `${VERIFICATION_PAYMENT_STORAGE_PREFIX}:${requestId}:${method}`;

  const clearVerificationPaymentReturnParams = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('paymentProvider');
    params.delete('paymentPurpose');
    params.delete('paymentReference');
    params.delete('requestId');
    params.delete('method');
    const nextQuery = params.toString();
    window.history.replaceState({}, document.title, nextQuery ? `/dashboard?${nextQuery}` : '/dashboard?view=kyc');
  };

  const finalizePaidIdentityVerification = async (
    requestId: string,
    details: {
      method: NigerianIdentityMethod;
      nin?: string;
      bvn?: string;
      account_number?: string;
      bank_code?: string;
    }
  ) => {
    if (details.method === 'nimc' && details.nin) {
      const response = await apiService.verifyLayer3NIN({
        request_id: requestId,
        nin: details.nin
      });
      setIdentityMethod('nimc');
      setLayer3Method('nimc');
      setNinValue(details.nin);
      setBvnValue('');
      setIdentityVerifiedData(response.nin_verification?.identity || { nin: details.nin });
      return;
    }

    if (details.method === 'bvn' && details.bvn && details.account_number && details.bank_code) {
      const response = await apiService.verifyLayer3BVN({
        request_id: requestId,
        bvn: details.bvn,
        account_number: details.account_number,
        bank_code: details.bank_code
      });
      setIdentityMethod('bvn');
      setLayer3Method('bvn');
      setBvnValue(details.bvn);
      setNinValue('');
      setIdentityVerifiedData(response.bvn_verification?.identity || {
        bvn: details.bvn,
        account_number: details.account_number,
        bank_code: details.bank_code
      });
      return;
    }

    throw new Error('Identity verification details are incomplete.');
  };

  // Check for pending Layer 3 verification on mount
  useEffect(() => {
    const checkLayer3Status = async () => {
      if (!user?.wallet) return;

      if (user.tier === 'layer_3') {
        setLayer3Status('approved');
      } else {
        // Check API for pending Layer 3 upgrade (for any tier below layer_3)
        try {
          const data = await apiService.get(`/api/identity-status?wallet=${encodeURIComponent(user.wallet)}`);

          // Check if user has pending Layer 3 upgrade (V1 uses 'pending', V2 uses 'in_progress')
          if (data.pending_upgrade_tier === 'layer_3' && ['pending', 'in_progress'].includes(data.status)) {
            setLayer3Status('pending');
            setKycSubmitted(true);
          }
          // Check if user is ALREADY layer_3 but local state is stale
          else if (data.tier === 'layer_3') {
            setLayer3Status('approved');
          }
        } catch (error) {
          console.error('[KYCHome] Failed to check Layer 3 status:', error);
        }
      }
    };
    checkLayer3Status();
  }, [user]);

  useEffect(() => {
    const resumeVerificationPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentPurpose = params.get('paymentPurpose');
      const paymentReference = params.get('paymentReference');
      const requestId = params.get('requestId');
      const rawMethod = params.get('method');
      const method = rawMethod === 'bvn' ? 'bvn' : rawMethod === 'nimc' ? 'nimc' : null;

      if (
        paymentPurpose !== 'verification' ||
        !paymentReference ||
        !requestId ||
        !method ||
        isResumingVerificationPayment ||
        hasHandledVerificationPaymentReturn.current
      ) {
        return;
      }

      hasHandledVerificationPaymentReturn.current = true;

      const storedDetails = window.sessionStorage.getItem(getVerificationPaymentStorageKey(requestId, method));
      if (!storedDetails) {
        setLayer3PaymentNotice('');
        setLayer3IdentityError('Your payment was confirmed, but we could not restore your verification details. Please enter them again to continue.');
        setVerificationContext('nigeria');
        setLayer3IdentityDraft({ method });
        setActiveStep('layer3_nimc_number');
        clearVerificationPaymentReturnParams();
        return;
      }

      try {
        setIsResumingVerificationPayment(true);
        setLayer3IdentityError('');
        setLayer3PaymentNotice('We found your Monnify return. Confirming your payment and restoring your verification session now.');
        setVerificationContext('nigeria');
        setActiveStep('layer3_nimc_number');
        const parsedDetails = JSON.parse(storedDetails);
        setLayer3IdentityDraft(parsedDetails);

        let paymentStatus: any = null;
        for (let attempt = 0; attempt < 5; attempt += 1) {
          paymentStatus = await apiService.getPaymentStatus(paymentReference);
          if (paymentStatus.status === 'completed' || paymentStatus.status === 'failed' || paymentStatus.status === 'expired') {
            break;
          }
          setLayer3PaymentNotice('Your payment is still being confirmed. This usually takes a few seconds.');
          await new Promise((resolve) => window.setTimeout(resolve, 2500));
        }

        if (paymentStatus?.status !== 'completed') {
          if (paymentStatus?.status === 'failed' || paymentStatus?.status === 'expired') {
            clearVerificationPaymentReturnParams();
            throw new Error('Your payment did not complete. Please try again.');
          }
          setLayer3PaymentNotice('Your payment is still processing. Stay on this page and try again in a moment if needed.');
          clearVerificationPaymentReturnParams();
          return;
        }

        setLayer3PaymentNotice('Payment confirmed. Restoring your verification session.');
        const session = await startOrRefreshLayer3Session(method);
        if (session.requestId !== requestId) {
          clearVerificationPaymentReturnParams();
          throw new Error('We could not restore the same verification session after payment. Please restart the Nigeria verification step.');
        }

        setLayer3PaymentNotice('Payment confirmed. Verifying your identity details now.');
        await finalizePaidIdentityVerification(session.requestId, parsedDetails);
        window.sessionStorage.removeItem(getVerificationPaymentStorageKey(requestId, method));
        setLayer3PaymentNotice('');
        clearVerificationPaymentReturnParams();
        setActiveStep('layer3_nin_confirm');
      } catch (error) {
        console.error('[Layer3] Failed to resume paid verification:', error);
        setLayer3PaymentNotice('');
        setLayer3IdentityError(getFriendlyLayer3IdentityError(error, method));
      } finally {
        setIsResumingVerificationPayment(false);
      }
    };

    resumeVerificationPayment();
  }, [isResumingVerificationPayment]);

  // Helper for dashboard navigation back
  const goToDashboard = () => setActiveStep('dashboard');
  const exitFlow = () => {
    if (onExit) {
      onExit();
      return;
    }
    goToDashboard();
  };
  const cancelLayer3Draft = async () => {
    const requestId = layer3Session?.requestId;
    setLayer3Session(null);
    setIsLayer3Flow(false);
    setVerificationContext(null);
    setIdentityMethod('nimc');
    setNinValue('');
    setBvnValue('');
    setIdentityVerifiedData(null);
    setLayer3IdentityDraft(null);
    setLayer3PaymentNotice('');
    setLayer3IdentityError('');
    setExtractedData(null);
    setUploadId('');
    setFrontImageUrl('');
    setBackImageUrl('');
    setLayer3Method('document_upload');
    if (requestId && !kycSubmitted) {
      try {
        await apiService.delete(`/api/v2/verification/${requestId}`);
      } catch (error) {
        console.error('[Layer3] Failed to cancel draft verification:', error);
      }
    }
    exitFlow();
  };
  const startOrRefreshLayer3Session = async (method: 'document_upload' | 'nimc' | 'bvn') => {
    const response = await apiService.startLayer3Verification(method);
    const verification = response.verification;
    if (!verification?.requestId || !verification?.pairingId || !verification?.pairingToken) {
      throw new Error('The server did not return a complete Layer 3 verification session.');
    }

    const session = {
      requestId: verification.requestId,
      pairingId: verification.pairingId,
      pairingToken: verification.pairingToken,
      qrCodeDataUrl: verification.qrCode?.dataUrl,
    };
    setLayer3Session(session);
    return session;
  };
  const beginLayer3Context = async (context: VerificationContext) => {
    try {
      const method = context === 'nigeria' ? identityMethod : 'document_upload';
      setVerificationContext(context);
      setLayer3Method(method);
      await startOrRefreshLayer3Session(method);
      setActiveStep(context === 'nigeria' ? 'layer3_nimc_number' : 'layer3_doc_selection');
    } catch (error) {
      console.error('[Layer3] Failed to start verification session:', error);
      notifyError(error instanceof Error ? error.message : 'Failed to start verification. Please try again.');
    }
  };
  const beginLayer3Liveness = async () => {
    try {
      await startOrRefreshLayer3Session(layer3Method);
      setIsLayer3Flow(true);
      setActiveStep('liveness');
    } catch (error) {
      console.error('[Layer3] Failed to refresh liveness handoff:', error);
      notifyError(error instanceof Error ? error.message : 'Failed to start liveness verification. Please try again.');
    }
  };

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
    // Layer 3 uses stripped-down component (no sidebar/header)
    if (isLayer3Flow) {
      return (
        <L3LivenessCheck
          verificationSession={layer3Session || undefined}
          onComplete={() => {
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

  if (activeStep === 'layer3_context' || activeStep === 'layer3_method') {
    return (
      <KYCVerificationContext
        onBack={cancelLayer3Draft}
        onCancel={cancelLayer3Draft}
        onSelectContext={beginLayer3Context}
      />
    );
  }

  if (activeStep === 'layer3_nimc_number') {
    return (
      <KYCNIMCNumberEntry
        onBack={() => setActiveStep('layer3_context')}
        onCancel={cancelLayer3Draft}
        error={layer3IdentityError}
        onClearError={() => setLayer3IdentityError('')}
        ctaLabel={isResumingVerificationPayment ? 'Resuming Verification' : 'Pay & Continue'}
        helperMessage="Nigeria identity verification continues after a Monnify payment step. CasperID will resume automatically when you return."
        notice={layer3PaymentNotice}
        isBusy={isResumingVerificationPayment}
        initialDetails={layer3IdentityDraft || undefined}
        onNext={async (details) => {
          try {
            setLayer3IdentityError('');
            setLayer3PaymentNotice('');
            const requestId = layer3Session?.requestId;
            if (!requestId) {
              throw new Error('Layer 3 session is missing. Please restart verification.');
            }
            setLayer3IdentityDraft(details);
            window.sessionStorage.setItem(
              getVerificationPaymentStorageKey(requestId, details.method),
              JSON.stringify(details)
            );

            const paymentSession = await apiService.createMonnifyVerificationCheckout({
              requestId,
              verificationMethod: details.method
            });

            if (paymentSession.status === 'completed') {
              await finalizePaidIdentityVerification(requestId, details);
              window.sessionStorage.removeItem(getVerificationPaymentStorageKey(requestId, details.method));
              setActiveStep('layer3_nin_confirm');
              return;
            }

            if (!paymentSession.checkoutUrl) {
              throw new Error('Monnify checkout could not be started. Please try again.');
            }

            setLayer3PaymentNotice('Redirecting you to Monnify to complete your payment.');
            window.location.href = paymentSession.checkoutUrl;
          } catch (error) {
            console.error('[Layer3] Identity verification failed:', error);
            setLayer3PaymentNotice('');
            setLayer3IdentityError(getFriendlyLayer3IdentityError(error, details.method));
          }
        }}
      />
    );
  }

  if (activeStep === 'layer3_nin_confirm') {
    return (
      <KYCNINConfirmation
        identity={identityVerifiedData || (identityMethod === 'nimc' ? { nin: ninValue } : { bvn: bvnValue })}
        identityMethod={identityMethod}
        onBack={() => setActiveStep('layer3_nimc_number')}
        onCancel={cancelLayer3Draft}
        onContinue={() => setActiveStep('layer3_doc_selection')}
      />
    );
  }

  if (activeStep === 'layer3_review_submit') {
    return (
      <KYCReviewSubmit
        requestId={layer3Session?.requestId || ''}
        documentData={extractedData}
        uploadId={uploadId}
        frontImageUrl={frontImageUrl}
        backImageUrl={backImageUrl}
        livenessVerified={true} // We know liveness is verified if we reached this step
        verificationContext={verificationContext || undefined}
        verificationMethod={layer3Method}
        onBack={() => setActiveStep('liveness')}
        onCancel={cancelLayer3Draft}
        onSubmit={() => {
          setKycSubmitted(true);
          setLayer3Status('pending');
          setActiveStep('layer3_submission_received');
        }}
      />
    );
  }

  if (activeStep === 'layer3_submission_received') {
    return (
      <KYCSubmissionReceived
        actionLabel={onLayer3Submitted ? 'Continue authorization' : undefined}
        onDashboard={() => {
          setKycSubmitted(true);
          if (onLayer3Submitted) {
            onLayer3Submitted();
          } else {
            goToDashboard();
          }
        }}
      />
    );
  }

  if (activeStep === 'layer3_full_success') {
    return (
      <KYCFullSuccess
        onDashboard={goToDashboard}
        onViewProfile={() => {
          goToDashboard();
        }}
      />
    );
  }

  if (activeStep === 'layer3_doc_selection') {
    return (
      <KYCDocumentSelection
        onBack={() => setActiveStep(verificationContext === 'nigeria' ? 'layer3_nin_confirm' : 'layer3_context')}
        onCancel={cancelLayer3Draft}
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
        onCancel={cancelLayer3Draft}
        onNext={async (frontFile, backFile) => {
          try {

            // Import API service
            const { apiService } = await import('../services/api');

            // Call OCR API
            const response = await apiService.uploadDocumentWithOCR(
              frontFile,
              backFile,
              selectedDocType as 'passport' | 'drivers_license' | 'national_id'
            );


            // Set extracted data and image URLs
            setExtractedData({
              ...response.extracted_data,
              nin: response.extracted_data?.nin || ninValue,
              first_name: response.extracted_data?.first_name || identityVerifiedData?.first_name || '',
              last_name: response.extracted_data?.last_name || identityVerifiedData?.last_name || '',
              date_of_birth: response.extracted_data?.date_of_birth || identityVerifiedData?.date_of_birth || '',
              gender: response.extracted_data?.gender || identityVerifiedData?.gender || '',
              phone_number: response.extracted_data?.phone_number || identityVerifiedData?.phone_number || '',
              address: response.extracted_data?.address || identityVerifiedData?.address || '',
              nationality: verificationContext === 'nigeria'
                ? 'Nigerian'
                : (response.extracted_data?.nationality || 'Unknown')
            });
            setUploadId(response.upload_id);
            setFrontImageUrl(response.front_image_url || '');
            setBackImageUrl(response.back_image_url || '');

            // Move to manual entry
            setActiveStep('layer3_manual_entry');
          } catch (error) {
            console.error('[Layer3] OCR upload failed:', error);
            // Fallback to manual entry with empty data
            setExtractedData({
              document_type: selectedDocType,
              nin: ninValue,
              bvn: bvnValue,
              document_number: '',
              first_name: identityVerifiedData?.first_name || '',
              last_name: identityVerifiedData?.last_name || '',
              date_of_birth: identityVerifiedData?.date_of_birth || '',
              gender: identityVerifiedData?.gender || '',
              nationality: verificationContext === 'nigeria' ? 'Nigerian' : 'Unknown',
              address: identityVerifiedData?.address || '',
              phone_number: identityVerifiedData?.phone_number || ''
            });
            setUploadId('fallback_' + Date.now());
            // Move to manual entry but PRESERVE any image URLs we might have
            setActiveStep('layer3_manual_entry');
            // DO NOT setFrontImageUrl('') or setBackImageUrl('') here
            // If the OCR failed, we still want the admin to see the images!
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
          beginLayer3Liveness();
        }}
        onCancel={cancelLayer3Draft}
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

        <div className="app-panel p-6 flex items-center gap-6 min-w-[320px]">
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
        <div className="absolute top-[52px] left-0 w-full h-1 bg-border-subtle rounded-full">
          <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>

        <div className="relative flex justify-between">
          {/* Layer 1 */}
          <div className="flex flex-col items-center gap-4">
            <div className={`size-10 rounded-full flex items-center justify-center shadow-lg ring-4 ring-canvas z-10 transition-all ${isLayerCompleted(1) ? 'bg-primary text-white shadow-primary/20' : 'bg-surface border-2 border-border-strong text-text-sub'
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
            <div className={`size-10 rounded-full flex items-center justify-center font-black ring-4 ring-canvas z-10 transition-all ${isLayerCompleted(2) ? 'bg-primary text-white shadow-lg shadow-primary/20' :
              getCurrentLayerNumber() >= 2 ? 'bg-surface border-2 border-primary text-primary' :
                'bg-surface border-2 border-border-strong text-text-sub'
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
            <div className={`size-10 rounded-full flex items-center justify-center font-black ring-4 ring-canvas z-10 transition-all ${isLayerCompleted(3) ? 'bg-primary text-white shadow-lg shadow-primary/20' :
              getCurrentLayerNumber() >= 3 ? 'bg-surface border-2 border-primary text-primary' :
                'bg-surface border-2 border-border-strong text-text-sub'
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
        <div className={`app-page p-10 flex flex-col h-full relative overflow-hidden group ${isLayerCompleted(1) ? 'opacity-80' : ''}`}>
          <div className="absolute top-8 right-8 text-border-subtle group-hover:text-primary/5 transition-colors">
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
        <div className={`app-page border-2 p-10 flex flex-col h-full relative group transition-all ${kycSubmitted ? 'border-border-subtle opacity-80' :
          isLayerCompleted(2) ? 'border-border-subtle opacity-90' :
            'border-primary/20'
          }`}>
          <div className="absolute top-8 right-8 text-border-subtle group-hover:text-primary/5 transition-colors">
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
            Confirm human presence and optionally link your external wallets to activate Layer 2.
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
        <div className={`app-page p-10 flex flex-col h-full relative group transition-all ${kycSubmitted ? 'border-primary shadow-glow ring-1 ring-primary/20' : 'border-border-subtle'}`}>
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
              <button onClick={() => setActiveStep('layer3_submission_received')} className="mt-auto w-full h-14 bg-surface text-primary border-2 border-primary rounded-[18px] font-black text-sm flex items-center justify-center gap-3 hover:bg-primary/5 transition-all">
                View Progress
              </button>
            </>
          ) : (
            <button onClick={() => setActiveStep('layer3_context')} className="mt-auto w-full h-14 bg-primary text-white rounded-[18px] font-black text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-primary/90 transition-all">
              Complete Full KYC (Layer 3)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
