import React, { useState, useEffect } from 'react';
import Logo from "./Logo";

interface HeaderMarketingProps {
    className?: string;
}

export default function HeaderMarketing({ className = "" }: HeaderMarketingProps) {
    const [scrolled, setScrolled] = useState(false);

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
                    <a href="/" className="hover:opacity-80 transition-opacity">
                        <Logo variant="png" showName />
                    </a>
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        {/* Links removed for a cleaner look */}
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
                    <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-black text-white shadow-xl hover:-translate-y-0.5 transition active:scale-95">
                        Download
                    </button>
                </div>
            </div>
        </header>
    );
}
