import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  showName?: boolean;
};

const Logo = ({ href = "/", className = "", showName = true }: LogoProps) => {
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image src="/logos/logo.png" alt="CasperID logo" width={32} height={32} className="h-8 w-8" />
      {showName && (
        <span className="text-sm font-semibold">
          Casper<span style={{ color: "#9333EA" }}>ID</span>
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="hover:opacity-90 transition">
      {content}
    </Link>
  ) : (
    content
  );
};

export default Logo;
