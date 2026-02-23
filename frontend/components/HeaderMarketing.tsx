import React, { useState, useEffect } from 'react';
import Logo from "./Logo";
import { Menu, X } from 'lucide-react';

interface HeaderMarketingProps {
    className?: string;
}

export default function HeaderMarketing({ className = "" }: HeaderMarketingProps) {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            id="site-header"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/98 backdrop-blur-xl border-b border-slate-900/10 shadow-lg shadow-slate-900/5 py-4' : 'bg-transparent py-6'} ${className}`}
        >
            <div className="w-full max-w-[1905px] mx-auto px-6 md:px-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="hover:opacity-80 transition-opacity">
                        <Logo variant="png" showName />
                    </div>
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="/#product" className="hover:text-slate-900 transition">Product</a>
                        <a href="/#download" className="hover:text-slate-900 transition">Download</a>
                        <a href="/#resources" className="hover:text-slate-900 transition">Resources</a>
                        <a href="/#developers" className="hover:text-slate-900 transition">Developers</a>
                        <a href="/anra" className="hover:text-slate-900 transition flex items-center gap-0.5">
                            anra
                            <span className="animate-pulse" title="Trending">🔥</span>
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="/dashboard"
                        className="hidden sm:inline-flex items-center gap-2 rounded-full bg-indigo-100 px-5 py-2.5 text-xs font-black text-indigo-700 shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition active:scale-95"
                    >
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        Get CasperID
                    </a>
                    <button className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-black text-white shadow-xl hover:-translate-y-0.5 transition active:scale-95">
                        Download
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-900 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div className={`fixed inset-0 bg-white z-[60] lg:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl font-bold text-slate-900 px-6">
                    <a onClick={() => setIsMenuOpen(false)} href="/#product" className="hover:text-indigo-600 transition">Product</a>
                    <a onClick={() => setIsMenuOpen(false)} href="/#download" className="hover:text-indigo-600 transition">Download</a>
                    <a onClick={() => setIsMenuOpen(false)} href="/#resources" className="hover:text-indigo-600 transition">Resources</a>
                    <a onClick={() => setIsMenuOpen(false)} href="/#developers" className="hover:text-indigo-600 transition">Developers</a>
                    <a onClick={() => setIsMenuOpen(false)} href="/anra" className="hover:text-indigo-600 transition flex items-center gap-2">
                        anra
                        <span className="animate-pulse">🔥</span>
                    </a>
                    <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
                        <a href="/dashboard" className="w-full text-center py-4 bg-indigo-100 text-indigo-700 rounded-2xl text-lg font-bold">Get CasperID</a>
                        <button className="w-full text-center py-4 bg-slate-900 text-white rounded-2xl text-lg font-bold shadow-xl shadow-slate-900/20">
                            Download
                        </button>
                    </div>
                </div>
                {/* Close button inside overlay */}
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-100 text-slate-900"
                >
                    <X size={32} />
                </button>
            </div>
        </header>
    );
}
