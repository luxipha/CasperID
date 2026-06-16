import React from 'react';
import { HostedAuthorizationOptions, HostedAuthorizationResult } from './utils/hostedAuthorization';
export interface CasperIDButtonProps extends HostedAuthorizationOptions {
    onSuccess?: (result: HostedAuthorizationResult) => void;
    onError?: (error: Error) => void;
    children?: React.ReactNode;
    style?: any;
    disabled?: boolean;
}
export declare function CasperIDButton({ onSuccess, onError, children, style, disabled, ...options }: CasperIDButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CasperIDButton.d.ts.map