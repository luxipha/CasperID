
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FooterMarketing } from "../../FooterMarketing";
import Logo from "../../Logo";
import { ChevronDown, Info, Calendar, Folder, Sparkles, Network, Menu, X } from 'lucide-react';

const TypewriterText: React.FC<{
    text: string;
    delay?: number;
    speed?: number;
    onComplete?: () => void;
    showCursorOnFinish?: boolean;
}> = ({
    text,
    delay = 0,
    speed = 150,
    onComplete,
    showCursorOnFinish = false
}) => {
        const [displayedText, setDisplayedText] = useState('');
        const [started, setStarted] = useState(false);
        const [isDone, setIsDone] = useState(false);

        const onCompleteRef = useRef(onComplete);
        useEffect(() => {
            onCompleteRef.current = onComplete;
        }, [onComplete]);

        useEffect(() => {
            let interval: number;
            const startTimeout = window.setTimeout(() => {
                setStarted(true);
                let currentIndex = 0;
                interval = window.setInterval(() => {
                    if (currentIndex <= text.length) {
                        setDisplayedText(text.slice(0, currentIndex));
                        currentIndex++;
                    } else {
                        window.clearInterval(interval);
                        setIsDone(true);
                        if (onCompleteRef.current) onCompleteRef.current();
                    }
                }, speed);
            }, delay);

            return () => {
                window.clearTimeout(startTimeout);
                if (interval) window.clearInterval(interval);
            };
        }, [text, delay, speed]);

        return (
            <span className="relative inline-block">
                <span className={started ? 'opacity-100' : 'opacity-0'}>
                    {displayedText}
                </span>
                {started && (!isDone || showCursorOnFinish) && (
                    <span className="inline-block w-[3px] h-[0.85em] bg-primary ml-1.5 -mb-0.5 animate-pulse"></span>
                )}
            </span>
        );
    };

interface AccordionItemProps {
    id: string;
    title: string;
    count: number;
    isOpen: boolean;
    onToggle: (id: string) => void;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ id, title, count, isOpen, onToggle, children }) => {
    const hasContent = count > 0;

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm transition-all ${!hasContent ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <button
                onClick={() => hasContent && onToggle(id)}
                disabled={!hasContent}
                className="flex items-center justify-between w-full p-6 text-left group"
            >
                <span className="font-bold text-main group-hover:text-primary transition-colors">
                    {title} ({count})
                </span>
                {hasContent && (
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>
            {isOpen && hasContent && (
                <div className="px-6 pb-6 transition-all duration-300">
                    <div className="pt-4 border-t border-gray-50 space-y-3">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

import changelogData from '../../../constants/changelog.json';

interface ChangelogItem {
    version: string;
    title: string;
    date: string;
    status: string;
    summary: string;
    highlight?: {
        title: string;
        description: string;
        type: string;
    };
    categories: {
        id: string;
        title: string;
        items: string[];
    }[];
}

const ChangelogPage: React.FC = () => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleItem = (id: string) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Scroll listener for header blur effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Group versions by year for the sidebar
    const versionsByYear = (changelogData as ChangelogItem[]).reduce((acc, item) => {
        const year = item.date.split(' ').pop() || 'Other';
        if (!acc[year]) acc[year] = [];
        acc[year].push(item);
        return acc;
    }, {} as Record<string, ChangelogItem[]>);

    const years = Object.keys(versionsByYear).sort((a, b) => parseInt(b) - parseInt(a));

    return (
        <div className="font-sans relative min-h-screen bg-white text-slate-900 w-full">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_30%_90%,rgba(147,51,234,0.06),transparent_25%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(0,0,0,0.08),transparent)] opacity-30" />
            </div>

            <main className="relative z-20 w-full max-w-[1905px] mx-auto px-4 sm:px-6 md:px-10 pt-16 sm:pt-24 pb-16 sm:pb-24">
                <header id="site-header" className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-white/80 shadow-sm' : ''}`}>
                    <div className="w-full max-w-[1905px] mx-auto px-4 md:px-10 flex items-center justify-between py-4 md:py-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <a href="/" className="cursor-pointer">
                                <Logo variant="png" />
                            </a>
                            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                                <a href="/#product" className="hover:text-slate-900 transition">Product</a>
                                <a href="/#download" className="hover:text-slate-900 transition">Download</a>
                                <a href="/#resources" className="hover:text-slate-900 transition">Resources</a>
                                <a href="/#developers" className="hover:text-slate-900 transition">Developers</a>
                                <a href="/casperos" className="hover:text-slate-900 transition cursor-pointer">CasperOS</a>
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
                                    <X className="h-6 w-6 text-slate-900" />
                                ) : (
                                    <Menu className="h-6 w-6 text-slate-900" />
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto py-12 md:py-24">
                    <header className="mb-20">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                            <h1 className="text-6xl md:text-8xl font-medium text-slate-900 tracking-tight leading-[1.1] flex flex-col">
                                <span>CasperID</span>
                                <span>Changelog</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <a href="https://x.com/AdevarID/" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold text-slate-900 hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                                    Follow us on X
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-primary/5 border border-primary/10 rounded-[1.5rem] text-primary">
                            <Info className="w-6 h-6 text-primary" />
                            <p className="text-base font-medium">New versions are rolled out gradually and may take a few days to reach all users.</p>
                        </div>
                    </header>

                    <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
                        <aside className="lg:w-64 shrink-0">
                            <div className="lg:sticky lg:top-32">
                                <h3 className="text-[10px] font-black text-sub uppercase tracking-[0.4em] mb-8 px-4">Version History</h3>
                                <nav className="space-y-1">
                                    {years.map(year => (
                                        <div key={year} className="mb-10">
                                            <div className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-500">
                                                <Calendar className="w-5 h-5 text-primary" />
                                                {year}
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                {versionsByYear[year].map(item => (
                                                    <a
                                                        key={item.version}
                                                        href={`#v${item.version}`}
                                                        className={`flex items-center gap-3 px-8 py-3 text-sm font-bold rounded-2xl transition-all ${item.status === 'Active Version' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-gray-50'}`}
                                                    >
                                                        {item.highlight ? <Sparkles className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                                                        v{item.version}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        <main className="flex-1 max-w-5xl">
                            <div className="space-y-32">
                                {(changelogData as ChangelogItem[]).map((item) => (
                                    <article key={item.version} id={`v${item.version}`} className="relative group">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                            <div className="flex items-center gap-6">
                                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg ${item.status === 'Active Version' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                    {item.status}
                                                </span>
                                                <h2 className="text-4xl md:text-5xl font-black text-main tracking-tight">{item.title}</h2>
                                            </div>
                                            <time className="text-base font-bold text-sub opacity-60">{item.date}</time>
                                        </div>

                                        {item.highlight && (
                                            <div className="bg-[#0B0C15] rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden mb-12">
                                                <div className="relative aspect-[21/9] flex items-center justify-center p-12">
                                                    <div className="absolute inset-0 opacity-40"></div>
                                                    <div className="relative z-10 w-full max-w-lg text-center">
                                                        <div className="mb-10 flex justify-center">
                                                            <div className="w-40 h-40 rounded-full border-4 border-primary/20 flex items-center justify-center">
                                                                {item.highlight.type === 'folder' ? <Folder className="w-20 h-20 text-primary" /> : <Sparkles className="w-20 h-20 text-primary" />}
                                                            </div>
                                                        </div>
                                                        <h3 className="text-5xl font-black text-white mb-6 tracking-tight leading-none">{item.highlight.title}</h3>
                                                        <p className="text-white/60 font-medium text-xl leading-snug">{item.highlight.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-8">
                                            <h4 className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-4">Updates</h4>
                                            <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row gap-12 border border-slate-100">
                                                <div className="md:w-1/2">
                                                    <h4 className="text-3xl font-bold text-main mb-6">Release Summary</h4>
                                                    <p className="text-lg text-sub font-medium leading-relaxed">
                                                        {item.summary}
                                                    </p>
                                                </div>
                                                <div className="md:w-1/2 space-y-4">
                                                    {item.categories.map(category => (
                                                        <AccordionItem
                                                            key={category.id}
                                                            id={category.id}
                                                            title={category.title}
                                                            count={category.items.length}
                                                            isOpen={!!expandedItems[category.id]}
                                                            onToggle={toggleItem}
                                                        >
                                                            <div className="space-y-3">
                                                                {category.items.map((update, idx) => (
                                                                    <div key={idx} className="flex gap-3 text-sm text-sub font-medium">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                                                                        <p>{update}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </AccordionItem>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </main>
                    </div>
                </div>

                {/* Mobile Navigation Overlay */}
                <div className={`fixed inset-0 bg-white z-[60] md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl font-bold text-slate-900 px-6">
                        <a href="/#product" className="hover:text-indigo-600 transition">Product</a>
                        <a href="/#download" className="hover:text-indigo-600 transition">Download</a>
                        <a href="/#resources" className="hover:text-indigo-600 transition">Resources</a>
                        <a href="/#developers" className="hover:text-indigo-600 transition">Developers</a>
                        <a href="/casperos" className="hover:text-indigo-600 transition cursor-pointer">CasperOS</a>
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
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-100 text-slate-900"
                    >
                        <X className="h-8 w-8 text-slate-900" />
                    </button>
                </div>

                <FooterMarketing />
            </main>
        </div>
    );
};

export default ChangelogPage;
