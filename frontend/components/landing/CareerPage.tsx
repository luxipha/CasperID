import React, { useState, useEffect } from 'react';
import { FooterMarketing } from '../FooterMarketing';
import HeaderMarketing from '../HeaderMarketing';
import { Users, Eye, Zap, Globe, ArrowRight, Home, CreditCard, School, HeartPulse } from 'lucide-react';
import { getAllJobs, Job } from '@/utils/jobLoader';

interface CareersPageProps {
    onJobClick: (slug: string) => void;
}

const CareersPage: React.FC<CareersPageProps> = ({ onJobClick }) => {
    const [activeFilter, setActiveFilter] = useState('All Roles');
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const loadJobs = async () => {
            const fetchedJobs = await getAllJobs();
            setJobs(fetchedJobs);
        };
        loadJobs();
    }, []);

    const filters = ['All Roles', 'Engineering', 'Product', 'Design', 'Marketing', 'Internships', 'Remote', 'Lagos', 'Nigeria', 'Vietnam'];

    const filteredJobs = activeFilter === 'All Roles'
        ? jobs
        : jobs.filter(job => job.department === activeFilter || job.location.includes(activeFilter));

    return (
        <div className="bg-bg-light min-h-screen">
            <HeaderMarketing />
            {/* Hero Section */}
            <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-scale">
                        <h1 className="text-5xl md:text-7xl font-black text-text-main leading-[1.1] mb-6 tracking-tight">
                            Build the Human Layer of the <span className="text-primary">Internet.</span>
                        </h1>
                        <p className="text-xl text-text-sub mb-10 max-w-xl leading-relaxed">
                            Join CasperID in creating a world where identity is user-controlled, secure, and infinitely reusable.
                        </p>
                        <button
                            onClick={() => document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                        >
                            View Open Roles
                        </button>
                    </div>
                    <div className="relative animate-fade-scale delay-200">
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-white flex items-center justify-center">
                            <div className="relative w-full h-full bg-[#161822] flex items-center justify-center overflow-hidden">
                                {/* Simulated Phone UI */}
                                <div className="w-48 h-96 bg-white rounded-[3rem] border-4 border-gray-800 relative shadow-2xl flex flex-col items-center pt-8 px-4">
                                    <div className="w-20 h-1.5 bg-gray-800 rounded-full mb-8"></div>
                                    <div className="w-full space-y-2">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className="flex justify-between">
                                                {[...Array(8)].map((_, j) => (
                                                    <span key={j} className="text-[8px] font-mono text-primary opacity-40">
                                                        {Math.round(Math.random())}
                                                    </span>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-4 w-10 h-10 rounded-full border-2 border-gray-300"></div>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-text-main mb-4 tracking-tight">
                        Driven by <span className="relative">
                            Decentralization.
                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-secondary rounded-full"></span>
                        </span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        {[
                            { title: 'User Ownership', icon: Users, desc: 'We believe everyone should own their digital footprint. We build tools that put users back in control.' },
                            { title: 'Radical Transparency', icon: Eye, desc: 'Open systems lead to better security. We foster an environment of open source and honest communication.' },
                            { title: 'Seamless Innovation', icon: Zap, desc: 'Identity should be frictionless. We relentlessly iterate to make complex technology feel invisible.' }
                        ].map((value, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-bg-light border border-gray-100 text-left hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <value.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-4">{value.title}</h3>
                                <p className="text-text-sub leading-relaxed">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section id="open-roles" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-text-main mb-4 tracking-tight">Join Our Mission.</h2>
                    <p className="text-text-sub">Find your place in the next evolution of identity.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === filter
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white text-text-sub hover:bg-gray-100'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
                        <div
                            key={i}
                            onClick={() => onJobClick(job.slug)}
                            className="p-6 rounded-2xl bg-white border border-gray-100 flex flex-col md:flex-row md:items-center justify-between hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-text-main mb-2">{job.title}</h3>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-md">
                                        {job.department}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-text-sub">
                                        <Globe size={14} /> {job.location}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-2 text-primary font-bold group-hover:translate-x-2 transition-transform">
                                View Role <ArrowRight size={18} />
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-text-sub">
                            No open roles matching your criteria. Check back soon!
                        </div>
                    )}
                </div>
            </section>

            {/* Why CasperID Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-text-main mb-4 tracking-tight">Why CasperID?</h2>
                        <p className="text-text-sub max-w-2xl mx-auto">
                            More than just a job. We're building a culture that supports your growth and well-being.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {[
                            { title: 'Remote-First Culture', icon: Home, desc: 'Work from anywhere in the world. We prioritize asynchronous communication and trust.' },
                            { title: 'Competitive Equity', icon: CreditCard, desc: 'We want you to be an owner. Every team member receives generous equity packages.' },
                            { title: 'Continuous Learning', icon: School, desc: 'Annual stipends for courses, conferences, and books to help you stay at the cutting edge.' },
                            { title: 'Premium Health Coverage', icon: HeartPulse, desc: 'Comprehensive medical, dental, and vision plans for you and your dependents.' }
                        ].map((benefit, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                    <benefit.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-text-main mb-2">{benefit.title}</h3>
                                    <p className="text-text-sub leading-relaxed">
                                        {benefit.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-primary p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to define the future of ID?</h2>
                        <div className="inline-block p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
                            <p className="text-xl font-medium mb-2 opacity-80">Don't see your role?</p>
                            <a href="mailto:careers@casperid.com" className="text-2xl md:text-4xl font-black hover:text-secondary transition-colors underline decoration-secondary underline-offset-8">
                                careers@casperid.com
                            </a>
                        </div>
                    </div>
                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                </div>
            </section>

            <FooterMarketing />
        </div>
    );
};

export default CareersPage;
