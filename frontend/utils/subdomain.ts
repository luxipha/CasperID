/**
 * Subdomain Utility
 * Extracts and validates subdomains for CasperID profile routing.
 */

const RESERVED_SUBDOMAINS = [
    'www',
    'api',
    'app',
    'admin',
    'anra',
    'adevaros',
    'staging',
    'dev',
    'mail',
    'blog',
    'docs',
    'support',
    'status'
];

/**
 * Gets the current subdomain if it's a valid CasperID name.
 * Handles production (casperid.com), Vercel previews, and localhost.
 */
export const getSubdomain = (): string | null => {
    // Local Development & Manual Override Support (via ?subdomain=name)
    const params = new URLSearchParams(window.location.search);
    const manualSubdomain = params.get('subdomain');
    if (manualSubdomain) return manualSubdomain.toLowerCase();

    // Production logic continues below
    const hostname = window.location.hostname;

    const parts = hostname.split('.');

    // Production: [name].casperid.com (3 parts)
    if (hostname.endsWith('casperid.com') && parts.length >= 3) {
        const subdomain = parts[0].toLowerCase();
        if (!RESERVED_SUBDOMAINS.includes(subdomain)) {
            return subdomain;
        }
    }

    // Vercel: [name].casper-id.vercel.app (4 parts)
    if (hostname.endsWith('casper-id.vercel.app') && parts.length >= 4) {
        const subdomain = parts[0].toLowerCase();
        if (!RESERVED_SUBDOMAINS.includes(subdomain)) {
            return subdomain;
        }
    }

    return null;
};
