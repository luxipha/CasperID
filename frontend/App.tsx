
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
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
import { CreateDID } from './components/CreateDID';
import { ManageDID } from './components/ManageDID';
import { ExportDID } from './components/ExportDID';
import { ImportDID } from './components/ImportDID';
import { Profile } from './components/Profile';
import { KYCHome } from './components/KYCHome';
import { CredentialVault } from './components/CredentialVault';
import { ConsentRequestModal } from './components/ui/ConsentRequestModal';
import { AuthEntry } from './components/AuthEntry';
import { OTPVerify } from './components/OTPVerify';
import { OnboardingStart } from './components/OnboardingStart';
import { OnboardingProgress } from './components/OnboardingProgress';
import { CrossAppVerificationModal } from './components/CrossAppVerificationModal';
import { CrossDevicePairing } from './components/CrossDevicePairing';
import { PostOnboardingBanner } from './components/initialization';
import { VerificationLevelBanner } from './components/VerificationLevelBanner';
import { MobileLinkingPage } from './components/mobile/mobileLinking';
import { PublicProfileContainer } from './components/PublicProfileContainer';
import { useAuth } from './contexts/AuthContext';
import { ApiTest } from './components/ApiTest';
import LandingPage from './components/landing/LandingPage';
import AdminPage from './admin/page';

const App: React.FC = () => {
  /* 
     ROUTING LOGIC
     We check the URL path to determine if we are visiting a specific page (like a public profile).
     System paths (dashboard, internal pages) are ignored here and handled by Auth check below.
  */
  const getInitialView = () => {
    const path = window.location.pathname;

    // Check for explicit system routes to ignore or handle specific logic
    if (path === '/') return 'landing';
    if (path === '/admin') return 'admin';
    if (path === '/pair' || path === '/dashboard') return 'loading';

    // If path has content (e.g. /seme-kure), assume it is a public profile
    if (path.length > 1) {
      // Remove leading slash
      const slug = path.substring(1);
      return 'public-profile';
    }

    return 'landing'; // Default to landing for root or unknown
  };

  const [currentView, setCurrentView] = useState(getInitialView());
  const [publicProfileSlug, setPublicProfileSlug] = useState<string | null>(
    window.location.pathname.length > 1 && window.location.pathname !== '/pair' && window.location.pathname !== '/dashboard' ? window.location.pathname.substring(1) : null
  );

  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [showPostOnboardingBanner, setShowPostOnboardingBanner] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  // Set initial view based on authentication and completion state
  React.useEffect(() => {
    // If we are viewing a public profile or landing page, DO NOT redirect based on auth
    if (currentView === 'public-profile' || currentView === 'landing' || currentView === 'admin') return;

    if (!isLoading) {
      if (isAuthenticated && user) {
        // Only redirect to overview if we're currently in an auth-related view or loading
        const isAuthView = ['auth-entry', 'otp-verify', 'onboarding-start', 'onboarding-progress', 'pairing', 'loading'].includes(currentView);

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
        // If they are not authenticated, they should probably be at auth-entry
        // BUT we should avoid forcing it if they are on a public route (handled at start)
        const isDashboardView = !['landing', 'public-profile', 'auth-entry', 'otp-verify', 'onboarding-start', 'onboarding-progress', 'pairing'].includes(currentView);
        if (isDashboardView) {
          setCurrentView('auth-entry');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, currentView]);

  const handleViewActivityDetail = (id: string) => {
    setSelectedActivityId(id);
    setCurrentView('activity-detail');
  };

  const handleFinishOnboarding = () => {
    setCurrentView('overview');
    // Show the post-onboarding banner which will handle MetaMask check
    setShowPostOnboardingBanner(true);
  };

  const handleVerificationUpgrade = (nextLevel: 'layer_1' | 'layer_2' | 'layer_3') => {
    console.log(`🔼 User wants to upgrade to ${nextLevel}`);

    switch (nextLevel) {
      case 'layer_1':
        // Navigate to email verification flow
        console.log('📧 Redirecting to email verification...');
        // TODO: Implement email verification flow
        break;
      case 'layer_2':
        // Navigate to liveness check
        console.log('👁️ Redirecting to liveness verification...');
        setCurrentView('kyc'); // Assuming KYC component handles liveness
        break;
      case 'layer_3':
        // Navigate to full KYC
        console.log('🆔 Redirecting to full KYC verification...');
        setCurrentView('kyc');
        break;
    }
  };

  const renderContent = () => {
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
        return (
          <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-text-sub font-medium">Loading CasperID...</p>
            </div>
          </div>
        );
      case 'auth-entry':
        return (
          <AuthEntry
            onEmailSubmit={(email, verificationId) => {
              setOnboardingEmail(email);
              setVerificationId(verificationId);
              setCurrentView('otp-verify');
            }}
            onReturningUser={(email) => {
              setCurrentView('overview');
            }}
            onBiometricLogin={() => setCurrentView('overview')}
          />
        );
      case 'otp-verify':
        return (
          <OTPVerify
            email={onboardingEmail}
            verificationId={verificationId}
            onSuccess={(email) => {
              setOnboardingEmail(email);
              setCurrentView('onboarding-start');
            }}
            onBack={() => setCurrentView('auth-entry')}
          />
        );
      case 'onboarding-start':
        return (
          <OnboardingStart
            email={onboardingEmail}
            onContinue={(email) => {
              setOnboardingEmail(email);
              setCurrentView('onboarding-progress');
            }}
            onLogin={() => setCurrentView('overview')}
          />
        );
      case 'pairing':
        return (
          <CrossDevicePairing
            onBack={() => setCurrentView('onboarding-start')}
            onPaired={(email) => {
              setOnboardingEmail(email);
              setCurrentView('onboarding-progress');
            }}
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
            onCreateNew={() => setCurrentView('did-create')}
            onManageDID={(id) => setCurrentView('did-manage')}
            onExportKeys={() => setCurrentView('did-export')}
            onImportDID={() => setCurrentView('did-import')}
          />
        );
      case 'did-create':
        return (
          <CreateDID
            onBack={() => setCurrentView('did-management')}
            onViewDetails={(id) => setCurrentView('did-manage')}
          />
        );
      case 'did-manage':
        return <ManageDID onBack={() => setCurrentView('did-management')} />;
      case 'did-export':
        return <ExportDID onBack={() => setCurrentView('did-management')} />;
      case 'did-import':
        return <ImportDID onBack={() => setCurrentView('did-management')} />;
      case 'public-profile':
        return publicProfileSlug ? <PublicProfileContainer walletOrUsername={publicProfileSlug} /> : <div>Invalid Profile</div>;
      case 'admin':
        return <AdminPage />;
      case 'landing':
        return <LandingPage />;
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Post-Onboarding Banner */}
            {showPostOnboardingBanner && (
              <PostOnboardingBanner
                onComplete={() => setShowPostOnboardingBanner(false)}
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
                <button className="flex items-center gap-2 px-6 py-3.5 bg-bg-dark text-white font-bold text-sm rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">
                  <img src="/logos/logo.svg" alt="CasperID" className="w-5 h-5 invert brightness-0" />
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
                <HumanFirstIdentity />
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

  // Don't show layout chrome during onboarding, public profile view, landing, or admin
  const isOnboarding = currentView === 'public-profile' || currentView === 'landing' || currentView === 'admin' || currentView === 'auth-entry' || currentView === 'otp-verify' || currentView === 'onboarding-start' || currentView === 'onboarding-progress' || currentView === 'pairing';

  if (isOnboarding) {
    return <main className="bg-bg-light min-h-screen">{renderContent()}</main>;
  }

  return (
    <div className="flex min-h-screen bg-bg-light font-sans selection:bg-primary/20">
      {/* Desktop Sidebar */}
      <Sidebar currentView={activeSidebarTab} onNavigate={setCurrentView} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Responsive Headers */}
        <Header />
        <MobileHeader />

        <main className="flex-1 px-5 md:px-10 py-6 md:py-10 overflow-y-auto pb-32">
          <div className="max-w-md mx-auto md:max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>

      <BottomNav currentView={currentView} onNavigate={setCurrentView} />

      {/* API Connection Test (development only) */}
      <ApiTest />

      {/* Consent Demo Modal */}
      <ConsentRequestModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        appName="Uniswap V4"
        appLogo="https://cryptologos.cc/logos/uniswap-uni-logo.png"
        onApprove={() => console.log('Consent approved')}
        onDeny={() => console.log('Consent denied')}
      />
    </div>
  );
};

export default App;
