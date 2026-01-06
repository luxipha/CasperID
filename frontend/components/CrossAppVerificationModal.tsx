
import React from 'react';

interface CrossAppVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export const CrossAppVerificationModal: React.FC<CrossAppVerificationModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-text-main/20 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-[540px] bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50"
        >
          <span className="material-symbols-outlined text-[28px]">close</span>
        </button>

        <div className="p-10 md:p-14 flex flex-col items-center text-center">
          {/* Wallet Icon */}
          <div className="size-24 rounded-[32px] bg-[#FFF4EB] flex items-center justify-center mb-10 shadow-sm border border-[#FFE4D1]">
             <div className="size-12 rounded-xl bg-[#FF8A00] flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-[32px] icon-filled">account_balance_wallet</span>
             </div>
          </div>

          <h2 className="text-[32px] font-black text-text-main leading-tight tracking-tight mb-5 px-4">
            Enable Cross-App Verification
          </h2>

          <p className="text-text-sub text-[17px] font-medium leading-relaxed max-w-sm mb-12">
            Connect MetaMask to manage your verification permissions across various apps. This lets other apps trust your CasperID without asking you to re-verify.
          </p>

          <div className="w-full space-y-6">
            <button 
              onClick={onConnect}
              className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Connect MetaMask
            </button>
            <button 
              onClick={onClose}
              className="text-text-sub hover:text-text-main font-bold text-[15px] transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8F9FB] border-t border-gray-50 p-6 flex items-center justify-center gap-2.5">
           <span className="material-symbols-outlined text-text-sub text-[18px]">lock</span>
           <p className="text-[11px] font-bold text-text-sub/70 leading-none">
             Your identity proofs are secured on Casper; MetaMask manages permissions only.
           </p>
        </div>
      </div>
    </div>
  );
};
