// import Image from "next/image";
// import Link from "next/link";
import React from 'react';

type LogoProps = {
  href?: string | null;
  className?: string;
  showName?: boolean;
  variant?: 'png' | 'svg';
};

const Logo = ({ href = "/", className = "", showName = true, variant = "svg" }: LogoProps) => {
  const logoSrc = variant === 'png' ? '/logos/logo.png' : '/logos/logo.svg';
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoSrc} alt="CasperID logo" width={32} height={32} className="h-8 w-8" />
      {showName && (
        <span className="text-sm font-semibold">
          Casper<span style={{ color: "#9333EA" }}>ID</span>
        </span>
      )}
    </div>
  );

  return href ? (
    <a href={href} className="hover:opacity-90 transition">
      {content}
    </a>
  ) : (
    content
  );
};

export default Logo;
