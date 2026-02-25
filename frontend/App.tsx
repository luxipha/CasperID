import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileNavigationDrawer } from './components/MobileNavigationDrawer';
import { BottomNav } from './components/BottomNav';
import { IdentityStatusCard, ReusableKYCCard, TrustScoreCard } from './components/DashboardCards';
import { ConnectedPlatforms } from './components/ConnectedPlatforms';
import { ReusableTools } from './components/ReusableTools';
import { HumanFirstIdentity } from './components/HumanFirstIdentity';
import { RecentActivity } from './components/RecentActivity';
import { Integrations } from './components/Integrations';
import { DataControls } from './components/DataControls';
import { ActivityLog } from './components/ActivityLog';
import { ActivityDetails } from './components/ActivityDetails';
import { Settings } from './components/Settings';
import { DIDManagement } from './components/DIDManagement';
import NameManagement from './components/NameManagement';
import { RegisterCID } from './components/RegisterCID';
import { ManageDID } from './components/ManageDID';
import { ExportDID } from './components/ExportDID';
import { ImportDID } from './components/ImportDID';
import { MasterIdentitySettings } from './components/MasterIdentitySettings';
import { Profile } from './components/Profile';
import { KYCHome } from './components/KYCHome';
import { CredentialVault } from './components/CredentialVault';
import { ConsentRequestModal } from './components/ui/ConsentRequestModal';
import { DIDDetailsModal } from './components/ui/DIDDetailsModal';
import { CreatePersonaModal } from './components/ui/CreatePersonaModal';
import { ConnectWalletModal } from './components/ui/ConnectWalletModal';
import { QuickActionsRail } from './components/ui/QuickActionsRail';
import { AuthEntry } from './components/AuthEntry';
import { OTPVerify } from './components/OTPVerify';
import { OnboardingStart } from './components/OnboardingStart';
import { OnboardingProgress } from './components/OnboardingProgress';
import { MobilePasskeyHandoff } from './components/onboarding/MobilePasskeyHandoff';
import { RegisterCIDPromptModal } from './components/RegisterCidPromptModal';
import { CrossDevicePairing } from './components/CrossDevicePairing';
import { PostOnboardingBanner } from './components/initialization';
import { VerificationLevelBanner } from './components/VerificationLevelBanner';
import { MobileLinkingPage } from './components/mobile/mobileLinking';
import { MobilePasskeyCapture } from './components/mobile/MobilePasskeyCapture';
import { AppLoadingSplash } from './components/AppLoadingSplash';
import { BusinessPlatform } from './business/BusinessPlatform';
import { PublicProfileContainer } from './components/PublicProfileContainer';
import { VerifyCredentialPage } from './components/VerifyCredentialPage';
import { QRScannerModal } from './components/QRScannerModal';
import { useAuth } from './contexts/AuthContext';
// ApiTest removed - was for debugging
// import { ApiTest } from './components/ApiTest';
import LandingPage from './components/landing/LandingPage';
import CareersPage from './components/landing/CareerPage';
import CareerDetailPage from './components/landing/CareerDetailPage';
import ApplySuccessPage from './components/landing/ApplySuccess';
import AffiliatePage from './components/landing/AffiliatePage';
import ChangelogPage from './components/landing/casperos/changelog';
import AdminPage from './admin/page';

const PublicProfileContainerWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return slug ? <PublicProfileContainer walletOrUsername={slug} /> : null;
};

const PRouteRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/profile/${slug}`} replace />;
};

const App: React.FC = () => {
  /* 
     ROUTING LOGIC
     We check the URL path to determine if we are visiting a specific page (like a public profile).
     System paths (dashboard, internal pages) are ignored here and handled by Auth check below.
  */
  // Check if a path is a reserved system path and should NOT be treated as a public profile
  const isReservedPath = (path: string) => {
    const sysPaths = ['/', '/admin', '/pair', '/dashboard', '/login', '/auth', '/settings', '/integrations', '/verify', '/mobile', '/null', '/business', '/anra', '/adevaros', '/casperos', '/careers', '/apply-success', '/affiliate', '/profile', '/p'];
    const p = path.toLowerCase();
    return sysPaths.includes(p) || p.startsWith('/verify/') || p.startsWith('/mobile/') || p.startsWith('/business/') || p.startsWith('/careers/') || p.startsWith('/profile/') || p.startsWith('/p/') || p === '/null';
  };

  const location = useLocation();
  const navigate = useNavigate();

  const getInitialView = () => {
    const path = location.pathname;

    // Check for explicit system routes
    if (path === '/') return 'landing';
    if (path === '/anra' || path === '/adevaros' || path === '/casperos') return 'landing';
    if (path === '/admin') return 'admin';
    if (path === '/pair' || path === '/dashboard') return 'dashboard-home';
    if (path === '/careers' || path.startsWith('/careers/')) return 'careers';
    if (path === '/apply-success') return 'apply-success';
    if (path === '/affiliate') return 'affiliate';
    if (path === '/profile' || path.startsWith('/profile/')) return 'public-profile';

    // Check for credential verification route
    if (path.startsWith('/verify/')) return 'verify-credential';

    // Check for vanity verification route: e.g. /alice.cid/verify/hash
    if (path.match(/^\/([^\/]+)\/verify\/([^\/]+)$/)) return 'verify-credential';

    // If path has content and IS NOT a reserved system path, assume it is a public profile
    if (path.length > 1 && !isReservedPath(path)) {
      return 'public-profile';
    }

    return 'landing'; // Default to landing for root or unknown
  };

  const [currentView, setCurrentView] = useState('loading'); // Initialize with loading
  const [publicProfileSlug, setPublicProfileSlug] = useState<string | null>(() => {
    const path = window.location.pathname;
    const slug = path.startsWith('/profile/') ? path.replace('/profile/', '') : path.substring(1);
    return (path.length > 1 && !isReservedPath(path) && slug !== 'null' && slug !== 'undefined') ? slug : null;
  });
  const [credentialHash, setCredentialHash] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verify/')) return path.replace('/verify/', '');
    const match = path.match(/^\/([^\/]+)\/verify\/([^\/]+)$/);
    return match ? match[2] : null;
  });

  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isDIDDetailsModalOpen, setIsDIDDetailsModalOpen] = useState(false);
  const [selectedIdentityName, setSelectedIdentityName] = useState<string | undefined>(undefined);
  const [showPostOnboardingBanner, setShowPostOnboardingBanner] = useState(false);
  const [showRegisterCIDPrompt, setShowRegisterCIDPrompt] = useState(false);
  const [isConnectWalletOpen, setIsConnectWalletOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    const handleOpenWallet = () => setIsConnectWalletOpen(true);
    window.addEventListener('openConnectWallet', handleOpenWallet);
    return () => window.removeEventListener('openConnectWallet', handleOpenWallet);
  }, []);

  // Synchronize currentView with URL on initial load and navigation
  useEffect(() => {
    if (isLoading) return;

    const initialView = getInitialView();
    if (initialView === 'dashboard-home') {
      // If on dashboard path, we let the auth effect handle it or default to overview
      if (isAuthenticated && user) {
        setCurrentView('overview');
      } else {
        setCurrentView('auth-entry');
      }
    } else {
      setCurrentView(initialView);
    }

    // Update slugs/hashes based on URL
    const path = location.pathname;
    const slug = path.substring(1);
    if (path.length > 1 && !isReservedPath(path) && slug !== 'null' && slug !== 'undefined') {
      const actualSlug = path.startsWith('/profile/') ? path.replace('/profile/', '') : slug;
      setPublicProfileSlug(actualSlug);
    }
    if (path.startsWith('/verify/')) {
      setCredentialHash(path.replace('/verify/', ''));
    } else {
      const match = path.match(/^\/([^\/]+)\/verify\/([^\/]+)$/);
      if (match) setCredentialHash(match[2]);
    }
  }, [location.pathname, isLoading]);

  // Toggle Crisp chat visibility on mobile after login
  useEffect(() => {
    // Only run if Crisp is loaded
    const crisp = (window as any).$crisp;
    if (crisp) {
      const isMobile = window.innerWidth < 768; // Standard mobile breakpoint
      // User specifically requested to remove chat support on mobile after login
      if (user && isMobile) {
        crisp.push(["do", "chat:hide"]);
      } else {
        crisp.push(["do", "chat:show"]);
      }
    }
  }, [user]);

  // Set initial view based on authentication and completion state
  React.useEffect(() => {
    if (isLoading) return;

    // If we are viewing a public profile, landing page, or credential verification, DO NOT redirect based on auth
    if (['public-profile', 'landing', 'admin', 'verify-credential'].includes(currentView)) {
      return;
    }

    if (!isLoading) {
      if (isAuthenticated && user) {
        // Only redirect to overview if we're currently in an auth-related view or loading
        const isAuthView = ['auth-entry', 'otp-verify', 'onboarding-start', 'pairing', 'loading', 'handoff'].includes(currentView);

        if (isAuthView) {
          if (user.wallet && user.human_id) {
            setCurrentView('overview');
          } else if (user.wallet) {
            setCurrentView('overview');
          } else {
            setCurrentView('onboarding-progress');
          }
        }
      } else {
        // New user - start with email entry
        const isDashboardView = !['landing', 'public-profile', 'verify-credential', 'auth-entry', 'otp-verify', 'onboarding-start', 'onboarding-progress', 'pairing', 'loading', 'handoff'].includes(currentView);
        if (isDashboardView) {
          setCurrentView('auth-entry');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, currentView]);

  useEffect(() => {
    const handleOpenKYC = () => {
      setCurrentView('kyc');
      setIsPersonaModalOpen(false); // Close modal if open
    };
    window.addEventListener('openKYC', handleOpenKYC);
    return () => window.removeEventListener('openKYC', handleOpenKYC);
  }, []);

  const handleViewActivityDetail = useCallback((id: string) => {
    setSelectedActivityId(id);
    setCurrentView('activity-detail');
  }, []);

  const handleFinishOnboarding = useCallback(() => {
    setCurrentView('overview');
    // Show the post-onboarding banner which will handle MetaMask check
    setShowPostOnboardingBanner(true);
  }, []);

  const handleBackToAuth = useCallback(() => {
    setCurrentView('auth-entry');
  }, []);

  const handleToOverview = useCallback(() => {
    setCurrentView('overview');
  }, []);

  const handleStartOnboarding = useCallback((email: string) => {
    setOnboardingEmail(email);
    setCurrentView('onboarding-progress');
  }, []);

  const handleVerificationSuccess = useCallback((email: string) => {
    setOnboardingEmail(email);
    setCurrentView('onboarding-start');
  }, []);

  const handleEmailSubmit = useCallback((email: string, vid: string) => {
    setOnboardingEmail(email);
    setVerificationId(vid);
    setCurrentView('otp-verify');
  }, []);

  const handleBiometricLogin = useCallback((email: string) => {
    if (email) {
      setOnboardingEmail(email);
      setCurrentView('handoff');
    } else {
      setCurrentView('overview');
    }
  }, []);

  const handleVerificationUpgrade = useCallback((nextLevel: 'layer_1' | 'layer_2' | 'layer_3') => {
    switch (nextLevel) {
      case 'layer_1':
        // Navigate to email verification flow
        // TODO: Implement email verification flow
        break;
      case 'layer_2':
        // Navigate to liveness check
        setCurrentView('kyc'); // Assuming KYC component handles liveness
        break;
      case 'layer_3':
        // Navigate to full KYC
        setCurrentView('kyc');
        break;
    }
  }, []);

  const renderContent = () => {
    // Check if this is a mobile passkey registration or login URL
    if (window.location.pathname.startsWith('/mobile/register/') || window.location.pathname.startsWith('/mobile/login/')) {
      return <MobilePasskeyCapture />;
    }

    // Check if this is a mobile pairing URL
    if (window.location.pathname === '/pair' || window.location.search.includes('data=')) {
      return (
        <MobileLinkingPage
          onComplete={() => {
            // Show success message and optionally redirect
            alert('Account created successfully! You can now return to your desktop.');
          }}
          onCancel={() => {
            window.history.back();
          }}
        />
      );
    }

    switch (currentView) {
      case 'loading':
        return <AppLoadingSplash />;
      case 'auth-entry':
        return (
          <AuthEntry
            onEmailSubmit={handleEmailSubmit}
            onReturningUser={handleToOverview}
            onBiometricLogin={handleBiometricLogin}
          />
        );
      case 'otp-verify':
        return (
          <OTPVerify
            email={onboardingEmail}
            verificationId={verificationId}
            onSuccess={handleVerificationSuccess}
            onBack={handleBackToAuth}
          />
        );
      case 'onboarding-start':
        return (
          <OnboardingStart
            email={onboardingEmail}
            onContinue={handleStartOnboarding}
            onLogin={handleToOverview}
          />
        );
      case 'handoff':
        return (
          <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[540px] bg-white rounded-[44px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.12)] overflow-hidden">
              <MobilePasskeyHandoff
                email={onboardingEmail}
                type="login"
                onComplete={handleToOverview}
                onBack={handleBackToAuth}
              />
            </div>
          </div>
        );
      case 'pairing':
        return (
          <CrossDevicePairing
            onBack={() => setCurrentView('onboarding-start')}
            onPaired={handleStartOnboarding}
          />
        );
      case 'onboarding-progress':
        return (
          <OnboardingProgress
            email={onboardingEmail}
            onComplete={handleFinishOnboarding}
          />
        );
      case 'integrations':
        return <Integrations />;
      case 'data':
        return <DataControls />;
      case 'activity':
        return <ActivityLog onViewDetail={handleViewActivityDetail} />;
      case 'activity-detail':
        return selectedActivityId ? (
          <ActivityDetails
            activityId={selectedActivityId}
            onBack={() => setCurrentView('activity')}
          />
        ) : (
          <div>Loading...</div>
        );
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      case 'kyc':
        return <KYCHome />;
      case 'credentials':
        return <CredentialVault />;
      case 'did-management':
        return (
          <DIDManagement
            onCreateNew={() => setIsPersonaModalOpen(true)}
            onManageDID={(id) => {
              setSelectedIdentityName(id);
              setIsDIDDetailsModalOpen(true);
            }}
            onExportKeys={() => setCurrentView('did-export')}
            onImportDID={() => setCurrentView('did-import')}
            onConfigureIdentity={() => setCurrentView('master-identity-settings')}
          />
        );
      case 'names':
        return <RegisterCID onBack={() => setCurrentView('overview')} />;
      case 'register-cid':
        return <RegisterCID onBack={() => setCurrentView('overview')} />;
      case 'did-create':
        // Redirect to DID Management if somehow reached
        setCurrentView('did-management');
        return null;
      case 'did-manage':
        return <ManageDID onBack={() => setCurrentView('did-management')} />;
      case 'did-export':
        return <ExportDID onBack={() => setCurrentView('did-management')} />;
      case 'did-import':
        return <ImportDID onBack={() => setCurrentView('did-management')} />;
      case 'master-identity-settings':
        return (
          <MasterIdentitySettings
            onBack={() => setCurrentView('did-management')}
            onViewDIDDetails={(name) => {
              setSelectedIdentityName(name);
              setIsDIDDetailsModalOpen(true);
            }}
            onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          />
        );
      case 'public-profile':
        return publicProfileSlug ? <PublicProfileContainer walletOrUsername={publicProfileSlug} /> : <div>Invalid Profile</div>;
      case 'verify-credential':
        return credentialHash ? <VerifyCredentialPage credentialHash={credentialHash} /> : <div>Invalid Credential</div>;
      case 'admin':
        return <AdminPage />;
      case 'careers':
        return (
          <CareersPage
            onJobClick={(slug) => navigate(`/careers/${slug}`)}
          />
        );
      case 'career-detail':
        return (
          <CareerDetailPage
            onBack={() => navigate('/careers')}
            onApplySuccess={() => navigate('/apply-success')}
          />
        );
      case 'apply-success':
        return <ApplySuccessPage onReturnToCareers={() => navigate('/careers')} />;
      case 'affiliate':
        return <AffiliatePage />;
      case 'landing':
        return <LandingPage />;
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Post-Onboarding Banner */}
            {showPostOnboardingBanner && (
              <PostOnboardingBanner
                onComplete={() => {
                  setShowPostOnboardingBanner(false);
                  setShowRegisterCIDPrompt(true);
                }}
              />
            )}

            {/* Verification Level Banner */}
            {user && user.tier && (
              <VerificationLevelBanner
                userLevel={user.tier}
                onUpgrade={handleVerificationUpgrade}
              />
            )}

            {/* Desktop Welcome Section */}
            <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-[32px] font-extrabold text-text-main tracking-tight leading-none">
                    Welcome back, {user?.display_name || 'User'}
                  </h2>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border ${user?.tier === 'layer_3'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : user?.tier === 'layer_2'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                    <span className="material-symbols-outlined text-sm icon-filled">shield</span>
                    {user?.tier === 'layer_3'
                      ? 'Full KYC'
                      : user?.tier === 'layer_2'
                        ? 'Liveness Verified'
                        : 'Basic Verified'}
                  </span>
                </div>
                <p className="text-text-sub font-medium text-lg">Manage your reusable identity across Web2 and Web3.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConsentModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-text-main font-bold text-sm rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl">login</span>
                  Consent Demo
                </button>
                <button className="flex items-center gap-2 px-6 py-3.5 bg-black text-white font-bold text-sm rounded-2xl transition-all shadow-lg active:scale-95">
                  <span className="material-symbols-outlined text-xl">fingerprint</span>
                  Login with Casper
                </button>
              </div>
            </div>

            {/* Core Identity Cards - Redesigned Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <IdentityStatusCard />
              <ReusableKYCCard />
              <TrustScoreCard />
            </div>

            {/* Tools & Platforms */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ConnectedPlatforms onAddNew={() => setCurrentView('integrations')} />
              </div>
              <div className="flex flex-col gap-8">
                <ReusableTools />
                <HumanFirstIdentity onNavigate={setCurrentView} />
              </div>
            </div>

            {/* Desktop Activity Log Summary */}
            <div className="hidden md:block">
              <RecentActivity />
            </div>
          </div>
        );
    }
  };

  const activeSidebarTab = (currentView === 'did-create' || currentView === 'did-manage' || currentView === 'did-export' || currentView === 'did-import')
    ? 'did-management'
    : currentView;

  // Don't show layout chrome during onboarding, public profile view, landing, admin, or credential verification
  const isOnboarding = currentView === 'public-profile' || currentView === 'landing' || currentView === 'admin' || currentView === 'verify-credential' || currentView === 'auth-entry' || currentView === 'otp-verify' || currentView === 'onboarding-start' || currentView === 'onboarding-progress' || currentView === 'pairing' || currentView === 'handoff' || currentView.startsWith('business');

  if (isLoading) {
    return <AppLoadingSplash />;
  }

  return (
    <>
      <Routes>
        <Route path="/anra" element={<LandingPage initialView="anra" />} />
        <Route path="/adevaros" element={<Navigate to="/anra" replace />} />
        <Route path="/casperos" element={<Navigate to="/anra" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/business/*" element={<BusinessPlatform />} />
        <Route path="/careers" element={<CareersPage onJobClick={(slug) => navigate(`/careers/${slug}`)} />} />
        <Route path="/careers/:id" element={<CareerDetailPage onBack={() => navigate('/careers')} onApplySuccess={(jobTitle) => navigate('/apply-success', { state: { jobTitle } })} />} />
        <Route path="/apply-success" element={<ApplySuccessPage onReturnToCareers={() => navigate('/careers')} />} />
        <Route path="/affiliate" element={<AffiliatePage />} />
        <Route path="/profile/:slug" element={<PublicProfileContainerWrapper />} />
        <Route path="/p/:slug" element={<PRouteRedirect />} />

        {/* Dashboard Route - must be before /:slug catch-all */}
        <Route path="/dashboard" element={
          <div className="flex min-h-screen bg-bg-light font-sans selection:bg-primary/20">
            {!isOnboarding ? (
              <>
                <Sidebar currentView={activeSidebarTab} onNavigate={setCurrentView} />
                <QuickActionsRail
                  onCreatePersona={() => setIsPersonaModalOpen(true)}
                  onConnectWallet={() => setIsConnectWalletOpen(true)}
                  onRegisterCID={() => setCurrentView('register-cid')}
                  onImportDID={() => setCurrentView('did-import')}
                  onNavigate={setCurrentView}
                />
                <div className="flex-1 md:pl-64 flex flex-col min-w-0">
                  <div className="hidden md:block">
                    <Header />
                  </div>
                  <MobileHeader
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    onOpenDrawer={() => setIsMobileDrawerOpen(true)}
                    onOpenScanner={() => setIsScannerOpen(true)}
                  />
                  <main className="flex-1 px-5 md:px-10 py-6 md:py-10 overflow-y-auto pb-32">
                    <div className="max-w-md mx-auto md:max-w-7xl">
                      {renderContent()}
                    </div>
                  </main>
                </div>
                <BottomNav currentView={currentView} onNavigate={setCurrentView} />
              </>
            ) : (
              <main className="bg-bg-light min-h-screen w-full">{renderContent()}</main>
            )}
          </div>
        } />

        <Route path="/:slug" element={
          !isReservedPath(location.pathname) ? (
            <PublicProfileContainer walletOrUsername={location.pathname.substring(1)} />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Main App Dashboard / Catch-all for reserved paths */}
        <Route path="*" element={
          <div className="flex min-h-screen bg-bg-light font-sans selection:bg-primary/20">
            {/* Dashboard Chrome logic here - but for now we renderContent based on currentView */}
            {!isOnboarding ? (
              <>
                {/* Desktop Sidebar */}
                <Sidebar currentView={activeSidebarTab} onNavigate={setCurrentView} />

                {/* Quick Actions Rail - Only visible on large screens */}
                <QuickActionsRail
                  onCreatePersona={() => setIsPersonaModalOpen(true)}
                  onConnectWallet={() => setIsConnectWalletOpen(true)}
                  onRegisterCID={() => setCurrentView('register-cid')}
                  onImportDID={() => setCurrentView('did-import')}
                  onNavigate={setCurrentView}
                />

                <div className="flex-1 md:pl-64 flex flex-col min-w-0">
                  {/* Responsive Headers */}
                  <div className="hidden md:block">
                    <Header />
                  </div>
                  <MobileHeader
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    onOpenDrawer={() => setIsMobileDrawerOpen(true)}
                    onOpenScanner={() => setIsScannerOpen(true)}
                  />

                  <main className="flex-1 px-5 md:px-10 py-6 md:py-10 overflow-y-auto pb-32">
                    <div className="max-w-md mx-auto md:max-w-7xl">
                      {renderContent()}
                    </div>
                  </main>
                </div>

                <BottomNav currentView={currentView} onNavigate={setCurrentView} />
              </>
            ) : (
              <main className="bg-bg-light min-h-screen w-full">{renderContent()}</main>
            )}
          </div>
        } />
      </Routes>

      {/* Modal Components */}
      <ConsentRequestModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        appName="CasperSwap"
        appLogo="https://casperswap.xyz/logo.png"
        onApprove={() => {
          setIsConsentModalOpen(false);
        }}
        onDeny={() => {
          setIsConsentModalOpen(false);
        }}
      />

      <DIDDetailsModal
        isOpen={isDIDDetailsModalOpen}
        onClose={() => setIsDIDDetailsModalOpen(false)}
        identityName={selectedIdentityName}
      />

      <CreatePersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        primaryIdentity={user?.cns_name || user?.human_id || 'Primary Identity'}
        userTier={user?.tier || 'layer_2'}
        onSubmit={() => {
          // Success handled within modal
        }}
      />

      <RegisterCIDPromptModal
        isOpen={showRegisterCIDPrompt}
        onClose={() => setShowRegisterCIDPrompt(false)}
        onRegister={() => {
          setShowRegisterCIDPrompt(false);
          setCurrentView('register-cid');
        }}
      />

      <ConnectWalletModal
        isOpen={isConnectWalletOpen}
        onClose={() => setIsConnectWalletOpen(false)}
        onWalletLinked={() => {
          // Wallet linked - could refresh user data here
        }}
      />

      <MobileNavigationDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </>
  );
};

export default App;
