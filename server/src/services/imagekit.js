const ImageKit = require('@imagekit/nodejs');

/**
 * ImageKit Service
 * Handles uploading images to ImageKit CDN
 */

// Check if ImageKit credentials are configured
if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.warn('⚠️ ImageKit credentials not fully configured. Avatar uploads will fail.');
    console.warn('Required env vars: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT');
}

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

module.exports = imagekit;
