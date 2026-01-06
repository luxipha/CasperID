
import React, { useState, useEffect } from 'react';

interface ImportDIDProps {
  onBack: () => void;
  onSuccess?: () => void;
}

type ImportStage = 'input' | 'confirm' | 'processing' | 'success';
type ImportMethod = 'json' | 'file' | 'wallet';

const CasperLogo = () => (
  <div className="flex flex-col items-center gap-2 mb-10">
    <div className="size-14 bg-primary flex items-center justify-center rounded-[18px] transform rotate-45 shadow-lg shadow-primary/30">
      <span className="material-symbols-outlined text-white text-[32px] -rotate-45 font-bold">keyboard_double_arrow_up</span>
    </div>
    <span className="text-[28px] font-black text-[#1A1A2E] tracking-tight">CasperID</span>
  </div>
);

export const ImportDID: React.FC<ImportDIDProps> = ({ onBack, onSuccess }) => {
  const [method, setMethod] = useState<ImportMethod>('json');
  const [stage, setStage] = useState<ImportStage>('input');
  const [signMethod, setSignMethod] = useState<'device' | 'signer'>('device');

  // Simulate processing time
  useEffect(() => {
    if (stage === 'processing') {
      const timer = setTimeout(() => {
        setStage('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleImportClick = () => setStage('confirm');
  const handleInitiateSignature = () => setStage('processing');

  if (stage === 'processing') {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <CasperLogo />
        <div className="w-full max-w-[540px] bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(134,82,226,0.1)] p-12 flex flex-col items-center text-center relative overflow-hidden">
          {/* Animated Gradient Bar at Top */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-primary to-secondary w-1/3 animate-[loading_2s_infinite_linear]"></div>
          </div>

          {/* Circular Progress Area */}
          <div className="relative size-32 mb-10">
            <svg className="size-full -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
              <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="364" strokeDashoffset="120"
                strokeLinecap="round"
                className="text-primary animate-[spin_3s_linear_infinite]" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="material-symbols-outlined text-[40px] text-primary/60">sync_alt</span>
            </div>
          </div>

          <h2 className="text-[32px] font-black text-text-main mb-4 tracking-tight leading-none">Importing Your DID...</h2>
          <p className="text-text-sub text-[15px] font-medium leading-relaxed max-w-sm mb-10">
            Please wait while we securely process and integrate your Decentralized Identifier into your CasperID dashboard.
          </p>

          <div className="w-full space-y-4 mb-10">
            <div className="bg-[#F8F9FB] rounded-2xl p-5 flex items-center gap-4 text-left border border-gray-100/50">
               <span className="material-symbols-outlined text-text-sub text-[22px]">schedule</span>
               <p className="text-[13px] text-text-sub font-medium leading-tight">
                 This typically takes a few moments, depending on the DID method and network conditions.
               </p>
            </div>
            <div className="bg-green-50/50 rounded-2xl p-4 flex items-center gap-4 text-left border border-green-100/50">
               <span className="material-symbols-outlined text-green-600 text-[20px] icon-filled">lock</span>
               <p className="text-[12px] text-green-800 font-bold">
                 Your DID and associated keys are being securely processed.
               </p>
            </div>
          </div>

          <button onClick={() => setStage('input')} className="text-[15px] font-black text-red-500 hover:text-red-600 transition-colors">
            Cancel Import
          </button>
        </div>
        <p className="mt-12 text-[11px] font-bold text-text-sub opacity-40 uppercase tracking-widest">© 2024 CasperID. All rights reserved.</p>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 fade-in duration-500">
        <CasperLogo />
        <div className="w-full max-w-[540px] bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(134,82,226,0.1)] p-12 flex flex-col items-center text-center">
          
          <div className="size-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-8 relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping"></div>
            <div className="size-12 rounded-full bg-green-500 flex items-center justify-center text-white relative z-10">
              <span className="material-symbols-outlined text-[32px] font-bold">check</span>
            </div>
          </div>

          <h2 className="text-[32px] font-black text-text-main mb-4 tracking-tight leading-none">DID Imported Successfully!</h2>
          <p className="text-text-sub text-[15px] font-medium leading-relaxed max-w-sm mb-10">
            You can now manage this DID within your CasperID dashboard and use it across integrated applications.
          </p>

          {/* Summary Card */}
          <div className="w-full bg-[#F8F9FB] rounded-[24px] border border-gray-100 p-8 space-y-6 mb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-text-sub text-[22px]">hub</span>
                 <span className="text-[12px] font-black text-text-sub uppercase tracking-widest">DID Method</span>
              </div>
              <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider border border-primary/10">did:casper</span>
            </div>
            
            <div className="h-px bg-gray-200/40"></div>

            <div className="text-left space-y-3">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-text-sub text-[22px]">fingerprint</span>
                 <span className="text-[12px] font-black text-text-sub uppercase tracking-widest">Identifier</span>
              </div>
              <div className="flex items-center gap-2 h-14 px-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                <span className="text-[13px] font-mono font-medium text-text-sub flex-1 truncate">did:casper:73a...9f2</span>
                <button className="text-text-sub hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-200/40"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-text-sub text-[22px]">badge</span>
                 <span className="text-[12px] font-black text-text-sub uppercase tracking-widest">Name</span>
              </div>
              <span className="text-[15px] font-black text-text-main">Main Identity</span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-4">
            <button 
              onClick={onBack}
              className="w-full h-[64px] bg-primary hover:bg-primary/90 text-white rounded-[20px] font-black text-[16px] flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all active:scale-[0.98]"
            >
              Go to DID Management
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
            </button>
            <button 
              onClick={onBack}
              className="w-full h-[64px] bg-white border border-gray-200 text-text-main hover:bg-gray-50 rounded-[20px] font-black text-[16px] flex items-center justify-center transition-all active:scale-[0.98]"
            >
              View Imported DID Details
            </button>
          </div>
        </div>
        <p className="mt-12 text-[11px] font-bold text-text-sub opacity-40 uppercase tracking-widest">© 2024 CasperID. All rights reserved.</p>
      </div>
    );
  }

  if (stage === 'confirm') {
    return (
      <div className="w-full max-w-[900px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-[36px] font-black text-text-main tracking-tight leading-none">Confirm DID Ownership</h1>
          <p className="text-text-sub text-[16px] font-medium max-w-3xl mx-auto leading-relaxed">
            To securely import your Decentralized Identifier, please sign the following message with the private key associated with this DID's controller. This cryptographically proves your ownership.
          </p>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(134,82,226,0.1)] overflow-hidden">
          <div className="p-10 md:p-12 space-y-10">
            {/* Message section */}
            <div className="space-y-4">
              <label className="text-[14px] font-bold text-text-main">Message to Sign</label>
              <div className="relative group">
                <div className="w-full h-16 px-6 rounded-2xl bg-[#F8F9FB] border border-gray-100 flex items-center pr-40 overflow-hidden">
                  <code className="text-[13px] font-mono font-medium text-text-sub truncate">
                    casperid-proof-of-control-8f7a-2b9c-4d1e-9273-5561a3c7d9e1
                  </code>
                </div>
                <button className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-text-main hover:bg-gray-50 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  Copy Message
                </button>
              </div>
            </div>

            {/* Sign with section */}
            <div className="space-y-6">
              <label className="text-[14px] font-bold text-text-main">Sign with...</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button 
                  onClick={() => setSignMethod('device')}
                  className={`flex items-center gap-5 p-6 rounded-[28px] border-2 text-left transition-all ${
                    signMethod === 'device' ? 'border-primary bg-primary/[0.02]' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors ${signMethod === 'device' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-text-sub'}`}>
                    <span className="material-symbols-outlined text-[32px] icon-filled">fingerprint</span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-text-main leading-none mb-1.5">Authenticate with Device</h4>
                    <p className="text-[12px] text-text-sub font-medium">Use Passkey or Biometrics</p>
                  </div>
                </button>

                <button 
                  onClick={() => setSignMethod('signer')}
                  className={`flex items-center gap-5 p-6 rounded-[28px] border-2 text-left transition-all ${
                    signMethod === 'signer' ? 'border-primary bg-primary/[0.02]' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors ${signMethod === 'signer' ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-text-sub'}`}>
                    <span className="material-symbols-outlined text-[32px]">account_balance_wallet</span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-text-main leading-none mb-1.5">Sign with Casper Signer</h4>
                    <p className="text-[12px] text-text-sub font-medium">Browser Extension Wallet</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-50/50 border border-red-100/50 rounded-2xl p-6 flex gap-4">
              <span className="material-symbols-outlined text-red-500 text-[24px]">warning</span>
              <div>
                <h4 className="font-bold text-red-900 text-[14px] leading-tight mb-1">Warning</h4>
                <p className="text-[12px] text-red-800 font-medium leading-relaxed">
                  Do not share your private key directly. Only sign messages you understand and originate from CasperID.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 md:p-10 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-end gap-6 border-t border-gray-50">
            <button 
              onClick={() => setStage('input')}
              className="text-[15px] font-bold text-text-sub hover:text-text-main transition-colors px-6 text-center"
            >
              Cancel Import
            </button>
            <button 
              onClick={handleInitiateSignature}
              className="w-full md:w-auto h-[60px] px-12 bg-primary hover:bg-primary/90 text-white rounded-[22px] font-black text-[15px] flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">draw</span>
              Initiate Signature
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-[13px] font-bold text-text-sub">
          <button 
            onClick={onBack} 
            className="hover:text-primary transition-colors flex items-center gap-1 group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to DID Management
          </button>
        </nav>

        <div className="space-y-2">
          <h1 className="text-[36px] font-black text-text-main tracking-tight leading-none">Import Your Existing DID</h1>
          <p className="text-text-sub text-[15px] font-medium max-w-2xl leading-relaxed">
            Import a Decentralized Identifier you already control or have backed up.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
        
        {/* Method Selection Section */}
        <div className="p-8 md:p-10 border-b border-gray-50 bg-gray-50/10">
          <p className="text-[11px] font-black text-text-sub uppercase tracking-widest mb-6">Choose Import Method</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Paste JSON */}
            <button 
              onClick={() => setMethod('json')}
              className={`relative flex flex-col items-center justify-center p-8 rounded-[28px] border-2 transition-all gap-3 ${
                method === 'json' ? 'border-primary bg-primary/[0.02] shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${method === 'json' ? 'text-primary' : 'text-text-sub'}`}>
                <span className="material-symbols-outlined text-[28px]">code</span>
              </div>
              <div className="text-center">
                <p className={`text-[15px] font-bold ${method === 'json' ? 'text-primary' : 'text-text-main'}`}>Paste JSON</p>
                <p className="text-[12px] text-text-sub font-medium">Raw DID Document</p>
              </div>
              {method === 'json' && (
                <div className="absolute top-4 right-4 size-6 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
              )}
            </button>

            {/* Upload File */}
            <button 
              onClick={() => setMethod('file')}
              className={`relative flex flex-col items-center justify-center p-8 rounded-[28px] border-2 transition-all gap-3 ${
                method === 'file' ? 'border-primary bg-primary/[0.02] shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${method === 'file' ? 'text-primary' : 'text-text-sub'}`}>
                <span className="material-symbols-outlined text-[28px]">upload_file</span>
              </div>
              <div className="text-center">
                <p className={`text-[15px] font-bold ${method === 'file' ? 'text-primary' : 'text-text-main'}`}>Upload File</p>
                <p className="text-[12px] text-text-sub font-medium">.json files only</p>
              </div>
              {method === 'file' && (
                <div className="absolute top-4 right-4 size-6 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
              )}
            </button>

            {/* Connect Wallet */}
            <button 
              onClick={() => setMethod('wallet')}
              className={`relative flex flex-col items-center justify-center p-8 rounded-[28px] border-2 transition-all gap-3 ${
                method === 'wallet' ? 'border-primary bg-primary/[0.02] shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${method === 'wallet' ? 'text-primary' : 'text-text-sub'}`}>
                <span className="material-symbols-outlined text-[28px]">wallet</span>
              </div>
              <div className="text-center">
                <p className={`text-[15px] font-bold ${method === 'wallet' ? 'text-primary' : 'text-text-main'}`}>Connect Wallet</p>
                <p className="text-[12px] text-text-sub font-medium">Via Casper Signer</p>
              </div>
              {method === 'wallet' && (
                <div className="absolute top-4 right-4 size-6 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10 space-y-10">
          
          {/* Main content area (JSON or File Upload) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[15px] font-bold text-text-main">
                {method === 'json' ? 'DID Document Content' : 'File Upload'}
              </label>
              <button className="text-[13px] font-bold text-primary hover:underline">View Example Format</button>
            </div>

            {method === 'json' ? (
              <div className="relative group">
                <textarea 
                  className="w-full h-[300px] p-8 rounded-[24px] bg-[#F8F9FB] border border-gray-100 font-mono text-[13px] leading-relaxed text-text-main focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none outline-none"
                  placeholder={`{\n  "@context": [\n    "https://www.w3.org/ns/did/v1"\n  ],\n  "id": "did:casper:...",\n  "verificationMethod": [\n    ...\n  ]\n}`}
                ></textarea>
                <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-lg bg-gray-200/50 text-[10px] font-black text-text-sub uppercase tracking-widest opacity-40">
                  JSON Format
                </div>
              </div>
            ) : method === 'file' ? (
              <div className="w-full h-[300px] border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center gap-5 hover:border-primary/40 hover:bg-primary/[0.01] transition-all group">
                <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[17px] font-bold text-text-main">Drag and drop your file here</p>
                  <p className="text-[14px] text-text-sub font-medium">or</p>
                </div>
                <button className="h-12 px-8 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-main hover:bg-gray-50 transition-all shadow-sm">
                  Browse files
                </button>
                <p className="text-[12px] text-text-sub font-medium opacity-60">.json files only</p>
              </div>
            ) : (
              <div className="w-full h-[300px] bg-gray-50/50 rounded-[32px] flex flex-col items-center justify-center gap-4 text-center p-10 border border-gray-100 border-dashed">
                <span className="material-symbols-outlined text-[40px] text-text-sub/40">account_balance_wallet</span>
                <p className="text-text-sub font-medium">Connect your Casper wallet to browse on-chain DIDs linked to your address.</p>
                <button className="h-11 px-6 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Connect Signer</button>
              </div>
            )}

            <div className="flex items-center gap-2 text-[12px] text-text-sub font-medium opacity-80">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Ensure the document adheres to the W3C DID Core specification.
            </div>
          </div>

          <div className="h-px bg-gray-50"></div>

          {/* Form and Sidebar Info */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10">
            <div className="space-y-4">
              <label className="text-[15px] font-bold text-text-main">DID Name / Label <span className="text-text-sub font-medium">(Optional)</span></label>
              <input 
                type="text" 
                className="w-full h-14 px-6 rounded-2xl bg-white border border-gray-100 text-[15px] font-medium text-text-main placeholder:text-text-sub/30 focus:border-primary/50 transition-all outline-none"
                placeholder="e.g. My Work Identity"
              />
              <p className="text-[12px] text-text-sub font-medium opacity-70">
                Helps you identify this DID in your dashboard.
              </p>
            </div>

            <div className="hidden lg:block w-px bg-gray-50 h-full"></div>

            <div className="bg-blue-50/50 border border-blue-100/50 rounded-[32px] p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[17px] font-bold text-blue-900 leading-tight">Verification Required</h4>
                  <p className="text-[14px] text-blue-800 font-medium leading-relaxed">
                    To complete the import, you may need to sign a message using the private key associated with this DID controller to prove ownership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 md:p-10 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-gray-50">
          <button 
            onClick={onBack}
            className="text-[15px] font-bold text-text-sub hover:text-text-main transition-colors px-4 text-center order-2 md:order-1"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleImportClick}
            className="w-full md:w-auto h-[60px] px-12 bg-primary hover:bg-primary/90 text-white rounded-[22px] font-black text-[15px] flex items-center justify-center gap-3 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] order-1 md:order-2"
          >
            Import DID
            <span className="material-symbols-outlined text-[20px]">login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
