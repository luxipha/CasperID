/**
 * Dynamic metadata generation and server-side rendering for profile pages
 */

import ProfileServerWrapper, { generateMetadata } from './profile-server-wrapper';

// Export the metadata generation function
export { generateMetadata };

// Export the server wrapper as default
export default ProfileServerWrapper;
