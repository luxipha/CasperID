import React from 'react';
import { motion } from 'framer-motion';
import { Verified, RefreshCw } from 'lucide-react';
import { t } from '../utils/i18n';

interface SecurityUpgradeProps {
    onNext: () => void;
    onSkip?: () => void;
    language?: string;
}

const SecurityUpgrade: React.FC<SecurityUpgradeProps> = ({ onNext, onSkip, language = 'EN' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col"
    >
        <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand/80">
                    {t('verification_step', language)}
                </span>
                <span className="text-xs font-bold text-muted">{t('kyc_required', language)}</span>
            </div>
            <div className="w-full bg-brand/10 h-1.5 rounded-full overflow-hidden">
                <div
                    className="bg-brand h-full rounded-full"
                    style={{ width: '40%' }}
                />
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-8">
            <div className="relative group">
                <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-brand-20 to-brand-5 flex items-center justify-center border border-brand-30 shadow-inner">
                    <Verified className="w-16 h-16 text-brand" />
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full dark:bg-[#171220] bg-white border-2 border-brand flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-brand" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-2xl font-bold tracking-tight text-main leading-tight">
                    {t('security_upgrade_required', language)}
                </h1>
                <p className="text-muted text-base leading-relaxed font-medium">
                    {t('security_upgrade_desc', language)}
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-brand/10 rounded-xl text-[10px] font-bold text-brand uppercase tracking-tighter border border-brand-10">
                    {t('biometric_secure', language)}
                </span>
                <span className="px-3 py-1 bg-cyan-400/10 rounded-xl text-[10px] font-bold text-cyan-500 uppercase tracking-tighter border border-cyan-400/10">
                    {t('zero_knowledge', language)}
                </span>
            </div>
        </div>

        <div className="p-8 space-y-4">
            <button
                onClick={onNext}
                className="w-full bg-brand hover:bg-brand/90 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-brand transition-all active:scale-[0.98]"
            >
                {t('start_upgrade', language)}
            </button>
            {onSkip && (
                <button
                    onClick={onSkip}
                    className="w-full dark:text-slate-400 text-slate-500 text-sm font-bold dark:hover:text-slate-200 hover:text-slate-800 transition-colors"
                >
                    {t('do_this_later', language)}
                </button>
            )}
        </div>
    </motion.div>
);

export default SecurityUpgrade;
