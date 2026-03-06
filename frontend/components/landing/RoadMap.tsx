
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Star, Zap, Shield, Globe, Cpu, Rocket, X, CheckCircle2, Circle } from 'lucide-react';

const milestones = [
    {
        id: 1,
        period: "Q1",
        title: "Identity Foundation (Existence)",
        description: "Core Identity System, L2 Verification v1, .cid Registry MVP, and Claim Flow.",
        icon: <Cpu className="w-5 h-5 md:w-6 md:h-6" />,
        position: { x: 52, y: 50 },
        details: {
            status: "In Progress",
            focus: "Make CasperID real",
            tasks: [
                { label: "Core Identity System (Email-based, Public profiles)", status: "doing" },
                { label: "L2 Verification v1 (Auditable status)", status: "doing" },
                { label: ".cid Registry MVP (Smart contract, name.cid routing)", status: "todo" },
                { label: "Claim Flow (Web2 UX, Card payments)", status: "todo" }
            ],
            metrics: 'Users can say: “This is my CasperID.”'
        }
    },
    {
        id: 2,
        period: "Q2",
        title: "Trust & Distribution (Gravity)",
        description: "Genesis .cid Campaign, Verification Signals, Sharability, and Basic Analytics.",
        icon: <Globe className="w-5 h-5 md:w-6 md:h-6" />,
        position: { x: 36, y: 200 },
        details: {
            status: "Upcoming",
            focus: "Make CasperID spread",
            tasks: [
                { label: "Genesis .cid Campaign (1:1 verified user)", status: "todo" },
                { label: "Verification Signals (Badges, Trust indicators)", status: "todo" },
                { label: "Sharability (SEO-friendly profiles, Social links)", status: "todo" },
                { label: "Basic Analytics (Claim rates, Profile visits)", status: "todo" }
            ],
            metrics: ".cid becomes something people share, not just claim."
        }
    },
    {
        id: 3,
        period: "Q3",
        title: "Monetization & Utility (Value)",
        description: "Paid .cid Expansion, Earn v1, Partner Integrations, and Fraud Controls.",
        icon: <Zap className="w-5 h-5 md:w-6 md:h-6" />,
        position: { x: 23, y: 350 },
        details: {
            status: "Upcoming",
            focus: "Make identity useful",
            tasks: [
                { label: "Paid .cid Expansion ($5/one-time, Premium names)", status: "todo" },
                { label: "Earn v1 (Rewards, Identity-gated)", status: "todo" },
                { label: "Partner Integrations (Reviews, Referrals, ID checks)", status: "todo" },
                { label: "Abuse & Fraud Controls (Rate limits, Scoring)", status: "todo" }
            ],
            metrics: "CasperID becomes economically relevant."
        }
    },
    {
        id: 4,
        period: "Q4",
        title: "Platform Expansion (Moat)",
        description: "Advanced Identity Controls, Developer Access, Enterprise Pilot, and 2027 Readiness.",
        icon: <Rocket className="w-5 h-5 md:w-6 md:h-6" />,
        position: { x: 14, y: 500 },
        details: {
            status: "Upcoming",
            focus: "Make CasperID hard to replace",
            tasks: [
                { label: "Advanced Identity Controls (Optional passkeys)", status: "todo" },
                { label: "Developer Access (APIs, Usage policies)", status: "todo" },
                { label: "Business & Enterprise Pilot", status: "todo" },
                { label: "2027 Readiness (Governance, Export, Review)", status: "todo" }
            ],
            metrics: "CasperID becomes infrastructure, not a feature."
        }
    }
];

const Roadmap: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedMilestone, setSelectedMilestone] = useState<typeof milestones[0] | null>(null);

    // Memoize star data so random positions don't recalculate on every re-render, causing a flash
    const stars = useMemo(() =>
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            initialOpacity: Math.random(),
            duration: 2 + Math.random() * 4,
        })),
        []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    useEffect(() => {
        if (selectedMilestone) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedMilestone]);

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Extended line to the wall while keeping milestones centered
    const pathData = "M 100 0 L 70 0 C 40 0, 10 200, 10 600";

    return (
        <section id="roadmap" ref={containerRef} className="pt-32 md:pt-48 pb-0 bg-slate-950 overflow-hidden w-full relative">
            {/* Starry Background */}
            <div className="absolute inset-0 pointer-events-none">
                {stars.map((star) => (
                    <motion.div
                        key={star.id}
                        initial={{ opacity: star.initialOpacity }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: star.duration, repeat: Infinity }}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full"
                        style={{
                            top: `${star.top}%`,
                            left: `${star.left}%`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 md:mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-6 md:mb-8"
                    >
                        The Future of Identity
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-8 px-2"
                    >
                        Strategic <span className="text-primary italic font-serif">Roadmap.</span>
                    </motion.h2>
                </div>
            </div>

            <div className="relative min-h-[800px] md:min-h-[1200px] w-full pb-32 md:pb-48 overflow-hidden max-w-7xl mx-auto px-4 sm:px-6">
                {/* Constellation Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 600">
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke="rgba(168, 85, 247, 0.1)"
                        strokeWidth="0.25"
                        strokeDasharray="2 2"
                    />
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="0.75"
                        style={{ pathLength }}
                    />
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Milestones */}
                <div className="absolute inset-0 pointer-events-none px-4 md:px-0">
                    {milestones.map((milestone) => (
                        <div
                            key={milestone.id}
                            className="absolute"
                            style={{
                                top: `${(milestone.position.y / 600) * 100}%`,
                                left: `max(15%, ${milestone.position.x}%)`,
                                width: '0',
                                height: '0'
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-20px" }}
                                className={`absolute pointer-events-auto flex items-center gap-4 md:gap-6 ${milestone.position.x > 50 ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                                style={{
                                    transform: `translate(${milestone.position.x > 50 ? 'calc(-100% + 16px)' : '-16px'}, -16px)`,
                                    width: 'max-content'
                                }}
                            >
                                {/* Node Dot */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-950 border-2 border-primary/50 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                        <div className="text-primary">
                                            {milestone.icon}
                                        </div>
                                    </div>
                                    {/* Pulse Effect */}
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-primary/20"
                                    />
                                </div>

                                {/* Content Card */}
                                <div
                                    className="max-w-[200px] sm:max-w-xs md:max-w-md cursor-pointer group/card select-none"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                    onClick={() => setSelectedMilestone(milestone)}
                                >
                                    <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-widest mb-1 md:mb-2 block group-hover/card:translate-x-1 transition-transform">
                                        {milestone.period}
                                    </span>
                                    <h3 className="text-lg md:text-2xl font-black text-white mb-2 md:mb-3 tracking-tight group-hover/card:text-primary/80 transition-colors whitespace-normal">
                                        {milestone.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed group-hover/card:text-slate-200 transition-colors hidden sm:block">
                                        {milestone.description}
                                    </p>
                                    <div className="mt-2 md:mt-4 flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-primary/60 uppercase tracking-widest opacity-100 sm:opacity-0 group-hover/card:opacity-100 transition-opacity">
                                        <span>View Details</span>
                                        <div className="w-4 h-px bg-primary/60"></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-48 md:h-96 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none"></div>

            {/* Side-Car Detail Panel — rendered via portal to avoid Chrome backdrop-filter repaint flicker */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedMilestone && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                key="backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setSelectedMilestone(null)}
                                className="fixed inset-0 bg-slate-950/80 z-[100]"
                                style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            />

                            {/* Panel */}
                            <motion.div
                                key="panel"
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="fixed top-0 right-0 h-full w-full sm:max-w-md md:max-w-lg bg-slate-900 border-l border-white/10 z-[110] shadow-2xl overflow-y-auto"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.4 }}
                                    className="p-6 sm:p-8 md:p-12"
                                >
                                    <div className="flex justify-between items-start mb-8 md:mb-12">
                                        <div>
                                            <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.3em] mb-2 md:mb-4 block">
                                                {selectedMilestone.period} Phase
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter pr-4">
                                                {selectedMilestone.title}
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => setSelectedMilestone(null)}
                                            className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors bg-white/5 md:bg-transparent"
                                        >
                                            <X className="w-5 h-5 md:w-6 md:h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-8 md:space-y-12">
                                        {/* Status & Focus */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                            <div>
                                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Status</span>
                                                <div className="flex items-center gap-2 bg-white/5 py-2 px-3 rounded-lg border border-white/5 w-fit">
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${selectedMilestone.details.status === 'Completed' ? 'bg-primary' :
                                                        selectedMilestone.details.status === 'In Progress' ? 'bg-amber-500 animate-pulse' : 'bg-white/20'
                                                        }`} />
                                                    <span className="text-xs md:text-sm font-bold text-white">{selectedMilestone.details.status}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Primary Focus</span>
                                                <span className="text-xs md:text-sm font-bold text-white block bg-primary/10 text-primary/90 py-2 px-3 rounded-lg w-fit">{selectedMilestone.details.focus}</span>
                                            </div>
                                        </div>

                                        {/* Tasks List */}
                                        <div>
                                            <h4 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-3">
                                                Key Deliverables
                                                <div className="flex-1 h-px bg-white/10"></div>
                                            </h4>
                                            <div className="space-y-3 md:space-y-4">
                                                {selectedMilestone.details.tasks.map((task, i) => (
                                                    <div key={i} className="flex items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-colors">
                                                        {task.status === 'done' ? (
                                                            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5 md:mt-0" />
                                                        ) : task.status === 'doing' ? (
                                                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-amber-500/50 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
                                                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500 animate-pulse" />
                                                            </div>
                                                        ) : (
                                                            <Circle className="w-4 h-4 md:w-5 md:h-5 text-white/20 shrink-0 mt-0.5 md:mt-0" />
                                                        )}
                                                        <span className={`text-xs md:text-sm font-medium leading-snug ${task.status === 'done' ? 'text-white' : 'text-slate-300 md:text-slate-400'}`}>
                                                            {task.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Metrics/Impact */}
                                        <div className="p-4 md:p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
                                            <span className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">Impact Metric</span>
                                            <p className="text-base md:text-xl font-black text-white tracking-tight leading-snug">
                                                {selectedMilestone.details.metrics}
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-4 block">Overview</span>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {selectedMilestone.description} This phase represents a critical step in the CasperID evolution,
                                                focusing on {selectedMilestone.details.focus.toLowerCase()} to ensure long-term scalability and security.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Action */}
                                    <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-white/10 pb-8 md:pb-0">
                                        <button className="w-full py-3 md:py-4 rounded-xl bg-primary text-background-dark font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20">
                                            Follow Progress
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
};

export default Roadmap;
