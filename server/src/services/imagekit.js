const ImageKit = require('@imagekit/nodejs');

/**
 * ImageKit Service
 * Handles uploading images to ImageKit CDN
 */

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

module.exports = imagekit;
