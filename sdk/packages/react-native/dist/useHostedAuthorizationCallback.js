import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { consumeHostedAuthorizationCallback, } from './utils/hostedAuthorization';
export function useHostedAuthorizationCallback(onSuccess, onError) {
    const handled = useRef(false);
    const successRef = useRef(onSuccess);
    const errorRef = useRef(onError);
    successRef.current = onSuccess;
    errorRef.current = onError;
    useEffect(() => {
        if (handled.current)
            return;
        const handleUrl = async (event) => {
            if (handled.current)
                return;
            handled.current = true;
            try {
                const result = await consumeHostedAuthorizationCallback(event.url);
                if (result)
                    successRef.current(result);
            }
            catch (error) {
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
//# sourceMappingURL=useHostedAuthorizationCallback.js.map