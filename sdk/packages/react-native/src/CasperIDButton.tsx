import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import {
    authorizeWithCasperID,
    HostedAuthorizationOptions,
    HostedAuthorizationResult,
} from './utils/hostedAuthorization';

export interface CasperIDButtonProps extends HostedAuthorizationOptions {
    onSuccess?: (result: HostedAuthorizationResult) => void;
    onError?: (error: Error) => void;
    children?: React.ReactNode;
    style?: any;
    disabled?: boolean;
}

export function CasperIDButton({
    onSuccess,
    onError,
    children,
    style,
    disabled,
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
        <Pressable
            style={({ pressed }) => [
                styles.button,
                (disabled || isLoading) && styles.disabled,
                pressed && styles.pressed,
                style,
            ]}
            disabled={disabled || isLoading}
            onPress={authorize}
        >
            <Text style={styles.text}>
                {isLoading ? 'Opening CasperID...' : children || 'Continue with CasperID'}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#0066FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        opacity: 0.8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
