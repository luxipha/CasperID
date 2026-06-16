import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { randomValue, sha256 } from './crypto';
import {
    saveTransaction,
    consumeTransaction,
} from './storage';
import type { HostedAuthorizationOptions, HostedAuthorizationResult, StoredResult } from './types';

const DEFAULT_HOSTED_AUTHORIZATION_TIMEOUT_MS = 30 * 60 * 1000;

const DEBUG = false;
function debug(...args: unknown[]) {
    if (DEBUG) console.log('[CasperID SDK DEBUG]', ...args);
}

export { HostedAuthorizationOptions, HostedAuthorizationResult } from './types';

export async function buildHostedAuthorizationUrl(options: HostedAuthorizationOptions): Promise<{ url: string; state: string }> {
    const accountUrl = new URL(options.accountUrl || 'https://account.casperid.com');
    const state = options.state || randomValue();
    const codeVerifier = randomValue(48);
    const codeChallenge = await sha256(codeVerifier);
    const redirectUri = new URL(options.redirectUri).toString();

    accountUrl.pathname = '/authorize';
    accountUrl.search = new URLSearchParams({
        response_type: 'code',
        client_id: options.clientId,
        redirect_uri: redirectUri,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    }).toString();

    await saveTransaction({
        state,
        codeVerifier,
        redirectUri,
        accountOrigin: accountUrl.origin,
    });

    debug('buildHostedAuthorizationUrl → url:', accountUrl.toString(), 'state:', state);
    return { url: accountUrl.toString(), state };
}

export async function authorizeWithCasperID(options: HostedAuthorizationOptions): Promise<HostedAuthorizationResult> {
    const mode = options.mode === 'auto' || !options.mode
        ? 'popup'
        : options.mode;
    const authorization = await buildHostedAuthorizationUrl(options);

    debug('authorizeWithCasperID → mode:', mode, 'authUrl:', authorization.url);

    if (mode === 'redirect') {
        await Linking.openURL(authorization.url);
        return new Promise(() => undefined);
    }

    const result = await WebBrowser.openAuthSessionAsync(authorization.url, options.redirectUri);

    debug('WebBrowser result type:', result.type);

    if (result.type !== 'success') {
        await consumeTransaction(authorization.state);
        throw new Error('CasperID authorization was cancelled or dismissed.');
    }

    const callbackUrl = new URL(result.url);
    const code = callbackUrl.searchParams.get('code');
    const returnedState = callbackUrl.searchParams.get('state');
    const error = callbackUrl.searchParams.get('error');
    const errorDescription = callbackUrl.searchParams.get('error_description');
    const metadata: Partial<StoredResult> = {
        authorizationStatus: callbackUrl.searchParams.get('authorization_status') as StoredResult['authorizationStatus'] || undefined,
        verificationStatus: callbackUrl.searchParams.get('verification_status') as StoredResult['verificationStatus'] || undefined,
        grantedTier: callbackUrl.searchParams.get('granted_tier') || undefined,
        requiredTier: callbackUrl.searchParams.get('required_tier') || undefined,
    };

    if (error) {
        await consumeTransaction(authorization.state);
        throw new Error(errorDescription || error);
    }

    if (!code || returnedState !== authorization.state) {
        await consumeTransaction(authorization.state);
        throw new Error('CasperID authorization returned unexpected state.');
    }

    const transaction = await consumeTransaction(authorization.state);
    if (!transaction) {
        throw new Error('CasperID authorization transaction is missing.');
    }

    debug('resolving successfully');
    return {
        code,
        state: transaction.state,
        codeVerifier: transaction.codeVerifier,
        redirectUri: transaction.redirectUri,
        authorizationStatus: metadata.authorizationStatus,
        verificationStatus: metadata.verificationStatus,
        grantedTier: metadata.grantedTier,
        requiredTier: metadata.requiredTier,
    };
}

export async function consumeHostedAuthorizationCallback(url: string): Promise<HostedAuthorizationResult | null> {
    const callbackUrl = new URL(url);
    const code = callbackUrl.searchParams.get('code');
    const state = callbackUrl.searchParams.get('state');
    const error = callbackUrl.searchParams.get('error');
    const errorDescription = callbackUrl.searchParams.get('error_description');
    const metadata: Partial<StoredResult> = {
        authorizationStatus: callbackUrl.searchParams.get('authorization_status') as StoredResult['authorizationStatus'] || undefined,
        verificationStatus: callbackUrl.searchParams.get('verification_status') as StoredResult['verificationStatus'] || undefined,
        grantedTier: callbackUrl.searchParams.get('granted_tier') || undefined,
        requiredTier: callbackUrl.searchParams.get('required_tier') || undefined,
    };

    if ((!code && !error) || !state) return null;

    const transaction = await consumeTransaction(state);
    if (!transaction) throw new Error('CasperID authorization state is invalid or expired.');

    if (error) throw new Error(errorDescription || error);

    return {
        code: code as string,
        state,
        codeVerifier: transaction.codeVerifier,
        redirectUri: transaction.redirectUri,
        authorizationStatus: metadata.authorizationStatus,
        verificationStatus: metadata.verificationStatus,
        grantedTier: metadata.grantedTier,
        requiredTier: metadata.requiredTier,
    };
}
