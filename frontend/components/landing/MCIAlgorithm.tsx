
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MCIAlgorithm: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<SVGSVGElement>(null);

    const nodes = [
        { x: 100, y: 100, label: 'Entropy' },
        { x: 300, y: 150, label: 'Markov Chain' },
        { x: 500, y: 100, label: 'Collision Res.' },
        { x: 700, y: 150, label: 'Human-Readable' },
        { x: 400, y: 300, label: 'MCI Core' },
    ];

    const connections = [
        [0, 1], [1, 2], [2, 3], [0, 4], [1, 4], [2, 4], [3, 4]
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Node animation
            gsap.from('.mci-node', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    scrub: 1,
                },
                scale: 0,
                opacity: 0,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            });

            // Line animation
            gsap.from('.mci-line', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    scrub: 1,
                },
                strokeDashoffset: 1000,
                opacity: 0,
                stagger: 0.05,
            });

            // Text callouts
            gsap.from('.mci-callout', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 40%',
                    end: 'bottom 20%',
                    scrub: 1,
                },
                y: 50,
                opacity: 0,
                stagger: 0.2,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Researched. <span className="text-primary">Mathematical Proof.</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Deterministic. Human-Readable. Unstoppable.
                    </p>
                </div>

                <div className="relative flex flex-col lg:flex-row items-center gap-16">
                    {/* Node Graph Visualization */}
                    <div className="lg:w-1/2 relative aspect-square bg-slate-50/50 rounded-[3rem] border border-slate-200 overflow-hidden flex items-center justify-center p-8">
                        <svg
                            ref={graphRef}
                            viewBox="0 0 800 400"
                            className="w-full h-full"
                        >
                            {/* Connections */}
                            {connections.map(([start, end], i) => (
                                <line
                                    key={i}
                                    x1={nodes[start].x}
                                    y1={nodes[start].y}
                                    x2={nodes[end].x}
                                    y2={nodes[end].y}
                                    className="mci-line stroke-primary/30 stroke-2"
                                    strokeDasharray="1000"
                                    strokeDashoffset="0"
                                />
                            ))}

                            {/* Nodes */}
                            {nodes.map((node, i) => (
                                <g key={i} className="mci-node">
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r="12"
                                        className="fill-primary shadow-xl"
                                    />
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r="20"
                                        className="fill-primary/20 animate-pulse"
                                    />
                                    <text
                                        x={node.x}
                                        y={node.y + 35}
                                        textAnchor="middle"
                                        className="fill-slate-500 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {node.label}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* Technical Callouts */}
                    <div className="lg:w-1/2 space-y-12">
                        <div className="mci-callout">
                            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Collision Resistance</h4>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">0% Duplicate Chance</h3>
                            <p className="text-slate-600">
                                Our proprietary algorithm ensures that every identity is mathematically unique, preventing any possibility of collision in the global namespace.
                            </p>
                        </div>

                        <div className="mci-callout">
                            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Entropy-to-Name Mapping</h4>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Complex Hashes to .cid</h3>
                            <p className="text-slate-600">
                                We turn complex cryptographic hashes into human-readable names instantly, making decentralized identity accessible to everyone.
                            </p>
                        </div>

                        <div className="mci-callout">
                            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">MCI Algorithm</h4>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Deterministic Anchoring</h3>
                            <p className="text-slate-600">
                                The Markov Chain Identity (MCI) algorithm provides a deterministic way to anchor your reputation across any chain or layer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MCIAlgorithm;
