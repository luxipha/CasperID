import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { t } from '../utils/i18n';

interface IdentityVerifiedProps {
    onNext: () => void;
}

const IdentityVerified: React.FC<IdentityVerifiedProps & { language?: string }> = ({ onNext, language = 'EN' }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="flex-1 flex flex-col items-center justify-center px-8 text-center"
    >
        {/* Success icon with glow */}
        <div className="relative mb-10 group">
            <div className="absolute inset-0 bg-[#6fe8ec]/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all" />
            <div className="relative w-32 h-32 rounded-2xl bg-[#6fe8ec] flex items-center justify-center shadow-[0_0_40px_rgba(111,232,236,0.4)] border-4 dark:border-white border-slate-100">
                <CheckCircle2 className="text-slate-900 w-16 h-16" />
            </div>
        </div>

        <h1 className="text-main text-3xl font-bold leading-tight mb-3">{t('identity_verified', language)}</h1>
        <p className="text-muted text-base leading-relaxed mb-12">
            {t('identity_verified_desc', language)}
        </p>

        {/* Data consent toggle */}
        <div className="w-full dark:bg-white/5 bg-black/5 rounded-2xl p-5 mb-8 flex items-center justify-between text-left">
            <div className="flex flex-col gap-0.5">
                <span className="text-main font-bold text-sm">{t('share_data_consent', language)}</span>
                <p className="text-muted text-xs leading-normal">{t('authorize_dapps', language)}</p>
            </div>
            <div className="w-11 h-6 bg-brand rounded-full relative p-1 cursor-pointer">
                <div className="absolute right-1 top-1 size-4 bg-white rounded-full" />
            </div>
        </div>

        <button
            onClick={onNext}
            className="w-full bg-[#6fe8ec] hover:brightness-105 active:scale-[0.98] transition-all text-slate-900 font-bold py-4 rounded-2xl shadow-lg shadow-[#6fe8ec]/20 flex items-center justify-center gap-2"
        >
            {t('return_to_app', language)}
            <ArrowRight className="w-5 h-5" />
        </button>
    </motion.div>
);

export default IdentityVerified;
