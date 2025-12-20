/**
 * Server-side wrapper component for profile pages
 * Handles metadata generation, SEO-friendly URLs, and redirects
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { generateProfileMetadata, fetchProfileData, generateProfileStructuredData } from './metadata';
import { parseProfileSlug, shouldRedirectToSeoUrl } from '@/lib/seo-utils';
import ClientProfilePage from './client-profile-page';

interface ProfilePageProps {
  params: { wallet: string };
}

/**
 * Generate metadata for the profile page
 */
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  return generateProfileMetadata(params.wallet);
}

/**
 * Server component that fetches initial data and renders client component
 */
export default async function ProfileServerWrapper({ params }: ProfilePageProps) {
  const { wallet } = params;
  
  // Parse the URL slug to determine what type of identifier we have
  const parsedSlug = parseProfileSlug(wallet);
  
  // Determine the lookup identifier (human ID or wallet address)
  const lookupId = parsedSlug.humanId || wallet;
  
  // Fetch initial profile data server-side for better performance
  const initialProfile = await fetchProfileData(lookupId);
  
  // If profile found, check if we need to redirect to SEO-friendly URL
  if (initialProfile) {
    const redirectCheck = shouldRedirectToSeoUrl(wallet, initialProfile);
    
    if (redirectCheck.shouldRedirect && redirectCheck.newUrl) {
      // Perform a permanent redirect to the SEO-friendly URL
      redirect(redirectCheck.newUrl);
    }
  }
  
  // Generate structured data for SEO
  const structuredData = initialProfile ? generateProfileStructuredData(initialProfile, wallet) : null;

  return (
    <>
      {/* Structured Data JSON-LD */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      
      {/* Client-side component with initial data */}
      <ClientProfilePage 
        params={{ wallet: lookupId }} 
        initialProfile={initialProfile}
        originalSlug={wallet}
      />
    </>
  );
}