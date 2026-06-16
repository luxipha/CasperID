import { getRandomValues, digestStringAsync } from 'expo-crypto';
import { CryptoDigestAlgorithm } from 'expo-crypto';

function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

export function randomValue(byteLength = 32): string {
    const bytes = new Uint8Array(byteLength);
    getRandomValues(bytes);
    return bytesToBase64Url(bytes);
}

export async function sha256(value: string): Promise<string> {
    const hex = await digestStringAsync(CryptoDigestAlgorithm.SHA256, value);
    return bytesToBase64Url(hexToBytes(hex));
}
