export interface HostedAuthorizationOptions {
    clientId: string;
    redirectUri: string;
    accountUrl?: string;
    state?: string;
    mode?: 'auto' | 'popup' | 'redirect';
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
}

export interface StoredTransaction {
    state: string;
    codeVerifier: string;
    redirectUri: string;
    accountOrigin: string;
}

export interface StoredResult {
    code?: string;
    state: string;
    error?: string;
    errorDescription?: string;
    authorizationStatus?: 'complete' | 'provisional';
    verificationStatus?: 'approved' | 'pending';
    grantedTier?: string;
    requiredTier?: string;
}
