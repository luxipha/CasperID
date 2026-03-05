
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Fingerprint,
    Database,
    DollarSign,
    Home,
    Gamepad2,
    Brain,
    Stethoscope,
    BadgeCheck,
    ArrowDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

gsap.registerPlugin(ScrollTrigger);

const sectors = [
    { id: 'depin', title: 'Infrastructure (DePIN)', desc: 'Powering Huddle01 nodes.', icon: Database, angle: -150, color: 'text-indigo-500' },
    { id: 'defi', title: 'Finance (DeFi)', desc: 'Institutional KYC without the leak.', icon: DollarSign, angle: -90, color: 'text-blue-500' },
    { id: 'realestate', title: 'Real Estate', desc: 'Fractional ownership via MCI.', icon: Home, angle: -30, color: 'text-emerald-500' },
    { id: 'gaming', title: 'Social & Gaming', desc: 'Unified metaverse reputation.', icon: Gamepad2, angle: 30, color: 'text-purple-500' },
    { id: 'ai', title: 'AI Training', desc: 'Privacy-preserving data sets.', icon: Brain, angle: 90, color: 'text-orange-500' },
    { id: 'health', title: 'Healthcare', desc: 'Secure medical record sharing.', icon: Stethoscope, angle: 150, color: 'text-rose-500' },
];

const contexts = [
    { id: 'work', label: 'work.', x: '10%' },
    { id: 'school', label: 'school.', x: '33%' },
    { id: 'bank', label: 'bank.', x: '57%' },
    { id: 'social', label: 'social.', x: '80%' },
];

const IdentityWeb: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<HTMLDivElement>(null);
    const [activeSector, setActiveSector] = useState<string | null>(null);
    const [activeContext, setActiveContext] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        let mm = gsap.matchMedia();
        let rafId: number;

        // Use rAF to ensure all sibling components have painted before
        // GSAP measures the page for pin spacer heights
        rafId = requestAnimationFrame(() => {
            mm.add({
                isDesktop: "(min-width: 768px)",
                isMobile: "(max-width: 767px)"
            }, (context) => {
                let { isDesktop, isMobile: _isMobile } = context.conditions as any;
                setIsMobile(_isMobile);

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: '+=200%',
                        pin: true,
                        scrub: 1,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            const progress = self.progress;

                            if (progress < 0.2) {
                                const ctxIndex = Math.floor(progress * 5 * contexts.length);
                                if (ctxIndex < contexts.length) setActiveContext(contexts[ctxIndex].id);
                            } else {
                                setActiveContext(null);
                            }

                            if (progress > 0.3) {
                                const sectorProgress = (progress - 0.3) / 0.7;
                                const index = Math.floor(sectorProgress * sectors.length);
                                if (index < sectors.length) {
                                    setActiveSector(sectors[index].id);
                                } else {
                                    setActiveSector(null);
                                }
                            }
                        }
                    }
                });

                tl.fromTo('.context-beam',
                    { scaleY: 0, opacity: 0 },
                    { scaleY: 1, opacity: 1, ease: 'none', duration: 1 },
                    0
                );

                tl.to('.section-label', {
                    opacity: 0,
                    y: _isMobile ? -40 : -20,
                    duration: 1,
                    ease: 'power2.inOut'
                }, _isMobile ? 0.35 : 0.5);

                sectors.forEach((sector, i) => {
                    tl.fromTo(`.line-${sector.id}`,
                        { strokeDashoffset: 1000, strokeDasharray: 1000 },
                        { strokeDashoffset: 0, ease: 'none', duration: 1.5 },
                        0.5 + (i * 0.1)
                    );

                    tl.fromTo(`.card-${sector.id}`,
                        { opacity: 0, scale: 0.5, y: 20 },
                        { opacity: 1, scale: 1, y: 0, ease: 'back.out(1.7)', duration: 1 },
                        1 + (i * 0.2)
                    );
                });

                gsap.to(coreRef.current, {
                    boxShadow: '0 0 80px rgba(79, 70, 229, 0.4)',
                    duration: 1.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                });

                return () => {
                    tl.kill();
                };
            });
        });

        return () => {
            cancelAnimationFrame(rafId);
            mm.revert();
        };
    }, []);

    // Recalculate pin spacer height after mount to prevent HowItWorks from overlapping
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    const currentRadius = isMobile ? 28 : 35;

    return (
        <section id="identity-web" ref={containerRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Top Context Nodes */}
            <div className="absolute top-8 md:top-12 left-0 w-full flex justify-around px-4 md:px-20 z-30">
                {contexts.map((ctx) => (
                    <div key={ctx.id} className="relative flex flex-col items-center">
                        <motion.div
                            animate={{
                                scale: activeContext === ctx.id ? 1.2 : 1,
                                color: activeContext === ctx.id ? '#4F46E5' : '#64748b'
                            }}
                            className="text-base md:text-2xl font-black tracking-tighter mb-2 md:mb-4"
                        >
                            {ctx.label}
                        </motion.div>
                        <div className={cn(
                            "w-px h-12 md:h-24 bg-gradient-to-b from-indigo-500/50 to-transparent transition-opacity duration-500",
                            activeContext === ctx.id ? "opacity-100" : "opacity-20"
                        )}></div>
                    </div>
                ))}
            </div>

            {/* The Central Beam (Context to Hub) */}
            <div className="absolute top-28 md:top-36 left-1/2 -translate-x-1/2 w-1 h-[20%] md:h-1/3 z-10">
                <div className="context-beam w-full h-full bg-gradient-to-b from-indigo-600 via-purple-500 to-indigo-600 blur-[1px] origin-top">
                    <div className="absolute inset-0 bg-indigo-500 blur-[10px] opacity-30"></div>
                    {/* Data Pulse */}
                    <motion.div
                        animate={{ y: ['0%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-12 bg-white/80 blur-md rounded-full"
                    />
                </div>
            </div>

            <div className="relative w-full max-w-6xl h-full flex items-center justify-center px-4">
                {/* SVG Web Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="100%" stopColor="#818CF8" />
                        </linearGradient>
                        <filter id="webGlow">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    {sectors.map((sector) => {
                        const angleRad = (sector.angle * Math.PI) / 180;
                        const radius = currentRadius;
                        const x2 = 50 + Math.cos(angleRad) * radius;
                        const y2 = 50 + Math.sin(angleRad) * radius;

                        return (
                            <g key={sector.id}>
                                <path
                                    className={`line-${sector.id} stroke-indigo-200`}
                                    d={`M 50 50 Q ${50 + Math.cos(angleRad) * (radius / 3.5)} ${50 + Math.sin(angleRad) * (radius / 3.5)} ${x2} ${y2}`}
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray="1000"
                                    strokeDashoffset="1000"
                                    filter="url(#webGlow)"
                                />
                                {/* Pulsing Data Packet */}
                                {activeSector === sector.id && (
                                    <motion.circle
                                        r="4"
                                        fill="#4F46E5"
                                        initial={{ offset: 0 }}
                                        animate={{ offset: 1 }}
                                    >
                                        <animateMotion
                                            dur="1s"
                                            repeatCount="indefinite"
                                            path={`M 50 50 Q ${50 + Math.cos(angleRad) * (radius / 3.5)} ${50 + Math.sin(angleRad) * (radius / 3.5)} ${x2} ${y2}`}
                                        />
                                    </motion.circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Central Identity Hub */}
                <div ref={coreRef} className="relative z-20 w-32 h-32 md:w-56 md:h-56 rounded-full bg-white border-2 border-indigo-500/50 flex flex-col items-center justify-center text-center p-4 md:p-6 shadow-2xl backdrop-blur-3xl">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/5 animate-pulse"></div>
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-1 md:mb-2">
                        <Fingerprint className="w-5 h-5 md:w-8 md:h-8 text-indigo-600" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-0.5 md:mb-1">Identity Hub</span>
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">
                        alice<span className="text-indigo-600">.cid</span>
                    </h2>
                </div>

                {/* Sector Nodes */}
                <div className="absolute inset-0 pointer-events-none">
                    {sectors.map((sector) => {
                        const angleRad = (sector.angle * Math.PI) / 180;
                        const radius = currentRadius;
                        const x = 50 + Math.cos(angleRad) * radius;
                        const y = 50 + Math.sin(angleRad) * radius;

                        return (
                            <div
                                key={sector.id}
                                className={`card-${sector.id} absolute pointer-events-auto z-10`}
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className={cn(
                                        "w-44 sm:w-56 md:w-72 p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white border border-slate-200 shadow-2xl transition-all duration-500",
                                        activeSector === sector.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : ''
                                    )}
                                >
                                    <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                                        <div className={cn(
                                            "w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center transition-colors duration-500",
                                            activeSector === sector.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                                        )}>
                                            <sector.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] sm:text-sm font-black text-slate-900 leading-tight">{sector.title}</h4>
                                            <p className="text-[8px] sm:text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Context Proof</p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] sm:text-xs text-slate-600 leading-relaxed mb-2 sm:mb-4 font-medium">
                                        {sector.desc}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-1.5 sm:-space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-white bg-indigo-100"></div>
                                            ))}
                                        </div>
                                        <AnimatePresence>
                                            {activeSector === sector.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    className="flex items-center gap-1 text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                                                >
                                                    <BadgeCheck size={10} />
                                                    Verified
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section Label */}
            <div className="section-label absolute top-40 md:top-auto md:bottom-12 md:left-12 z-40 max-w-[280px] md:max-w-md text-center md:text-left px-4">
                <h2 className="text-2xl md:text-6xl font-black text-slate-900 tracking-tighter mb-2 md:mb-4">
                    One Identity.<br /><span className="text-indigo-600">Infinite Possibilities.</span>
                </h2>
                <p className="text-sm md:text-lg text-slate-600 font-medium leading-relaxed">
                    CasperID creates isolated, sector-specific proofs on the fly. Master document never leaves the hub.
                </p>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-400 z-50 animate-bounce">
                <ArrowDown size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Keep scrolling</span>
            </div>
        </section>
    );
};

export default IdentityWeb;
