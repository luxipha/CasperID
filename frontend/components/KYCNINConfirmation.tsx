import React from 'react';

interface NinIdentity {
  nin?: string;
  bvn?: string;
  account_number?: string;
  bank_code?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
  nationality?: string;
}

interface KYCNINConfirmationProps {
  identity: NinIdentity;
  identityMethod?: 'nimc' | 'bvn';
  onBack: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

export const KYCNINConfirmation: React.FC<KYCNINConfirmationProps> = ({
  identity,
  identityMethod = 'nimc',
  onBack,
  onContinue,
  onCancel
}) => {
  const fullName = identity.full_name || [identity.first_name, identity.middle_name, identity.last_name].filter(Boolean).join(' ');
  const isBvn = identityMethod === 'bvn';

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 md:pb-20">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-6"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back
      </button>

      <div className="mb-6 md:mb-10">
        <h1 className="text-[32px] md:text-[40px] font-black text-text-main tracking-tight leading-tight">
          Confirm Your Verified Identity
        </h1>
        <p className="text-text-sub text-base md:text-lg font-medium leading-relaxed max-w-3xl mt-2">
          We found this identity record from your {isBvn ? 'BVN' : 'NIN'}. Review it before continuing to the mandatory document upload step.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-10 space-y-6 md:space-y-8">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Identity Source</p>
              <h2 className="text-xl font-black text-text-main">Monnify {isBvn ? 'BVN' : 'NIN'} Verification</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Full Name</p>
              <p className="text-base font-bold text-text-main">{fullName || 'Not returned'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">{isBvn ? 'BVN' : 'NIN'}</p>
              <p className="text-base font-bold text-text-main">{isBvn ? identity.bvn : identity.nin}</p>
            </div>
            {isBvn && (
              <>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Account Number</p>
                  <p className="text-base font-bold text-text-main">{identity.account_number || 'Not returned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Bank Code</p>
                  <p className="text-base font-bold text-text-main">{identity.bank_code || 'Not returned'}</p>
                </div>
              </>
            )}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Date of Birth</p>
              <p className="text-base font-bold text-text-main">{identity.date_of_birth || 'Not returned'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Gender</p>
              <p className="text-base font-bold text-text-main">{identity.gender || 'Not returned'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Phone</p>
              <p className="text-base font-bold text-text-main">{identity.phone_number || 'Not returned'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Nationality</p>
              <p className="text-base font-bold text-text-main">{identity.nationality || 'Nigerian'}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest opacity-60">Address</p>
              <p className="text-base font-bold text-text-main">{identity.address || 'Not returned'}</p>
            </div>
          </div>

          <div className="rounded-[20px] border border-primary/10 bg-primary/5 p-5 text-sm font-medium text-text-sub leading-relaxed">
            You still need to upload a government ID. CasperID will compare the uploaded document against this verified {isBvn ? 'BVN-backed' : 'NIN'} record before final review.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onContinue}
              className="flex-1 h-14 bg-primary text-white rounded-[18px] font-black text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-primary/90 transition-all"
            >
              Continue to Document Upload
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              onClick={onBack}
              className="sm:w-[220px] h-14 border-2 border-gray-100 rounded-[18px] font-black text-sm text-text-main hover:bg-gray-50 transition-all"
            >
              Re-enter {isBvn ? 'BVN' : 'NIN'}
            </button>
          </div>
        </div>

        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>
            <div className="space-y-10 relative">
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                <div className="absolute top-0 left-0 w-full h-[50%] bg-primary"></div>
              </div>
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Enter {isBvn ? 'BVN' : 'NIN'}</span>
                  <span className="text-[11px] font-bold text-text-sub">Completed</span>
                </div>
              </div>
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary">Confirm Details</span>
                  <span className="text-[11px] font-bold text-text-sub">Review provider result</span>
                </div>
              </div>
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Upload Document</span>
                  <span className="text-[11px] font-bold text-text-sub">Mandatory supporting ID</span>
                </div>
              </div>
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  4
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Liveness & Submit</span>
                  <span className="text-[11px] font-bold text-text-sub">Finish verification</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

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
