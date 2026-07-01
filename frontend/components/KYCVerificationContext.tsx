import React from 'react';

interface KYCVerificationContextProps {
  onBack: () => void;
  onCancel: () => void;
  onSelectContext: (context: 'nigeria' | 'international') => void;
}

export const KYCVerificationContext: React.FC<KYCVerificationContextProps> = ({
  onBack,
  onCancel,
  onSelectContext,
}) => {
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
          Where are you verifying from?
        </h1>
        <p className="text-text-sub text-base md:text-lg font-medium leading-relaxed max-w-3xl mt-2">
          We use this to route you through the correct identity checks. Document upload is required for every Layer 3 submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10 items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <button
            onClick={() => onSelectContext('nigeria')}
            className="w-full text-left bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-8 flex flex-col gap-5 md:gap-6 group hover:border-primary/40 hover:shadow-glow transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="size-14 md:size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[32px]">badge</span>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-text-main">Nigeria</h3>
                <p className="text-text-sub text-sm md:text-base font-medium leading-relaxed mt-1">
                  Verify with either NIN or BVN, confirm your details, then upload a supporting government ID before liveness.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['NIN or BVN', 'Government ID', 'Liveness'].map(tag => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-black text-text-sub uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>

          <button
            onClick={() => onSelectContext('international')}
            className="w-full text-left bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-soft p-5 md:p-8 flex flex-col gap-5 md:gap-6 group hover:border-primary/40 hover:shadow-glow transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="size-14 md:size-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[32px]">public</span>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-text-main">Outside Nigeria</h3>
                <p className="text-text-sub text-sm md:text-base font-medium leading-relaxed mt-1">
                  Upload your passport or accepted government ID, confirm the extracted details, then complete liveness.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Passport', 'Government ID', 'Liveness'].map(tag => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-black text-text-sub uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>

        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>

            <div className="space-y-10 relative">
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100"></div>

              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs shadow-md">
                  1
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary">Verification Context</span>
                  <span className="text-[11px] font-bold text-text-sub">Choose the right identity path.</span>
                </div>
              </div>

              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Identity Evidence</span>
                  <span className="text-[11px] font-bold text-text-sub">NIN or BVN, then document collection</span>
                </div>
              </div>

              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub">Face scan verification</span>
                </div>
              </div>

              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  4
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Review & Submit</span>
                  <span className="text-[11px] font-bold text-text-sub">Final confirmation</span>
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
