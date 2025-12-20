/**
 * SEO utilities for generating user-friendly URLs
 */

import { UserProfile } from './api-client';

/**
 * Generate a slug from a string (remove special characters, spaces, etc.)
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate SEO-friendly URL slug for a user profile
 * Format: "first-last-human-id" or just "human-id" if no name
 */
export function generateProfileSlug(profile: UserProfile): string {
  const { first_name, last_name, human_id } = profile;
  
  if (!human_id) {
    throw new Error('Profile must have a human_id');
  }

  // If we have both first and last name, create: "john-doe-ba-ka-la-ma"
  if (first_name && last_name) {
    const nameSlug = createSlug(`${first_name} ${last_name}`);
    return `${nameSlug}-${human_id}`;
  }
  
  // If we only have first name, create: "john-ba-ka-la-ma"
  if (first_name) {
    const nameSlug = createSlug(first_name);
    return `${nameSlug}-${human_id}`;
  }
  
  // If no name, just use human_id: "ba-ka-la-ma"
  return human_id;
}

/**
 * Extract human ID from an SEO-friendly URL slug
 * Works with: "john-doe-ba-ka-la-ma", "john-ba-ka-la-ma", or "ba-ka-la-ma"
 */
export function extractHumanIdFromSlug(slug: string): string {
  // Human IDs follow the pattern: word-word-word-word (4 parts)
  // Names can have 1-2 parts before the human ID
  
  const parts = slug.split('-');
  
  // If it's exactly 4 parts, it's probably just a human ID
  if (parts.length === 4) {
    return slug;
  }
  
  // If more than 4 parts, the last 4 are likely the human ID
  if (parts.length > 4) {
    return parts.slice(-4).join('-');
  }
  
  // If less than 4 parts, it might be a shortened slug, return as-is
  return slug;
}

/**
 * Check if a slug contains a human ID pattern
 */
export function containsHumanId(slug: string): boolean {
  const humanIdPattern = /([a-z]{2,4}-){3}[a-z]{2,4}$/i;
  return humanIdPattern.test(slug);
}

/**
 * Generate the canonical profile URL for a user
 */
export function getCanonicalProfileUrl(profile: UserProfile, baseUrl: string = ''): string {
  const slug = generateProfileSlug(profile);
  return `${baseUrl}/profile/${slug}`;
}

/**
 * Parse a profile URL slug to determine if it's an old format or new format
 */
export function parseProfileSlug(slug: string): {
  type: 'seo-friendly' | 'human-id' | 'wallet';
  humanId: string | null;
  isWallet: boolean;
} {
  // Check if it looks like a wallet address
  if (slug.startsWith('0x') || slug.startsWith('01') || slug.length > 50) {
    return {
      type: 'wallet',
      humanId: null,
      isWallet: true
    };
  }
  
  // Check if it contains a human ID pattern
  if (containsHumanId(slug)) {
    const humanId = extractHumanIdFromSlug(slug);
    return {
      type: 'seo-friendly',
      humanId,
      isWallet: false
    };
  }
  
  // Check if it's just a human ID (4 parts separated by hyphens)
  const parts = slug.split('-');
  if (parts.length === 4) {
    return {
      type: 'human-id',
      humanId: slug,
      isWallet: false
    };
  }
  
  // Default to treating it as a human ID or wallet
  return {
    type: 'human-id',
    humanId: slug,
    isWallet: false
  };
}

/**
 * Generate redirect mapping for old URLs to new SEO-friendly URLs
 */
export function shouldRedirectToSeoUrl(currentSlug: string, profile: UserProfile): {
  shouldRedirect: boolean;
  newUrl?: string;
} {
  const parsed = parseProfileSlug(currentSlug);
  
  // For now, disable automatic redirects - let users use clean human_id URLs
  // TODO: In the future, when custom usernames are implemented, this can be re-enabled
  // to redirect to user's chosen custom username
  
  // Only redirect wallet addresses (long hex strings) to human_id
  if (parsed.type === 'wallet') {
    return {
      shouldRedirect: true,
      newUrl: `/profile/${profile.human_id}`
    };
  }
  
  // No redirects for human_id or SEO-friendly URLs - keep them as-is
  return { shouldRedirect: false };
}