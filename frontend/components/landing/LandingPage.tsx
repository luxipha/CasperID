import React, { useEffect, useState } from 'react';
import { FooterMarketing } from "../FooterMarketing";
import StickyScrollSection from "./sticky-scroll";
import Logo from "../Logo";
import ScanShowcase from "../ScanShowcase";
import "./LandingPage.css";
import RoadmapSection from "./RoadmapSection";
// ChatAssistant disabled - using Crisp chatbot instead
// import ChatAssistant from "./ChatAssistant";
import OldVsNewSection from "./OldVsNewSection";
import ContextualSection from "./ContextsAware";
import { CasperOSFlow } from "./CasperOSFlow";

export default function LandingPage() {
  const [currentLandingView, setCurrentLandingView] = React.useState<'main' | 'casperos'>('main');
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for header blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load tsparticles
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js";
    script.async = true;
    document.body.appendChild(script);

    // Initializer
    const scriptInit = document.createElement('script');
    scriptInit.textContent = `
      const loadParticles = () => {
        if (!window.tsParticles) return;
        window.tsParticles.load({
          id: "tsparticles",
          options: {
            background: { color: "transparent" },
            interactivity: {
              detectsOn: "window",
              events: {
                onClick: { enable: false, mode: "repulse" },
                onHover: { enable: false, mode: "bubble" },
                resize: true
              },
              modes: {
                bubble: { distance: 200, duration: 2, opacity: 0, size: 0, speed: 3 },
                repulse: { distance: 400, duration: 0.4 }
              }
            },
            particles: {
              color: { value: "#ffffff" },
              move: { enable: true, speed: 0.3, direction: "none", random: true, outModes: "out" },
              number: { density: { enable: true }, value: 600 },
              opacity: { animation: { enable: true, speed: 5 }, value: { min: 0.3, max: 0.6 } },
              shape: { type: "circle" },
              size: { value: 1 }
            }
          }
        });
      };
      if (document.readyState === "complete") {
        setTimeout(loadParticles, 1000); 
      } else {
        window.addEventListener("load", loadParticles);
      }
    `;
    document.body.appendChild(scriptInit);

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
    if (header) {
      const toggle = () => {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      };
      toggle();
      window.addEventListener('scroll', toggle, { passive: true });
      return () => window.removeEventListener('scroll', toggle);
    }

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(scriptInit);
    };
  }, []);

  return (
    <div id="top" className="font-sans relative min-h-screen bg-white text-slate-900 w-full">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_30%_90%,rgba(147,51,234,0.06),transparent_25%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(0,0,0,0.08),transparent)] opacity-30" />
      </div>

      <main className={`relative z-20 w-full ${currentLandingView === 'main' ? 'max-w-[1905px] mx-auto px-10 pt-24 pb-24' : ''}`}>
        <header id="site-header" className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-white/80 shadow-sm' : ''}`}>
          <div className="w-full max-w-[1905px] mx-auto px-4 md:px-10 flex items-center justify-between py-4 md:py-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div onClick={() => setCurrentLandingView('main')} className="cursor-pointer">
                <Logo variant="png" />
              </div>
              <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                <a
                  onClick={() => setCurrentLandingView('main')}
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
                  onClick={() => setCurrentLandingView('casperos')}
                  className={`hover:text-slate-900 transition cursor-pointer ${currentLandingView === 'casperos' ? 'text-indigo-600 font-bold' : ''}`}
                >
                  CasperOS
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
              <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 md:px-4 py-2 text-xs font-semibold text-white shadow-sm hover:-translate-y-0.5 transition">
                Download
              </button>
              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {currentLandingView === 'main' ? (
          <>
            <section
              id="hero-ring"
              data-ring="true"
              className="relative overflow-hidden flex flex-col items-center text-center min-h-[70vh] justify-center bg-transparent"
            >
              <div className="relative z-10 flex flex-col items-center">
                <Logo className="mb-6" variant="png" />
                <h1 className="text-[36px] sm:text-[52px] md:text-[80px] font-black tracking-tight mb-4 leading-[1.05]">
                  Verify once
                </h1>
                <p className="text-[24px] sm:text-[32px] md:text-[56px] text-slate-600 font-semibold mb-4 leading-[1.1]">
                  Reuse everywhere
                </p>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-600 font-semibold mb-10 max-w-3xl px-4">
                  One-tap login, verified, and ready to autofill anywhere.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-300/40"
                  >
                    Get Started
                  </a>
                  <a
                    href="#use-cases"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 border border-slate-200"
                  >
                    Explore use cases
                  </a>
                </div>
              </div>
            </section>

            {/* Contextual Identities Section */}
            <ContextualSection />

            <section id="product" className="w-full flex justify-center pb-16 pt-24 md:pt-32 px-4">
              <div className="w-full max-w-[1585px] border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200">

                <div className="bg-black">
                  <iframe
                    className="w-full h-[300px] sm:h-[500px] md:h-[700px] lg:h-[900px] rounded-2xl"
                    src="https://www.youtube.com/embed/SrPLG0vmXHQ"
                    title="CasperID Product Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                </div>
              </div>
            </section>

            <section className="w-full py-16 md:py-24 px-4" id="identity">
              <div className="max-w-6xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] items-start gap-8 md:gap-6">
                <div className="max-w-xl text-left space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                    CasperID is a reusable digital identity layer
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600">
                    that lets you complete KYC once and log in across platforms without resubmitting documents or losing control of your data.</p>
                </div>
                <div className="w-full">
                  <ScanShowcase />
                </div>
              </div>
            </section>

            {/* Old vs New Section */}
            <OldVsNewSection />

            <div id="use-cases">
              <StickyScrollSection />
            </div>

            <section className="relative w-full min-h-[600px] md:min-h-[800px] lg:h-[900px] overflow-hidden bg-white py-16 md:py-0" id="developers">
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
                  <button className="mt-4 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-slate-300 text-slate-500 text-sm font-semibold shadow-lg shadow-slate-300/40 cursor-not-allowed" disabled>
                    Download for Chrome
                  </button>
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

            <section className="w-full py-12 md:py-16 min-h-[600px] md:min-h-[827px] bg-white" id="blogs">
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

                <div className="w-full mt-8 md:mt-10">
                  <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-start items-start">
                    {/* Blog 1: Identity is Not an App */}
                    <a
                      href="https://medium.com/@luxipha/identity-is-not-an-app-the-case-for-a-neutral-internet-identity-layer-6f6e38b9e188"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="space-y-4 w-full sm:w-[384px] group"
                    >
                      <div className="w-full aspect-square sm:w-[384px] sm:h-[384px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl transition-shadow">
                        <img src="/images/1.png" alt="Identity is Not an App" className="w-full h-full object-cover" />
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
                      className="space-y-4 w-full sm:w-[384px] group"
                    >
                      <div className="w-full aspect-square sm:w-[384px] sm:h-[384px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl transition-shadow">
                        <img src="/images/2.png" alt="5 Ways CasperID Fixes Identity" className="w-full h-full object-cover" />
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
                      <button className="px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-slate-300 text-slate-500 text-sm font-semibold shadow-lg shadow-slate-800/30 cursor-not-allowed" disabled>
                        Add To Chrome
                      </button>
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
          <CasperOSFlow />
        )}

        <FooterMarketing className="scroll-mt-24" onNavigate={setCurrentLandingView} />
        {/* ChatAssistant disabled - using Crisp chatbot instead */}
        {/* <ChatAssistant /> */}
      </main>
    </div>
  );
}
