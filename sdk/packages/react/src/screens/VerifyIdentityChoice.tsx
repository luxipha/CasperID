import React from 'react';
import { motion } from 'framer-motion';
import { Globe, CreditCard, Smartphone, ShieldCheck, ChevronRight } from 'lucide-react';

interface VerifyIdentityChoiceProps {
    onNext: () => void;
}

const docs = [
    { id: 'passport', title: 'Passport', desc: 'All countries supported', Icon: Globe },
    { id: 'license', title: 'Driver License', desc: 'Government issued card', Icon: CreditCard },
    { id: 'idcard', title: 'ID Card', desc: 'National identity document', Icon: Smartphone },
];

const VerifyIdentityChoice: React.FC<VerifyIdentityChoiceProps> = ({ onNext }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex-1 px-6 pt-4 flex flex-col"
    >
        <h3 className="text-2xl font-bold mb-2 text-main">Verify Identity</h3>
        <p className="text-muted text-sm mb-8 leading-relaxed">
            Choose a document type to start the secure verification process.
        </p>

        <div className="space-y-4 overflow-y-auto pr-1 pb-6">
            {docs.map(({ id, title, desc, Icon }) => (
                <button
                    key={id}
                    onClick={onNext}
                    className="w-full group cursor-pointer dark:bg-white/5 bg-slate-100/50 border dark:border-white/10 border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:dark:bg-[var(--casperid-primary,#8651e1)]/15 hover:bg-[var(--casperid-primary,#8651e1)]/5 hover:dark:border-[var(--casperid-primary,#8651e1)]/40 hover:border-[var(--casperid-primary,#8651e1)]/30 transition-all transform hover:-translate-y-1"
                >
                    <div className="w-14 h-14 rounded-xl dark:bg-slate-800/50 bg-white flex items-center justify-center text-[var(--casperid-primary,#8651e1)] group-hover:bg-[var(--casperid-primary,#8651e1)]/20 transition-colors border dark:border-transparent border-slate-100">
                        <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="font-bold text-base text-main">{title}</h4>
                        <p className="text-xs text-muted font-medium">{desc}</p>
                    </div>
                    <ChevronRight className="text-[var(--casperid-primary,#8651e1)] w-5 h-5" />
                </button>
            ))}

            <div className="mt-8 relative h-32 w-full rounded-2xl overflow-hidden dark:bg-white/5 bg-slate-100/30 flex items-center justify-center border border-dashed dark:border-[var(--casperid-primary,#8651e1)]/30 border-[var(--casperid-primary,#8651e1)]/40">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--casperid-primary,#8651e1)] via-transparent to-transparent" />
                <div className="text-center z-10">
                    <ShieldCheck className="text-[var(--casperid-primary,#8651e1)]/40 w-10 h-10 mx-auto mb-1" />
                    <p className="text-[10px] text-muted uppercase tracking-tighter font-bold">Encrypted E2E</p>
                </div>
            </div>
        </div>
    </motion.div>
);

export default VerifyIdentityChoice;
