import React from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Calendar, Globe, CheckCircle2, Sparkles } from 'lucide-react';

interface ReviewDataProps {
    onNext: () => void;
}

const fields = [
    { label: 'Full Name', value: 'Alexander Sterling', Icon: User },
    { label: 'ID Number', value: 'G-2940-8831-22', Icon: CreditCard },
    { label: 'Date of Birth', value: '14 May 1992', Icon: Calendar },
    { label: 'Nationality', value: 'United Kingdom', Icon: Globe },
];

const ReviewData: React.FC<ReviewDataProps> = ({ onNext }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex-1 overflow-y-auto px-6 pb-6"
    >
        {/* Progress bar */}
        <div className="flex gap-1 mb-6">
            {[1, 2, 3, 0].map((fill, i) => (
                <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${fill ? 'bg-[var(--casperid-primary,#8651e1)]' : 'bg-[var(--casperid-primary,#8651e1)]/20'}`}
                />
            ))}
        </div>

        <div className="mb-6">
            <h1 className="text-2xl font-bold text-main mb-2">Review Data</h1>
            <p className="text-muted text-sm leading-relaxed">
                Verify your extracted identity information. This data will be used to mint your CasperID.
            </p>
        </div>

        <div className="space-y-5">
            {fields.map(({ label, value, Icon }) => (
                <div key={label} className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--casperid-primary,#8651e1)]/80 ml-1">
                        {label}
                    </label>
                    <div className="dark:bg-white/5 bg-black/5 rounded-2xl flex items-center px-4 py-3 border dark:border-white/10 border-black/5 focus-within:ring-2 focus-within:ring-[var(--casperid-primary,#8651e1)]/40 transition-all">
                        <Icon className="text-[var(--casperid-primary,#8651e1)]/60 mr-3 w-5 h-5" />
                        <input
                            className="bg-transparent border-none p-0 w-full focus:ring-0 text-main font-medium"
                            type="text"
                            defaultValue={value}
                        />
                    </div>
                </div>
            ))}

            {/* Document scan thumbnail placeholder */}
            <div className="mt-8 relative h-32 w-full rounded-2xl overflow-hidden border border-[var(--casperid-primary,#8651e1)]/20 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--casperid-primary,#8651e1)]/20 to-cyan-500/10 blur-sm" />
                <div className="absolute inset-0 bg-[var(--casperid-primary,#8651e1)]/10 flex flex-col items-center justify-center p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-[var(--casperid-primary,#8651e1)] w-5 h-5" />
                        <span className="text-xs font-bold dark:text-slate-200 text-slate-700">ID Document Scanned Successfully</span>
                    </div>
                    <button className="mt-2 text-[10px] text-[var(--casperid-primary,#8651e1)] underline font-medium" type="button">
                        Retake Photo
                    </button>
                </div>
            </div>
        </div>

        <div className="mt-8">
            <button
                onClick={onNext}
                className="w-full bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[var(--casperid-primary,#8651e1)]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
                <span>Confirm &amp; Mint</span>
                <Sparkles className="w-5 h-5" />
            </button>
            <p className="text-center text-[10px] mt-4 text-slate-500">
                Secured by CasperID Protocol.
            </p>
        </div>
    </motion.div>
);

export default ReviewData;
