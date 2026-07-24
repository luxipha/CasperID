import React, { useEffect, useState } from 'react';

type IdentityMethod = 'nimc' | 'bvn';

interface KYCNIMCNumberEntryProps {
  onBack: () => void;
  onNext: (details: {
    method: IdentityMethod;
    nin?: string;
    bvn?: string;
    account_number?: string;
    bank_code?: string;
  }) => void;
  onCancel: () => void;
  error?: string;
  onClearError?: () => void;
  ctaLabel?: string;
  helperMessage?: string;
  notice?: string;
  isBusy?: boolean;
  initialDetails?: {
    method?: IdentityMethod;
    nin?: string;
    bvn?: string;
    account_number?: string;
    bank_code?: string;
  };
}

export const KYCNIMCNumberEntry: React.FC<KYCNIMCNumberEntryProps> = ({
  onBack,
  onNext,
  onCancel,
  error,
  onClearError,
  ctaLabel = 'Continue to Confirm Details',
  helperMessage,
  notice,
  isBusy = false,
  initialDetails,
}) => {
  const [method, setMethod] = useState<IdentityMethod>(initialDetails?.method || 'nimc');
  const [nin, setNin] = useState(initialDetails?.nin || '');
  const [bvn, setBvn] = useState(initialDetails?.bvn || '');
  const [accountNumber, setAccountNumber] = useState(initialDetails?.account_number || '');
  const [bankCode, setBankCode] = useState(initialDetails?.bank_code || '');

  useEffect(() => {
    setMethod(initialDetails?.method || 'nimc');
    setNin(initialDetails?.nin || '');
    setBvn(initialDetails?.bvn || '');
    setAccountNumber(initialDetails?.account_number || '');
    setBankCode(initialDetails?.bank_code || '');
  }, [initialDetails]);

  const isValid = method === 'nimc'
    ? nin.length === 11
    : bvn.length === 11 && accountNumber.length === 10 && bankCode.trim().length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
        <div className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
              Verify with NIN or BVN
            </h1>
            <p className="text-text-sub text-lg font-medium leading-relaxed max-w-3xl">
              Choose one Nigerian identity method. Document upload is still mandatory before liveness and final submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <button
              disabled={isBusy}
              onClick={() => {
                onClearError?.();
                setMethod('nimc');
              }}
              className={`text-left rounded-[28px] border p-6 shadow-soft transition-all disabled:opacity-60 ${method === 'nimc' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${method === 'nimc' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined text-[24px]">badge</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-main">Use NIN</h3>
                  <p className="text-sm text-text-sub font-medium mt-1">
                    Verify with your 11-digit National Identification Number.
                  </p>
                </div>
              </div>
            </button>

            <button
              disabled={isBusy}
              onClick={() => {
                onClearError?.();
                setMethod('bvn');
              }}
              className={`text-left rounded-[28px] border p-6 shadow-soft transition-all disabled:opacity-60 ${method === 'bvn' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${method === 'bvn' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined text-[24px]">account_balance</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-main">Use BVN</h3>
                  <p className="text-sm text-text-sub font-medium mt-1">
                    Verify with your BVN plus the linked bank account details.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft p-10 max-w-3xl space-y-8">
            {notice ? (
              <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4">
                <p className="text-sm font-black text-primary">Payment in progress</p>
                <p className="mt-1 text-sm font-medium text-text-main">{notice}</p>
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-black text-red-800">Verification unavailable</p>
                <p className="mt-1 text-sm font-medium text-red-700">{error}</p>
              </div>
            ) : null}
            {method === 'nimc' ? (
              <div className="space-y-3">
                <label className="text-sm font-black text-text-main">National Identification Number (NIN)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-sub/50">badge</span>
                  </div>
                  <input
                    type="text"
                    value={nin}
                    onChange={(e) => {
                      onClearError?.();
                      setNin(e.target.value.replace(/\D/g, '').slice(0, 11));
                    }}
                    disabled={isBusy}
                    className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white border border-gray-100 text-base font-medium text-text-main placeholder:text-text-sub/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="Enter your 11-digit NIN"
                  />
                </div>
                <p className="text-[12px] text-text-sub font-medium opacity-70">
                  We will use this to verify your identity details before document upload.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-sm font-black text-text-main">Bank Verification Number (BVN)</label>
                  <input
                    type="text"
                    value={bvn}
                    onChange={(e) => {
                      onClearError?.();
                      setBvn(e.target.value.replace(/\D/g, '').slice(0, 11));
                    }}
                    disabled={isBusy}
                    className="w-full h-16 px-6 rounded-2xl bg-white border border-gray-100 text-base font-medium text-text-main placeholder:text-text-sub/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="Enter your 11-digit BVN"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-text-main">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                    onChange={(e) => {
                      onClearError?.();
                      setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                    }}
                    disabled={isBusy}
                    className="w-full h-16 px-6 rounded-2xl bg-white border border-gray-100 text-base font-medium text-text-main placeholder:text-text-sub/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="10-digit account number"
                  />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-text-main">Bank Code</label>
                    <input
                      type="text"
                      value={bankCode}
                    onChange={(e) => {
                      onClearError?.();
                      setBankCode(e.target.value.trimStart());
                    }}
                    disabled={isBusy}
                    className="w-full h-16 px-6 rounded-2xl bg-white border border-gray-100 text-base font-medium text-text-main placeholder:text-text-sub/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="e.g. 058"
                  />
                  </div>
                </div>
                <p className="text-[12px] text-text-sub font-medium opacity-70">
                  Monnify BVN verification requires the BVN and the linked bank account details.
                </p>
              </div>
            )}

            <button
              disabled={!isValid || isBusy}
              onClick={() => onNext(
                method === 'nimc'
                  ? { method, nin }
                  : { method, bvn, account_number: accountNumber, bank_code: bankCode.trim() }
              )}
              className="w-full h-16 bg-primary text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {ctaLabel}
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>

            {helperMessage ? (
              <p className="text-center text-xs font-medium text-text-sub leading-relaxed -mt-3">
                {helperMessage}
              </p>
            ) : null}

            <div className="pt-4 flex flex-col items-center gap-4 border-t border-gray-50">
              <button
                disabled={isBusy}
                onClick={onBack}
                className="text-text-sub hover:text-text-main font-bold text-sm disabled:opacity-60"
              >
                Go back
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

            <div className="space-y-10 relative">
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                <div className="absolute top-0 left-0 w-full h-[33%] bg-primary"></div>
              </div>

              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Choose Context</span>
                  <span className="text-[11px] font-bold text-text-sub">Completed</span>
                </div>
              </div>

              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary">Identity Number</span>
                  <span className="text-[11px] font-bold text-text-sub">NIN or BVN</span>
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

      <div className="mt-12 flex justify-center">
        <button
          disabled={isBusy}
          onClick={onCancel}
          className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          Cancel Verification
        </button>
      </div>
    </div>
  );
};
