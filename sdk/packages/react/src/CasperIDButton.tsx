import React, { useState } from 'react';
import {
    authorizeWithCasperID,
    HostedAuthorizationOptions,
    HostedAuthorizationResult,
} from './utils/hostedAuthorization';

export interface CasperIDButtonProps extends HostedAuthorizationOptions {
    onSuccess?: (result: HostedAuthorizationResult) => void;
    onError?: (error: Error) => void;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    id?: string;
}

export function CasperIDButton({
    onSuccess,
    onError,
    children = 'Continue with CasperID',
    className,
    disabled,
    id,
    ...options
}: CasperIDButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const authorize = async () => {
        setIsLoading(true);
        try {
            const result = await authorizeWithCasperID(options);
            onSuccess?.(result);
        } catch (error) {
            onError?.(error instanceof Error ? error : new Error('CasperID authorization failed.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button id={id} type="button" className={className} disabled={disabled || isLoading} onClick={authorize}>
            {isLoading ? 'Opening CasperID...' : children}
        </button>
    );
}
