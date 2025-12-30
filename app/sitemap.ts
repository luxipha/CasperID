/**
 * Dynamic sitemap generation for CasperID
 * Includes verified user profiles for SEO discovery
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://casperid.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/me`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Fetch verified users for profile sitemaps
  let profileRoutes: MetadataRoute.Sitemap = [];
  
  // Only fetch profiles if API_URL is configured (not during build without backend)
  if (process.env.API_URL) {
    try {
      const response = await fetch(`${SITE_URL}/api/verified-profiles-sitemap`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      if (response.ok) {
        const profiles = await response.json();
        
        profileRoutes = profiles.map((profile: any) => ({
          url: `${SITE_URL}${profile.url}`,
          lastModified: new Date(profile.lastModified),
          changeFrequency: profile.changeFrequency as 'monthly',
          priority: profile.priority,
        }));
      }
      
    } catch (error) {
      console.error('Failed to fetch profiles for sitemap:', error);
      // Gracefully continue with static routes only
    }
  }

  return [
    ...staticRoutes,
    ...profileRoutes,
  ];
}