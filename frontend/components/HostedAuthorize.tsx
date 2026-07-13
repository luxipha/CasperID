import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { AuthEntry } from './AuthEntry';
import { ConsentRequest } from './ConsentRequest';
import { KYCHome } from './KYCHome';
import { LivenessCheck } from './LivenessCheck';
import Logo from './Logo';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStart } from './OnboardingStart';
import { OTPVerify } from './OTPVerify';

type Tier = 'layer_0' | 'layer_1' | 'layer_2' | 'layer_3';
type FlowStep =
  | 'validating'
  | 'signin'
  | 'recover_prompt'
  | 'verify_otp'
  | 'recover_otp'
  | 'recover_passkey'
  | 'register_passkey'
  | 'onboarding'
  | 'checking_tier'
  | 'upgrade_l2_prompt'
  | 'upgrade_l2'
  | 'upgrade_l3_prompt'
  | 'upgrade_l3'
  | 'consent'
  | 'authorizing'
  | 'error';

interface AppMetadata {
  name: string;
  logo_url?: string;
  requested_scopes: string[];
  shared_fields?: string[];
  language?: string;
  theme?: {
    primaryColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    mode?: 'light' | 'dark' | 'system';
  };
}

interface SelectedContext {
  type: 'master' | 'persona';
  did?: string;
  alias?: string;
  context?: string;
  name?: string;
}

function appendAuthorizationResult(redirectUri: string, values: Record<string, string>): string {
  const url = new URL(redirectUri);
  Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function isRecoverablePasskeyFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const normalizedMessage = error.message.toLowerCase();
  return (
    normalizedMessage.includes('cancelled or not approved') ||
    normalizedMessage.includes('authentication was cancelled') ||
    normalizedMessage.includes('notallowederror') ||
    normalizedMessage.includes('not allowed')
  );
}

const tierLabels: Record<Tier, string> = {
  layer_0: 'Unverified',
  layer_1: 'Layer 1',
  layer_2: 'Layer 2',
  layer_3: 'Layer 3',
};

interface VerificationRequirementPromptProps {
  app: AppMetadata;
  layer: 'Layer 2' | 'Layer 3';
  description: string;
  requirements: string[];
  onContinue: () => void;
  onCancel: () => void;
  desktopHandoff?: {
    qrCodeDataUrl: string;
    status: 'loading' | 'ready' | 'scanning' | 'error';
    error?: string;
    onRetry: () => void;
  };
}

const VerificationRequirementPrompt: React.FC<VerificationRequirementPromptProps> = ({
  app,
  layer,
  description,
  requirements,
  onContinue,
  onCancel,
  desktopHandoff,
}) => (
  <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
    <div className="w-full max-w-[560px] overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-[0_40px_90px_-24px_rgba(0,0,0,0.18)]">
      <div className="border-b border-gray-100 bg-gray-50/70 px-8 py-9 text-center">
        <div className="mb-6 flex items-center justify-center gap-5">
          <div className="size-16 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
            {app.logo_url
              ? <img src={app.logo_url} alt={app.name} className="h-full w-full object-contain" />
              : <span className="material-symbols-outlined flex h-full items-center justify-center text-3xl text-primary">apps</span>}
          </div>
          <span className="material-symbols-outlined text-3xl text-text-sub/30">arrow_forward</span>
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Logo href={null} showName={false} variant="png" className="scale-[1.15]" />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Verification required</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-text-main">
          {app.name} requires {layer}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-text-sub">{description}</p>
      </div>

      <div className="space-y-6 p-8">
        <div className="space-y-3">
          {requirements.map((requirement) => (
            <div key={requirement} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <span className="material-symbols-outlined text-xl text-primary">check_circle</span>
              <span className="text-sm font-bold text-text-main">{requirement}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs font-semibold leading-relaxed text-blue-900">
          Verification happens securely on CasperID. {app.name} receives only your verification result and approved permissions.
        </div>

        <div className="space-y-3">
          {desktopHandoff ? (
            <div className="rounded-3xl border border-primary/15 bg-primary/[0.03] p-5 text-center">
              {desktopHandoff.qrCodeDataUrl ? (
                <>
                  <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-lg">
                    <img src={desktopHandoff.qrCodeDataUrl} alt={`Scan to begin ${layer} verification`} className="size-52 object-contain" />
                  </div>
                  <h2 className="mt-4 text-lg font-black text-text-main">Scan to begin verification</h2>
                  <p className="mt-1 text-xs font-semibold text-text-sub">
                    Open your phone camera and scan this code. This page will update automatically.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {desktopHandoff.status === 'scanning' ? 'Verification in progress' : 'Waiting for phone'}
                  </div>
                </>
              ) : desktopHandoff.status === 'error' ? (
                <>
                  <p className="text-sm font-bold text-red-700">{desktopHandoff.error || 'Unable to create the mobile handoff.'}</p>
                  <button onClick={desktopHandoff.onRetry} className="mt-4 h-11 rounded-xl bg-primary px-5 text-xs font-black text-white">
                    Try again
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                  <p className="text-xs font-bold text-text-sub">Creating secure phone handoff...</p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onContinue} className="h-14 w-full rounded-2xl bg-primary text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
              Continue to {layer} verification
            </button>
          )}
          <button onClick={onCancel} className="h-12 w-full rounded-2xl text-sm font-bold text-text-sub hover:bg-gray-50">
            Not now
          </button>
        </div>
      </div>
    </div>
  </div>
);

const HostedAuthorize: React.FC = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const clientId = params.get('client_id') || '';
  const redirectUri = params.get('redirect_uri') || '';
  const state = params.get('state') || '';
  const codeChallenge = params.get('code_challenge') || '';
  const codeChallengeMethod = params.get('code_challenge_method') || '';
  const responseMode = params.get('response_mode') || 'query';
  const responseOrigin = params.get('response_origin') || '';

  const { user, isAuthenticated, isLoading: authLoading, login, refreshUser } = useAuth();
  const [app, setApp] = useState<AppMetadata | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>('validating');
  const [email, setEmail] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [currentTier, setCurrentTier] = useState<Tier>('layer_0');
  const [authorizationStatus, setAuthorizationStatus] = useState<'complete' | 'provisional'>('complete');
  const [error, setError] = useState('');
  const [recoveryNotice, setRecoveryNotice] = useState('');
  const [selectedContextId, setSelectedContextId] = useState('master');
  const [l2Handoff, setL2Handoff] = useState<{
    requestId: string;
    qrCodeDataUrl: string;
    status: 'loading' | 'ready' | 'scanning' | 'error';
    error?: string;
  }>({ requestId: '', qrCodeDataUrl: '', status: 'loading' });
  const [l2HandoffAttempt, setL2HandoffAttempt] = useState(0);
  const isMobileDevice = useMemo(() => {
    const userAgentData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return userAgentData?.mobile === true || isIPadOS ||
      /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);
  const sharedFields = useMemo(() => {
    return Array.isArray(app?.shared_fields) ? app.shared_fields : [];
  }, [app?.shared_fields]);
  const contextOptions = useMemo(() => {
    const rootName = user?.cns_name || user?.human_id || user?.display_name || 'your profile';
    const options = [{
      id: 'master',
      type: 'master' as const,
      title: 'Master profile',
      subtitle: `Share from ${rootName}`,
      badge: currentTier.replace('_', ' ').toUpperCase(),
    }];

    (user?.context_dids || [])
      .filter((contextDid) => contextDid.routing_type !== 'wallet')
      .forEach((contextDid) => {
      const alias = contextDid.alias || contextDid.did;
      options.push({
        id: contextDid.did,
        type: 'persona' as const,
        title: contextDid.alias ? `${contextDid.alias}${contextDid.context ? `.${contextDid.context}` : ''}` : contextDid.did,
        subtitle: contextDid.alias && rootName ? `${contextDid.alias}.${String(rootName).replace(/\.cid$/i, '')}.cid` : contextDid.did,
        badge: contextDid.context,
      });
      });

    return options;
  }, [currentTier, user?.cns_name, user?.context_dids, user?.display_name, user?.human_id]);

  useEffect(() => {
    if (!contextOptions.some((option) => option.id === selectedContextId)) {
      setSelectedContextId('master');
    }
  }, [contextOptions, selectedContextId]);

  const checkEligibility = useCallback(async () => {
    if (!clientId) return;
    setError('');
    setFlowStep('checking_tier');
    try {
      await refreshUser();
      const result = await apiService.getOAuthAuthorizationStatus(clientId);
      setCurrentTier(result.current_tier || 'layer_0');
      if (result.onboarding_required) {
        setFlowStep('onboarding');
      } else if (result.eligible) {
        setAuthorizationStatus(result.authorization_status || 'complete');
        setFlowStep('consent');
      } else if (result.current_tier === 'layer_0') {
        setFlowStep('onboarding');
      } else if (result.required_tier === 'layer_2') {
        setFlowStep('upgrade_l2_prompt');
      } else if (result.required_tier === 'layer_3') {
        setFlowStep('upgrade_l3_prompt');
      } else {
        setFlowStep('onboarding');
      }
    } catch (statusError: any) {
      setError(statusError.message || 'Unable to check your verification status.');
      setFlowStep('error');
    }
  }, [clientId, refreshUser]);

  useEffect(() => {
    const validate = async () => {
      if (!clientId || !redirectUri || !state || !codeChallenge || codeChallengeMethod !== 'S256') {
        setError('This authorization request is incomplete or invalid.');
        setFlowStep('error');
        return;
      }

      try {
        const result = await apiService.validateOAuthAuthorization(clientId, redirectUri);
        setApp(result.app);
        setFlowStep(isAuthenticated ? 'checking_tier' : 'signin');
      } catch (validationError: any) {
        setError(validationError.message || 'This application is not authorized to use CasperID.');
        setFlowStep('error');
      }
    };

    if (!authLoading) validate();
  }, [authLoading, clientId, codeChallenge, codeChallengeMethod, isAuthenticated, redirectUri, state]);

  useEffect(() => {
    if (app && isAuthenticated && flowStep === 'checking_tier') {
      checkEligibility();
    }
  }, [app, checkEligibility, flowStep, isAuthenticated]);

  useEffect(() => {
    if (flowStep !== 'upgrade_l2_prompt' || isMobileDevice) return;

    let cancelled = false;
    const initializeHandoff = async () => {
      setL2Handoff({ requestId: '', qrCodeDataUrl: '', status: 'loading' });
      try {
        const response = await apiService.post('/api/v2/verification/layer2/start', {
          linkWallet: false,
          purpose: `${app?.name || 'Application'} Layer 2 authorization`,
        });
        if (cancelled) return;
        const verification = response.verification;
        if (!verification?.requestId || !verification?.qrCode?.dataUrl) {
          throw new Error('The server did not return a mobile verification QR code.');
        }
        setL2Handoff({
          requestId: verification.requestId,
          qrCodeDataUrl: verification.qrCode.dataUrl,
          status: 'ready',
        });
      } catch (handoffError: any) {
        if (!cancelled) {
          setL2Handoff({
            requestId: '',
            qrCodeDataUrl: '',
            status: 'error',
            error: handoffError.message || 'Unable to create the mobile handoff.',
          });
        }
      }
    };

    initializeHandoff();
    return () => {
      cancelled = true;
    };
  }, [app?.name, flowStep, isMobileDevice, l2HandoffAttempt]);

  useEffect(() => {
    if (flowStep !== 'upgrade_l2_prompt' || isMobileDevice || !l2Handoff.requestId || l2Handoff.status === 'error') return;

    const poll = window.setInterval(async () => {
      try {
        const result = await apiService.get(`/api/v2/verification/${l2Handoff.requestId}/status`);
        if (result.verification?.status === 'completed') {
          window.clearInterval(poll);
          await checkEligibility();
        } else if (result.verification?.status === 'in_progress' || result.verification?.status === 'processing') {
          setL2Handoff(current => ({ ...current, status: 'scanning' }));
        }
      } catch {
        // The handoff can remain pending while the phone opens the verification link.
      }
    }, 1500);

    return () => window.clearInterval(poll);
  }, [checkEligibility, flowStep, isMobileDevice, l2Handoff.requestId, l2Handoff.status]);

  const returnError = (code: string, description: string) => {
    if (responseMode === 'web_message' && window.opener) {
      const redirectOrigin = new URL(redirectUri).origin;
      if (responseOrigin === redirectOrigin) {
        window.opener.postMessage({
          type: 'casperid:authorization',
          error: code,
          error_description: description,
          state,
        }, responseOrigin);
        window.close();
        return;
      }
    }
    window.location.assign(appendAuthorizationResult(redirectUri, {
      error: code,
      error_description: description,
      state,
    }));
  };

  const completeAuthorization = async () => {
    setError('');
    setFlowStep('authorizing');
    try {
      const result = await apiService.completeOAuthAuthorization({
        client_id: clientId,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        selected_context_did: selectedContextId === 'master' ? undefined : selectedContextId,
      });

      if (responseMode === 'web_message' && window.opener) {
        const redirectOrigin = new URL(redirectUri).origin;
        if (responseOrigin !== redirectOrigin) {
          throw new Error('Authorization response origin does not match the registered redirect URI.');
        }
        window.opener.postMessage({
          type: 'casperid:authorization',
          code: result.code,
          state,
          authorizationStatus: result.authorization_status,
          verificationStatus: result.verification_status,
          grantedTier: result.granted_tier,
          requiredTier: result.required_tier,
          sharedFields: result.shared_fields,
          selectedContext: result.selected_context,
        }, responseOrigin);
        window.close();
        return;
      }

      window.location.assign(appendAuthorizationResult(redirectUri, {
        code: result.code,
        state,
        authorization_status: result.authorization_status,
        verification_status: result.verification_status,
        granted_tier: result.granted_tier,
        required_tier: result.required_tier,
        shared_fields: Array.isArray(result.shared_fields) ? result.shared_fields.join(',') : '',
        selected_context_type: result.selected_context?.type || '',
        selected_context_did: result.selected_context?.did || '',
        selected_context_alias: result.selected_context?.alias || '',
        selected_context_name: result.selected_context?.name || '',
        selected_context_category: result.selected_context?.context || '',
      }));
    } catch (authorizationError: any) {
      setError(authorizationError.message || 'Authorization failed.');
      setFlowStep('error');
    }
  };

  const startRecovery = useCallback(async (nextEmail: string) => {
    try {
      setError('');
      const response = await apiService.sendRecoveryOTP(nextEmail);
      setEmail(nextEmail);
      setVerificationId(response.verificationId);
      setFlowStep('recover_otp');
    } catch (recoveryError: any) {
      setError(recoveryError.message || 'Failed to start account recovery.');
      setFlowStep('error');
    }
  }, []);

  const theme = app?.theme;
  const themeStyle = {
    '--casperid-primary': theme?.primaryColor || '#8651e1',
    '--casperid-radius': `${theme?.borderRadius || '12'}px`,
    fontFamily: theme?.fontFamily || 'Inter',
  } as React.CSSProperties;

  if (flowStep === 'validating' || authLoading) {
    return <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center text-primary font-bold">Loading CasperID...</div>;
  }

  return (
    <div style={themeStyle} className={`casperid-hosted-flow ${theme?.mode === 'dark' ? 'dark' : ''}`}>
      {flowStep === 'signin' && app && (
        <AuthEntry
          appName={app.name}
          appLogo={app.logo_url}
          onEmailSubmit={(nextEmail, nextVerificationId) => {
            setEmail(nextEmail);
            setVerificationId(nextVerificationId);
            setFlowStep('verify_otp');
          }}
          onReturningUser={() => {
            setFlowStep('checking_tier');
          }}
          onBiometricLogin={async (nextEmail) => {
            try {
              await login(nextEmail);
              setFlowStep('checking_tier');
            } catch (loginError: any) {
              if (nextEmail && isRecoverablePasskeyFailure(loginError)) {
                setEmail(nextEmail);
                setRecoveryNotice('This device does not have a passkey for your CasperID account. Verify your email to add this device.');
                setFlowStep('recover_prompt');
                return;
              }

              setError(loginError.message || 'Passkey sign-in failed.');
              setFlowStep('error');
            }
          }}
          onRecoverAccount={startRecovery}
        />
      )}

      {flowStep === 'recover_prompt' && (
        <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-[32px] border border-amber-100 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <span className="material-symbols-outlined text-3xl">phonelink_lock</span>
            </div>
            <h1 className="mt-5 text-2xl font-black text-text-main">Add a passkey on this device</h1>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-text-sub">
              {recoveryNotice || 'This device does not have a passkey for your CasperID account. Verify your email to add this device.'}
            </p>
            <button
              onClick={() => startRecovery(email)}
              className="mt-6 h-12 w-full rounded-xl bg-primary font-black text-white"
            >
              Continue with email recovery
            </button>
            <button
              onClick={() => setFlowStep('signin')}
              className="mt-3 h-11 w-full rounded-xl font-bold text-text-sub hover:bg-gray-50"
            >
              Try existing passkey again
            </button>
          </div>
        </div>
      )}

      {flowStep === 'verify_otp' && (
        <OTPVerify
          email={email}
          verificationId={verificationId}
          onBack={() => setFlowStep('signin')}
          onSuccess={(response) => {
            setEmail(response.email);
            setFlowStep('register_passkey');
          }}
        />
      )}

      {flowStep === 'recover_otp' && (
        <OTPVerify
          email={email}
          verificationId={verificationId}
          title="Recover Your Account"
          description={`We sent a 6-digit recovery code to ${email}`}
          backLabel="Back to Sign In"
          successLabel="Verify & Recover"
          errorTitle="Recovery Failed"
          onVerifyCode={(nextVerificationId, otp) => apiService.verifyRecoveryOTP(nextVerificationId, otp)}
          onBack={() => setFlowStep('signin')}
          onSuccess={(response) => {
            setEmail(response.email || email);
            setRecoveryToken(response.recoveryToken);
            setFlowStep('recover_passkey');
          }}
        />
      )}

      {flowStep === 'register_passkey' && (
        <OnboardingStart
          email={email}
          onContinue={() => setFlowStep('onboarding')}
          onLogin={() => setFlowStep('signin')}
        />
      )}

      {flowStep === 'recover_passkey' && (
        <OnboardingStart
          email={email}
          mode="recovery"
          recoveryToken={recoveryToken}
          onContinue={checkEligibility}
          onLogin={() => setFlowStep('signin')}
        />
      )}

      {flowStep === 'onboarding' && (
        <OnboardingProgress email={email} onComplete={checkEligibility} />
      )}

      {flowStep === 'upgrade_l2_prompt' && app && (
        <VerificationRequirementPrompt
          app={app}
          layer="Layer 2"
          description="To continue, complete a short liveness check that confirms you are a real person."
          requirements={[
            'Use your phone camera for the liveness check',
            'Follow the blink and face-positioning instructions',
            'No identity document is required',
          ]}
          onContinue={() => setFlowStep('upgrade_l2')}
          onCancel={() => returnError('access_denied', 'The required Layer 2 verification was not completed.')}
          desktopHandoff={!isMobileDevice ? {
            qrCodeDataUrl: l2Handoff.qrCodeDataUrl,
            status: l2Handoff.status,
            error: l2Handoff.error,
            onRetry: () => setL2HandoffAttempt(attempt => attempt + 1),
          } : undefined}
        />
      )}

      {flowStep === 'upgrade_l2' && (
        <LivenessCheck
          layer={2}
          onBack={() => setFlowStep('upgrade_l2_prompt')}
          onComplete={checkEligibility}
        />
      )}

      {flowStep === 'upgrade_l3_prompt' && app && (
        <VerificationRequirementPrompt
          app={app}
          layer="Layer 3"
          description="To continue, submit your identity details and complete the required verification steps."
          requirements={[
            'Provide an accepted government identity document',
            'Complete the required liveness confirmation',
            'Your submission may require review before final approval',
          ]}
          onContinue={() => setFlowStep('upgrade_l3')}
          onCancel={() => returnError('access_denied', 'The required Layer 3 verification was not completed.')}
        />
      )}

      {flowStep === 'upgrade_l3' && (
        <div className="min-h-screen bg-[#F8F9FF] px-4 py-6 sm:px-6 md:p-8">
          <KYCHome
            initialStep="layer3_context"
            onExit={() => returnError('access_denied', 'The required Layer 3 verification was not completed.')}
            onLayer3Submitted={checkEligibility}
          />
        </div>
      )}

      {flowStep === 'consent' && app && (
        <div className="min-h-screen bg-[#F8F9FF] px-4 py-5 sm:px-6 sm:py-6">
          {authorizationStatus === 'provisional' && (
            <div className="mx-auto mb-4 max-w-[600px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 md:p-4 text-sm font-semibold leading-relaxed text-amber-900">
              Your Layer 3 review is pending. You can continue to {app.name} now while CasperID completes the review. Your current status remains {tierLabels[currentTier]} until final approval.
            </div>
          )}
          <ConsentRequest
            appName={app.name}
            appLogo={app.logo_url}
            requestedScopes={app.requested_scopes}
            sharedFields={sharedFields}
            contextOptions={contextOptions}
            selectedContextId={selectedContextId}
            onSelectContext={setSelectedContextId}
            approveLabel={`Continue to ${app.name}`}
            denyLabel="Cancel"
            onApprove={completeAuthorization}
            onDeny={() => returnError('access_denied', 'The user canceled this authorization request.')}
          />
        </div>
      )}

      {(flowStep === 'checking_tier' || flowStep === 'authorizing') && (
        <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center gap-4 text-center">
          <Logo showName={false} className="scale-[1.5]" />
          <p className="font-black text-text-main">{flowStep === 'authorizing' ? 'Authorizing application...' : 'Checking verification status...'}</p>
        </div>
      )}

      {flowStep === 'error' && (
        <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-xl">
            <h1 className="text-2xl font-black text-text-main">Authorization could not continue</h1>
            <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
            {isAuthenticated && app && (
              <button onClick={checkEligibility} className="mt-6 h-12 w-full rounded-xl bg-primary font-black text-white">Try again</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostedAuthorize;
