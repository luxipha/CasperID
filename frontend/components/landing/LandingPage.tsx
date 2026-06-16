import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FooterMarketing } from "../FooterMarketing";
import Logo from "../Logo";
import "./LandingPage.css";
import Roadmap from "./RoadMap";
// ChatAssistant disabled - using Crisp chatbot instead
// import ChatAssistant from "./ChatAssistant";
import ContextualSection from "./ContextsAware";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import CinematicHero from "./CinematicHero";
import Hero from "./SplitHero";
import IdentityWeb from "./IdentityWeb";
import MCIAlgorithm from "./MCIAlgorithm";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HowItWorks from "./HowItWorks";
import { ArrowRight, BadgeCheck, Code2, ShieldCheck, Sparkles } from 'lucide-react';


interface LandingPageProps {
}

export default function LandingPage({ }: LandingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Update document title
  useDocumentTitle('casperId - Verify once, Reuse everywhere');

  // Sync internal view with URL removed as CasperOS moved to anra.rest


  const handleNavigate = (view: 'main') => {
    navigate('/');
  };

  // Scroll listener for header blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {

    // Houdini
    if ('paintWorklet' in CSS) {
      // @ts-ignore
      CSS.paintWorklet.addModule('https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js').catch(() => { });
      const applyRing = (el: any) => {
        if (!el) return;
        const setPos = (x: number, y: number, interactive: boolean) => {
          el.style.setProperty('--ring-x', x);
          el.style.setProperty('--ring-y', y);
          el.style.setProperty('--ring-interactive', interactive ? 1 : 0);
        };
        setPos(50, 50, false);
        el.addEventListener('pointermove', (e: any) => {
          setPos((e.clientX / window.innerWidth) * 100, (e.clientY / window.innerHeight) * 100, true);
        });
        el.addEventListener('pointerleave', () => setPos(50, 50, false));
      };
      document.querySelectorAll('[data-ring="true"]').forEach(applyRing);
    }

    // Header scroll
    const header = document.getElementById('site-header');
    const toggle = () => {
      if (window.scrollY > 10) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    };

    if (header) {
      toggle();
      window.addEventListener('scroll', toggle, { passive: true });
    }

    // Refresh triggers after components mount — use both a timeout and onLoad
    // to handle race conditions where GSAP calculates pin heights before layout settles
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      if (header) window.removeEventListener('scroll', toggle);
      window.removeEventListener('load', onLoad);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div id="top" className="font-sans relative min-h-screen bg-white text-slate-900 w-full">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_30%_90%,rgba(147,51,234,0.06),transparent_25%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(0,0,0,0.08),transparent)] opacity-30" />
      </div>

      <main className="relative z-20 w-full max-w-[1905px] mx-auto px-4 sm:px-6 md:px-10 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <header id="site-header" className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-white/80 shadow-sm' : ''}`}>
          <div className="w-full max-w-[1905px] mx-auto px-4 md:px-10 flex items-center justify-between py-4 md:py-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div onClick={() => handleNavigate('main')} className="cursor-pointer">
                <Logo variant="png" />
              </div>
              <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                <a href="#blogs" className="hover:text-slate-900 transition">
                  Resources
                </a>
                <a href="#roadmap" className="hover:text-slate-900 transition">
                  Roadmap
                </a>
                <a href="#developers" className="hover:text-slate-900 transition">
                  Business
                </a>
                <a onClick={() => navigate('/events')} className="hover:text-slate-900 transition cursor-pointer">
                  Events
                </a>
                <a
                  href="https://www.anra.rest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition cursor-pointer flex items-center gap-0.5"
                >
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
        </header>

        <CinematicHero />
        <Hero />
        <IdentityWeb />
        <HowItWorks />
        <ContextualSection />
        <MCIAlgorithm />

        <section className="relative w-full overflow-hidden py-16 md:py-24" id="developers">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,126,34,0.14),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(109,232,236,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(248,250,252,0.95))]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-primary shadow-sm shadow-primary/10">
                <Code2 className="h-3.5 w-3.5" />
                Integrate in minutes
              </div>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                One button for auth, verification, and reusable identity
              </h2>
              <p className="mt-5 max-w-2xl text-base md:text-lg leading-8 text-slate-600">
                Drop CasperID into your app, send users through the hosted flow on <span className="font-semibold text-slate-900">account.casperid.com</span>, and let us handle passkeys, liveness, KYC, and selective disclosure.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,1fr)] lg:items-start">
              <div className="rounded-[32px] border border-slate-200/80 bg-[#0b1220] p-5 sm:p-6 shadow-[0_30px_120px_rgba(15,23,42,0.22)] lg:sticky lg:top-24">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">React SDK quickstart</p>
                    <p className="mt-1 text-sm text-slate-400">Hosted auth flow, popup on desktop, redirect on mobile.</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    SDK v2
                  </span>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-xs font-medium text-slate-500">auth.tsx</span>
                  </div>
                  <pre className="overflow-x-auto px-4 py-5 text-[13px] leading-7 text-slate-200">
                    <code>{`npm install @casperid/react
import { CasperIDButton } from '@casperid/react';

<CasperIDButton clientId="app_..." mode="auto">
  Continue with CasperID
</CasperIDButton>`}</code>
                  </pre>
                </div>

                <div className="mt-5 flex items-center gap-3 text-sm">
                  <a
                    href="/business/docs"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    Full docs
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Passkeys out of the box</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">Passwordless WebAuthn, no phishing surface</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">A clean hosted button instead of a brittle passkey flow.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-700">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Progressive verification</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">Email to liveness to document KYC</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Step users up only when your product needs stronger trust.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-700">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">Selective disclosure</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">Prove “over 18” without exposing a birthdate</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Share the answer, not the underlying personal data.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-16 min-h-[600px] md:min-h-[827px]" id="blogs">
          <div className="w-full px-4 md:px-12">
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900">Latest Blogs</h2>
              <a
                href="https://medium.com/@luxipha"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 md:px-5 py-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                View all blogs
              </a>
            </div>

            <div className="w-full mt-8 md:mt-10 overflow-hidden">
              <div className="flex flex-row gap-6 lg:gap-8 justify-start items-start overflow-x-auto pb-6 sm:pb-0 no-scrollbar snap-x snap-mandatory sm:snap-none px-1">
                {/* Blog 1: Identity is Not an App */}
                <a
                  href="https://medium.com/@luxipha/identity-is-not-an-app-the-case-for-a-neutral-internet-identity-layer-6f6e38b9e188"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="space-y-4 w-[85%] sm:w-[384px] group flex-shrink-0 snap-start"
                >
                  <div className="w-full aspect-square md:w-[384px] md:h-[384px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl transition-shadow">
                    <img src="/images/frag.webp" alt="Identity is Not an App" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg md:text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Identity is Not an App: The Case for a Neutral Internet Identity Layer
                    </div>
                    <div className="text-sm text-slate-500 flex gap-4">
                      <span>Jan 2026</span>
                      <span>Identity</span>
                    </div>
                    <span className="text-sm text-slate-900 font-semibold inline-flex items-center gap-1 group-hover:underline">
                      Read blog <span className="text-lg leading-none">›</span>
                    </span>
                  </div>
                </a>

                {/* Blog 2: 5 Surprising Ways */}
                <a
                  href="https://medium.com/@luxipha/5-surprising-ways-casperid-is-fixing-our-broken-digital-identity-66993cbcf474"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="space-y-4 w-[85%] sm:w-[384px] group flex-shrink-0 snap-start"
                >
                  <div className="w-full aspect-square md:w-[384px] md:h-[384px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl transition-shadow">
                    <img src="/images/CID.webp" alt="5 Ways CasperID Fixes Identity" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg md:text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      5 Surprising Ways CasperID is Fixing Our Broken Digital Identity
                    </div>
                    <div className="text-sm text-slate-500 flex gap-4">
                      <span>Jan 2026</span>
                      <span>Product</span>
                    </div>
                    <span className="text-sm text-slate-900 font-semibold inline-flex items-center gap-1 group-hover:underline">
                      Read blog <span className="text-lg leading-none">›</span>
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>


          <div className="w-full px-4 md:px-12 mt-8 flex gap-3">
            <button className="h-10 w-10 md:h-10 md:w-10 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm touch-manipulation">
              ‹
            </button>
            <button className="h-10 w-10 md:h-10 md:w-10 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm touch-manipulation">
              ›
            </button>
          </div>
        </section>

        <Roadmap />

        <section className="w-full py-6 md:py-10 px-4 md:px-12" id="download">
          <div
            id="download-ring"
            data-ring="true"
            className="w-full mx-auto min-h-[400px] md:min-h-[600px] lg:h-[900px] rounded-3xl overflow-hidden bg-black relative px-6 md:px-12 py-12 md:py-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_20%,rgba(99,102,241,0.3),transparent),radial-gradient(1px_1px_at_70%_60%,rgba(79,70,229,0.25),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(59,130,246,0.2),transparent)] opacity-60" />
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-2xl text-left space-y-4 md:space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Stop re-verifying, <br />Start reusing
                </h2>
                <div className="flex flex-wrap gap-3 md:gap-4 pt-2">
                  <a
                    href="https://chromewebstore.google.com/detail/oecccgmhmojgniechnclmffchodmdjmd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-white text-slate-900 text-sm font-semibold shadow-lg shadow-white/30 hover:-translate-y-0.5 transition"
                  >
                    Add To Chrome
                  </a>
                  <a href="/dashboard" className="px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-slate-800 text-white text-sm font-semibold shadow-lg shadow-slate-900/40">
                    Create CasperID
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FooterMarketing className="scroll-mt-24" onNavigate={(view) => {
          if (view === 'main') {
            handleNavigate(view);
          }
        }} />
        {/* ChatAssistant disabled - using Crisp chatbot instead */}
        {/* <ChatAssistant /> */}

        {/* Mobile Navigation Overlay - High Z-index and Premium Blur */}
        <div className={`fixed inset-0 bg-white/90 backdrop-blur-2xl z-[60] md:hidden transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl font-bold text-slate-900 px-6">
            <a onClick={() => { setIsMenuOpen(false); handleNavigate('main'); }} href="#blogs" className="hover:text-indigo-600 transition">Resources</a>
            <a onClick={() => setIsMenuOpen(false)} href="#roadmap" className="hover:text-indigo-600 transition">Roadmap</a>
            <a onClick={() => setIsMenuOpen(false)} href="#developers" className="hover:text-indigo-600 transition">Business</a>
            <a onClick={() => { setIsMenuOpen(false); navigate('/events'); }} className="hover:text-indigo-600 transition cursor-pointer">Events</a>
            <a
              href="https://www.anra.rest"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-indigo-600 transition cursor-pointer"
            >
              anra
            </a>
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
          {/* Close button inside overlay for better accessibility */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-100 text-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
