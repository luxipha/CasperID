import Link from "next/link";

export function FooterMarketing() {
  const productLinks = [
    { label: "Download", href: "/download" },
    { label: "Product", href: "/verify" },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
  ];

  const resourceLinks = [
    { label: "Blog", href: "/blog" },
    { label: "Pricing", href: "/verify-identity" },
    { label: "Use Cases", href: "/verify" },
  ];

  const footerLinks = [
    { label: "About CasperID", href: "/" },
    { label: "Products", href: "/verify" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <footer className="w-full min-h-[900px] bg-white text-slate-900 flex flex-col justify-between py-12 px-10">
      <div className="flex items-start justify-between">
        <div className="text-lg font-semibold">Experience liftoff</div>
        <div className="flex items-start gap-16 text-sm">
          <div className="space-y-3">
            <div className="font-semibold text-slate-800">Product</div>
            <div className="space-y-2">
              {productLinks.map((link) => (
                <Link key={link.label} href={link.href} className="block hover:text-slate-500">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="font-semibold text-slate-800">Resources</div>
            <div className="space-y-2">
              {resourceLinks.map((link) => (
                <Link key={link.label} href={link.href} className="block hover:text-slate-500">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div className="text-[120px] md:text-[200px] font-black leading-none tracking-tight text-slate-900">
          CasperID
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-700">
        <span className="font-semibold">CasperID</span>
        <div className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-slate-500">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
