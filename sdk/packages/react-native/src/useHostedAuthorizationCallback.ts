import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
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

        const handleUrl = async (event: { url: string }) => {
            if (handled.current) return;
            handled.current = true;
            try {
                const result = await consumeHostedAuthorizationCallback(event.url);
                if (result) successRef.current(result);
            } catch (error) {
                errorRef.current?.(error instanceof Error ? error : new Error('CasperID authorization callback failed.'));
            }
        };

        const subscription = Linking.addEventListener('url', handleUrl);

        Linking.getInitialURL().then((url) => {
            if (url && !handled.current) {
                handleUrl({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);
}
