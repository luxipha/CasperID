/**
 * Robots.txt configuration for CasperID
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://casperid.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/me/',
          '/_next/',
          '/private/',
          '*?wallet=*', // Don't index wallet address URLs
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/profile/*',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/me/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}