import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Puzzle, ChevronRight, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuthSelectionProps {
    onNext: (method: 'extension' | 'otp') => void;
}

const AuthSelection: React.FC<AuthSelectionProps> = ({ onNext }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex-1 px-8 flex flex-col justify-center gap-8"
    >
        <div className="text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-[var(--casperid-primary,#8651e1)]/20 blur-2xl rounded-full" />
                <div className="relative w-full h-full glass-container flex items-center justify-center rounded-full border border-[var(--casperid-primary,#8651e1)]/30">
                    <Fingerprint className="w-10 h-10 text-[var(--casperid-primary,#8651e1)]" />
                </div>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-main">Welcome Back</h1>
            <p className="text-muted text-sm leading-relaxed">
                Secure your Web3 identity with our premium authentication layer.
            </p>
        </div>

        <div className="space-y-4">
            <button
                onClick={() => onNext('extension')}
                className="w-full group relative overflow-hidden flex items-center gap-4 bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white py-5 px-6 rounded-2xl font-bold transition-all transform active:scale-[0.98]"
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
                <div className="bg-[var(--casperid-primary,#8651e1)]/10 p-2 rounded-lg">
                    <Smartphone className="w-5 h-5 text-[var(--casperid-primary,#8651e1)]" />
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
                <ShieldCheck className="w-5 h-5 text-[var(--casperid-primary,#8651e1)]" />
                <span className="text-[10px] font-bold text-muted">FULLY AUDITED</span>
            </div>
            <div className="glass-container p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-slate-200/50">
                <RefreshCw className="w-5 h-5 text-[var(--casperid-primary,#8651e1)]" />
                <span className="text-[10px] font-bold text-muted">NON-CUSTODIAL</span>
            </div>
        </div>
    </motion.div>
);

export default AuthSelection;
