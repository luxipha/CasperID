
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserPlus, ShieldCheck, Globe, RotateCcw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        id: 1,
        title: "Generate ID",
        description: "Create your unique CasperID in seconds. No central authority, no data silos. Just you and your private keys.",
        icon: <UserPlus className="w-12 h-12 text-primary" />,
        color: "from-purple-500/20 to-indigo-500/20"
    },
    {
        id: 2,
        title: "Verify Once",
        description: "Complete a one-time verification. Our MCI Algorithm generates a zero-knowledge proof that you are who you say you are.",
        icon: <ShieldCheck className="w-12 h-12 text-primary" />,
        color: "from-indigo-500/20 to-blue-500/20"
    },
    {
        id: 3,
        title: "Use Everywhere",
        description: "Access any dApp, bank, or service with a single click. Context-specific proofs ensure you only share what's necessary.",
        icon: <Globe className="w-12 h-12 text-primary" />,
        color: "from-blue-500/20 to-cyan-500/20"
    },
    {
        id: 4,
        title: "Revoke Access",
        description: "Take back your data in a single click. Revoke permissions instantly and ensure your digital footprint is only where you want it.",
        icon: <RotateCcw className="w-12 h-12 text-primary" />,
        color: "from-cyan-500/20 to-emerald-500/20"
    }
];

const HowItWorks: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const pin = gsap.fromTo(
            sectionRef.current,
            {
                translateX: 0,
            },
            {
                translateX: "-300vw",
                ease: "none",
                duration: 1,
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: "top top",
                    end: "3000 top",
                    scrub: 0.6,
                    pin: true,
                    anticipatePin: 1,
                },
            }
        );
        return () => {
            pin.kill();
        };
    }, []);

    return (
        <section className="overflow-hidden">
            <div ref={triggerRef} className="relative">
                {/* Section Header - Fixed position relative to the pinned section */}
                <div className="absolute top-10 left-10 z-20 md:top-20 md:left-20">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-2">Protocol Flow</h3>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">How it Works</h2>
                </div>

                <div ref={sectionRef} className="flex h-screen w-[400vw] relative">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className="h-screen w-screen flex flex-col items-center justify-center px-4 relative"
                        >
                            {/* Background Number */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black text-primary/5 select-none pointer-events-none">
                                0{step.id}
                            </div>

                            <div className="relative z-10 max-w-4xl w-full text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="mb-8 flex justify-center"
                                >
                                    <div className={`p-8 rounded-3xl bg-gradient-to-br ${step.color} backdrop-blur-xl border border-primary/20 shadow-2xl`}>
                                        {step.icon}
                                    </div>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter"
                                >
                                    {step.id}. {step.title}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
                                >
                                    {step.description}
                                </motion.p>
                            </div>

                            {/* Progress Indicator */}
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4">
                                {steps.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${s.id === step.id ? 'w-12 bg-primary' : 'w-4 bg-primary/20'}`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
