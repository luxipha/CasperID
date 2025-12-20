/**
 * SEO-friendly profile link component
 * Automatically generates SEO-optimized URLs for user profiles
 */

'use client';

import Link from 'next/link';
import { UserProfile } from '@/lib/api-client';
import { generateProfileSlug } from '@/lib/seo-utils';

interface SEOProfileLinkProps {
  profile: UserProfile | { first_name?: string; last_name?: string; human_id: string };
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SEOProfileLink({ profile, children, className, onClick }: SEOProfileLinkProps) {
  const seoSlug = generateProfileSlug(profile as UserProfile);
  const href = `/profile/${seoSlug}`;

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

/**
 * Hook to get SEO-friendly profile URL
 */
export function useProfileUrl(profile: UserProfile | { first_name?: string; last_name?: string; human_id: string }): string {
  const seoSlug = generateProfileSlug(profile as UserProfile);
  return `/profile/${seoSlug}`;
}

/**
 * Utility to get full SEO-friendly profile URL with domain
 */
export function getFullProfileUrl(
  profile: UserProfile | { first_name?: string; last_name?: string; human_id: string },
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://casperid.com'
): string {
  const seoSlug = generateProfileSlug(profile as UserProfile);
  return `${baseUrl}/profile/${seoSlug}`;
}