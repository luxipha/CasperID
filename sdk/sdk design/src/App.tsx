/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Fingerprint, 
  X, 
  Smartphone, 
  Puzzle, 
  ChevronRight, 
  Verified, 
  Lock, 
  ArrowRight, 
  Mail, 
  Delete, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  HelpCircle, 
  Flashlight,
  Globe,
  CreditCard,
  User,
  Calendar,
  Sparkles,
  Network,
  Settings,
  Menu,
  Sun,
  Moon
} from 'lucide-react';

// --- Types ---

type Screen = 
  | 'AuthSelection' 
  | 'Login' 
  | 'PinVerification' 
  | 'SecurityUpgrade' 
  | 'FaceScan' 
  | 'VerifyIdentityChoice' 
  | 'DocumentScan' 
  | 'ReviewData' 
  | 'MintingIdentity' 
  | 'IdentityVerified' 
  | 'PermissionsRequest';

// --- Components ---

const GlassContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`glass-container relative w-full max-w-[400px] h-[750px] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border dark:border-white/10 border-white/40 ${className}`}>
    {children}
  </div>
);

const Header = ({ onBack, title = "CasperID", subtitle = "SECURE SDK", showClose = true, theme, toggleTheme }: { onBack?: () => void, title?: string, subtitle?: string, showClose?: boolean, theme: 'light' | 'dark', toggleTheme: () => void }) => (
  <header className="flex items-center justify-between px-6 pt-8 pb-4 relative z-20">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#8651e1] rounded-xl flex items-center justify-center shadow-lg shadow-[#8651e1]/30">
        <Shield className="text-white w-5 h-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-main">{title}</h2>
        {subtitle && <p className="text-[10px] uppercase tracking-widest text-[#8651e1] font-bold">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={toggleTheme}
        className="p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-full transition-colors text-muted"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      {showClose && (
        <button onClick={onBack} className="p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-full transition-colors text-muted">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  </header>
);

const Footer = ({ children }: { children: React.ReactNode }) => (
  <footer className="p-8 text-center relative z-20">
    {children}
  </footer>
);

// --- Individual Screens ---

const AuthSelection = ({ onNext }: { onNext: (method: 'extension' | 'otp') => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -20 }}
    className="flex-1 px-8 flex flex-col justify-center gap-8"
  >
    <div className="text-center space-y-3">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-[#8651e1]/20 blur-2xl rounded-full"></div>
        <div className="relative w-full h-full glass-container flex items-center justify-center rounded-full border border-[#8651e1]/30">
          <Fingerprint className="w-10 h-10 text-[#8651e1]" />
        </div>
      </div>
      <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-main">Welcome Back</h1>
      <p className="text-muted text-sm leading-relaxed">Secure your Web3 identity with our premium authentication layer.</p>
    </div>

    <div className="space-y-4">
      <button 
        onClick={() => onNext('extension')}
        className="w-full group relative overflow-hidden flex items-center gap-4 bg-[#8651e1] hover:bg-[#8651e1]/90 text-white py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98]"
      >
        <div className="bg-white/20 p-2 rounded-lg">
          <Puzzle className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-base">Sign in with Extension</span>
          <span className="text-[10px] uppercase tracking-widest text-white/70">Secure Wallet</span>
        </div>
        <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </button>

      <button 
        onClick={() => onNext('otp')}
        className="w-full group relative overflow-hidden flex items-center gap-4 dark:bg-white/5 bg-slate-100/50 hover:dark:bg-white/10 hover:bg-slate-200/80 border dark:border-white/10 border-slate-200 text-main py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98]"
      >
        <div className="bg-[#8651e1]/10 p-2 rounded-lg">
          <Smartphone className="w-5 h-5 text-[#8651e1]" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-base">Sign in with OTP</span>
          <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Two-Factor Auth</span>
        </div>
        <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50">
        <ShieldCheck className="w-5 h-5 text-[#8651e1]" />
        <span className="text-[10px] font-bold text-muted">FULLY AUDITED</span>
      </div>
      <div className="glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50">
        <RefreshCw className="w-5 h-5 text-[#8651e1]" />
        <span className="text-[10px] font-bold text-muted">NON-CUSTODIAL</span>
      </div>
    </div>
  </motion.div>
);

const Login = ({ onNext }: { onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    exit={{ opacity: 0, x: -20 }}
    className="flex-1 flex flex-col px-8 pt-12"
  >
    <div className="mb-8">
      <h2 className="text-3xl font-extrabold text-main tracking-tight leading-tight">Welcome back</h2>
      <p className="text-muted mt-3 text-sm leading-relaxed">
        Enter your credentials to access the decentralized web ecosystem.
      </p>
    </div>

    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
          Email or Phone
        </label>
        <div className="relative">
          <input 
            className="w-full dark:bg-black/20 bg-slate-100/50 border dark:border-white/10 border-slate-200 rounded-2xl h-14 px-5 text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8651e1]/30 transition-all font-medium" 
            placeholder="name@example.com" 
            type="text" 
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
            <Mail className="w-5 h-5" />
          </div>
        </div>
      </div>
      <button 
        onClick={onNext}
        className="w-full h-14 bg-[#8651e1] hover:bg-[#8651e1]/90 text-white font-bold rounded-2xl shadow-xl shadow-[#8651e1]/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
      >
        <span>Continue</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>

    <div className="mt-auto pb-8">
      <div className="p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl border dark:border-white/5 border-slate-200/50 mb-6">
        <div className="flex items-start gap-3">
          <Verified className="text-[#6DE8EC] w-5 h-5 mt-0.5" />
          <p className="text-[11px] text-muted leading-normal font-medium">
            Your data is encrypted and never stored on central servers. Powered by Casper Network.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 opacity-50">
        <Lock className="text-muted w-3 h-3" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">End-to-End Encrypted</span>
      </div>
    </div>
  </motion.div>
);

const PinVerification = ({ onNext }: { onNext: () => void }) => {
  const [pin, setPin] = useState(['4', '8', '', '', '', '']);
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col px-8 pt-12"
    >
      <div className="space-y-2 mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-main">PIN Verification</h1>
        <p className="text-muted text-sm font-medium">Enter the code sent to your device</p>
      </div>

      <div className="flex justify-between gap-2 mb-12">
        {pin.map((digit, i) => (
          <div key={i} className="size-12 rounded-full glass-container flex items-center justify-center text-xl font-bold text-[#6DE8EC] border dark:border-white/10 border-slate-200">
            {digit}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main">
            {num}
          </button>
        ))}
        <div className="h-14"></div>
        <button className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main">0</button>
        <button className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center transition-colors text-main">
          <Delete className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-auto pb-8 space-y-4">
        <button 
          onClick={onNext}
          className="w-full h-14 bg-[#8651e1] hover:bg-[#8651e1]/90 text-white font-bold rounded-full transition-all shadow-lg shadow-[#8651e1]/20 flex items-center justify-center gap-2 group"
        >
          Verify
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="w-full h-14 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-full transition-all border border-white/10">
          Resend Code
        </button>
      </div>
    </motion.div>
  );
};

const SecurityUpgrade = ({ onNext }: { onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="flex-1 flex flex-col"
  >
    <div className="p-6 pb-2">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8651e1]/80">Verification Step</span>
        <span className="text-xs font-bold text-muted">4 / 10</span>
      </div>
      <div className="w-full bg-[#8651e1]/10 h-1.5 rounded-full overflow-hidden">
        <div className="bg-[#8651e1] h-full rounded-full" style={{ width: '40%' }}></div>
      </div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
      <div className="relative group">
        <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500"></div>
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[#8651e1]/20 to-[#8651e1]/5 flex items-center justify-center border border-[#8651e1]/30 shadow-inner">
          <Verified className="w-16 h-16 text-[#8651e1]" />
        </div>
        <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full dark:bg-[#171220] bg-white border-2 border-[#8651e1] flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-[#8651e1]" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-main leading-tight">
          Security Upgrade Required
        </h1>
        <p className="text-muted text-base leading-relaxed font-medium">
          To access advanced Web3 features, please verify your humanity with a quick face scan.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <span className="px-3 py-1 bg-[#8651e1]/10 rounded-full text-[10px] font-bold text-[#8651e1] uppercase tracking-tighter border border-[#8651e1]/10">Biometric Secure</span>
        <span className="px-3 py-1 bg-cyan-400/10 rounded-full text-[10px] font-bold text-cyan-500 uppercase tracking-tighter border border-cyan-400/10">Zero-Knowledge</span>
      </div>
    </div>

    <div className="p-8 space-y-4">
      <button 
        onClick={onNext}
        className="w-full bg-[#8651e1] hover:bg-[#8651e1]/90 text-white rounded-full py-4 font-bold text-lg shadow-xl shadow-[#8651e1]/30 transition-all active:scale-[0.98]"
      >
        Start Upgrade
      </button>
      <button className="w-full dark:text-slate-400 text-slate-500 text-sm font-bold dark:hover:text-slate-200 hover:text-slate-800 transition-colors">
        I'll do this later
      </button>
    </div>
  </motion.div>
);

const FaceScan = ({ onNext }: { onNext: () => void }) => {
  const [step, setStep] = React.useState(0);
  const instructions = [
    "Align your face within the frame",
    "Blink your eyes",
    "Look left",
    "Look right",
    "Processing..."
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev < instructions.length - 1) return prev + 1;
        clearInterval(timer);
        setTimeout(onNext, 1000);
        return prev;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [onNext]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col relative dark:bg-[#050a0a] bg-slate-50 overflow-hidden"
    >
      {/* Background Camera Simulation */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full dark:bg-[#050a0a] bg-slate-50 flex items-center justify-center">
          <div className="w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6fe8ec]/30 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-40 pt-12 pb-4 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-1.5 dark:bg-black/40 bg-white/40 backdrop-blur-md rounded-full border dark:border-white/5 border-black/5">
          <div className="w-2 h-2 rounded-full bg-[#6fe8ec] shadow-[0_0_8px_#6fe8ec]"></div>
          <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold">Secure SDK</span>
        </div>
      </div>

      {/* Main Scan Area */}
      <div className="relative z-20 flex-1 flex items-center justify-center">
        {/* Mask Overlay with Hole - Fixed radii for portrait oval */}
        <div 
          className="absolute inset-0 z-10 dark:bg-[#050a0a]/80 bg-white/80 backdrop-blur-[2px]" 
          style={{ 
            mask: 'radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)', 
            WebkitMask: 'radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)' 
          }}
        ></div>

        {/* The Oval Frame - Explicitly sized and non-stretching */}
        <div className="relative z-30 flex items-center justify-center">
          <div className="w-[200px] h-[290px] flex-shrink-0 rounded-full border-[3px] border-[#6fe8ec] shadow-[0_0_40px_rgba(111,232,236,0.4),inset_0_0_20px_rgba(111,232,236,0.2)] relative overflow-hidden">
            {/* Animated Glow Border */}
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-[1px] border-white/30"
            />
            
            {/* Scanning Line */}
            <motion.div 
              animate={{ top: ['-10%', '110%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#6fe8ec] to-transparent shadow-[0_0_20px_#6fe8ec] z-10"
            />

            {/* Inner Gradient for Depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(111,232,236,0.05)_100%)]"></div>
          </div>

          {/* Corner Brackets - Positioned relative to the oval */}
          <div className="absolute w-[280px] h-[380px] pointer-events-none flex items-center justify-center">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#6fe8ec]/30 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#6fe8ec]/30 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#6fe8ec]/30 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#6fe8ec]/30 rounded-br-2xl"></div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="relative z-40 p-8 flex flex-col items-center gap-6">
        {/* Instruction Box */}
        <div className="dark:bg-[#0a1515]/95 bg-white/90 backdrop-blur-2xl border dark:border-white/10 border-black/5 w-full p-6 rounded-[2.5rem] text-center shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.p 
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[#6fe8ec] font-bold text-2xl tracking-tight mb-2"
            >
              {instructions[step]}
            </motion.p>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            Secure Face Scan • Encrypted
          </div>
        </div>

        {/* Progress Bar Style Indicator */}
        <div className="flex gap-2 w-full max-w-[140px]">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                i <= Math.floor((step / (instructions.length - 1)) * 2) 
                ? 'bg-[#6fe8ec] shadow-[0_0_15px_#6fe8ec]' 
                : 'dark:bg-slate-800 bg-slate-200'
              }`}
            ></div>
          ))}
        </div>

        {/* Status Pill */}
        <div className="px-6 py-2.5 dark:bg-black/60 bg-white/60 backdrop-blur-md rounded-full border dark:border-white/5 border-black/5 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${step === instructions.length - 1 ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-[#6fe8ec] animate-pulse'}`}></div>
          <span className="text-[10px] dark:text-slate-400 text-slate-600 uppercase tracking-[0.25em] font-black">
            {step === instructions.length - 1 ? 'Calibration Complete' : 'Awaiting Calibration'}
          </span>
        </div>
      </footer>
    </motion.div>
  );
};




const VerifyIdentityChoice = ({ onNext }: { onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    exit={{ opacity: 0, x: -20 }}
    className="flex-1 px-6 pt-4 flex flex-col"
  >
    <h3 className="text-2xl font-bold mb-2 text-main">Verify Identity</h3>
    <p className="text-muted text-sm mb-8 leading-relaxed">Choose a document type to start the secure verification process.</p>
    
    <div className="space-y-4 overflow-y-auto pr-1 pb-6">
      {[
        { id: 'passport', title: 'Passport', desc: 'All countries supported', icon: Globe },
        { id: 'license', title: 'Driver License', desc: 'Government issued card', icon: CreditCard },
        { id: 'idcard', title: 'ID Card', desc: 'National identity document', icon: Smartphone }
      ].map(item => (
        <button 
          key={item.id}
          onClick={onNext}
          className="w-full group cursor-pointer dark:bg-white/5 bg-slate-100/50 border dark:border-white/10 border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:dark:bg-[#8651e1]/15 hover:bg-[#8651e1]/5 hover:dark:border-[#8651e1]/40 hover:border-[#8651e1]/30 transition-all transform hover:-translate-y-1"
        >
          <div className="w-14 h-14 rounded-xl dark:bg-slate-800/50 bg-white flex items-center justify-center text-[#8651e1] group-hover:bg-[#8651e1]/20 transition-colors border dark:border-transparent border-slate-100">
            <item.icon className="w-8 h-8" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-bold text-base text-main">{item.title}</h4>
            <p className="text-xs text-muted font-medium">{item.desc}</p>
          </div>
          <ChevronRight className="text-[#8651e1] w-5 h-5" />
        </button>
      ))}
      
      <div className="mt-8 relative h-32 w-full rounded-2xl overflow-hidden dark:bg-white/5 bg-slate-100/30 flex items-center justify-center border border-dashed dark:border-[#8651e1]/30 border-[#8651e1]/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8651e1] via-transparent to-transparent"></div>
        <div className="text-center z-10">
          <ShieldCheck className="text-[#8651e1]/40 w-10 h-10 mx-auto mb-1" />
          <p className="text-[10px] text-muted uppercase tracking-tighter font-bold">Encrypted E2E</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const DocumentScan = ({ onNext }: { onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }}
    className="flex-1 flex flex-col relative"
  >
    <div className="absolute inset-0 z-0">
      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
        <div className="w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6DE8EC]/20 via-transparent to-transparent"></div>
      </div>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
    </div>

    <div className="relative z-10 p-6 flex flex-col items-center">
      <div className="text-center px-4 py-2 dark:bg-black/40 bg-white/40 backdrop-blur-xl rounded-full border dark:border-white/10 border-black/5">
        <h3 className="text-main text-sm font-medium tracking-wide uppercase">Scan the front of your ID</h3>
      </div>
    </div>

    <div className="relative z-10 flex-1 flex items-center justify-center px-6">
      <div className="w-full aspect-[1.58/1] relative">
        <div className="absolute inset-0 border border-[#6DE8EC] rounded-2xl shadow-[0_0_20px_rgba(109,232,236,0.3),inset_0_0_15px_rgba(109,232,236,0.2)]"></div>
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#6DE8EC] rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#6DE8EC] rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#6DE8EC] rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#6DE8EC] rounded-br-2xl"></div>
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent opacity-50"
        />
      </div>
    </div>

    <div className="relative z-10 p-8 dark:bg-black/60 bg-white/60 backdrop-blur-2xl border-t dark:border-white/10 border-black/5 rounded-t-[2.5rem]">
      <p className="text-muted text-xs text-center mb-6 font-medium">Align your document within the glowing frame. Ensure all four corners are visible.</p>
      <div className="flex items-center justify-between gap-4">
        <button className="w-12 h-12 rounded-full dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted">
          <Flashlight className="w-6 h-6" />
        </button>
        <button 
          onClick={onNext}
          className="flex-1 bg-[#8242f0] hover:bg-[#8242f0]/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)]"
        >
          <Camera className="w-6 h-6" />
          <span>Capture</span>
        </button>
        <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
      <div className="w-32 h-1.5 bg-slate-600/30 rounded-full mx-auto mt-8"></div>
    </div>
  </motion.div>
);

const ReviewData = ({ onNext }: { onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -20 }}
    className="flex-1 overflow-y-auto px-6 pb-6"
  >
    <div className="px-0 flex gap-1 mb-6">
      <div className="h-1 flex-1 bg-[#8651e1] rounded-full"></div>
      <div className="h-1 flex-1 bg-[#8651e1] rounded-full"></div>
      <div className="h-1 flex-1 bg-[#8651e1] rounded-full"></div>
      <div className="h-1 flex-1 bg-[#8651e1]/20 rounded-full"></div>
    </div>

    <div className="mb-6">
      <h1 className="text-2xl font-bold text-main mb-2">Review Data</h1>
      <p className="text-muted text-sm leading-relaxed">
        Verify your extracted identity information. This data will be used to mint your CasperID NFT.
      </p>
    </div>

    <div className="space-y-5">
      {[
        { label: 'Full Name', value: 'Alexander Sterling', icon: User },
        { label: 'ID Number', value: 'G-2940-8831-22', icon: CreditCard },
        { label: 'Date of Birth', value: '14 May 1992', icon: Calendar },
        { label: 'Nationality', value: 'United Kingdom', icon: Globe }
      ].map(field => (
        <div key={field.label} className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#8651e1]/80 ml-1">{field.label}</label>
          <div className="dark:bg-white/5 bg-black/5 rounded-2xl flex items-center px-4 py-3 border dark:border-white/10 border-black/5 group focus-within:ring-2 focus-within:ring-[#8651e1]/40 transition-all">
            <field.icon className="text-[#8651e1]/60 mr-3 w-5 h-5" />
            <input 
              className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-medium" 
              type="text" 
              defaultValue={field.value} 
            />
          </div>
        </div>
      ))}
      
      <div className="mt-8 relative h-32 w-full rounded-2xl overflow-hidden border border-[#8651e1]/20 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#8651e1]/20 to-cyan-500/10 blur-sm"></div>
        <div className="absolute inset-0 bg-[#8651e1]/10 flex flex-col items-center justify-center p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-[#8651e1] w-5 h-5" />
            <span className="text-xs font-bold text-slate-200">ID Document Scanned Successfully</span>
          </div>
          <button className="mt-2 text-[10px] text-[#8651e1] underline font-medium" type="button">Retake Photo</button>
        </div>
      </div>
    </div>

    <div className="mt-8">
      <button 
        onClick={onNext}
        className="w-full bg-[#8651e1] hover:bg-[#8651e1]/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#8651e1]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        <span>Confirm & Mint</span>
        <Sparkles className="w-5 h-5" />
      </button>
      <p className="text-center text-[10px] mt-4 text-slate-500">
        Secured by CasperID Protocol. Variant 8/10.
      </p>
    </div>
  </motion.div>
);

const MintingIdentity = ({ onNext }: { onNext: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onNext, 4000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center px-8 text-center"
    >
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#8651e1]/20 animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-4 rounded-full border-2 border-[#6DE8EC]/20 animate-[spin_6s_linear_infinite_reverse]"></div>
        
        <motion.div 
          animate={{ rotateY: [0, 180, 360], y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-40 h-56 bg-[#8651e1]/10 backdrop-blur-xl border border-[#8651e1]/30 rounded-2xl flex flex-col p-4 shadow-[0_0_50px_-12px_rgba(114,43,238,0.5)]"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-8 h-8 rounded bg-[#8651e1]/30 flex items-center justify-center">
              <Shield className="text-[#8651e1] w-4 h-4" />
            </div>
            <div className="w-6 h-1 bg-[#8651e1]/40 rounded-full"></div>
          </div>
          <div className="space-y-3 mb-auto">
            <div className="h-2 w-3/4 bg-[#8651e1]/20 rounded-full"></div>
            <div className="h-2 w-1/2 bg-[#8651e1]/20 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="size-6 rounded-full bg-gradient-to-tr from-[#8651e1] to-[#6DE8EC] overflow-hidden border border-white/10"></div>
            <div className="flex flex-col items-start">
              <div className="h-1.5 w-12 bg-white/20 rounded-full mb-1"></div>
              <div className="h-1 w-8 bg-white/10 rounded-full"></div>
            </div>
          </div>
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8651e1]/10 to-transparent h-1/2 w-full"
          />
        </motion.div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold dark:bg-gradient-to-r dark:from-slate-100 dark:to-slate-400 bg-slate-900 bg-clip-text dark:text-transparent text-slate-900">
          Minting your Identity...
        </h2>
        <p className="dark:text-slate-400 text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
          Securing your decentralized identity on the Casper Network. This will take a moment.
        </p>
      </div>

      <div className="w-full mt-12 p-6 dark:bg-[#8651e1]/5 bg-[#8651e1]/5 border-t dark:border-white/5 border-black/5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-[#8651e1] uppercase tracking-widest">Transaction Status</span>
          <span className="text-xs font-bold text-[#6DE8EC]">65% Complete</span>
        </div>
        <div className="w-full h-1.5 dark:bg-[#8651e1]/10 bg-[#8651e1]/10 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '65%' }}
            className="h-full bg-gradient-to-r from-[#8651e1] to-[#6DE8EC] rounded-full shadow-[0_0_10px_rgba(114,43,238,0.5)]"
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2 dark:bg-[#8651e1]/10 bg-[#8651e1]/10 rounded-xl border dark:border-[#8651e1]/10 border-[#8651e1]/5">
          <Network className="text-[#8651e1] w-4 h-4" />
          <p className="text-[10px] dark:text-slate-300 text-slate-600 font-medium">Broadcasting to Casper Mainnet Node...</p>
        </div>
      </div>
    </motion.div>
  );
};

const IdentityVerified = ({ onNext }: { onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }} 
    animate={{ opacity: 1, scale: 1 }} 
    exit={{ opacity: 0, scale: 1.1 }}
    className="flex-1 flex flex-col items-center justify-center px-8 text-center"
  >
    <div className="relative mb-10 group">
      <div className="absolute inset-0 bg-[#6fe8ec]/30 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
      <div className="relative w-32 h-32 rounded-full bg-[#6fe8ec] flex items-center justify-center shadow-[0_0_40px_rgba(111,232,236,0.4)] border-4 dark:border-white border-slate-100">
        <CheckCircle2 className="text-main w-16 h-16" />
      </div>
    </div>
    <h1 className="text-main text-3xl font-bold leading-tight mb-3">Identity Verified</h1>
    <p className="text-muted text-base leading-relaxed mb-12">Your CasperID has been successfully authenticated on the Casper blockchain. You're ready to go.</p>
    
    <div className="w-full dark:bg-white/5 bg-black/5 rounded-2xl p-5 border dark:border-white/5 border-black/5 mb-8 flex items-center justify-between text-left">
      <div className="flex flex-col gap-0.5">
        <span className="text-main font-bold text-sm">Share Data Consent</span>
        <p className="text-muted text-xs leading-normal">Authorize dApps to access your credentials</p>
      </div>
      <div className="w-11 h-6 bg-[#8651e1] rounded-full relative p-1">
        <div className="absolute right-1 top-1 size-4 bg-white rounded-full"></div>
      </div>
    </div>

    <button 
      onClick={onNext}
      className="w-full bg-[#6fe8ec] hover:brightness-105 active:scale-[0.98] transition-all text-slate-900 font-bold py-4 rounded-full shadow-lg shadow-[#6fe8ec]/20 flex items-center justify-center gap-2"
    >
      Return to App
      <ArrowRight className="w-5 h-5" />
    </button>
  </motion.div>
);

const PermissionsRequest = ({ onBack }: { onBack: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -20 }}
    className="flex-1 px-8 pt-8 flex flex-col items-center"
  >
    <div className="flex flex-col items-center gap-4 mb-10">
      <div className="relative">
        <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(134,81,225,0.3)] animate-pulse"></div>
        <div className="relative w-24 h-24 rounded-full border-2 border-[#8651e1]/40 p-1 bg-black/50">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-2xl">NF</div>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-main">NFT Marketplace</h1>
        <p className="text-[#8651e1]/70 text-sm font-medium mt-1">Requesting Access</p>
      </div>
    </div>

    <div className="w-full space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 px-1">Permissions Requested</h3>
      {[
        'Verify Identity Status',
        'Read Public Profile',
        'Share KYC Level'
      ].map(perm => (
        <div key={perm} className="flex items-center gap-4 p-4 rounded-2xl dark:bg-white/5 bg-black/5 border dark:border-white/5 border-black/5 group hover:dark:border-white/10 hover:border-black/10 transition-all">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-main">{perm}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 flex gap-3 p-4 rounded-2xl dark:bg-[#8651e1]/5 bg-[#8651e1]/5 border dark:border-[#8651e1]/10 border-[#8651e1]/5">
      <ShieldCheck className="text-[#8651e1] w-5 h-5 shrink-0" />
      <p className="text-xs leading-relaxed text-muted">
        <span className="font-bold text-main">Privacy Note:</span> Only cryptographic proofs are shared. No private keys are ever exposed to the application.
      </p>
    </div>

    <footer className="mt-auto w-full pb-8 flex flex-col gap-3">
      <button 
        onClick={onBack}
        className="w-full py-4 rounded-2xl bg-[#8651e1] hover:bg-[#8651e1]/90 text-white font-bold text-base shadow-xl shadow-[#8651e1]/20 transition-all flex items-center justify-center gap-2"
      >
        Approve & Verify
        <Verified className="w-5 h-5" />
      </button>
      <button onClick={onBack} className="w-full py-3 rounded-2xl bg-transparent dark:hover:bg-white/5 hover:bg-black/5 dark:text-slate-400 text-slate-500 font-semibold text-sm transition-all">
        Deny
      </button>
    </footer>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('AuthSelection');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const nextScreen = (next: Screen) => setScreen(next);
  const reset = () => setScreen('AuthSelection');

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4 selection:bg-[#8651e1]/30 transition-colors duration-500">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-[#8651e1]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[30%] bg-[#6DE8EC]/5 blur-[100px] rounded-full"></div>
      </div>

      <GlassContainer className="backdrop-blur-3xl">
        <Header 
          onBack={reset} 
          subtitle={screen === 'PermissionsRequest' ? 'NFT MARKETPLACE' : 'SECURE SDK'}
          showClose={screen !== 'AuthSelection'}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {screen === 'AuthSelection' && (
              <motion.div key="auth" className="flex-1 flex flex-col">
                <AuthSelection onNext={(method) => nextScreen(method === 'otp' ? 'Login' : 'SecurityUpgrade')} />
              </motion.div>
            )}
            {screen === 'Login' && (
              <motion.div key="login" className="flex-1 flex flex-col">
                <Login onNext={() => nextScreen('PinVerification')} />
              </motion.div>
            )}
            {screen === 'PinVerification' && (
              <motion.div key="pin" className="flex-1 flex flex-col">
                <PinVerification onNext={() => nextScreen('SecurityUpgrade')} />
              </motion.div>
            )}
            {screen === 'SecurityUpgrade' && (
              <motion.div key="upgrade" className="flex-1 flex flex-col">
                <SecurityUpgrade onNext={() => nextScreen('FaceScan')} />
              </motion.div>
            )}
            {screen === 'FaceScan' && (
              <motion.div key="face" className="flex-1 flex flex-col">
                <FaceScan onNext={() => nextScreen('VerifyIdentityChoice')} />
              </motion.div>
            )}
            {screen === 'VerifyIdentityChoice' && (
              <motion.div key="choice" className="flex-1 flex flex-col">
                <VerifyIdentityChoice onNext={() => nextScreen('DocumentScan')} />
              </motion.div>
            )}
            {screen === 'DocumentScan' && (
              <motion.div key="doc" className="flex-1 flex flex-col">
                <DocumentScan onNext={() => nextScreen('ReviewData')} />
              </motion.div>
            )}
            {screen === 'ReviewData' && (
              <motion.div key="review" className="flex-1 flex flex-col">
                <ReviewData onNext={() => nextScreen('MintingIdentity')} />
              </motion.div>
            )}
            {screen === 'MintingIdentity' && (
              <motion.div key="mint" className="flex-1 flex flex-col">
                <MintingIdentity onNext={() => nextScreen('IdentityVerified')} />
              </motion.div>
            )}
            {screen === 'IdentityVerified' && (
              <motion.div key="verified" className="flex-1 flex flex-col">
                <IdentityVerified onNext={() => nextScreen('PermissionsRequest')} />
              </motion.div>
            )}
            {screen === 'PermissionsRequest' && (
              <motion.div key="perms" className="flex-1 flex flex-col">
                <PermissionsRequest onBack={reset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Footer for some screens */}
        {['AuthSelection', 'Login', 'PinVerification'].includes(screen) && (
          <Footer>
            <p className="text-[11px] text-slate-500 font-medium">
              By connecting, you agree to our 
              <a className="text-[#8651e1] hover:underline ml-1" href="#">Terms of Service</a> & 
              <a className="text-[#8651e1] hover:underline ml-1" href="#">Privacy Policy</a>
            </p>
          </Footer>
        )}
      </GlassContainer>

      {/* Decorative elements outside the modal */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 pointer-events-none">
        <Lock className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">End-to-End Encrypted by CasperID Protocol</span>
      </div>
    </div>
  );
}
