const TRANSACTION_PREFIX = 'casperid_authorization:';
const RESULT_PREFIX = 'casperid_authorization_result:';
const POPUP_PREFIX = 'casperid_authorization_popup:';
const DEFAULT_HOSTED_AUTHORIZATION_TIMEOUT_MS = 30 * 60 * 1000;
const TRANSACTION_TTL_MS = DEFAULT_HOSTED_AUTHORIZATION_TIMEOUT_MS;

export interface HostedAuthorizationOptions {
    clientId: string;
    redirectUri: string;
    accountUrl?: string;
    state?: string;
    mode?: 'auto' | 'popup' | 'redirect';
    /**
     * Maximum time to wait for popup authorization. Defaults to 30 minutes so
     * signup and cross-device verification can complete. Set to 0 to disable.
     */
    timeoutMs?: number;
}

export interface HostedAuthorizationResult {
    code: string;
    state: string;
    codeVerifier: string;
    redirectUri: string;
    authorizationStatus?: 'complete' | 'provisional';
    verificationStatus?: 'approved' | 'pending';
    grantedTier?: string;
    requiredTier?: string;
    sharedFields?: string[];
    selectedContext?: {
        type: 'master' | 'persona';
        did?: string;
        alias?: string;
        context?: string;
        name?: string;
    };
}

interface StoredTransaction {
    state: string;
    codeVerifier: string;
    redirectUri: string;
    accountOrigin: string;
    expiresAt?: number;
}

interface StoredResult {
    code?: string;
    state: string;
    error?: string;
    errorDescription?: string;
    authorizationStatus?: 'complete' | 'provisional';
    verificationStatus?: 'approved' | 'pending';
    grantedTier?: string;
    requiredTier?: string;
    sharedFields?: string[];
    selectedContext?: HostedAuthorizationResult['selectedContext'];
}

function parseSharedFields(value: string | null): string[] | undefined {
    if (!value) return undefined;
    const fields = value
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean);
    return fields.length ? fields : undefined;
}

function parseSelectedContext(url: URL): HostedAuthorizationResult['selectedContext'] | undefined {
    const type = url.searchParams.get('selected_context_type');
    if (type !== 'master' && type !== 'persona') return undefined;

    const did = url.searchParams.get('selected_context_did') || undefined;
    const alias = url.searchParams.get('selected_context_alias') || undefined;
    const name = url.searchParams.get('selected_context_name') || undefined;
    const context = url.searchParams.get('selected_context_category') || undefined;

    return { type, did, alias, context, name };
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomValue(byteLength = 32): string {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return toBase64Url(bytes);
}

async function sha256(value: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return toBase64Url(new Uint8Array(digest));
}

function transactionKey(state: string): string {
    return `${TRANSACTION_PREFIX}${state}`;
}

function resultKey(state: string): string {
    return `${RESULT_PREFIX}${state}`;
}

function popupKey(state: string): string {
    return `${POPUP_PREFIX}${state}`;
}

function readStorageValue(storage: Storage, key: string): string | null {
    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorageValue(storage: Storage, key: string, value: string): void {
    try {
        storage.setItem(key, value);
    } catch {
        // Authorization can still complete if one storage layer is available.
    }
}

function removeStorageValue(storage: Storage, key: string): void {
    try {
        storage.removeItem(key);
    } catch {
        // Ignore storage access failures during cleanup.
    }
}

function parseTransaction(stored: string | null): StoredTransaction | null {
    if (!stored) return null;
    try {
        const transaction = JSON.parse(stored) as StoredTransaction;
        if (transaction.expiresAt && transaction.expiresAt <= Date.now()) {
            return null;
        }
        return transaction;
    } catch {
        return null;
    }
}

function saveTransaction(transaction: StoredTransaction): void {
    const storedTransaction = {
        ...transaction,
        expiresAt: Date.now() + TRANSACTION_TTL_MS,
    };
    const serialized = JSON.stringify(storedTransaction);
    const key = transactionKey(transaction.state);
    writeStorageValue(sessionStorage, key, serialized);
    writeStorageValue(localStorage, key, serialized);
}

function loadTransaction(state: string): StoredTransaction | null {
    const key = transactionKey(state);
    const sessionTransaction = parseTransaction(readStorageValue(sessionStorage, key));
    if (sessionTransaction) return sessionTransaction;
    removeStorageValue(sessionStorage, key);

    const persistentTransaction = parseTransaction(readStorageValue(localStorage, key));
    if (persistentTransaction) return persistentTransaction;
    removeStorageValue(localStorage, key);
    return null;
}

function clearTransaction(state: string): void {
    const key = transactionKey(state);
    removeStorageValue(sessionStorage, key);
    removeStorageValue(localStorage, key);
}

function consumeTransaction(state: string): StoredTransaction | null {
    const transaction = loadTransaction(state);
    clearTransaction(state);
    return transaction;
}

function storeResult(result: StoredResult): void {
    localStorage.setItem(resultKey(result.state), JSON.stringify(result));
}

function loadResult(state: string): StoredResult | null {
    const stored = localStorage.getItem(resultKey(state));
    if (!stored) return null;
    try {
        return JSON.parse(stored) as StoredResult;
    } catch {
        return null;
    }
}

function clearResult(state: string): void {
    localStorage.removeItem(resultKey(state));
}

function markPopupTransaction(state: string): void {
    localStorage.setItem(popupKey(state), '1');
}

function isPopupTransaction(state: string): boolean {
    return localStorage.getItem(popupKey(state)) === '1';
}

function clearPopupTransaction(state: string): void {
    localStorage.removeItem(popupKey(state));
}

const DEBUG = false;
function debug(...args: unknown[]) {
  if (DEBUG) console.log('[CasperID SDK DEBUG]', ...args);
}

function isMobileBrowser(): boolean {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

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

    saveTransaction({
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
        ? (isMobileBrowser() ? 'redirect' : 'popup')
        : options.mode;
    const authorization = await buildHostedAuthorizationUrl(options);

    debug('authorizeWithCasperID → mode:', mode, 'authUrl:', authorization.url);

    if (mode === 'redirect') {
        window.location.assign(authorization.url);
        return new Promise(() => undefined);
    }

    const popupUrl = new URL(authorization.url);
    popupUrl.searchParams.set('response_mode', 'web_message');
    popupUrl.searchParams.set('response_origin', window.location.origin);
    markPopupTransaction(authorization.state);
    const popup = window.open(popupUrl.toString(), 'casperid_authorization', 'popup=yes,width=520,height=720');
    if (!popup) {
        debug('popup was blocked!');
        clearPopupTransaction(authorization.state);
        if (!options.mode || options.mode === 'auto') {
            window.location.assign(authorization.url);
            return new Promise(() => undefined);
        }
        consumeTransaction(authorization.state);
        throw new Error('CasperID authorization popup was blocked.');
    }
    const openedPopup = popup;

    debug('popup opened successfully. popup.closed:', openedPopup.closed, 'origin:', window.location.origin);

    return new Promise((resolve, reject) => {
        let settled = false;
        const timeoutMs = options.timeoutMs ?? DEFAULT_HOSTED_AUTHORIZATION_TIMEOUT_MS;
        const timeout = timeoutMs > 0
            ? window.setTimeout(() => finish(new Error('CasperID authorization timed out.')), timeoutMs)
            : null;
        let tickCount = 0;
        const poll = window.setInterval(() => {
            tickCount++;
            const sharedResult = loadResult(authorization.state);
            if (sharedResult?.error) {
                finish(new Error(sharedResult.errorDescription || sharedResult.error));
                return;
            }
            if (sharedResult?.code) {
                debug(`tick #${tickCount}: shared result found via localStorage`);
                finish(undefined, sharedResult.code, sharedResult);
                return;
            }

            if (openedPopup.closed) {
                debug(`tick #${tickCount}: popup.closed === true; ignored because opener isolation can sever the reference`);
            }

            try {
                const popupUrl = new URL(openedPopup.location.href);
                debug(`tick #${tickCount}: popup URL readable → origin: ${popupUrl.origin}, pathname: ${popupUrl.pathname}`);
                if (popupUrl.origin !== window.location.origin) {
                    return;
                }

                const code = popupUrl.searchParams.get('code');
                const state = popupUrl.searchParams.get('state');
                debug(`tick #${tickCount}: same origin! code=${code}, state=${state}, expected_state=${authorization.state}`);
                if (!code || state !== authorization.state) {
                    return;
                }

                finish(undefined, code, {
                    authorizationStatus: popupUrl.searchParams.get('authorization_status') as StoredResult['authorizationStatus'] || undefined,
                    verificationStatus: popupUrl.searchParams.get('verification_status') as StoredResult['verificationStatus'] || undefined,
                    grantedTier: popupUrl.searchParams.get('granted_tier') || undefined,
                    requiredTier: popupUrl.searchParams.get('required_tier') || undefined,
                    sharedFields: parseSharedFields(popupUrl.searchParams.get('shared_fields')),
                    selectedContext: parseSelectedContext(popupUrl),
                });
            } catch {
                // Still on the account origin; continue polling.
            }
        }, 500);

        const onStorage = (event: StorageEvent) => {
            if (event.key !== resultKey(authorization.state) || !event.newValue) {
                return;
            }

            try {
                const sharedResult = JSON.parse(event.newValue) as StoredResult;
                if (sharedResult.state === authorization.state) {
                    if (sharedResult.error) finish(new Error(sharedResult.errorDescription || sharedResult.error));
                    else if (sharedResult.code) finish(undefined, sharedResult.code, sharedResult);
                }
            } catch {
                // Ignore malformed cross-window payloads.
            }
        };

        const onMessage = (event: MessageEvent) => {
            const transaction = loadTransaction(authorization.state);
            if (!transaction || event.origin !== transaction.accountOrigin || event.source !== openedPopup) return;
            const result = event.data as { type?: string; state?: string; code?: string; error?: string; error_description?: string } & StoredResult;
            if (result.type !== 'casperid:authorization' || result.state !== authorization.state) return;
            if (result.error) finish(new Error(result.error_description || result.error));
            else if (result.code) finish(undefined, result.code, result);
        };

        function finish(error?: Error, code?: string, metadata: Partial<StoredResult> = {}) {
            if (settled) { debug('finish called but already settled — skipping'); return; }
            debug('finish called — error:', error?.message, 'code:', code);
            settled = true;
            if (timeout !== null) window.clearTimeout(timeout);
            window.clearInterval(poll);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('message', onMessage);
            try {
                openedPopup.close();
            } catch {
                debug('popup reference is inaccessible due to opener isolation');
            }
            if (error) {
                consumeTransaction(authorization.state);
                clearResult(authorization.state);
                clearPopupTransaction(authorization.state);
                debug('rejecting with:', error.message);
                reject(error);
                return;
            }
            const transaction = consumeTransaction(authorization.state);
            if (!transaction || !code) {
                debug('transaction missing or no code — rejecting');
                clearResult(authorization.state);
                clearPopupTransaction(authorization.state);
                reject(new Error('CasperID authorization transaction is missing.'));
                return;
            }
            clearResult(authorization.state);
            clearPopupTransaction(authorization.state);
            debug('resolving successfully');
            resolve({
                code,
                state: transaction.state,
                codeVerifier: transaction.codeVerifier,
                redirectUri: transaction.redirectUri,
                authorizationStatus: metadata.authorizationStatus,
                verificationStatus: metadata.verificationStatus,
                grantedTier: metadata.grantedTier,
                requiredTier: metadata.requiredTier,
                sharedFields: metadata.sharedFields,
                selectedContext: metadata.selectedContext,
            });
        }

        window.addEventListener('storage', onStorage);
        window.addEventListener('message', onMessage);
    });
}

export function consumeHostedAuthorizationCallback(url = window.location.href): HostedAuthorizationResult | null {
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
        sharedFields: parseSharedFields(callbackUrl.searchParams.get('shared_fields')),
        selectedContext: parseSelectedContext(callbackUrl),
    };
    if ((!code && !error) || !state) return null;

    const transaction = consumeTransaction(state);
    if (!transaction) throw new Error('CasperID authorization state is invalid or expired.');

    if (window.opener || isPopupTransaction(state)) {
        debug('popup callback detected; publishing result for opener');
        storeResult({ code: code || undefined, state, error: error || undefined, errorDescription: errorDescription || undefined, ...metadata });
        clearPopupTransaction(state);
        window.close();
        return null;
    }

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
        sharedFields: metadata.sharedFields,
        selectedContext: metadata.selectedContext,
    };
}
