
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Users, ArrowRight, Filter, Search, CheckCircle2, Trophy, Code, Mic2 } from 'lucide-react';
import { FooterMarketing } from "../FooterMarketing";
import Logo from "../Logo";

gsap.registerPlugin(ScrollTrigger);

interface Event {
    id: string;
    title: string;
    description: string;
    fullContent?: string;
    date: string;
    location: string;
    type: 'Hackathon' | 'Community Call' | 'Governance' | 'Workshop' | 'Campaign';
    status: 'Upcoming' | 'Live' | 'Past';
    image: string;
    rewardPool?: string;
    attendees?: number;
    agenda?: { time: string; activity: string }[];
    speakers?: { name: string; role: string; avatar: string }[];
}

interface CampaignData {
    title: string;
    description: string;
    rewardPool: string;
    participants: string;
    image: string;
}

interface TaskData {
    title: string;
    desc: string;
    reward: string;
    current: number;
    total: number;
    unit: string;
}

interface Incentive {
    label: string;
    isWin: boolean;
    rarity?: string;
}

import eventsData from '../../constants/events.json';

// Helper to ensure we have the correct data structure regardless of environment/cache
const getEvents = () => {
    if (Array.isArray(eventsData)) return eventsData;
    if (eventsData && typeof eventsData === 'object' && 'events' in eventsData) {
        return (eventsData as any).events;
    }
    return [];
};

const getCampaign = (): CampaignData => {
    if (eventsData && typeof eventsData === 'object' && 'featuredCampaign' in eventsData) {
        return (eventsData as any).featuredCampaign;
    }
    return {
        title: "SEA Full Speed Scratch & Win",
        description: "Complete identity verification tasks to earn scratch attempts. Win exclusive .cid domains and CSPR tokens instantly.",
        rewardPool: "50,000 CSPR Pool",
        participants: "12k+ Participants",
        image: "https://picsum.photos/seed/casper-event/800/600"
    };
};

const getTasks = (): TaskData[] => {
    if (eventsData && typeof eventsData === 'object' && 'tasks' in eventsData) {
        return (eventsData as any).tasks;
    }
    return [];
};

const getIncentives = (): Incentive[] => {
    if (eventsData && typeof eventsData === 'object' && 'scratchIncentives' in eventsData) {
        return (eventsData as any).scratchIncentives;
    }
    return [
        { label: 'Free .cid Domain', isWin: true, rarity: 'Common' },
        { label: '10 CSPR', isWin: true, rarity: 'Common' },
        { label: '50 CSPR', isWin: true, rarity: 'Uncommon' },
        { label: 'Rare .cid Name', isWin: true, rarity: 'Rare' },
        { label: 'Try Again', isWin: false },
    ];
};

const EVENTS: Event[] = getEvents() as Event[];
const CAMPAIGN: CampaignData = getCampaign();
const TASKS: TaskData[] = getTasks();
const INCENTIVES: Incentive[] = getIncentives();

interface ScratchCardProps {
    onComplete: (success: boolean) => void;
    attempts: number;
    onUseAttempt: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ onComplete, attempts, onUseAttempt }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScratched, setIsScratched] = useState(false);
    const [result, setResult] = useState<{ label: string; isWin: boolean; rarity?: string } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isStarted, setIsStarted] = useState(false);

    const incentives = INCENTIVES;

    const initScratch = () => {
        if (attempts <= 0) return;

        setIsStarted(true);
        setIsScratched(false);
        onUseAttempt();

        const randomIncentive = incentives[Math.floor(Math.random() * incentives.length)];
        setResult(randomIncentive);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#1f2937' : '#e5e7eb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add pattern
        ctx.fillStyle = 'rgba(134, 82, 226, 0.1)';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.font = 'bold 16px Inter';
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 + 6);
    };

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas || isScratched || !isStarted) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        checkScratchPercentage();
    };

    const checkScratchPercentage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) {
                transparentPixels++;
            }
        }

        const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
        if (percentage > 50 && !isScratched) {
            setIsScratched(true);
            if (result) {
                onComplete(result.isWin);
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        handleMouseMove(e);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || isScratched || !isStarted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        scratch(x, y);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-full max-w-md aspect-[2/1] bg-gray-50 dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
                {/* Result Layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    {!isStarted ? (
                        <div className="text-text-muted-light dark:text-text-muted-dark">
                            <span className="material-icons text-4xl mb-2 opacity-20">redeem</span>
                            <p className="text-sm font-bold uppercase tracking-widest">Ready to scratch</p>
                        </div>
                    ) : result?.isWin ? (
                        <div className="animate-fade-scale">
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">{result.rarity} Reward</p>
                            <p className="text-2xl font-black text-text-light dark:text-white mb-4">{result.label}</p>
                            <button className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all">
                                Claim Reward
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-scale">
                            <p className="text-xl font-black text-text-light dark:text-white">Better luck next time!</p>
                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1">Complete more tasks for attempts.</p>
                        </div>
                    )}
                </div>

                {/* Scratchable Layer */}
                {isStarted && (
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-500 ${isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleMouseMove}
                        onTouchEnd={handleMouseUp}
                    />
                )}
            </div>

            {!isStarted && (
                <button
                    onClick={initScratch}
                    disabled={attempts <= 0}
                    className={`px-12 py-4 rounded-full font-black text-lg transition-all ${attempts > 0
                        ? 'bg-primary text-white hover:scale-105 shadow-xl shadow-primary/20'
                        : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-white/30 cursor-not-allowed'
                        }`}
                >
                    {attempts > 0 ? 'Start Scratching' : 'No Attempts Left'}
                </button>
            )}

            {isScratched && (
                <button
                    onClick={() => setIsStarted(false)}
                    className="text-sm font-bold text-primary hover:underline"
                >
                    Scratch another?
                </button>
            )}
        </div>
    );
};

const TaskItem: React.FC<{
    title: string;
    desc: string;
    reward: string;
    current: number;
    total: number;
    unit: string;
}> = ({ title, desc, reward, current, total, unit }) => {
    const progress = Math.min((current / total) * 100, 100);

    return (
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="md:w-48 bg-gray-50 dark:bg-black/20 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
                <span className="text-primary text-3xl font-black mb-1">+{reward}</span>
                <span className="text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest text-center">Scratch attempts</span>
            </div>
            <div className="flex-grow p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h4 className="text-xl font-bold text-text-light dark:text-white mb-1">{title}</h4>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{desc}</p>
                    </div>
                    <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:scale-105 transition-all shadow-md shadow-primary/10">
                        Go
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{current} / {total} {unit}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventsPage: React.FC = () => {
    const [attempts, setAttempts] = useState(3);
    const [activeTab, setActiveTab] = useState<'All' | 'Hackathon' | 'Community Call' | 'Governance' | 'Workshop'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Scroll listener for header blur effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const selectedEvent = EVENTS.find(e => e.id === selectedEventId);

    const filteredEvents = EVENTS.filter(event => {
        const matchesTab = activeTab === 'All' || event.type === activeTab;
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    useLayoutEffect(() => {
        // Refresh ScrollTrigger when the grid changes (filtering)
        ScrollTrigger.refresh();
    }, [filteredEvents]);

    return (
        <div ref={containerRef} className="bg-white text-slate-900 min-h-screen font-sans">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_30%_90%,rgba(147,51,234,0.06),transparent_25%)]" />
            </div>

            <header id="site-header" className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-white/80 shadow-sm' : ''}`}>
                <div className="w-full max-w-[1905px] mx-auto px-4 md:px-10 flex items-center justify-between py-4 md:py-6">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div onClick={() => navigate('/')} className="cursor-pointer">
                            <Logo variant="png" />
                        </div>
                        <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                            <a onClick={() => navigate('/#blogs')} className="hover:text-slate-900 transition cursor-pointer">
                                Resources
                            </a>
                            <a onClick={() => navigate('/#roadmap')} className="hover:text-slate-900 transition cursor-pointer">
                                Roadmap
                            </a>
                            <a onClick={() => navigate('/#developers')} className="hover:text-slate-900 transition cursor-pointer">
                                Developers
                            </a>
                            <a onClick={() => navigate('/events')} className="text-primary font-bold transition cursor-pointer">
                                Events
                            </a>
                            <a onClick={() => navigate('/anra')} className="hover:text-slate-900 transition cursor-pointer flex items-center gap-0.5">
                                anra
                                <span className="animate-pulse" title="Trending">🔥</span>
                            </a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <a
                            href="/dashboard"
                            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 md:px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition"
                        >
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            Get CasperID
                        </a>
                        <a
                            href="https://chromewebstore.google.com/detail/oecccgmhmojgniechnclmffchodmdjmd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 md:px-4 py-2 text-xs font-semibold text-white shadow-sm hover:-translate-y-0.5 transition"
                        >
                            Add to Chrome
                        </a>
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 z-50 relative"
                        >
                            {isMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Overlay */}
                <div className={`fixed inset-0 bg-white/90 backdrop-blur-2xl z-[60] md:hidden transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl font-bold text-slate-900 px-6">
                        <a onClick={() => { setIsMenuOpen(false); navigate('/#blogs'); }} className="hover:text-indigo-600 transition cursor-pointer">Resources</a>
                        <a onClick={() => { setIsMenuOpen(false); navigate('/#roadmap'); }} className="hover:text-indigo-600 transition cursor-pointer">Roadmap</a>
                        <a onClick={() => { setIsMenuOpen(false); navigate('/#developers'); }} className="hover:text-indigo-600 transition cursor-pointer">Developers</a>
                        <a onClick={() => { setIsMenuOpen(false); navigate('/events'); }} className="text-primary transition cursor-pointer">Events</a>
                        <a onClick={() => { setIsMenuOpen(false); navigate('/anra'); }} className="hover:text-indigo-600 transition cursor-pointer">anra</a>
                        <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
                            <a href="/dashboard" className="w-full text-center py-4 bg-indigo-100 text-indigo-700 rounded-2xl text-lg font-bold">Get CasperID</a>
                            <a
                                href="https://chromewebstore.google.com/detail/oecccgmhmojgniechnclmffchodmdjmd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center py-4 bg-slate-900 text-white rounded-2xl text-lg font-bold shadow-xl shadow-slate-900/20"
                            >
                                Add to Chrome
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-20 pt-24 pb-20">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            Ecosystem Hub
                        </span>
                        <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
                            CasperID <span className="text-primary italic font-serif">Events.</span>
                        </h1>
                        <p className="text-xl text-text-muted-light dark:text-text-muted-dark font-medium leading-relaxed mb-12">
                            Join the global movement for decentralized identity. From technical hackathons to community summits, find your place in the CasperID ecosystem.
                        </p>
                    </motion.div>
                </section>

                {/* Featured Campaign Section (The Scratch & Win) */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                    <div className="relative rounded-[3rem] overflow-hidden bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none"></div>

                        <div className="flex flex-col lg:flex-row items-center gap-12 p-8 md:p-16">
                            <div className="lg:w-1/2">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Featured Campaign</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                                    {CAMPAIGN.title.split(' ').slice(0, -3).join(' ')} <br /><span className="text-primary">{CAMPAIGN.title.split(' ').slice(-3).join(' ')}</span>
                                </h2>
                                <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-8 leading-relaxed">
                                    {CAMPAIGN.description}
                                </p>

                                <div className="flex flex-wrap gap-4 mb-8">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-bold">{CAMPAIGN.rewardPool}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-bold">{CAMPAIGN.participants}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const el = document.getElementById('bounties-section');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                                >
                                    Join Campaign <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="lg:w-1/2 w-full">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                                    <img
                                        src={CAMPAIGN.image}
                                        alt={CAMPAIGN.title}
                                        className="relative z-10 rounded-[2rem] border border-white dark:border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Events Directory */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-gray-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                        <div>
                            <h2 className="text-4xl font-black tracking-tight mb-2">Events Directory</h2>
                            <p className="text-text-muted-light dark:text-text-muted-dark font-medium">Browse and apply for upcoming ecosystem activities.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-light" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                                {['All', 'Hackathon', 'Governance', 'Workshop'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-text-muted-light hover:bg-white dark:hover:bg-white/5 hover:text-primary hover:shadow-sm'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
                        <AnimatePresence mode="sync">
                            {filteredEvents.map((event) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="event-card group bg-white dark:bg-surface-dark rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => setSelectedEventId(event.id)}>
                                        <motion.img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1 rounded-lg backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest ${event.status === 'Live' ? 'bg-emerald-500/80 text-white' :
                                                event.status === 'Upcoming' ? 'bg-primary/80 text-white' : 'bg-gray-500/80 text-white'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                                                {event.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <h3
                                            className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors leading-tight cursor-pointer"
                                            onClick={() => setSelectedEventId(event.id)}
                                        >
                                            {event.title}
                                        </h3>
                                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mb-8 line-clamp-2">
                                            {event.description}
                                        </p>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-3 text-sm font-bold text-text-muted-light dark:text-text-muted-dark">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {event.date}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm font-bold text-text-muted-light dark:text-text-muted-dark">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {event.location}
                                            </div>
                                            {event.rewardPool && (
                                                <div className="flex items-center gap-3 text-sm font-bold text-emerald-500">
                                                    <Trophy className="w-4 h-4" />
                                                    Reward: {event.rewardPool}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark bg-primary/20 overflow-hidden">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id + i}`} alt="User" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-text-muted-light uppercase tracking-widest">
                                                    {event.attendees ? `${(event.attendees / 1000).toFixed(1)}k+` : 'Limited'}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => setShowApplyModal(event.id)}
                                                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                            >
                                                Apply Now
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Bounties / Scratch Section */}
                <section id="bounties-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center border-t border-gray-100 dark:border-white/5">
                    <div className="max-w-3xl mx-auto mb-20">
                        <h2 className="text-5xl font-black mb-6 tracking-tighter">Active Bounties</h2>
                        <p className="text-xl text-text-muted-light dark:text-text-muted-dark font-medium">Complete tasks to earn scratch attempts and win instant rewards.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start text-left">
                        <div className="space-y-6">
                            {TASKS.map((task, idx) => (
                                <TaskItem
                                    key={idx}
                                    title={task.title}
                                    desc={task.desc}
                                    reward={task.reward}
                                    current={task.current}
                                    total={task.total}
                                    unit={task.unit}
                                />
                            ))}
                        </div>

                        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 shadow-2xl sticky top-32">
                            <ScratchCard
                                attempts={attempts}
                                onUseAttempt={() => setAttempts(prev => prev - 1)}
                                onComplete={() => { }}
                            />
                            <div className="mt-8 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-text-muted-light uppercase tracking-widest mb-1">Your Balance</p>
                                    <p className="text-2xl font-black text-primary">{attempts} Attempts</p>
                                </div>
                                <button className="px-6 py-3 bg-primary/10 text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all">
                                    Get More
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Event Detail Overlay */}
                <AnimatePresence>
                    {selectedEvent && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 md:p-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedEventId(null)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            />

                            <motion.div
                                layoutId={`event-card-${selectedEvent.id}`}
                                className="relative w-full max-w-6xl h-full md:h-[85vh] bg-white dark:bg-surface-dark md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row"
                            >
                                {/* Left Side: Visual & Identity */}
                                <div className="md:w-2/5 h-64 md:h-full relative overflow-hidden">
                                    <motion.img
                                        layoutId={`event-image-${selectedEvent.id}`}
                                        src={selectedEvent.image}
                                        alt={selectedEvent.title}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                                                {selectedEvent.type}
                                            </span>
                                            <span className="text-white/60 text-xs font-bold">{selectedEvent.status}</span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 leading-tight">
                                            {selectedEvent.title}
                                        </h2>
                                        <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {selectedEvent.date}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedEventId(null)}
                                        className="absolute top-8 left-8 p-3 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all border border-white/10"
                                    >
                                        <ArrowRight className="w-6 h-6 rotate-180" />
                                    </button>
                                </div>

                                {/* Right Side: Content */}
                                <div className="md:w-3/5 h-full overflow-y-auto p-8 md:p-16 custom-scrollbar">
                                    <div className="max-w-2xl mx-auto">
                                        <div className="mb-12">
                                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">The Mission</h3>
                                            <p className="text-xl text-text-light dark:text-white font-medium leading-relaxed">
                                                {selectedEvent.fullContent || selectedEvent.description}
                                            </p>
                                        </div>

                                        {selectedEvent.agenda && (
                                            <div className="mb-12">
                                                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-8">Agenda</h3>
                                                <div className="space-y-8">
                                                    {selectedEvent.agenda.map((item, i) => (
                                                        <div key={i} className="flex gap-6">
                                                            <div className="w-24 shrink-0 text-sm font-black text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest pt-1">
                                                                {item.time}
                                                            </div>
                                                            <div className="relative pl-6 border-l border-gray-100 dark:border-white/10">
                                                                <div className="absolute top-2 -left-[5px] w-2 h-2 rounded-full bg-primary"></div>
                                                                <p className="text-lg font-bold text-text-light dark:text-white">{item.activity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedEvent.speakers && (
                                            <div className="mb-12">
                                                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-8">Speakers</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    {selectedEvent.speakers.map((speaker, i) => (
                                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                                                            <img src={speaker.avatar} alt={speaker.name} className="w-12 h-12 rounded-full bg-primary/10" />
                                                            <div>
                                                                <p className="font-bold text-text-light dark:text-white">{speaker.name}</p>
                                                                <p className="text-xs text-text-muted-light dark:text-text-muted-dark">{speaker.role}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-12 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center gap-6">
                                            <button
                                                onClick={() => {
                                                    setShowApplyModal(selectedEvent.id);
                                                    setSelectedEventId(null);
                                                }}
                                                className="w-full sm:w-auto px-12 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                            >
                                                Apply Now
                                            </button>
                                            <div className="flex gap-4">
                                                <button className="p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                                    <Calendar className="w-5 h-5" />
                                                </button>
                                                <button className="p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                                    <Users className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Apply Modal */}
                <AnimatePresence>
                    {showApplyModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowApplyModal(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-lg bg-white dark:bg-surface-dark rounded-[2.5rem] p-10 shadow-2xl border border-white/10"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tight">Apply for Event</h3>
                                        <p className="text-primary font-bold uppercase text-xs tracking-widest mt-1">
                                            {EVENTS.find(e => e.id === showApplyModal)?.title}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowApplyModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                        <ArrowRight className="w-6 h-6 rotate-180" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-4">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-emerald-500 mb-1">Identity Verified</h4>
                                            <p className="text-xs text-emerald-500/70">Your CasperID is verified and ready for application. No further KYC required.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted-light mb-2">Why do you want to join?</label>
                                            <textarea
                                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 outline-none focus:ring-2 focus:ring-primary/20 transition-all h-32 resize-none"
                                                placeholder="Tell us about your background or project..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowApplyModal(null)}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        Submit Application
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div> { /* End of relative z-20 */}

            <FooterMarketing className="scroll-mt-24" onNavigate={(view) => {
                if (view === 'main') navigate('/');
                else if (view === 'anra') navigate('/anra');
            }} />
        </div>
    );
};

export default EventsPage;
