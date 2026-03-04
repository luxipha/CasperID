import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FooterMarketing } from "../FooterMarketing";
import Logo from "../Logo";
import "./LandingPage.css";
import RoadmapSection from "./RoadmapSection";
// ChatAssistant disabled - using Crisp chatbot instead
// import ChatAssistant from "./ChatAssistant";
import ContextualSection from "./ContextsAware";
import { AdevarOSFlow } from "./AdevarOSFlow";
import { ScrollToTop } from "./casperos/ScrollToTop";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import CinematicHero from "./CinematicHero";
import Hero from "./SplitHero";
import IdentityWeb from "./IdentityWeb";
import MCIAlgorithm from "./MCIAlgorithm";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HowItWorks from "./HowItWorks";


interface LandingPageProps {
  initialView?: 'main' | 'anra';
}

export default function LandingPage({ initialView = 'main' }: LandingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLandingView, setCurrentLandingView] = React.useState<'main' | 'anra'>(initialView);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Dynamic titles for sub-views
  useDocumentTitle(
    currentLandingView === 'anra'
      ? 'anra by CasperID - anra | All-in-One Restaurant Operating System'
      : 'casperId - Verify once, Reuse everywhere'
  );

  // Sync internal view with URL
  useEffect(() => {
    if (location.pathname === '/anra' || location.pathname === '/adevaros') {
      setCurrentLandingView('anra');
    } else if (location.pathname === '/') {
      setCurrentLandingView('main');
    }
  }, [location.pathname]);

  const handleNavigate = (view: 'main' | 'anra') => {
    setCurrentLandingView(view);
    if (view === 'anra') {
      navigate('/anra');
    } else {
      navigate('/');
    }
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

    // Refresh triggers after components mount
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      if (header) window.removeEventListener('scroll', toggle);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div id="top" className="font-sans relative min-h-screen bg-white text-slate-900 w-full">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_30%_90%,rgba(147,51,234,0.06),transparent_25%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(0,0,0,0.08),transparent)] opacity-30" />
      </div>

      <main className={`relative z-20 w-full ${currentLandingView === 'main' ? 'max-w-[1905px] mx-auto px-4 sm:px-6 md:px-10 pt-16 sm:pt-24 pb-16 sm:pb-24' : ''}`}>
        <header id="site-header" className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-white/80 shadow-sm' : ''}`}>
          <div className="w-full max-w-[1905px] mx-auto px-4 md:px-10 flex items-center justify-between py-4 md:py-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div onClick={() => handleNavigate('main')} className="cursor-pointer">
                <Logo variant="png" />
              </div>
              <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                <a
                  onClick={() => handleNavigate('main')}
                  href="#product"
                  className="hover:text-slate-900 transition"
                >
                  Product
                </a>
                <a href="#download" className="hover:text-slate-900 transition">
                  Download
                </a>
                <a href="#resources" className="hover:text-slate-900 transition">
                  Resources
                </a>
                <a href="#developers" className="hover:text-slate-900 transition">
                  Developers
                </a>
                <a
                  onClick={() => handleNavigate('anra')}
                  className={`hover:text-slate-900 transition cursor-pointer flex items-center gap-0.5 ${currentLandingView === 'anra' ? 'text-indigo-600 font-bold' : ''}`}
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

        {currentLandingView === 'main' ? (
          <>
            <CinematicHero />
            <Hero />
            <IdentityWeb />
            <HowItWorks />
            <ContextualSection />
            <MCIAlgorithm />



            {/* Old vs New Section */}


            <section className="relative w-full min-h-[600px] md:min-h-[800px] lg:h-[900px] overflow-hidden py-16 md:py-0" id="developers">
              <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_10%,rgba(0,0,0,0.16),transparent),radial-gradient(1px_1px_at_50%_50%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_90%_80%,rgba(0,0,0,0.1),transparent)] opacity-40" />
              <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,rgba(99,102,241,0.2),transparent),radial-gradient(1px_1px_at_80%_20%,rgba(79,70,229,0.15),transparent)] opacity-30" />
              <div className="relative z-10 h-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                <div className="flex-1 flex flex-col items-center text-center space-y-3 md:space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Available at no charge
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                    For developers
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-600">
                    A verified identity you can reuse everywhere
                  </div>
                  <a
                    href="https://chromewebstore.google.com/detail/oecccgmhmojgniechnclmffchodmdjmd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/40 hover:-translate-y-0.5 transition"
                  >
                    Download for Chrome
                  </a>
                </div>
                <div className="flex-1 flex flex-col items-center text-center space-y-3 md:space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Coming soon
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                    For organizations
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-600">
                    Identity infrastructure for real teams
                  </div>
                  <button className="mt-4 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-white text-slate-800 text-sm font-semibold border border-slate-200 shadow-sm">
                    Notify me
                  </button>
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

            <RoadmapSection />

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
          </>
        ) : (
          <AdevarOSFlow />
        )}

        <FooterMarketing className="scroll-mt-24" onNavigate={(view) => {
          if (view === 'main' || (view as any) === 'anra') {
            handleNavigate(view as any);
          }
        }} />
        {/* ChatAssistant disabled - using Crisp chatbot instead */}
        {/* <ChatAssistant /> */}

        <ScrollToTop />

        {/* Mobile Navigation Overlay - High Z-index and Premium Blur */}
        <div className={`fixed inset-0 bg-white/90 backdrop-blur-2xl z-[60] md:hidden transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col items-center justify-center h-full gap-8 text-2xl font-bold text-slate-900 px-6">
            <a onClick={() => { setIsMenuOpen(false); handleNavigate('main'); }} href="#product" className="hover:text-indigo-600 transition">Product</a>
            <a onClick={() => setIsMenuOpen(false)} href="#download" className="hover:text-indigo-600 transition">Download</a>
            <a onClick={() => setIsMenuOpen(false)} href="#resources" className="hover:text-indigo-600 transition">Resources</a>
            <a onClick={() => setIsMenuOpen(false)} href="#developers" className="hover:text-indigo-600 transition">Developers</a>
            <a onClick={() => { setIsMenuOpen(false); handleNavigate('anra'); }} className="hover:text-indigo-600 transition cursor-pointer">anra</a>
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
