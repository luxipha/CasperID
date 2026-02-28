import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Delete, ArrowRight } from 'lucide-react';

interface PinVerificationProps {
    onNext: () => void;
}

const PinVerification: React.FC<PinVerificationProps> = ({ onNext }) => {
    const [pin] = useState(['4', '8', '', '', '', '']);

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
                    <div
                        key={i}
                        className="size-12 rounded-full glass-container flex items-center justify-center text-xl font-bold text-[#6DE8EC] border dark:border-white/10 border-slate-200"
                    >
                        {digit}
                        {i === 2 && !digit && (
                            <div className="w-0.5 h-5 bg-[var(--casperid-primary,#8651e1)] animate-pulse" />
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main"
                    >
                        {num}
                    </button>
                ))}
                <div className="h-14" />
                <button className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-xl font-bold transition-colors text-main">
                    0
                </button>
                <button className="h-14 rounded-2xl dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center transition-colors text-main">
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            <div className="mt-auto pb-8 space-y-4">
                <button
                    onClick={onNext}
                    className="w-full h-14 bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white font-bold rounded-full transition-all shadow-lg shadow-[var(--casperid-primary,#8651e1)]/20 flex items-center justify-center gap-2 group"
                >
                    Verify
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full h-14 dark:bg-white/5 hover:dark:bg-white/10 bg-slate-100 hover:bg-slate-200 text-muted font-bold rounded-full transition-all border dark:border-white/10 border-slate-200">
                    Resend Code
                </button>
            </div>
        </motion.div>
    );
};

export default PinVerification;
