
import React, { useState } from 'react';

interface KYCDocumentSelectionProps {
  onBack: () => void;
  onNext: (docType: string) => void;
  onCancel: () => void;
}

export const KYCDocumentSelection: React.FC<KYCDocumentSelectionProps> = ({ onBack, onNext, onCancel }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const docTypes = [
    { id: 'passport', title: 'Passport', desc: 'International travel document', icon: 'book' },
    { id: 'license', title: "Driver's License", desc: 'State or national driving permit', icon: 'directions_car' },
    { id: 'national_id', title: 'National ID Card', desc: 'Government issued identity card', icon: 'badge' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
        
        {/* Left: Document Selection Area */}
        <div className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
              Select Your Document Type
            </h1>
            <p className="text-text-sub text-lg font-medium leading-relaxed max-w-2xl">
              Please select the type of government identification document you will be uploading to proceed.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            {docTypes.map((doc) => (
              <button 
                key={doc.id}
                onClick={() => setSelected(doc.id)}
                className={`w-full text-left bg-white rounded-[24px] border p-6 flex items-center gap-6 transition-all active:scale-[0.99] group ${
                  selected === doc.id 
                    ? 'border-primary shadow-glow ring-1 ring-primary/20' 
                    : 'border-gray-100 shadow-soft hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className={`size-14 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  selected === doc.id ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-text-sub'
                }`}>
                  <span className="material-symbols-outlined text-[28px]">{doc.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-text-main">{doc.title}</h3>
                  <p className="text-text-sub text-sm font-medium">{doc.desc}</p>
                </div>
                {selected === doc.id && (
                   <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
                )}
              </button>
            ))}
          </div>

          <div className="max-w-2xl">
            <button 
              disabled={!selected}
              onClick={() => selected && onNext(selected)}
              className="w-full h-16 bg-primary text-white rounded-[22px] font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              Next
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right: Verification Steps Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden p-8 space-y-8">
            <h2 className="text-[11px] font-black text-text-sub uppercase tracking-[0.2em] mb-4">Verification Steps</h2>
            
            <div className="space-y-10 relative">
              {/* Vertical Stepper Line */}
              <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-gray-100">
                <div className="absolute top-0 left-0 w-full h-[33%] bg-primary"></div>
              </div>

              {/* Step 1: Choose Method (Completed) */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub">Completed</span>
                </div>
              </div>

              {/* Step 2: Verification (Active) */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary">Verification</span>
                  <span className="text-[11px] font-bold text-text-sub">Document Type</span>
                </div>
              </div>

              {/* Step 3: Liveness Check */}
              <div className="flex gap-6 items-start relative z-10 opacity-40">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main">Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub">Face scan verification</span>
                </div>
              </div>

              {/* Step 4: Review & Submit */}
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
          className="flex items-center gap-2 text-text-sub hover:text-alerts transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          Cancel Verification
        </button>
      </div>
    </div>
  );
};
