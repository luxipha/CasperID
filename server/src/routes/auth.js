const express = require('express');
const router = express.Router();

// Environment variables for OAuth
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || 'YOUR_LINKEDIN_CLIENT_ID';
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || 'YOUR_TWITTER_CLIENT_ID';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const REDIRECT_URI_BASE = process.env.API_URL || 'http://localhost:3001';

/**
 * GET /api/auth/linkedin
 * Redirects to LinkedIn OAuth
 */
router.get('/linkedin', (req, res) => {
    const { wallet } = req.query;
    const state = Buffer.from(JSON.stringify({ wallet, provider: 'linkedin' })).toString('base64');
    const redirectUri = `${REDIRECT_URI_BASE}/api/auth/callback/linkedin`;

    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=openid%20profile%20email`;

    res.redirect(url);
});

/**
 * GET /api/auth/twitter
 * Redirects to Twitter OAuth
 */
router.get('/twitter', (req, res) => {
    const { wallet } = req.query;
    const state = Buffer.from(JSON.stringify({ wallet, provider: 'twitter' })).toString('base64');
    const redirectUri = `${REDIRECT_URI_BASE}/api/auth/callback/twitter`;

    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=users.read%20tweet.read&code_challenge=challenge&code_challenge_method=plain`;

    res.redirect(url);
});

/**
 * GET /api/auth/google
 * Redirects to Google OAuth
 */
router.get('/google', (req, res) => {
    const { wallet } = req.query;
    const state = Buffer.from(JSON.stringify({ wallet, provider: 'google' })).toString('base64');
    const redirectUri = `${REDIRECT_URI_BASE}/api/auth/callback/google`;

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email%20profile`;

    res.redirect(url);
});

/**
 * GET /api/auth/callback/:provider
 * Handles OAuth callback
 */
router.get('/callback/:provider', (req, res) => {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
        return res.send(`
            <script>
                window.opener.postMessage({ type: 'AUTH_ERROR', provider: '${provider}', error: '${error}' }, '*');
                window.close();
            </script>
        `);
    }

    // In a real implementation, we would exchange the code for a token here
    // and verify the user profile.

    // For now, we assume success to demonstrate the flow (since we don't have real keys to exchange code)
    // But this endpoint IS the real callback handler structure.

    res.send(`
        <script>
            window.opener.postMessage({ type: 'AUTH_SUCCESS', provider: '${provider}', code: '${code}' }, '*');
            window.close();
        </script>
    `);
});

module.exports = router;
