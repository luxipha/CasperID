// This component ensures all public assets are included in the build
// by referencing them in the code. This prevents Next.js from optimizing them away.

export default function AssetPreloader() {
  // This component should never render, it's just to reference assets
  if (typeof window !== 'undefined') {
    return null;
  }

  // Reference all logo assets
  const logoAssets = [
    '/logos/logo.png',
    '/logos/logo_round.png', 
    '/logos/favicon.svg',
    '/logos/avatar.png',
    '/logos/adevar_logoapp.png',
    '/logos/apple-touch-icon.png',
    '/logos/favicon-96x96.png',
    '/logos/favicon.ico',
    '/logos/web-app-manifest-192x192.png',
    '/logos/web-app-manifest-512x512.png',
  ];

  // Reference all image assets
  const imageAssets = [
    '/images/1.webp',
    '/images/2.webp',
    '/images/3.webp',
    '/images/4.webp',
    '/images/5.webp',
    '/images/5cb0bc04.json',
  ];

  return (
    <div style={{ display: 'none' }}>
      {logoAssets.map((src, i) => (
        <img key={`logo-${i}`} src={src} alt="" />
      ))}
      {imageAssets.map((src, i) => (
        <img key={`image-${i}`} src={src} alt="" />
      ))}
    </div>
  );
}