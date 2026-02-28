import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Network } from 'lucide-react';

interface MintingIdentityProps {
    onNext: () => void;
}

const MintingIdentity: React.FC<MintingIdentityProps> = ({ onNext }) => {
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
            {/* Rotating card animation */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[var(--casperid-primary,#8651e1)]/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-2 border-[#6DE8EC]/20 animate-[spin_6s_linear_infinite_reverse]" />

                <motion.div
                    animate={{ rotateY: [0, 180, 360], y: [-10, 10, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-40 h-56 bg-[var(--casperid-primary,#8651e1)]/10 backdrop-blur-xl border border-[var(--casperid-primary,#8651e1)]/30 rounded-2xl flex flex-col p-4 shadow-[0_0_50px_-12px_rgba(114,43,238,0.5)]"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-8 h-8 rounded bg-[var(--casperid-primary,#8651e1)]/30 flex items-center justify-center">
                            <Shield className="text-[var(--casperid-primary,#8651e1)] w-4 h-4" />
                        </div>
                        <div className="w-6 h-1 bg-[var(--casperid-primary,#8651e1)]/40 rounded-full" />
                    </div>
                    <div className="space-y-3 mb-auto">
                        <div className="h-2 w-3/4 bg-[var(--casperid-primary,#8651e1)]/20 rounded-full" />
                        <div className="h-2 w-1/2 bg-[var(--casperid-primary,#8651e1)]/20 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <div className="size-6 rounded-full bg-gradient-to-tr from-[var(--casperid-primary,#8651e1)] to-[#6DE8EC] overflow-hidden border border-white/10" />
                        <div className="flex flex-col items-start">
                            <div className="h-1.5 w-12 bg-white/20 rounded-full mb-1" />
                            <div className="h-1 w-8 bg-white/10 rounded-full" />
                        </div>
                    </div>
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--casperid-primary,#8651e1)]/10 to-transparent h-1/2 w-full"
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

            {/* Transaction status */}
            <div className="w-full mt-12 p-6 dark:bg-[var(--casperid-primary,#8651e1)]/5 bg-[var(--casperid-primary,#8651e1)]/5 border-t dark:border-white/5 border-black/5">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-[var(--casperid-primary,#8651e1)] uppercase tracking-widest">
                        Transaction Status
                    </span>
                    <span className="text-xs font-bold text-[#6DE8EC]">65% Complete</span>
                </div>
                <div className="w-full h-1.5 dark:bg-[var(--casperid-primary,#8651e1)]/10 bg-[var(--casperid-primary,#8651e1)]/10 rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '65%' }}
                        className="h-full bg-gradient-to-r from-[var(--casperid-primary,#8651e1)] to-[#6DE8EC] rounded-full shadow-[0_0_10px_rgba(114,43,238,0.5)]"
                    />
                </div>
                <div className="flex items-center gap-3 px-3 py-2 dark:bg-[var(--casperid-primary,#8651e1)]/10 bg-[var(--casperid-primary,#8651e1)]/10 rounded-xl border dark:border-[var(--casperid-primary,#8651e1)]/10 border-[var(--casperid-primary,#8651e1)]/5">
                    <Network className="text-[var(--casperid-primary,#8651e1)] w-4 h-4" />
                    <p className="text-[10px] dark:text-slate-300 text-slate-600 font-medium">
                        Broadcasting to Casper Mainnet Node...
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default MintingIdentity;
