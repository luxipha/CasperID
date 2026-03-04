
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Shield, CheckCircle, MousePointer2, Coins, Gamepad2, Users, LayoutGrid, Briefcase, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

const APPS = [
    { icon: Coins, label: 'DEX', color: 'text-blue-400' },
    { icon: Gamepad2, label: 'Gaming', color: 'text-purple-400' },
    { icon: Users, label: 'DAO', color: 'text-emerald-400' },
    { icon: LayoutGrid, label: 'NFTs', color: 'text-orange-400' },
    { icon: Briefcase, label: 'Banking', color: 'text-rose-400' },
    { icon: Globe, label: 'Web3', color: 'text-cyan-400' },
];

const CinematicHero: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLDivElement>(null);
    const tagRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isApproved, setIsApproved] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [showApps, setShowApps] = useState(false);

    useEffect(() => {
        const tl = gsap.timeline({
            defaults: { ease: "power3.inOut" }
        });

        // Phase 1: The Hook (0.0s - 1.5s)
        tl.fromTo(tagRef.current,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
        );
        tl.fromTo(headlineRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.8 },
            "-=0.3"
        );

        // Phase 2: The Split (1.5s - 2.0s)
        tl.to(headlineRef.current, {
            x: "-35%",
            scale: 0.85,
            duration: 0.6,
            ease: "power4.inOut"
        }, 1.5);

        // Phase 3: The Reveal (2.0s - 2.5s)
        tl.fromTo(cardRef.current,
            { x: "100%", opacity: 0, rotateY: 20 },
            { x: "25%", opacity: 1, rotateY: 0, duration: 0.5, ease: "back.out(1.2)" },
            2.0
        );

        // Phase 4: The 'Aha!' Moment (2.5s - 4.5s)
        // Cursor enters
        tl.fromTo(cursorRef.current,
            { x: 400, y: 400, opacity: 0 },
            { x: 100, y: 260, opacity: 1, duration: 0.8, ease: "power2.out" },
            2.5
        );

        // Hover effect
        tl.to(cursorRef.current, {
            scale: 0.9,
            duration: 0.2,
            onComplete: () => setIsClicked(true)
        }, 3.5);

        // Click effect
        tl.to(cursorRef.current, {
            scale: 1,
            duration: 0.2,
            onComplete: () => {
                setIsApproved(true);
                gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, delay: 0.5 });
                // Trigger apps expansion after progress bar
                setTimeout(() => setShowApps(true), 2000);
            }
        }, 3.7);

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-[85vh] w-full overflow-hidden flex items-start justify-center perspective-1000 pt-[15vh] pb-20"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center">
                <div ref={headlineRef} className="text-left flex flex-col items-start">
                    {/* Phase 1: The Hook Content */}
                    <div ref={tagRef} className="mb-6">
                        <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Coming Soon: SDK</span>
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 leading-none">
                        Verify once.
                    </h1>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mt-4 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent animate-gradient-x">
                        Reuse everywhere
                    </h2>
                    <p className="mt-8 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-medium">
                        Reusable KYC and liveness verification powered by Zero-Knowledge proofs. One secure identity, infinite applications.
                    </p>
                </div>

                {/* Phase 3: The Reveal Card */}
                <div
                    ref={cardRef}
                    className="absolute right-4 md:right-16 lg:right-24 top-1/2 -translate-y-1/2 w-full max-w-md opacity-0 pointer-events-none"
                >
                    <div className="relative flex items-center justify-center">
                        {/* App Icons Expansion */}
                        <AnimatePresence>
                            {showApps && APPS.map((app, index) => {
                                const angle = (index / APPS.length) * Math.PI * 2;
                                const radius = 240; // Distance from center
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <motion.div
                                        key={app.label}
                                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                        animate={{
                                            x,
                                            y,
                                            opacity: 1,
                                            scale: 1,
                                            transition: {
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 15,
                                                delay: index * 0.1
                                            }
                                        }}
                                        className="absolute z-0 flex flex-col items-center gap-2"
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-xl",
                                            "hover:scale-110 transition-transform cursor-pointer group"
                                        )}>
                                            <app.icon className={cn("w-6 h-6", app.color)} />
                                            {/* Glow effect */}
                                            <div className={cn("absolute inset-0 blur-xl opacity-20 rounded-full", app.color.replace('text', 'bg'))}></div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{app.label}</span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <motion.div
                            animate={showApps ? { scale: 0.85 } : { scale: 1 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="relative z-10 w-full"
                        >
                            {/* Glassmorphic Card */}
                            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>

                                <AnimatePresence mode="wait">
                                    {!isApproved ? (
                                        <motion.div
                                            key="required"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            className="relative z-10 flex flex-col items-center text-center"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                                                <Shield className="w-8 h-8 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Identity Required</h3>
                                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                                To access trading features, please verify your identity securely.
                                            </p>

                                            <button
                                                className={cn(
                                                    "w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
                                                    isClicked ? "bg-primary scale-95" : "bg-primary hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                                                )}
                                            >
                                                Verify with CasperID
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="approved"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative z-10 flex flex-col items-center text-center"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                                            </div>
                                            <h3 className="text-3xl font-bold text-emerald-500 mb-2">Approved</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">
                                                Zero-Knowledge Proof verified.
                                            </p>
                                            <div className="mt-8 w-full h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                    className="h-full bg-emerald-500"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Simulated Cursor */}
                        <div
                            ref={cursorRef}
                            className="absolute z-50 pointer-events-none opacity-0"
                        >
                            <MousePointer2 className="w-8 h-8 text-white drop-shadow-lg fill-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scroll to explore</span>
                <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent"></div>
            </motion.div>
        </section>
    );
};

export default CinematicHero;
