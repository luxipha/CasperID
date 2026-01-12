import React from 'react';
import { Shield, Check, ArrowRight } from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="flex-1 flex flex-col pt-12">
      <div className="flex justify-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-[#8652E2]/10 to-[#00F0FF]/10 rounded-full blur-2xl"></div>
        <div className="relative w-32 h-32 bg-white rounded-full shadow-lg border border-[#8652E2]/5 flex items-center justify-center z-10">
          <div className="absolute inset-0 rounded-full border border-[#00F0FF]/20 scale-110"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-[#8652E2] to-[#6a3cb5] rounded-full flex items-center justify-center shadow-[0_0_20px_-5px_rgba(134,82,226,0.5)] text-white">
            <Shield size={48} strokeWidth={2} />
          </div>
          <div className="absolute top-0 right-2 bg-[#00F0FF] text-[#1A1A2E] w-8 h-8 rounded-full flex items-center justify-center shadow-cyan-glow border-2 border-white animate-pulse-subtle">
            <Check size={16} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="text-center space-y-3 mb-8">
        <h2 className="text-[#1A1A2E] text-[28px] font-extrabold leading-[1.2] tracking-tight">
          Verify once.<br />
          Reuse everywhere.
        </h2>
        <p className="text-[#626D85] text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
          Securely manage your digital identity and connect to apps with one tap.
        </p>
      </div>

      <div className="mt-auto space-y-4 flex flex-col items-center pb-8">
        <button
          onClick={() => window.open('http://www.casperId.com', '_blank')}
          className="group w-[85%] h-[52px] bg-[#8652E2] hover:bg-[#7440d0] transition-colors rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg shadow-[#8652E2]/20"
        >
          <span className="relative z-10 text-white font-bold text-base tracking-wide flex items-center gap-2">
            Get Started with CasperID
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>
        <div className="text-center">
          <button
            onClick={onLogin}
            className="inline-flex items-center text-sm font-semibold text-[#626D85] hover:text-[#8652E2] transition-colors py-2 px-4 rounded-md hover:bg-[#8652E2]/5"
          >
            Already have an account? <span className="text-[#1A1A2E] ml-1 font-bold">Log In</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
