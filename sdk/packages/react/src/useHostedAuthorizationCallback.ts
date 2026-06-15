import { useEffect, useRef } from 'react';
import {
    consumeHostedAuthorizationCallback,
    HostedAuthorizationResult,
} from './utils/hostedAuthorization';

export function useHostedAuthorizationCallback(
    onSuccess: (result: HostedAuthorizationResult) => void,
    onError?: (error: Error) => void
) {
    const handled = useRef(false);
    const successRef = useRef(onSuccess);
    const errorRef = useRef(onError);
    successRef.current = onSuccess;
    errorRef.current = onError;

    useEffect(() => {
        if (handled.current) return;
        handled.current = true;
        try {
            const result = consumeHostedAuthorizationCallback();
            if (result) successRef.current(result);
        } catch (error) {
            errorRef.current?.(error instanceof Error ? error : new Error('CasperID authorization callback failed.'));
        }
    }, []);
}
