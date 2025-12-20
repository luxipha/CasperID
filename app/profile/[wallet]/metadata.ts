/**
 * Metadata utilities for user profile pages
 * Handles dynamic Open Graph, Twitter Cards, and SEO metadata
 */

import { Metadata } from 'next';
import { UserProfile } from '@/lib/api-client';
import { generateProfileSlug, parseProfileSlug } from '@/lib/seo-utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://casperid.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch user profile data server-side for metadata generation
 */
export async function fetchProfileData(walletOrHumanId: string): Promise<UserProfile | null> {
  try {
    // Parse the slug to get the correct lookup identifier
    const parsedSlug = parseProfileSlug(walletOrHumanId);
    const lookupId = parsedSlug.humanId || walletOrHumanId;

    const response = await fetch(`${API_URL}/api/public-profile/${lookupId}`, {
      cache: 'no-store' // Always fetch fresh data for metadata
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    // The /api/public-profile endpoint returns the profile data directly at root level
    // It includes: wallet, first_name, last_name, experiences, education, skills, etc.
    return data; // Return the full data object, not data.profile
  } catch (error) {
    console.error('Failed to fetch profile for metadata:', error);
    return null;
  }
}

/**
 * Generate dynamic metadata for user profile pages
 */
export async function generateProfileMetadata(walletOrHumanId: string): Promise<Metadata> {
  const profile = await fetchProfileData(walletOrHumanId);

  // Default metadata if profile not found
  if (!profile) {
    return {
      title: 'Profile Not Found - CasperID',
      description: 'This CasperID profile could not be found.',
      robots: {
        index: false,
        follow: false
      }
    };
  }

  // Build user display name
  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.human_id || 'CasperID User';

  // Build description
  const jobTitle = profile.job_title ? `${profile.job_title}` : '';
  const company = profile.company ? ` at ${profile.company}` : '';
  const location = profile.location ? ` • ${profile.location}` : '';
  const verificationBadge = profile.verification_status === 'verified' ? ' ✓ Verified' : '';

  let description = `${displayName}${verificationBadge}`;
  if (jobTitle || company) {
    description += ` • ${jobTitle}${company}`;
  }
  description += location;

  if (profile.headline) {
    description += ` • ${profile.headline}`;
  } else if (profile.about) {
    // Use first 100 characters of about section
    const aboutSnippet = profile.about.substring(0, 100);
    description += ` • ${aboutSnippet}${profile.about.length > 100 ? '...' : ''}`;
  }

  // Build SEO-friendly profile URL
  const seoSlug = generateProfileSlug(profile);
  const profileUrl = `${SITE_URL}/profile/${seoSlug}`;

  // Profile image URL (use OG image generation if no custom image)
  const ogImageUrl = `${SITE_URL}/api/og-image?name=${encodeURIComponent(displayName)}&id=${encodeURIComponent(profile.human_id || '')}&title=${encodeURIComponent(jobTitle + company)}&verified=${profile.verification_status === 'verified'}`;
  const profileImageUrl = profile.profile_image_url || ogImageUrl;

  return {
    title: `${displayName} - CasperID Profile`,
    description,
    keywords: [
      'CasperID',
      'blockchain identity',
      'verified profile',
      displayName,
      profile.human_id,
      jobTitle,
      company,
      profile.location
    ].filter(Boolean).join(', '),

    authors: [{ name: displayName }],

    openGraph: {
      type: 'profile',
      title: `${displayName} on CasperID`,
      description,
      url: profileUrl,
      siteName: 'CasperID',
      images: [
        {
          url: profileImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName}'s CasperID Profile`
        }
      ],
      locale: 'en_US'
    },

    twitter: {
      card: 'summary_large_image',
      site: '@CasperID',
      creator: profile.social_links?.twitter ? `@${profile.social_links.twitter}` : undefined,
      title: `${displayName} on CasperID`,
      description,
      images: [profileImageUrl]
    },

    alternates: {
      canonical: profileUrl
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': 160
      }
    },

    verification: {
      other: {
        'casperid-profile': profile.wallet || '',
        'casperid-human-id': profile.human_id || ''
      }
    }
  };
}

/**
 * Generate structured data (JSON-LD) for profile pages
 */
export function generateProfileStructuredData(profile: UserProfile, walletOrHumanId: string) {
  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.human_id || 'CasperID User';

  // Use SEO-friendly URL for structured data
  const seoSlug = generateProfileSlug(profile);
  const profileUrl = `${SITE_URL}/profile/${seoSlug}`;
  const ogImageUrl = `${SITE_URL}/api/og-image?name=${encodeURIComponent(displayName)}&id=${encodeURIComponent(profile.human_id || '')}&verified=${profile.verification_status === 'verified'}`;
  const profileImageUrl = profile.profile_image_url || ogImageUrl;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": profileUrl,
    "name": displayName,
    "url": profileUrl,
    "image": profileImageUrl,
    "description": profile.headline || profile.about || `${displayName} on CasperID`,
    "identifier": profile.human_id,
    "alumniOf": [],
    "worksFor": [],
    "knowsAbout": [],
    "sameAs": []
  };

  // Add job information
  if (profile.job_title || profile.company) {
    structuredData.worksFor = [{
      "@type": "Organization",
      "name": profile.company || "Unknown",
      "jobTitle": profile.job_title || "Professional"
    }];
  }

  // Add location
  if (profile.location) {
    (structuredData as any).homeLocation = {
      "@type": "Place",
      "name": profile.location
    };
  }

  // Add social media profiles
  if (profile.social_links) {
    const socialUrls: string[] = [];
    if (profile.social_links.linkedin) socialUrls.push(`https://linkedin.com/in/${profile.social_links.linkedin}`);
    if (profile.social_links.twitter) socialUrls.push(`https://twitter.com/${profile.social_links.twitter}`);
    if (profile.social_links.github) socialUrls.push(`https://github.com/${profile.social_links.github}`);
    if (profile.social_links.instagram) socialUrls.push(`https://instagram.com/${profile.social_links.instagram}`);

    structuredData.sameAs = socialUrls;
  }

  return structuredData;
}