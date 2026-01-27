import React, { useState, useEffect, useRef } from 'react';
import {
  Landmark,
  ArrowLeftRight,
  Gift,
  Briefcase,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  CheckCircle,
  Check,
  X,
  Scan,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

// --- Mock verification response for demo ---
const getVerificationAnalysis = async (): Promise<string> => {
  // Simulated responses for demo purposes
  const responses = [
    "Identity verified. Your unique Zero-Knowledge proof has been generated and your sovereign identity is now active across the Web3 ecosystem.",
    "Verification complete. Your biometric hash has been encrypted and anchored to the CasperID network with full privacy preservation.",
    "Proof generated successfully. Your decentralized identity is now universally recognized across all integrated platforms."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};


// --- Icon mapping ---
const iconMap: Record<string, React.ReactNode> = {
  account_balance: <Landmark className="w-6 h-6" />,
  swap_horiz: <ArrowLeftRight className="w-6 h-6" />,
  redeem: <Gift className="w-6 h-6" />,
  work: <Briefcase className="w-6 h-6" />,
};

// --- Internal Component: Service Card ---
const ServiceCard = ({ icon, label }: { icon: string; label: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200 text-center flex flex-col items-center group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-600/30">
    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600 mb-4 transition-colors group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
      {iconMap[icon] || <Landmark className="w-6 h-6" />}
    </div>
    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">{label}</span>
    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      <span className="text-[9px] font-black text-emerald-500 tracking-tighter uppercase">Verified</span>
    </div>
  </div>
);

// --- Internal Component: Verification Modal ---
const VerificationModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<'scan' | 'processing' | 'result'>('scan');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'scan') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Camera access denied:", err));
    }
    return () => { stream?.getTracks().forEach(track => track.stop()); };
  }, [step]);

  const handleScan = async () => {
    setStep('processing');
    const result = await getVerificationAnalysis();
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAiAnalysis(result);
    setStep('result');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">Liveness Check</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'scan' && (
            <div className="space-y-8">
              <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden border-2 border-indigo-600/20">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] opacity-60" />
                <div className="absolute inset-0 border-[12px] border-slate-900/40 pointer-events-none"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent shadow-[0_0_20px_#7C3AED] animate-bounce opacity-70"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-indigo-600/30 rounded-full animate-pulse"></div>
              </div>
              <p className="text-center text-sm text-slate-500 font-medium px-4">
                Center your face in the frame. Encryption remains local via ZK-Proofs.
              </p>
              <button onClick={handleScan} className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 group uppercase tracking-widest text-sm active:scale-95">
                <Scan className="w-5 h-5" />
                <span>Initialize AI Scan</span>
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-20 flex flex-col items-center space-y-10">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-indigo-600/10 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-24 border-t-2 border-indigo-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Analyzing Proof</h3>
                <p className="text-xs text-indigo-600 font-mono animate-pulse">GENERATING ZK-STARK...</p>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-black text-emerald-600 uppercase text-lg tracking-widest mb-3">Proof Active</h4>
                <p className="text-slate-600 text-sm italic leading-relaxed">"{aiAnalysis}"</p>
              </div>
              <button onClick={onClose} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs">
                Access Verified Ecosystem
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Consolidated Component ---
const OldVsNewSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-center bg-white backdrop-blur-2xl px-4 py-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 shadow-2xl relative overflow-hidden">

        {/* Visual Background Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* LEFT: The Old Way */}
        <div className="lg:col-span-4 flex flex-col items-center text-center space-y-8 md:space-y-12">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center group scale-90 sm:scale-100">
            <div className="absolute inset-0 border-2 border-dashed border-slate-300 rounded-full animate-[spin_20s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]"></div>

            {/* Clunky Labels */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-100 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-tighter transform -rotate-12">Face Scan Required</div>
            <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-slate-100 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-tighter transform rotate-6">Manual Review</div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-100 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-tighter transform rotate-3">Wait 3-5 Days</div>

            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <RefreshCw className="w-10 h-10 md:w-12 md:h-12 animate-spin" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-[9px] md:text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">Traditional Systems</h3>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Endless Repetition</p>
          </div>
        </div>

        {/* CENTER: Transition */}
        <div className="lg:col-span-1 flex justify-center items-center">
          <div className="hidden lg:flex flex-col items-center group">
            <div className="w-px h-20 bg-gradient-to-b from-transparent to-indigo-600/60 group-hover:h-24 transition-all duration-500"></div>
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 transform group-hover:scale-110 transition-transform">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div className="w-px h-20 bg-gradient-to-t from-transparent to-indigo-600/60 group-hover:h-24 transition-all duration-500"></div>
          </div>
          <div className="lg:hidden w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white animate-bounce my-8">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>

        {/* RIGHT: CasperID Section */}
        <div className="lg:col-span-6 space-y-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <ServiceCard icon="account_balance" label="Governance" />
            <ServiceCard icon="swap_horiz" label="Protocols" />
            <ServiceCard icon="redeem" label="Ecosystem" />
            <ServiceCard icon="work" label="Careers" />
          </div>

          <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
            <div className="relative w-full group cursor-pointer" onClick={() => setIsModalOpen(true)}>
              <div className="absolute inset-0 bg-indigo-600/20 blur-[80px] rounded-full group-hover:bg-indigo-600/30 transition-all"></div>
              <div className="relative bg-white p-8 rounded-[2.5rem] border-2 border-indigo-600/20 shadow-2xl flex flex-col items-center hover:scale-[1.02] transition-transform">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-600/20">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Verified Human</h4>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">Active Proof</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600 mb-2">The CasperID Protocol</h3>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">One-Tap Sovereignty</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER HIGHLIGHTS */}
      <div className="mt-12 flex flex-wrap justify-center gap-12 text-slate-500">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Zero-Knowledge</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Instant Sync</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Universal ID</span>
        </div>
      </div>

      {isModalOpen && <VerificationModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default OldVsNewSection;
