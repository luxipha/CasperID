/**
 * WebAuthn utilities for CasperID SDK
 * Handles base64url encoding/decoding and credential formatting
 */

import type {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON
} from '../types';

/**
 * Convert ArrayBuffer to base64url string
 * Used for encoding WebAuthn credential data for server transport
 */
export function arrayBufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Convert base64url string to ArrayBuffer
 * Used for decoding server challenge data for WebAuthn API
 */
export function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
    // Add padding if needed
    const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
    const base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/') + padding;

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Check if WebAuthn is supported in the current browser
 */
export function isWebAuthnSupported(): boolean {
    return !!(
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential === 'function'
    );
}

/**
 * Check if platform authenticator (Touch ID, Face ID, Windows Hello) is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!isWebAuthnSupported()) return false;
    try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
}

/**
 * Detect device type for credential metadata
 */
export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipod|android.*mobile|windows phone|blackberry/i.test(userAgent)) {
        return 'mobile';
    }
    if (/ipad|android(?!.*mobile)|tablet/i.test(userAgent)) {
        return 'tablet';
    }
    return 'desktop';
}

/**
 * Get device info for credential metadata
 */
export function getDeviceInfo(): { platform: string; userAgent: string; deviceType: string } {
    return {
        platform: navigator.platform || 'unknown',
        userAgent: navigator.userAgent,
        deviceType: detectDeviceType()
    };
}

/**
 * Convert server registration options to WebAuthn API format
 */
export function prepareRegistrationOptions(
    serverOptions: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptions {
    return {
        ...serverOptions,
        challenge: base64urlToArrayBuffer(serverOptions.challenge),
        user: {
            ...serverOptions.user,
            id: base64urlToArrayBuffer(serverOptions.user.id)
        },
        excludeCredentials: serverOptions.excludeCredentials?.map(cred => ({
            ...cred,
            id: base64urlToArrayBuffer(cred.id)
        }))
    };
}

/**
 * Convert server authentication options to WebAuthn API format
 */
export function prepareAuthenticationOptions(
    serverOptions: PublicKeyCredentialRequestOptionsJSON
): PublicKeyCredentialRequestOptions {
    return {
        ...serverOptions,
        challenge: base64urlToArrayBuffer(serverOptions.challenge),
        allowCredentials: serverOptions.allowCredentials?.map(cred => ({
            ...cred,
            id: base64urlToArrayBuffer(cred.id)
        }))
    };
}

/**
 * Format registration credential for server transport
 */
export function formatRegistrationCredential(
    credential: PublicKeyCredential
): {
    id: string;
    rawId: string;
    type: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
        transports?: string[];
    };
    clientExtensionResults: AuthenticationExtensionsClientOutputs;
    deviceInfo: { platform: string; userAgent: string; deviceType: string };
} {
    const response = credential.response as AuthenticatorAttestationResponse;

    return {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
            clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
            attestationObject: arrayBufferToBase64url(response.attestationObject),
            transports: response.getTransports?.()
        },
        clientExtensionResults: credential.getClientExtensionResults(),
        deviceInfo: getDeviceInfo()
    };
}

/**
 * Format authentication credential for server transport
 */
export function formatAuthenticationCredential(
    credential: PublicKeyCredential
): {
    id: string;
    rawId: string;
    type: string;
    response: {
        clientDataJSON: string;
        authenticatorData: string;
        signature: string;
        userHandle: string | null;
    };
    clientExtensionResults: AuthenticationExtensionsClientOutputs;
} {
    const response = credential.response as AuthenticatorAssertionResponse;

    return {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
            clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
            authenticatorData: arrayBufferToBase64url(response.authenticatorData),
            signature: arrayBufferToBase64url(response.signature),
            userHandle: response.userHandle
                ? arrayBufferToBase64url(response.userHandle)
                : null
        },
        clientExtensionResults: credential.getClientExtensionResults()
    };
}

/**
 * Create a passkey (registration)
 */
export async function createPasskey(
    options: PublicKeyCredentialCreationOptionsJSON
): Promise<{
    id: string;
    rawId: string;
    type: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
        transports?: string[];
    };
    clientExtensionResults: AuthenticationExtensionsClientOutputs;
    deviceInfo: { platform: string; userAgent: string; deviceType: string };
}> {
    if (!isWebAuthnSupported()) {
        throw new Error('WebAuthn is not supported in this browser');
    }

    const preparedOptions = prepareRegistrationOptions(options);

    const credential = await navigator.credentials.create({
        publicKey: preparedOptions
    }) as PublicKeyCredential | null;

    if (!credential) {
        throw new Error('Passkey creation was cancelled or failed');
    }

    return formatRegistrationCredential(credential);
}

/**
 * Authenticate with a passkey
 */
export async function authenticateWithPasskey(
    options: PublicKeyCredentialRequestOptionsJSON
): Promise<{
    id: string;
    rawId: string;
    type: string;
    response: {
        clientDataJSON: string;
        authenticatorData: string;
        signature: string;
        userHandle: string | null;
    };
    clientExtensionResults: AuthenticationExtensionsClientOutputs;
}> {
    if (!isWebAuthnSupported()) {
        throw new Error('WebAuthn is not supported in this browser');
    }

    const preparedOptions = prepareAuthenticationOptions(options);

    const credential = await navigator.credentials.get({
        publicKey: preparedOptions
    }) as PublicKeyCredential | null;

    if (!credential) {
        throw new Error('Passkey authentication was cancelled or failed');
    }

    return formatAuthenticationCredential(credential);
}
