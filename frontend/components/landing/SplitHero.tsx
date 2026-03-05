
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const splitRef = useRef<HTMLDivElement>(null);
    const reelRef = useRef<HTMLDivElement>(null);
    const suffixRef = useRef<HTMLDivElement>(null);

    const personas = ['work', 'myagent', 'reviews', 'bank', 'Wallet', 'school', 'pay'];
    const [currentPersonaIndex, setCurrentPersonaIndex] = React.useState(0);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Pin the entire hero section
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top top',
                end: '+=300%',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    // Calculate which persona to show based on scroll progress
                    const progress = self.progress;
                    if (progress > 0.2 && progress < 0.8) {
                        const step = 0.6 / personas.length;
                        const index = Math.floor((progress - 0.2) / step) % personas.length;
                        setCurrentPersonaIndex(index);
                    }
                }
            });

            // Split Animation
            gsap.to(reelRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=50%',
                    scrub: 1,
                },
                width: 'auto',
                opacity: 1,
            });

            gsap.to(suffixRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=50%',
                    scrub: 1,
                },
                scale: 1, // Keep scale consistent
                x: '5%', // Subtle shift instead of massive move
            });

            // Snap Back Animation
            gsap.to(reelRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: '75% top',
                    end: '100% top',
                    scrub: 1,
                },
                width: 0,
                opacity: 0,
            });

            gsap.to(suffixRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: '75% top',
                    end: '100% top',
                    scrub: 1,
                },
                x: '0%',
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl px-4">
                {/* Live Tag */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary text-glow">MCI Algorithm v1.0 Live</span>
                    </div>
                </motion.div>

                {/* The Split Container */}
                <div ref={splitRef} className="flex items-baseline justify-center w-full">
                    {/* Left Side: Slot Machine Reel */}
                    <div
                        ref={reelRef}
                        className="overflow-hidden opacity-0 flex items-baseline justify-end whitespace-nowrap"
                        style={{ width: 0 }}
                    >
                        <div className="h-14 sm:h-24 md:h-48 flex items-baseline justify-end pr-0 translate-y-[-0.02em] md:translate-y-[-0.05em] translate-x-[0.12em]">
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={personas[currentPersonaIndex]}
                                    initial={{ y: 60, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -60, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className="text-4xl sm:text-6xl md:text-9xl font-black text-primary tracking-tighter drop-shadow-2xl py-4"
                                >
                                    {personas[currentPersonaIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side: The Anchor */}
                    <div ref={suffixRef} className="text-center flex-shrink-0">
                        <h1 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter text-slate-900 drop-shadow-2xl">
                            <span className="text-primary">.</span>alice<span className="text-primary">.cid</span>
                        </h1>
                    </div>
                </div>

                {/* Centered Text - Not affected by split */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 max-w-2xl mx-auto text-center"
                >
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                        One Verified Identity. Infinite Possibilities.
                    </h3>
                    <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                        Create context-specific proofs for different sectors of the web without ever leaking your underlying documents.
                    </p>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scroll to explore</span>
                <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent"></div>
            </motion.div>
        </section>
    );
};

export default Hero;
