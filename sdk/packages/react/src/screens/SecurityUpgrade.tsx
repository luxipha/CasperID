import React from 'react';
import { motion } from 'framer-motion';
import { Verified, RefreshCw } from 'lucide-react';

interface SecurityUpgradeProps {
    onNext: () => void;
    onSkip?: () => void;
}

const SecurityUpgrade: React.FC<SecurityUpgradeProps> = ({ onNext, onSkip }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col"
    >
        <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--casperid-primary,#8651e1)]/80">
                    Verification Step
                </span>
                <span className="text-xs font-bold text-muted">KYC Required</span>
            </div>
            <div className="w-full bg-[var(--casperid-primary,#8651e1)]/10 h-1.5 rounded-full overflow-hidden">
                <div
                    className="bg-[var(--casperid-primary,#8651e1)] h-full rounded-full"
                    style={{ width: '40%' }}
                />
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
            <div className="relative group">
                <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--casperid-primary,#8651e1)]/20 to-[var(--casperid-primary,#8651e1)]/5 flex items-center justify-center border border-[var(--casperid-primary,#8651e1)]/30 shadow-inner">
                    <Verified className="w-16 h-16 text-[var(--casperid-primary,#8651e1)]" />
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full dark:bg-[#171220] bg-white border-2 border-[var(--casperid-primary,#8651e1)] flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-[var(--casperid-primary,#8651e1)]" />
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
                <span className="px-3 py-1 bg-[var(--casperid-primary,#8651e1)]/10 rounded-full text-[10px] font-bold text-[var(--casperid-primary,#8651e1)] uppercase tracking-tighter border border-[var(--casperid-primary,#8651e1)]/10">
                    Biometric Secure
                </span>
                <span className="px-3 py-1 bg-cyan-400/10 rounded-full text-[10px] font-bold text-cyan-500 uppercase tracking-tighter border border-cyan-400/10">
                    Zero-Knowledge
                </span>
            </div>
        </div>

        <div className="p-8 space-y-4">
            <button
                onClick={onNext}
                className="w-full bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white rounded-full py-4 font-bold text-lg shadow-xl shadow-[var(--casperid-primary,#8651e1)]/30 transition-all active:scale-[0.98]"
            >
                Start Upgrade
            </button>
            {onSkip && (
                <button
                    onClick={onSkip}
                    className="w-full dark:text-slate-400 text-slate-500 text-sm font-bold dark:hover:text-slate-200 hover:text-slate-800 transition-colors"
                >
                    I'll do this later
                </button>
            )}
        </div>
    </motion.div>
);

export default SecurityUpgrade;
