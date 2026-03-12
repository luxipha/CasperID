import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Verified } from 'lucide-react';
import { t } from '../utils/i18n';

interface PermissionsRequestProps {
    appName?: string;
    appLogoFallback?: string;
    onApprove: () => void;
    onDeny: () => void;
    language?: string;
}

const permissions = [
    'perm_identity',
    'perm_profile',
    'perm_kyc',
];

const PermissionsRequest: React.FC<PermissionsRequestProps> = ({
    appName = 'This App',
    appLogoFallback,
    onApprove,
    onDeny,
    language = 'EN',
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex-1 px-8 pt-8 flex flex-col items-center"
    >
        <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative">
                <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(134,81,225,0.3)] animate-pulse" />
                <div className="relative w-24 h-24 rounded-full border-2 border-brand-40 p-1 dark:bg-black/50 bg-white">
                    {appLogoFallback ? (
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img src={appLogoFallback} alt={appName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-2xl">
                            {appName.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-main">{appName}</h1>
                <p className="text-brand/70 text-sm font-medium mt-1 uppercase tracking-wider">{t('requesting_access', language)}</p>
            </div>
        </div>

        <div className="w-full space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 px-1">
                {t('permission_request', language)}
            </h3>
            {permissions.map((perm) => (
                <div
                    key={perm}
                    className="flex items-center gap-4 p-4 rounded-2xl dark:bg-white/5 bg-black/5 transition-all"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-main">{t(perm, language)}</p>
                </div>
            ))}
        </div>

        <div className="mt-8 flex gap-3 p-4 rounded-2xl dark:bg-brand/5 bg-brand/5">
            <ShieldCheck className="text-brand w-5 h-5 shrink-0" />
            <p className="text-xs leading-relaxed text-muted">
                <span className="font-bold text-main">{t('privacy_note', language)}:</span> {t('privacy_desc', language)}
            </p>
        </div>

        <footer className="mt-auto w-full pb-8 flex flex-col gap-3">
            <button
                onClick={onApprove}
                className="w-full py-4 rounded-2xl bg-brand hover:bg-brand-90 text-white font-bold text-base shadow-xl shadow-brand transition-all flex items-center justify-center gap-2"
            >
                {t('approve_verify', language)}
                <Verified className="w-5 h-5" />
            </button>
            <button
                onClick={onDeny}
                className="w-full py-3 rounded-2xl bg-transparent dark:hover:bg-white/5 hover:bg-black/5 dark:text-slate-400 text-slate-500 font-semibold text-sm transition-all"
            >
                {t('deny', language)}
            </button>
        </footer>
    </motion.div>
);

export default PermissionsRequest;
