import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Verified, Lock, ArrowRight } from 'lucide-react';

interface LoginProps {
    onNext: () => void;
}

const Login: React.FC<LoginProps> = ({ onNext }) => (
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
                        className="w-full dark:bg-black/20 bg-slate-100/50 border dark:border-white/10 border-slate-200 rounded-2xl h-14 px-5 text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--casperid-primary,#8651e1)]/30 transition-all font-medium"
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
                className="w-full h-14 bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white font-bold rounded-2xl shadow-xl shadow-[var(--casperid-primary,#8651e1)]/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>

        <div className="mt-auto pb-8">
            <div className="p-4 dark:bg-white/5 bg-slate-100/50 rounded-2xl border dark:border-white/5 border-slate-200/50 mb-6">
                <div className="flex items-start gap-3">
                    <Verified className="text-[#6DE8EC] w-5 h-5 mt-0.5 shrink-0" />
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

export default Login;
