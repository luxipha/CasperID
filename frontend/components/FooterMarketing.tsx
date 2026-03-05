// import Link from "next/link";
import Logo from "./Logo";

export function FooterMarketing({ className, onNavigate }: { className?: string; onNavigate?: (view: string) => void }) {
  const productLinks = [
    { label: "anra 🔥", href: "/anra" },
    { label: "White Paper", href: "https://docs.google.com/document/d/1XxpYRW5Dz4vV5G_3rIublF-lwqxPHnQ7quAhiDFaKgo/edit?usp=drive_link" },
    { label: "Changelog", href: "/changelog" },
  ];

  const resourceLinks = [
    { label: "Blog", href: "#blogs" },
    { label: "Pricing", href: "#developers" },
    { label: "Use Cases", href: "#use-cases" },
    { label: "Careers", href: "/careers" },
    { label: "Relationship Managers", href: "/affiliate" },
  ];


  return (
    <footer className={`w-full min-h-[500px] md:min-h-[700px] lg:min-h-[900px] bg-white text-slate-900 flex flex-col justify-between py-8 md:py-12 px-4 md:px-10 ${className ?? ""}`}>
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="text-base md:text-lg font-semibold">Verify once, use everywhere</div>
        <div className="flex flex-wrap items-start gap-8 md:gap-16 text-sm">
          <div className="space-y-3">
            <div className="font-semibold text-slate-800">Product</div>
            <div className="space-y-2">
              {productLinks.map((link) => (
                <a key={link.label} href={link.href} className="block hover:text-slate-500">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="font-semibold text-slate-800">Resources</div>
            <div className="space-y-2">
              {resourceLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block hover:text-slate-500 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center py-8 md:py-0">
        <div className="text-[48px] sm:text-[72px] md:text-[120px] lg:text-[180px] xl:text-[200px] font-black leading-none tracking-tight text-slate-900">
          Casper<span style={{ color: "#9333EA" }}>ID</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-700">
        <Logo showName variant="png" />
        <div className="text-center text-xs md:text-sm">
          © 2026 CasperID. Built with precision for the sovereign web.
        </div>
        <div className="flex items-center gap-6">
          <a href="#top" className="hover:text-slate-500">
            About CasperID
          </a>
        </div>
      </div>
    </footer>
  );
}
