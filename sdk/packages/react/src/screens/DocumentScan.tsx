import React from 'react';
import { motion } from 'framer-motion';
import { Camera, HelpCircle, Flashlight } from 'lucide-react';

interface DocumentScanProps {
    onNext: () => void;
}

const DocumentScan: React.FC<DocumentScanProps> = ({ onNext }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col relative"
    >
        {/* Simulated dark camera background */}
        <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <div className="w-full h-full opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#6DE8EC]/20 via-transparent to-transparent" />
            </div>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>

        {/* Top label */}
        <div className="relative z-10 p-6 flex flex-col items-center">
            <div className="text-center px-4 py-2 dark:bg-black/40 bg-white/40 backdrop-blur-xl rounded-full border dark:border-white/10 border-black/5">
                <h3 className="text-main text-sm font-medium tracking-wide uppercase">Scan the front of your ID</h3>
            </div>
        </div>

        {/* ID frame */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
            <div className="w-full aspect-[1.58/1] relative">
                <div className="absolute inset-0 border border-[#6DE8EC] rounded-2xl shadow-[0_0_20px_rgba(109,232,236,0.3),inset_0_0_15px_rgba(109,232,236,0.2)]" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#6DE8EC] rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#6DE8EC] rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#6DE8EC] rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#6DE8EC] rounded-br-2xl" />
                <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6DE8EC] to-transparent opacity-50"
                />
            </div>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 p-8 dark:bg-black/60 bg-white/60 backdrop-blur-2xl border-t dark:border-white/10 border-black/5 rounded-t-[2.5rem]">
            <p className="text-muted text-xs text-center mb-6 font-medium">
                Align your document within the glowing frame. Ensure all four corners are visible.
            </p>
            <div className="flex items-center justify-between gap-4">
                <button className="w-12 h-12 rounded-full dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted">
                    <Flashlight className="w-6 h-6" />
                </button>
                <button
                    onClick={onNext}
                    className="flex-1 bg-[var(--casperid-primary,#8651e1)] hover:bg-[var(--casperid-primary,#8651e1)]/90 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(130,66,240,0.5)]"
                >
                    <Camera className="w-6 h-6" />
                    <span>Capture</span>
                </button>
                <button className="w-12 h-12 rounded-full dark:bg-white/5 bg-black/5 flex items-center justify-center text-muted">
                    <HelpCircle className="w-6 h-6" />
                </button>
            </div>
            <div className="w-32 h-1.5 bg-slate-600/30 rounded-full mx-auto mt-8" />
        </div>
    </motion.div>
);

export default DocumentScan;
