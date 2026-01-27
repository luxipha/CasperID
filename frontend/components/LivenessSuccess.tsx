import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCasper } from '../contexts/casper-context';
import ConnectWalletModal from './ui/ConnectWalletModal';

interface LivenessSuccessProps {
  onDashboard: () => void;
  onCancel: () => void;
}

export const LivenessSuccess: React.FC<LivenessSuccessProps> = ({ onDashboard, onCancel }) => {
  const { refreshUser } = useAuth();
  const { connect } = useCasper();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletType, setWalletType] = useState<'evm' | 'casper' | undefined>(undefined);

  // Refresh user data when component mounts to ensure latest verification status
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        await refreshUser();
        console.log('✅ User data refreshed after Layer 2 completion');
      } catch (error) {
        console.error('❌ Failed to refresh user data:', error);
      }
    };

    refreshUserData();
  }, [refreshUser]);

  const handleConnect = async (walletName: string) => {
    if (walletName === 'Connect Casper Signer') {
      setWalletType('casper');
      setIsWalletModalOpen(true);
    } else {
      setWalletType('evm');
      setIsWalletModalOpen(true);
    }
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        {/* Top Breadcrumb-style indicator */}
        <div className="flex items-center gap-2 text-[13px] font-bold text-text-sub mb-8">
          <span>Verification</span>
          <span className="material-symbols-outlined text-sm opacity-40">chevron_right</span>
          <span className="text-primary">Layer 2 (Activated)</span>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-6"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Verification
        </button>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
            Layer 2 Activated: Liveness Confirmed!
          </h1>
        </div>

        {/* Page Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

          {/* Left: Success Confirmation Card */}
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 md:p-16 flex flex-col items-center text-center">

            {/* Success Icon */}
            <div className="size-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-8 relative">
              <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping duration-[3s]"></div>
              <div className="size-14 rounded-full bg-green-500 flex items-center justify-center text-white relative z-10 shadow-lg">
                <span className="material-symbols-outlined text-[32px] font-bold">check</span>
              </div>
            </div>

            <h2 className="text-3xl font-black text-text-main mb-4 tracking-tight">
              Your Layer 2 Identity is now active.
            </h2>
            <p className="text-text-sub text-lg font-medium leading-relaxed max-w-xl mb-12">
              Stronger Sybil resistance, new platform interactions, eligibility for Layer 3 (Full KYC).
            </p>

            {/* Wallet Section - Matched to screenshot */}
            <div className="w-full bg-[#F8F9FB] rounded-[32px] border border-gray-100 p-8 md:p-10 mb-12">
              <div className="text-left mb-8">
                <h3 className="text-lg font-black text-text-main mb-2">Want More Control? Link an External Wallet (Optional)</h3>
                <p className="text-text-sub text-sm font-medium">Connect a wallet to associate it with your CasperID for direct dApp interactions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Connect Casper Signer', icon: 'deployed_code' },
                  { name: 'Connect MetaMask', icon: 'extension' },
                  { name: 'Connect via WalletConnect', icon: 'qr_code_scanner' },
                  { name: 'Connect Ledger', icon: 'account_balance' }
                ].map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet.name)}
                    className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary/40 hover:shadow-md transition-all group text-left"
                  >
                    <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-text-sub group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[24px]">{wallet.icon}</span>
                    </div>
                    <span className="text-sm font-bold text-text-main leading-tight">{wallet.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-xs space-y-4">
              <button
                onClick={onDashboard}
                className="w-full h-16 bg-primary text-white rounded-[22px] font-black text-base shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
              <button
                onClick={onDashboard}
                className="w-full h-12 text-text-sub hover:text-text-main font-bold text-sm"
              >
                Skip for now
              </button>
            </div>
          </div>

          {/* Right: Verification Progress Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
              <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

              <div className="space-y-10 relative">
                {/* Vertical Stepper Line */}
                <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                  <div className="absolute top-0 left-0 w-full h-full bg-primary"></div>
                </div>

                {/* Step 1: Choose Method (Completed) */}
                <div className="flex gap-6 items-start relative z-10">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main leading-tight">Choose Method</span>
                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                  </div>
                </div>

                {/* Step 2: Liveness Check (Completed) */}
                <div className="flex gap-6 items-start relative z-10">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main leading-tight">Liveness Check</span>
                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Face scan verification</span>
                  </div>
                </div>

                {/* Step 3: Minting (Completed) */}
                <div className="flex gap-6 items-start relative z-10">
                  <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-text-main leading-tight">Minting</span>
                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Layer 2 Credential</span>
                  </div>
                </div>

                {/* Step 4: Success (Active) */}
                <div className="flex gap-6 items-start relative z-10">
                  <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-primary leading-tight">Success</span>
                    <span className="text-[11px] font-bold text-text-sub mt-0.5">Verified ID Activated</span>
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
        <div className="mt-12 flex justify-center">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
            Cancel Verification
          </button>
        </div>
      </div>

      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        initialWalletType={walletType}
        onClose={() => {
          setIsWalletModalOpen(false);
          setWalletType(undefined);
        }}
        onWalletLinked={(address, chain) => {
          console.log(`Successfully linked ${chain} wallet: ${address}`);
          setIsWalletModalOpen(false);
          setWalletType(undefined);
          refreshUser();
        }}
      />
    </>
  );
};

export default LivenessSuccess;
