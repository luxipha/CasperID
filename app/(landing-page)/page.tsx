import Link from "next/link";
import Script from "next/script";
import { FooterMarketing } from "@/components/footer-marketing";
import StickyScrollSection from "./sticky-scroll";
import Logo from "@/components/logo";
import ScanShowcase from "@/components/scan-showcase";

export default function LandingPage() {
  return (
    <div id="top" className="font-sans relative min-h-screen bg-white text-slate-900 w-full">
      <Script src="https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js" strategy="afterInteractive" />
      <Script id="hero-ring-worklet" strategy="afterInteractive">
        {`
          if ('paintWorklet' in CSS) {
            CSS.paintWorklet.addModule('https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js').catch(() => {});
            const applyRing = (el) => {
              if (!el) return;
              const setPos = (x, y, interactive) => {
                el.style.setProperty('--ring-x', x);
                el.style.setProperty('--ring-y', y);
                el.style.setProperty('--ring-interactive', interactive ? 1 : 0);
              };
              setPos(50, 50, 0);
              el.addEventListener('pointermove', (e) => {
                setPos((e.clientX / window.innerWidth) * 100, (e.clientY / window.innerHeight) * 100, true);
              });
              el.addEventListener('pointerleave', () => setPos(50, 50, false));
            };

            document.querySelectorAll('[data-ring="true"]').forEach(applyRing);
          }
        `}
      </Script>
      <Script id="tsparticles-init" strategy="afterInteractive">
        {`
          const loadParticles = () => {
            if (!window.tsParticles) return;
            window.tsParticles.load({
              id: "tsparticles",
              options: {
                background: {
                  color: "transparent"
                },
                interactivity: {
                  detectsOn: "window",
                  events: {
                    onClick: { enable: false, mode: "repulse" },
                    onHover: { enable: false, mode: "bubble" },
                    resize: true
                  },
                  modes: {
                    bubble: {
                      distance: 200,
                      duration: 2,
                      opacity: 0,
                      size: 0,
                      speed: 3
                    },
                    repulse: {
                      distance: 400,
                      duration: 0.4
                    }
                  }
                },
                particles: {
                  color: { value: "#ffffff" },
                  move: {
                    direction: "none",
                    enable: true,
                    outModes: "out",
                    random: true,
                    speed: 0.3
                  },
                  number: {
                    density: { enable: true },
                    value: 600
                  },
                  opacity: {
                    animation: { enable: true, speed: 5 },
                    value: { min: 0.3, max: 0.6 }
                  },
                  shape: { type: "circle" },
                  size: { value: 1 }
                }
              }
            });
          };

          if (document.readyState === "complete") {
            loadParticles();
          } else {
            window.addEventListener("load", loadParticles);
          }
        `}
      </Script>
      <Script id="header-scroll" strategy="afterInteractive">
        {`
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
          }
        `}
      </Script>
      {/* <div id="tsparticles" className="fixed inset-0 w-screen h-screen pointer-events-none z-10" /> */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_30%_90%,rgba(147,51,234,0.06),transparent_25%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(0,0,0,0.08),transparent)] opacity-30" />
      </div>

      <main className="relative z-20 w-full max-w-[1905px] mx-auto px-10 pt-24 pb-24">
        <header id="site-header" className="site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300">
          <div className="w-full max-w-[1905px] mx-auto px-10 flex items-center justify-between py-6">
            <div className="flex items-center gap-6">
              <Logo />
            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
              <Link href="#product" className="hover:text-slate-900">
                Product
              </Link>
              <Link href="#use-cases" className="flex items-center gap-1 hover:text-slate-900 cursor-pointer">
                <span>Use Cases</span>
              </Link>
              <Link href="#developers" className="hover:text-slate-900">
                Pricing
              </Link>
              <Link href="#blogs" className="hover:text-slate-900">
                Blog
              </Link>
              <Link href="#download" className="flex items-center gap-1 hover:text-slate-900 cursor-pointer">
                <span>Resources</span>
              </Link>
            </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/me"
                className="hidden md:inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Get CasperID
              </Link>
              <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:-translate-y-0.5 transition">
                Download
              </button>
            </div>
          </div>
        </header>

        <section
          id="hero-ring"
          data-ring="true"
          className="relative overflow-hidden flex flex-col items-center text-center min-h-[70vh] justify-center bg-transparent"
        >
          <div className="relative z-10 flex flex-col items-center">
            <Logo className="mb-6" />
            <h1 className="text-[52px] md:text-[80px] font-black tracking-tight mb-4 leading-[1.05]">
              Verify once
            </h1>
            <p className="text-[32px] md:text-[56px] text-slate-600 font-semibold mb-4 leading-[1.1]">
              Reuse everywhere
            </p>
            <p className="text-2xl text-slate-600 font-semibold mb-10 max-w-3xl">
              One-tap login, verified, and ready to autofill anywhere.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/me"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-300/40"
              >
                Get Started
              </Link>
              <Link
                href="#use-cases"
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 border border-slate-200"
              >
                Explore use cases
              </Link>
            </div>
          </div>
        </section>

        <section id="product" className="w-full flex justify-center pb-16 pt-32">
          <div className="w-[1585px] max-w-full border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200">
            <div className="bg-slate-100 text-slate-500 text-sm px-4 py-2 border-b border-slate-200">
              Product video
            </div>
            <div className="bg-black">
              <iframe
                className="w-full h-[900px] rounded-2xl"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=placeholder"
                title="CasperID Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="w-full py-24" id="identity">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1.1fr_0.9fr] items-start gap-6">
            <div className="max-w-xl text-left space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
CasperID is a reusable digital identity layer
              </h2>
              <p className="text-xl text-slate-600">
                that lets you complete KYC once and log in across platforms without resubmitting documents or losing control of your data.</p>
            </div>
            <div className="w-full">
              <ScanShowcase />
            </div>
          </div>
        </section>

      </main>

      <div id="use-cases">
        <StickyScrollSection />
      </div>

      <section className="relative w-full h-[900px] overflow-hidden bg-white" id="developers">
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_10%,rgba(0,0,0,0.16),transparent),radial-gradient(1px_1px_at_50%_50%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_90%_80%,rgba(0,0,0,0.1),transparent)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,rgba(99,102,241,0.2),transparent),radial-gradient(1px_1px_at_80%_20%,rgba(79,70,229,0.15),transparent)] opacity-30" />
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="flex-1 flex flex-col items-center text-center space-y-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Available at no charge
            </div>
            <div className="text-4xl md:text-5xl font-bold text-slate-900">
              For developers
            </div>
            <div className="text-3xl md:text-4xl font-semibold text-slate-600">
              A verified identity you can reuse everywhere
            </div>
            <button className="mt-4 px-6 py-3 rounded-full bg-slate-300 text-slate-500 text-sm font-semibold shadow-lg shadow-slate-300/40 cursor-not-allowed" disabled>
              Download for Chrome
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center text-center space-y-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Coming soon
            </div>
            <div className="text-4xl md:text-5xl font-bold text-slate-900">
              For organizations
            </div>
            <div className="text-3xl md:text-4xl font-semibold text-slate-600">
              Identity infrastructure for real teams
            </div>
            <button className="mt-4 px-6 py-3 rounded-full bg-white text-slate-800 text-sm font-semibold border border-slate-200 shadow-sm">
              Notify me
            </button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 min-h-[827px] bg-white" id="blogs">
        <div className="w-full px-6 md:px-12">
          <div className="w-full flex items-center justify-between">
            <h2 className="text-4xl font-bold text-slate-900">Latest Blogs</h2>
            <button className="px-5 py-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-800 border border-slate-200">
              View blog
            </button>
          </div>

          <div className="w-full mt-10">
            <div className="grid grid-cols-1 md:grid-cols-[max-content_max-content] gap-6 lg:gap-8 justify-start items-start">
              {[1, 2].map((idx) => (
                <div key={idx} className="space-y-4 w-[384px]">
                  <div className="w-[384px] h-[384px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex items-center justify-center text-white text-lg font-semibold">
                    <span>Blog cover {idx}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xl font-semibold text-slate-900">
                      {idx === 1 ? "Nano Banana Pro in CasperID" : "Introducing CasperID"}
                    </div>
                    <div className="text-sm text-slate-500 flex gap-4">
                      <span>Nov {idx === 1 ? "21" : "19"}, 2025</span>
                      <span>Product</span>
                    </div>
                    <button className="text-sm text-slate-900 font-semibold inline-flex items-center gap-1 hover:underline">
                      Read blog <span className="text-lg leading-none">›</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full px-6 md:px-12 mt-8 flex gap-3">
          <button className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm">
            ‹
          </button>
          <button className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm">
            ›
          </button>
        </div>
      </section>

      <section className="w-full py-10 px-6 md:px-12" id="download">
        <div
          id="download-ring"
          data-ring="true"
          className="w-full mx-auto h-[900px] rounded-3xl overflow-hidden bg-black relative px-8 md:px-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_20%,rgba(99,102,241,0.3),transparent),radial-gradient(1px_1px_at_70%_60%,rgba(79,70,229,0.25),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(59,130,246,0.2),transparent)] opacity-60" />
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-2xl text-left space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Stop re-verifying, <br />Start reusing
              </h2>
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="px-6 py-3 rounded-full bg-slate-300 text-slate-500 text-sm font-semibold shadow-lg shadow-slate-800/30 cursor-not-allowed" disabled>
                  Add To Chrome
                </button>
                <Link href="/me" className="px-6 py-3 rounded-full bg-slate-800 text-white text-sm font-semibold shadow-lg shadow-slate-900/40">
                  Create CasperID
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 md:px-12 py-8 flex justify-end">
        <Link
          href="#top"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm hover:-translate-y-0.5 transition"
        >
          ↑ Back to top
        </Link>
      </section>
      <FooterMarketing className="scroll-mt-24" />
    </div>
  );
}
