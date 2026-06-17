import { beforeEach, describe, expect, it, vi } from 'vitest';
import { consumeHostedAuthorizationCallback } from './hostedAuthorization';

describe('consumeHostedAuthorizationCallback', () => {
    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
        Object.defineProperty(window, 'opener', {
            configurable: true,
            value: null,
        });
    });

    it('returns and consumes a matching PKCE transaction', () => {
        sessionStorage.setItem('casperid_authorization:state-123', JSON.stringify({
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
            accountOrigin: 'https://account.casperid.com',
        }));

        expect(consumeHostedAuthorizationCallback('https://affiliate.example/auth/callback?code=code-123&state=state-123')).toEqual({
            code: 'code-123',
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
        });
        expect(sessionStorage.getItem('casperid_authorization:state-123')).toBeNull();
    });

    it('recovers a callback when mobile or PWA navigation loses sessionStorage', () => {
        localStorage.setItem('casperid_authorization:state-123', JSON.stringify({
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
            accountOrigin: 'https://account.casperid.com',
            expiresAt: Date.now() + 30 * 60 * 1000,
        }));

        expect(consumeHostedAuthorizationCallback('https://affiliate.example/auth/callback?code=code-123&state=state-123')).toEqual({
            code: 'code-123',
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
        });
        expect(sessionStorage.getItem('casperid_authorization:state-123')).toBeNull();
        expect(localStorage.getItem('casperid_authorization:state-123')).toBeNull();
    });

    it('rejects and removes expired durable authorization transactions', () => {
        localStorage.setItem('casperid_authorization:state-123', JSON.stringify({
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
            accountOrigin: 'https://account.casperid.com',
            expiresAt: Date.now() - 1,
        }));

        expect(() => consumeHostedAuthorizationCallback('https://affiliate.example/auth/callback?code=code-123&state=state-123'))
            .toThrow('CasperID authorization state is invalid or expired.');
        expect(localStorage.getItem('casperid_authorization:state-123')).toBeNull();
    });

    it('rejects callbacks without a matching state transaction', () => {
        expect(() => consumeHostedAuthorizationCallback('https://affiliate.example/auth/callback?code=code-123&state=unknown'))
            .toThrow('CasperID authorization state is invalid or expired.');
    });

    it('surfaces OAuth denial callbacks as errors', () => {
        sessionStorage.setItem('casperid_authorization:state-123', JSON.stringify({
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
            accountOrigin: 'https://account.casperid.com',
        }));

        expect(() => consumeHostedAuthorizationCallback('https://affiliate.example/auth/callback?error=access_denied&error_description=User%20denied&state=state-123'))
            .toThrow('User denied');
        expect(sessionStorage.getItem('casperid_authorization:state-123')).toBeNull();
    });

    it('publishes popup results for the opener and closes the popup flow', () => {
        sessionStorage.setItem('casperid_authorization:state-123', JSON.stringify({
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
            accountOrigin: 'https://account.casperid.com',
        }));

        const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => undefined);
        Object.defineProperty(window, 'opener', {
            configurable: true,
            value: {},
        });

        expect(consumeHostedAuthorizationCallback('https://affiliate.example/auth/callback?code=code-123&state=state-123')).toBeNull();
        expect(JSON.parse(localStorage.getItem('casperid_authorization_result:state-123') || '{}')).toEqual({
            code: 'code-123',
            state: 'state-123',
        });
        expect(closeSpy).toHaveBeenCalled();
        closeSpy.mockRestore();
    });

    it('publishes popup results when opener isolation removes window.opener', () => {
        sessionStorage.setItem('casperid_authorization:state-123', JSON.stringify({
            state: 'state-123',
            codeVerifier: 'verifier-123',
            redirectUri: 'https://affiliate.example/auth/callback',
            accountOrigin: 'https://account.casperid.com',
        }));
        localStorage.setItem('casperid_authorization_popup:state-123', '1');

        const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => undefined);

        expect(consumeHostedAuthorizationCallback('https://affiliate.example/auth/callback?code=code-123&state=state-123')).toBeNull();
        expect(JSON.parse(localStorage.getItem('casperid_authorization_result:state-123') || '{}')).toEqual({
            code: 'code-123',
            state: 'state-123',
        });
        expect(localStorage.getItem('casperid_authorization_popup:state-123')).toBeNull();
        expect(closeSpy).toHaveBeenCalled();
        closeSpy.mockRestore();
    });
});
