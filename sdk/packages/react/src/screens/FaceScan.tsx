import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface FaceScanProps {
    onNext: () => void;
}

const instructions = [
    'Align your face within the frame',
    'Blink your eyes',
    'Look left',
    'Look right',
    'Processing...',
];

const FaceScan: React.FC<FaceScanProps> = ({ onNext }) => {
    const [step, setStep] = React.useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => {
                if (prev < instructions.length - 1) return prev + 1;
                clearInterval(timer);
                setTimeout(onNext, 1000);
                return prev;
            });
        }, 2500);
        return () => clearInterval(timer);
    }, [onNext]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative dark:bg-[#050a0a] bg-slate-50 overflow-hidden"
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6fe8ec]/30 via-transparent to-transparent" />
            </div>

            {/* Top badge */}
            <div className="relative z-40 pt-12 pb-4 flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-1.5 dark:bg-black/40 bg-white/40 backdrop-blur-md rounded-full border dark:border-white/5 border-black/5">
                    <div className="w-2 h-2 rounded-full bg-[#6fe8ec] shadow-[0_0_8px_#6fe8ec]" />
                    <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold">Secure SDK</span>
                </div>
            </div>

            {/* Scan area */}
            <div className="relative z-20 flex-1 flex items-center justify-center">
                {/* Frosted mask with oval hole */}
                <div
                    className="absolute inset-0 z-10 dark:bg-[#050a0a]/80 bg-white/80 backdrop-blur-[2px]"
                    style={{
                        mask: 'radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)',
                        WebkitMask: 'radial-gradient(ellipse 100px 145px at center, transparent 99%, black 100%)',
                    }}
                />

                <div className="relative z-30 flex items-center justify-center">
                    {/* Oval biometric frame */}
                    <div className="w-[200px] h-[290px] flex-shrink-0 rounded-full border-[3px] border-[#6fe8ec] shadow-[0_0_40px_rgba(111,232,236,0.4),inset_0_0_20px_rgba(111,232,236,0.2)] relative overflow-hidden">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border-[1px] border-white/30"
                        />
                        <motion.div
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#6fe8ec] to-transparent shadow-[0_0_20px_#6fe8ec] z-10"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(111,232,236,0.05)_100%)]" />
                    </div>

                    {/* Corner brackets */}
                    <div className="absolute w-[280px] h-[380px] pointer-events-none flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#6fe8ec]/30 rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#6fe8ec]/30 rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#6fe8ec]/30 rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#6fe8ec]/30 rounded-br-2xl" />
                    </div>
                </div>
            </div>

            {/* Instruction card */}
            <footer className="relative z-40 p-8 flex flex-col items-center gap-6">
                <div className="dark:bg-[#0a1515]/95 bg-white/90 backdrop-blur-2xl border dark:border-white/10 border-black/5 w-full p-6 rounded-[2.5rem] text-center shadow-2xl">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-[#6fe8ec] font-bold text-2xl tracking-tight mb-2"
                        >
                            {instructions[step]}
                        </motion.p>
                    </AnimatePresence>
                    <div className="flex items-center justify-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest">
                        <Lock className="w-3 h-3" />
                        Secure Face Scan • Encrypted
                    </div>
                </div>

                {/* Progress dots */}
                <div className="flex gap-2 w-full max-w-[140px]">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i <= Math.floor((step / (instructions.length - 1)) * 2)
                                    ? 'bg-[#6fe8ec] shadow-[0_0_15px_#6fe8ec]'
                                    : 'dark:bg-slate-800 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                <div className="px-6 py-2.5 dark:bg-black/60 bg-white/60 backdrop-blur-md rounded-full border dark:border-white/5 border-black/5 flex items-center gap-3">
                    <div
                        className={`w-2 h-2 rounded-full ${step === instructions.length - 1
                                ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                                : 'bg-[#6fe8ec] animate-pulse'
                            }`}
                    />
                    <span className="text-[10px] dark:text-slate-400 text-slate-600 uppercase tracking-[0.25em] font-black">
                        {step === instructions.length - 1 ? 'Calibration Complete' : 'Awaiting Calibration'}
                    </span>
                </div>
            </footer>
        </motion.div>
    );
};

export default FaceScan;
