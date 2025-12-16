import Link from "next/link";
import Script from "next/script";
import { Raleway } from "next/font/google";
import { FooterMarketing } from "@/components/footer-marketing";
import StickyScrollSection from "./sticky-scroll";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });

export default function LandingPage() {
  return (
    <div className={`${raleway.variable} font-sans relative min-h-screen bg-white text-slate-900 w-full`}>
      <Script
        src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
        strategy="afterInteractive"
      />
      <Script src="https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js" strategy="afterInteractive" />
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
      {/* <div id="tsparticles" className="fixed inset-0 w-screen h-screen pointer-events-none z-10" /> */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_30%_90%,rgba(147,51,234,0.06),transparent_25%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10%_20%,rgba(0,0,0,0.12),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(0,0,0,0.08),transparent)] opacity-30" />
      </div>

      <main className="relative z-20 w-full max-w-[1905px] mx-auto px-10 pb-24">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500" />
              <div className="text-sm font-semibold">CasperID</div>
            </div>
            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
              <Link href="/verify" className="hover:text-slate-900">
                Product
              </Link>
              <div className="flex items-center gap-1 hover:text-slate-900 cursor-pointer">
                <span>Use Cases</span>
              </div>
              <Link href="/verify-identity" className="hover:text-slate-900">
                Pricing
              </Link>
              <Link href="/blog" className="hover:text-slate-900">
                Blog
              </Link>
              <div className="flex items-center gap-1 hover:text-slate-900 cursor-pointer">
                <span>Resources</span>
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm shadow-indigo-200">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Verify with CasperID
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:-translate-y-0.5 transition">
              Download
            </button>
          </div>
        </header>

        <section className="relative overflow-hidden flex flex-col items-center text-center min-h-[70vh] justify-center bg-transparent">
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500" />
              <span className="font-semibold">CasperID</span>
            </div>
            <h1 className="text-[52px] md:text-[80px] font-black tracking-tight mb-4 leading-[1.05]">
              Experience lift-off
            </h1>
            <p className="text-[32px] md:text-[56px] text-slate-600 font-semibold mb-4 leading-[1.1]">
              with a trusted identity
            </p>
            <p className="text-2xl text-slate-600 font-semibold mb-10 max-w-3xl">
              One-tap login, verified, and ready to autofill anywhere.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/onboard"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-300/40"
              >
                Download for Chrome
              </Link>
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 border border-slate-200"
              >
                Explore use cases
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full flex justify-center pb-16 pt-32">
          <div className="w-[1585px] max-w-full border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200">
            <div className="bg-slate-100 text-slate-500 text-sm px-4 py-2 border-b border-slate-200">
              Product video
            </div>
            <div className="bg-black">
              <video
                className="w-full h-[900px]"
                height={900}
                controls
                poster="/images/avatar.jpeg"
              >
                <source src="" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className="w-full py-24">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1.1fr_0.9fr] items-center gap-6">
            <div className="max-w-xl text-left space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                CasperID is your agent-first identity layer for the web.
              </h2>
              <p className="text-xl text-slate-600">
                A verified profile that logs you in, autofills everything, and keeps you in control of what you share.
              </p>
            </div>
            <div className="w-[320px] h-[320px] md:w-[600px] md:h-[600px] flex items-center justify-center justify-self-end">
              <lottie-player
                src="/images/5cb0bc04.json"
                background="transparent"
                speed="1"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </section>

      </main>

      <StickyScrollSection />

      <section className="relative w-full h-[900px] overflow-hidden bg-white">
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
              Achieve new heights
            </div>
            <button className="mt-4 px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-300/40">
              Download
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
              Level up your entire team
            </div>
            <button className="mt-4 px-6 py-3 rounded-full bg-white text-slate-800 text-sm font-semibold border border-slate-200 shadow-sm">
              Notify me
            </button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 min-h-[900px] bg-white">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <h2 className="text-4xl font-bold text-slate-900">Latest Blogs</h2>
          <button className="px-5 py-2 rounded-full bg-slate-100 text-sm font-semibold text-slate-800 border border-slate-200">
            View blog
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-10 grid md:grid-cols-2 gap-8">
          {[1, 2].map((idx) => (
            <div key={idx} className="space-y-4">
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 flex items-center justify-center text-white text-lg font-semibold">
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

        <div className="max-w-6xl mx-auto px-6 mt-8 flex gap-3">
          <button className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm">
            ‹
          </button>
          <button className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm">
            ›
          </button>
        </div>
      </section>

      <section className="w-full py-10">
        <div className="w-full h-[900px] rounded-3xl overflow-hidden bg-black relative">
          <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_20%,rgba(99,102,241,0.3),transparent),radial-gradient(1px_1px_at_70%_60%,rgba(79,70,229,0.25),transparent),radial-gradient(1px_1px_at_40%_80%,rgba(59,130,246,0.2),transparent)] opacity-60" />
          <div className="relative z-10 h-full flex items-center px-10">
            <div className="max-w-2xl text-left space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Download CasperID for macOS
              </h2>
              <div className="flex flex-wrap gap-4 pt-2">
                <button className="px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-semibold shadow-lg shadow-slate-800/30">
                  Download for Apple Silicon
                </button>
                <button className="px-6 py-3 rounded-full bg-slate-800 text-white text-sm font-semibold shadow-lg shadow-slate-900/40">
                  Download for Intel
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FooterMarketing />
    </div>
  );
}
