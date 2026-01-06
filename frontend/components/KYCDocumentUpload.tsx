
import React, { useState } from 'react';

interface KYCDocumentUploadProps {
  docType: string;
  onBack: () => void;
  onNext: (frontFile: File, backFile: File | null) => void;
  onCancel: () => void;
}

export const KYCDocumentUpload: React.FC<KYCDocumentUploadProps> = ({ docType, onBack, onNext, onCancel }) => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');

  const getDocName = () => {
    if (docType === 'passport') return 'Passport';
    if (docType === 'license') return "Driver's License";
    return 'National ID';
  };

  const requiresBackImage = docType !== 'passport';
  const isReady = frontFile && (!requiresBackImage || backFile);

  // Ref for file input
  const frontInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'front') {
        setFrontFile(file);
        setFrontPreview(reader.result as string);
      } else {
        setBackFile(file);
        setBackPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBrowseClick = () => {
    frontInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Top Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-sub hover:text-primary transition-colors font-bold text-sm group mb-6"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Document Type
      </button>

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-[40px] font-black text-text-main tracking-tight leading-tight">
          Upload Your {getDocName()}
        </h1>
        <p className="text-text-sub text-lg font-medium leading-relaxed max-w-3xl mt-2">
          Please upload a clear image of {requiresBackImage ? 'the front and back' : 'your'} {getDocName()}. Ensure all details are legible and the image is well-lit. We will extract details automatically using OCR.
        </p>
      </div>

      {/* Page Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

        {/* Left: Upload Area */}
        <div className="space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-4">
              <div className="relative w-full aspect-[16/10] rounded-[32px] overflow-hidden bg-gradient-to-br from-[#EAE2D3] via-[#DBC9A6] to-[#C9B388] flex flex-col items-center justify-center">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                {/* Drop Zone Content */}
                {!frontFile ? (
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Hidden main file input */}
                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect('front', e)}
                    />

                    <div className="size-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-primary mb-6 shadow-xl border border-white/30">
                      <span className="material-symbols-outlined text-[36px] font-bold">cloud_upload</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A2E] mb-2">Drag & drop your files here</h3>
                    <p className="text-[#1A1A2E]/60 text-lg font-bold mb-8 tracking-tight">or click to browse from your computer</p>

                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="h-14 px-10 bg-white text-text-main rounded-2xl font-black text-base shadow-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                      Browse files
                    </button>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="size-16 rounded-full bg-green-500 flex items-center justify-center text-white mb-4 shadow-xl">
                      <span className="material-symbols-outlined text-[32px] font-bold">check</span>
                    </div>
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-1">Document Uploaded</h3>
                    <p className="text-[#1A1A2E]/60 text-base font-bold">
                      {requiresBackImage && !backFile ? 'Upload back image below' : 'Ready to continue'}
                    </p>
                  </div>
                )}

                {/* Horizontal Divider Line */}
                <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[85%] h-px bg-white/30"></div>

                {/* Document Placeholders */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8">
                  {/* Front Upload */}
                  <label
                    className={`size-32 md:size-40 rounded-2xl border-2 border-white/40 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all ${frontFile ? 'bg-white/40 border-white' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect('front', e)}
                    />
                    <div className="relative">
                      <span className="material-symbols-outlined text-white text-4xl opacity-60">badge</span>
                      <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">{frontFile ? 'check' : 'add'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">Front of Document</span>
                  </label>

                  {/* Back Upload - Only show for ID/License */}
                  {requiresBackImage && (
                    <label
                      className={`size-32 md:size-40 rounded-2xl border-2 border-white/40 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all ${backFile ? 'bg-white/40 border-white' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect('back', e)}
                      />
                      <div className="relative">
                        <span className="material-symbols-outlined text-white text-4xl opacity-60">branding_watermark</span>
                        <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md">
                          <span className="material-symbols-outlined text-white text-[12px] font-bold">{backFile ? 'check' : 'add'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">Back of Document</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Box */}
          <div className="bg-[#EEF4FF]/50 border border-[#E0E7FF] rounded-[24px] p-8 flex items-start gap-6">
            <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px] icon-filled">lightbulb</span>
            </div>
            <div className="space-y-3">
              <h4 className="text-[15px] font-black text-text-main tracking-tight">Tips for a successful upload</h4>
              <ul className="space-y-2">
                {['Ensure good lighting and no glare on the document.', 'Make sure all four corners of the document are visible.', 'Use a high resolution image for accurate data extraction.'].map((tip, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text-sub font-medium">
                    <div className="size-1.5 rounded-full bg-primary shrink-0 opacity-40"></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Continue Button */}
          <button
            disabled={!isReady}
            onClick={() => onNext(frontFile!, backFile)}
            className={`w-full h-16 rounded-[22px] font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${isReady
              ? 'bg-primary text-white shadow-primary/30 hover:shadow-primary/40'
              : 'bg-gray-100 text-text-sub shadow-none cursor-not-allowed'
              }`}
          >
            Continue Verification
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
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

              {/* Step 1: Completed */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Choose Method</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Completed</span>
                </div>
              </div>

              {/* Step 2: Active */}
              <div className="flex gap-6 items-start relative z-10">
                <div className="size-8 rounded-full bg-white border-2 border-primary flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-white">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-primary leading-tight">Document Upload</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Uploading files</span>
                </div>
              </div>

              {/* Step 3: Pending */}
              <div className="flex gap-6 items-start relative z-10 opacity-30">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Verify Data</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Review accuracy</span>
                </div>
              </div>

              {/* Step 4: Pending */}
              <div className="flex gap-6 items-start relative z-10 opacity-30">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  4
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Liveness Check</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Face scan verification</span>
                </div>
              </div>

              {/* Step 5: Pending */}
              <div className="flex gap-6 items-start relative z-10 opacity-30">
                <div className="size-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-text-sub font-black text-xs">
                  5
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-text-main leading-tight">Review & Submit</span>
                  <span className="text-[11px] font-bold text-text-sub mt-0.5">Final confirmation</span>
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
    </div >
  );
};
