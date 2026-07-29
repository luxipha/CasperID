const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const {
    AuthorizationCode,
    BusinessApp,
    UserAccount,
    UserProfile,
    VerificationRequestV2
} = require('../database/models');
const { requireAuth } = require('../middleware/auth');
const { generateBusinessToken } = require('../utils/jwt-manager');
const { rateLimitMiddleware } = require('../utils/rate-limiter');
const {
    TIER_LEVELS,
    TIER_NUMERIC,
    normalizeRequiredTier
} = require('../constants/tier-levels');
const { expandScopesToSharedFields } = require('../utils/business-disclosure');
const { CORE_SCOPES, resolveRequestedScopes } = require('../utils/business-scopes');
const { getRootNameForAccount, buildContextualName } = require('../services/contextual-names');

const router = express.Router();
const AUTHORIZATION_CODE_TTL_MS = 2 * 60 * 1000;
router.use(rateLimitMiddleware('business_api'));

function sanitizedTheme(app) {
    return {
        primaryColor: app.sdk_config?.primary_color || '#8651e1',
        borderRadius: app.sdk_config?.border_radius || '12',
        fontFamily: app.sdk_config?.font_family || 'Inter',
        mode: app.sdk_config?.mode || 'light'
    };
}

function hasProvisionedAccount(user) {
    return typeof user?.wallet === 'string' &&
        user.wallet.length > 0 &&
        user.wallet !== 'pending_wallet' &&
        user.wallet !== 'undefined';
}

async function assessAuthorizationEligibility(app, user) {
    const grantedTier = user.tier || 'layer_0';
    const requiredTier = normalizeRequiredTier(app.sdk_config?.requiredTier);
    const onboardingRequired = !hasProvisionedAccount(user);

    if (onboardingRequired) {
        return {
            eligible: false,
            grantedTier,
            requiredTier,
            authorizationStatus: null,
            verificationStatus: null,
            onboardingRequired: true
        };
    }

    if ((TIER_NUMERIC[grantedTier] ?? 0) >= TIER_NUMERIC[requiredTier]) {
        return {
            eligible: true,
            grantedTier,
            requiredTier,
            authorizationStatus: 'complete',
            verificationStatus: 'approved',
            onboardingRequired: false
        };
    }

    // A submitted Layer 3 request is a terminal state for hosted authorization,
    // even when the user entered Layer 3 directly from Layer 1. Preserve the
    // user's real tier while admin review is pending.
    const pendingLayer3 = requiredTier === TIER_LEVELS.LAYER_3 &&
        (TIER_NUMERIC[grantedTier] ?? 0) >= TIER_NUMERIC[TIER_LEVELS.LAYER_1]
        ? await VerificationRequestV2.findOne({
            user_id: user.user_id,
            verification_tier: 'layer_3',
            status: { $in: ['pending', 'in_progress'] },
            'verification_data.submitted_at': { $exists: true, $nin: [null, ''] },
            expires_at: { $gt: new Date() }
        })
        : null;

    return {
        eligible: !!pendingLayer3,
        grantedTier,
        requiredTier,
        authorizationStatus: pendingLayer3 ? 'provisional' : null,
        verificationStatus: pendingLayer3 ? 'pending' : null,
        onboardingRequired: false
    };
}

function hashValue(value) {
    return crypto.createHash('sha256').update(value).digest('base64url');
}

function isExactRedirectUriAllowed(app, redirectUri) {
    return typeof redirectUri === 'string' &&
        Array.isArray(app.redirect_uris) &&
        app.redirect_uris.includes(redirectUri);
}

function isValidPkceValue(value) {
    return typeof value === 'string' && /^[A-Za-z0-9._~-]{43,128}$/.test(value);
}

function resolveSelectedContext(user, selectedContextDid) {
    if (!selectedContextDid || selectedContextDid === 'master') {
        return { type: 'master' };
    }

    const selectedContext = Array.isArray(user.context_dids)
        ? user.context_dids.find((contextDid) => contextDid.did === selectedContextDid)
        : null;
    if (!selectedContext) {
        return null;
    }
    if (selectedContext.routing_type === 'wallet') {
        return false;
    }

    const rootName = getRootNameForAccount(user);
    return {
        type: 'persona',
        did: selectedContext.did,
        alias: selectedContext.alias,
        context: selectedContext.context,
        name: buildContextualName(selectedContext.alias, rootName) || undefined
    };
}

async function loadBusinessTokenUser(userId, selectedContext = null) {
    const user = await UserAccount.findOne({
        $or: [{ user_id: userId }, { wallet: userId }]
    });
    if (!user) return null;

    const profile = user.wallet ? await UserProfile.findOne({ wallet: user.wallet }) : null;
    const resolvedName = profile
        ? profile.name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null
        : null;
    const persona = selectedContext?.type === 'persona'
        ? user.context_dids?.find((contextDid) => contextDid.did === selectedContext.did && contextDid.routing_type !== 'wallet')
        : null;
    const personaDisclosures = persona?.disclosures || {};
    const personaName = [
        personaDisclosures.firstName ? profile?.first_name : null,
        personaDisclosures.lastName ? profile?.last_name : null
    ].filter(Boolean).join(' ') || selectedContext?.name || selectedContext?.alias || null;

    return {
        userId: user.user_id,
        wallet: user.wallet,
        humanId: persona ? (selectedContext?.name || selectedContext?.alias || persona.did) : (profile?.human_id || user.human_id || null),
        name: persona ? personaName : resolvedName,
        verified: user.email_verified || false,
        tier: user.tier || 'layer_0',
        email: persona
            ? (personaDisclosures.email ? (profile?.email || user.recovery_email || null) : null)
            : user.recovery_email,
        sharedData: []
    };
}

router.get('/authorize/validate', async (req, res) => {
    try {
        const { client_id: clientId, redirect_uri: redirectUri } = req.query;
        if (!clientId || !redirectUri) {
            return res.status(400).json({ success: false, error: 'client_id and redirect_uri are required' });
        }

        const app = await BusinessApp.findOne({ app_id: clientId, active: true });
        if (!app || !isExactRedirectUriAllowed(app, redirectUri)) {
            return res.status(400).json({ success: false, error: 'Invalid authorization request' });
        }

        return res.json({
            success: true,
            app: {
                app_id: app.app_id,
                name: app.name,
                logo_url: app.sdk_config?.logo_url || '',
                redirect_uri: redirectUri,
                required_tier: normalizeRequiredTier(app.sdk_config?.requiredTier),
                requested_scopes: resolveRequestedScopes(app),
                shared_fields: expandScopesToSharedFields(resolveRequestedScopes(app)),
                language: app.sdk_config?.language || 'EN',
                theme: sanitizedTheme(app)
            }
        });
    } catch (error) {
        console.error('[OAuth] Authorization validation failed:', error);
        return res.status(500).json({ success: false, error: 'Authorization validation failed' });
    }
});

router.get('/authorize/status', requireAuth, async (req, res) => {
    try {
        const clientId = req.query.client_id;
        const userId = req.user.userId || req.user.user_id || req.user.wallet;
        const app = await BusinessApp.findOne({ app_id: clientId, active: true });
        const user = await UserAccount.findOne({ $or: [{ user_id: userId }, { wallet: userId }] });

        if (!app || !user) {
            return res.status(404).json({ success: false, error: 'Application or user not found' });
        }

        const assessment = await assessAuthorizationEligibility(app, user);
        return res.json({
            success: true,
            eligible: assessment.eligible,
            current_tier: assessment.grantedTier,
            required_tier: assessment.requiredTier,
            authorization_status: assessment.authorizationStatus,
            verification_status: assessment.verificationStatus,
            onboarding_required: assessment.onboardingRequired
        });
    } catch (error) {
        console.error('[OAuth] Authorization status failed:', error);
        return res.status(500).json({ success: false, error: 'Authorization status failed' });
    }
});

router.post('/authorize/complete', requireAuth, async (req, res) => {
    try {
        const {
            client_id: clientId,
            redirect_uri: redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod,
            selected_context_did: selectedContextDid
        } = req.body;

        const userId = req.user.userId || req.user.user_id || req.user.wallet;
        if (
            typeof clientId !== 'string' ||
            typeof redirectUri !== 'string' ||
            !isValidPkceValue(codeChallenge) ||
            codeChallengeMethod !== 'S256' ||
            !userId
        ) {
            return res.status(400).json({ success: false, error: 'Invalid authorization request' });
        }

        const app = await BusinessApp.findOne({ app_id: clientId, active: true });
        if (!app || !isExactRedirectUriAllowed(app, redirectUri)) {
            return res.status(400).json({ success: false, error: 'Invalid authorization request' });
        }

        const user = await UserAccount.findOne({
            $or: [{ user_id: userId }, { wallet: userId }]
        });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Authenticated user no longer exists' });
        }

        const selectedContext = resolveSelectedContext(user, selectedContextDid);
        if (selectedContext === false) {
            return res.status(400).json({ success: false, error: 'Wallet-routing personas cannot be used for identity authorization.' });
        }
        if (!selectedContext) {
            return res.status(400).json({ success: false, error: 'The selected persona is no longer available.' });
        }

        const assessment = await assessAuthorizationEligibility(app, user);
        if (!assessment.eligible) {
            return res.status(403).json({
                success: false,
                error: assessment.onboardingRequired
                    ? 'Account setup must complete before authorization can continue'
                    : 'Required verification tier has not been completed',
                code: assessment.onboardingRequired ? 'onboarding_required' : 'verification_required',
                current_tier: assessment.grantedTier,
                required_tier: assessment.requiredTier,
                onboarding_required: assessment.onboardingRequired
            });
        }

        const code = crypto.randomBytes(32).toString('base64url');
        await AuthorizationCode.create({
            code_hash: hashValue(code),
            app_id: app.app_id,
            user_id: userId,
            redirect_uri: redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            granted_tier: assessment.grantedTier,
            required_tier: assessment.requiredTier,
            requested_scopes: resolveRequestedScopes(app),
            authorization_status: assessment.authorizationStatus,
            verification_status: assessment.verificationStatus,
            selected_context: selectedContext,
            expires_at: new Date(Date.now() + AUTHORIZATION_CODE_TTL_MS)
        });

        const sharedFields = expandScopesToSharedFields(
            resolveRequestedScopes(app)
        );

        return res.json({
            success: true,
            code,
            authorization_status: assessment.authorizationStatus,
            verification_status: assessment.verificationStatus,
            granted_tier: assessment.grantedTier,
            required_tier: assessment.requiredTier,
            selected_context: selectedContext,
            shared_fields: sharedFields,
            expires_in: Math.floor(AUTHORIZATION_CODE_TTL_MS / 1000)
        });
    } catch (error) {
        console.error('[OAuth] Authorization completion failed:', error);
        return res.status(500).json({ success: false, error: 'Authorization completion failed' });
    }
});

router.post('/token', async (req, res) => {
    try {
        const {
            grant_type: grantType,
            code,
            client_id: clientId,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        } = req.body;
        const apiSecret = req.headers['x-api-secret'];

        if (
            grantType !== 'authorization_code' ||
            typeof code !== 'string' ||
            typeof clientId !== 'string' ||
            typeof redirectUri !== 'string' ||
            !isValidPkceValue(codeVerifier) ||
            !apiSecret
        ) {
            return res.status(400).json({ success: false, error: 'Invalid token request' });
        }

        const app = await BusinessApp.findOne({ app_id: clientId, active: true });
        if (!app || !(await bcrypt.compare(apiSecret, app.api_secret_hash))) {
            return res.status(401).json({ success: false, error: 'Invalid client credentials' });
        }

        const authorizationCode = await AuthorizationCode.findOne({
            code_hash: hashValue(code),
            app_id: clientId,
            redirect_uri: redirectUri,
            consumed_at: null,
            expires_at: { $gt: new Date() }
        });

        if (!authorizationCode || hashValue(codeVerifier) !== authorizationCode.code_challenge) {
            return res.status(400).json({ success: false, error: 'Invalid or expired authorization code' });
        }

        const consumedCode = await AuthorizationCode.findOneAndUpdate(
            {
                _id: authorizationCode._id,
                consumed_at: null,
                expires_at: { $gt: new Date() }
            },
            { $set: { consumed_at: new Date() } },
            { new: true }
        );
        if (!consumedCode) {
            return res.status(400).json({ success: false, error: 'Invalid or expired authorization code' });
        }

        const userData = await loadBusinessTokenUser(consumedCode.user_id, consumedCode.selected_context);
        if (!userData) {
            return res.status(400).json({ success: false, error: 'Authorized user no longer exists' });
        }

        userData.tier = consumedCode.granted_tier;
        userData.sharedData = expandScopesToSharedFields(consumedCode.requested_scopes || []);
        const isProvisional = consumedCode.authorization_status === 'provisional';
        return res.json({
            access_token: generateBusinessToken(userData, app.app_id, {
                requiredTier: consumedCode.required_tier,
                scopes: consumedCode.requested_scopes,
                authorizationStatus: consumedCode.authorization_status,
                verificationStatus: consumedCode.verification_status,
                selectedContext: consumedCode.selected_context,
                expiresIn: isProvisional ? '24h' : undefined
            }),
            token_type: 'Bearer',
            expires_in: 86400,
            authorization_status: consumedCode.authorization_status,
            verification_status: consumedCode.verification_status,
            granted_tier: consumedCode.granted_tier,
            required_tier: consumedCode.required_tier,
            scopes: consumedCode.requested_scopes,
            selected_context: consumedCode.selected_context
        });
    } catch (error) {
        console.error('[OAuth] Token exchange failed:', error);
        return res.status(500).json({ success: false, error: 'Token exchange failed' });
    }
});

module.exports = router;
module.exports.isExactRedirectUriAllowed = isExactRedirectUriAllowed;
module.exports.hashValue = hashValue;
module.exports.isValidPkceValue = isValidPkceValue;
module.exports.assessAuthorizationEligibility = assessAuthorizationEligibility;
