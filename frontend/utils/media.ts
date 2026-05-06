/**
 * Utility to convert Google Drive share links to direct image source URLs.
 * Handles format: https://drive.google.com/file/d/ID/view...
 */
export const getDriveImageUrl = (url: string): string => {
    if (!url || !url.includes('drive.google.com')) return url;
    
    // Extract ID from /d/ID/ format
    const match = url.match(/\/d\/(.+?)(\/|$)/);
    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    
    // Extract ID from ?id=ID format
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const id = urlParams.get('id');
    if (id) {
        return `https://lh3.googleusercontent.com/d/${id}`;
    }
    
    return url;
};
