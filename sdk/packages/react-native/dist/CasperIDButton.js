import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { authorizeWithCasperID, } from './utils/hostedAuthorization';
export function CasperIDButton({ onSuccess, onError, children, style, disabled, ...options }) {
    const [isLoading, setIsLoading] = useState(false);
    const authorize = async () => {
        setIsLoading(true);
        try {
            const result = await authorizeWithCasperID(options);
            onSuccess?.(result);
        }
        catch (error) {
            onError?.(error instanceof Error ? error : new Error('CasperID authorization failed.'));
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Pressable, { style: ({ pressed }) => [
            styles.button,
            (disabled || isLoading) && styles.disabled,
            pressed && styles.pressed,
            style,
        ], disabled: disabled || isLoading, onPress: authorize, children: _jsx(Text, { style: styles.text, children: isLoading ? 'Opening CasperID...' : children || 'Continue with CasperID' }) }));
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
//# sourceMappingURL=CasperIDButton.js.map