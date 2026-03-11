
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
    const cardContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isApproved, setIsApproved] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [showApps, setShowApps] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        let mm = gsap.matchMedia();

        mm.add({
            isLargeDesktop: "(min-width: 1441px)",
            is1366: "(min-width: 1025px) and (max-width: 1440px)",
            isMobile: "(max-width: 767px)"
        }, (context) => {
            let { isLargeDesktop, is1366, isMobile } = context.conditions as any;
            setIsMobile(isMobile);

            const tl = gsap.timeline({
                defaults: { ease: "power3.inOut" }
            });

            // Phase 1: The Hook (Common)
            tl.fromTo(tagRef.current,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
            );
            tl.fromTo(headlineRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.8 },
                "-=0.3"
            );

            if (isLargeDesktop) {
                // Phase 2: The Split — full animation for 1441px+ (1920, 2560, etc.)
                tl.to(headlineRef.current, {
                    x: "-20%",
                    scale: 0.85,
                    duration: 0.6,
                    ease: "power4.inOut"
                }, 1.5);

                // Phase 3: The Reveal
                tl.fromTo(cardContainerRef.current,
                    { x: "100%", opacity: 0, rotateY: 20 },
                    { x: "25%", opacity: 1, rotateY: 0, duration: 0.5, ease: "back.out(1.2)" },
                    2.0
                );

                // Phase 4: The 'Aha!' Moment
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
                        setTimeout(() => setShowApps(true), 2000);
                    }
                }, 3.7);

            } else if (is1366) {
                // Phase 2: Gentler split for 1366×768 — smaller shift keeps text on screen
                tl.to(headlineRef.current, {
                    x: "-8",
                    scale: 0.88,
                    duration: 0.6,
                    ease: "power4.inOut"
                }, 1.5);

                // Phase 3: Card reveal adjusted for narrower viewport
                tl.fromTo(cardContainerRef.current,
                    { x: "100%", opacity: 0, rotateY: 20 },
                    { x: "15%", opacity: 1, rotateY: 0, duration: 0.5, ease: "back.out(1.2)" },
                    2.0
                );

                // Phase 4: Cursor animation
                tl.fromTo(cursorRef.current,
                    { x: 300, y: 300, opacity: 0 },
                    { x: 80, y: 220, opacity: 1, duration: 0.8, ease: "power2.out" },
                    2.5
                );
                tl.to(cursorRef.current, {
                    scale: 0.9,
                    duration: 0.2,
                    onComplete: () => setIsClicked(true)
                }, 3.5);
                tl.to(cursorRef.current, {
                    scale: 1,
                    duration: 0.2,
                    onComplete: () => {
                        setIsApproved(true);
                        gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, delay: 0.5 });
                        setTimeout(() => setShowApps(true), 2000);
                    }
                }, 3.7);

            } else {
                // Mobile Timeline

                // Phase 2: Subtle push up
                tl.to(headlineRef.current, {
                    y: -20,
                    scale: 0.95,
                    duration: 0.6,
                    ease: "power4.inOut"
                }, 1.5);

                // Phase 3: Reveal card from bottom
                tl.fromTo(cardContainerRef.current,
                    { y: 50, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)", onComplete: () => {
                            // Auto-simulate click on mobile since no cursor
                            setTimeout(() => {
                                setIsClicked(true);
                                setTimeout(() => {
                                    setIsApproved(true);
                                    setTimeout(() => setShowApps(true), 2000);
                                }, 300);
                            }, 1000);
                        }
                    },
                    2.0
                );
            }

            return () => {
                tl.kill();
            };
        });

        return () => mm.revert();
    }, []);

    // Adjust radius for mobile apps diagram
    const radiusMap = isMobile ? 140 : 240;

    return (
        <section
            ref={containerRef}
            className="relative min-h-[85vh] w-full overflow-hidden flex items-start justify-center perspective-1000 pt-[15vh] pb-20 md:pb-0"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-primary/5 blur-[100px] md:blur-[160px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl px-4 flex flex-col items-center md:items-start md:block">
                <div ref={headlineRef} className="text-center md:text-left flex flex-col items-center md:items-start w-full md:w-auto relative z-20">
                    {/* Phase 1: The Hook Content */}
                    <div ref={tagRef} className="mb-6">
                        <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Coming Soon: SDK</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 leading-none">
                        Verify once.
                    </h1>
                    <h2 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter mt-2 md:mt-4 text-primary">
                        Reuse everywhere
                    </h2>
                    <p className="mt-6 md:mt-8 text-base md:text-xl text-slate-600 max-w-md md:max-w-2xl leading-relaxed font-medium">
                        Reusable KYC and liveness verification powered by Zero-Knowledge proofs. One secure identity, infinite applications.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 md:mt-10 flex items-center gap-3 md:gap-4">
                        <a
                            href="/dashboard"
                            className="px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-transform"
                        >
                            Get Started
                        </a>
                        <a
                            href="#identity-web"
                            className="px-6 py-3 rounded-full bg-slate-100 text-slate-800 text-sm font-semibold border border-slate-200 hover:-translate-y-0.5 transition-transform"
                        >
                            Explore use cases
                        </a>
                    </div>
                </div>

                {/* Phase 3: The Reveal Card */}
                <div
                    ref={cardContainerRef}
                    className="mt-24 sm:mt-32 md:mt-0 md:absolute md:right-4 lg:right-24 md:top-1/2 md:-translate-y-1/2 w-full max-w-sm md:max-w-md opacity-0 relative z-30"
                >
                    <div className="relative flex items-center justify-center">
                        {/* App Icons Expansion */}
                        <AnimatePresence>
                            {showApps && APPS.map((app, index) => {
                                const angle = (index / APPS.length) * Math.PI * 2;
                                const x = Math.cos(angle) * radiusMap;
                                const y = Math.sin(angle) * radiusMap;

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
                                            "w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-xl",
                                            "hover:scale-110 transition-transform cursor-pointer group"
                                        )}>
                                            <app.icon className={cn("w-5 h-5 md:w-6 md:h-6", app.color)} />
                                            {/* Glow effect */}
                                            <div className={cn("absolute inset-0 blur-xl opacity-20 rounded-full", app.color.replace('text', 'bg'))}></div>
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-800 transition-colors">{app.label}</span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <motion.div
                            animate={showApps ? (isMobile ? { scale: 0.7 } : { scale: 0.85 }) : { scale: 1 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="relative z-10 w-full"
                        >
                            {/* Glassmorphic Card */}
                            <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/40 md:bg-white/5 backdrop-blur-2xl shadow-xl md:shadow-2xl overflow-hidden mx-auto">
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
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 md:mb-6">
                                                <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 md:text-primary mb-2">Identity Required</h3>
                                            <p className="text-slate-600 md:text-slate-500 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed max-w-[250px]">
                                                To access trading features, please verify your identity securely.
                                            </p>

                                            <button
                                                className={cn(
                                                    "w-full py-3 md:py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-sm md:text-base",
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
                                            className="relative z-10 flex flex-col items-center text-center py-4"
                                        >
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 md:mb-6">
                                                <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-emerald-500 mb-2">Approved</h3>
                                            <p className="text-slate-600 md:text-slate-500 text-xs md:text-sm leading-relaxed">
                                                Zero-Knowledge Proof verified.
                                            </p>
                                            <div className="mt-6 md:mt-8 w-full h-1 bg-emerald-500/20 rounded-full overflow-hidden">
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

                        {/* Simulated Cursor - Desktop Only */}
                        <div
                            ref={cursorRef}
                            className="hidden md:block absolute z-50 pointer-events-none opacity-0"
                        >
                            <MousePointer2 className="w-8 h-8 text-slate-800 drop-shadow-lg fill-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scroll to explore</span>
                <div className="w-px h-8 md:h-12 bg-gradient-to-b from-primary to-transparent"></div>
            </motion.div>
        </section>
    );
};

export default CinematicHero;
