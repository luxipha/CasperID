import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface IdentityVerifiedProps {
    onNext: () => void;
}

const IdentityVerified: React.FC<IdentityVerifiedProps> = ({ onNext }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="flex-1 flex flex-col items-center justify-center px-8 text-center"
    >
        {/* Success icon with glow */}
        <div className="relative mb-10 group">
            <div className="absolute inset-0 bg-[#6fe8ec]/30 rounded-full blur-3xl group-hover:blur-2xl transition-all" />
            <div className="relative w-32 h-32 rounded-full bg-[#6fe8ec] flex items-center justify-center shadow-[0_0_40px_rgba(111,232,236,0.4)] border-4 dark:border-white border-slate-100">
                <CheckCircle2 className="text-slate-900 w-16 h-16" />
            </div>
        </div>

        <h1 className="text-main text-3xl font-bold leading-tight mb-3">Identity Verified</h1>
        <p className="text-muted text-base leading-relaxed mb-12">
            Your CasperID has been successfully authenticated on the Casper blockchain. You're ready to go.
        </p>

        {/* Data consent toggle */}
        <div className="w-full dark:bg-white/5 bg-black/5 rounded-2xl p-5 border dark:border-white/5 border-black/5 mb-8 flex items-center justify-between text-left">
            <div className="flex flex-col gap-0.5">
                <span className="text-main font-bold text-sm">Share Data Consent</span>
                <p className="text-muted text-xs leading-normal">Authorize dApps to access your credentials</p>
            </div>
            <div className="w-11 h-6 bg-[var(--casperid-primary,#8651e1)] rounded-full relative p-1 cursor-pointer">
                <div className="absolute right-1 top-1 size-4 bg-white rounded-full" />
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

export default IdentityVerified;
