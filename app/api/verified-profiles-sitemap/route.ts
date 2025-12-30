/**
 * API endpoint for verified profiles sitemap data
 * Returns list of verified profiles for SEO indexing
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Return empty array if backend is not available (during build)
    if (!process.env.API_URL && process.env.NODE_ENV !== 'production') {
      console.log('Backend not available during build, returning empty sitemap');
      return NextResponse.json([]);
    }

    // In production, you might want to cache this and update periodically
    const response = await fetch(`${API_BASE_URL}/api/verified-profiles`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch verified profiles');
    }

    const profiles = await response.json();

    // Transform to sitemap format with SEO-friendly URLs
    const sitemapData = profiles
      .filter((profile: any) => profile.human_id && profile.verification_status === 'verified')
      .map((profile: any) => {
        // Generate SEO-friendly slug
        let slug = profile.human_id;
        if (profile.first_name && profile.last_name) {
          const nameSlug = `${profile.first_name} ${profile.last_name}`
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          slug = `${nameSlug}-${profile.human_id}`;
        } else if (profile.first_name) {
          const nameSlug = profile.first_name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          slug = `${nameSlug}-${profile.human_id}`;
        }

        return {
          url: `/profile/${slug}`,
          lastModified: profile.verified_at || profile.updated_at || new Date().toISOString(),
          changeFrequency: 'monthly',
          priority: 0.6,
        };
      })
      .slice(0, 1000); // Limit to 1000 profiles for performance

    return NextResponse.json(sitemapData);

  } catch (error) {
    console.error('Failed to generate verified profiles sitemap:', error);
    return NextResponse.json([], { status: 500 });
  }
}