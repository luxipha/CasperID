import type { HostedAuthorizationOptions, HostedAuthorizationResult } from './types';
export { HostedAuthorizationOptions, HostedAuthorizationResult } from './types';
export declare function buildHostedAuthorizationUrl(options: HostedAuthorizationOptions): Promise<{
    url: string;
    state: string;
}>;
export declare function authorizeWithCasperID(options: HostedAuthorizationOptions): Promise<HostedAuthorizationResult>;
export declare function consumeHostedAuthorizationCallback(url: string): Promise<HostedAuthorizationResult | null>;
//# sourceMappingURL=hostedAuthorization.d.ts.map