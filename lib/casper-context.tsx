"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CasperContextType {
    isConnected: boolean;
    account: string | null;
    publicKey: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const CasperContext = createContext<CasperContextType | undefined>(undefined);

export function CasperProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    useEffect(() => {
        // Check if already connected
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            // Check if Casper Wallet is installed
            if (typeof window !== 'undefined' && (window as any).CasperWalletProvider) {
                const provider = (window as any).CasperWalletProvider();
                const isConnected = await provider.isConnected();
                if (isConnected) {
                    const activeKey = await provider.getActivePublicKey();
                    setIsConnected(true);
                    setPublicKey(activeKey);
                    setAccount(activeKey); // Use full public key
                }
            }
        } catch (error) {
            console.error('Error checking Casper connection:', error);
        }
    };

    const connect = async () => {
        try {
            if (typeof window === 'undefined') {
                throw new Error('Window is not defined');
            }

            // Wait for Casper Wallet to be injected (retry for up to 3 seconds)
            const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
            let walletProvider = (window as any).CasperWalletProvider;

            if (!walletProvider) {
                for (let i = 0; i < 10; i++) {
                    await sleep(300);
                    walletProvider = (window as any).CasperWalletProvider;
                    if (walletProvider) break;
                }
            }

            if (!walletProvider) {
                alert('Casper Wallet extension not detected! Please ensure it is installed and enabled.');
                // Optional: Only redirect if they explicitly confirm they need it
                if (confirm("Go to download page?")) {
                    window.open('https://www.casperwallet.io/', '_blank');
                }
                return;
            }

            const provider = walletProvider();

            // Request connection
            await provider.requestConnection();

            // Get active public key
            const activeKey = await provider.getActivePublicKey();

            setIsConnected(true);
            setPublicKey(activeKey);
            setAccount(activeKey); // Store full public key, not truncated account-hash

            console.log('Casper wallet connected:', activeKey);
        } catch (error: any) {
            console.error('Error connecting to Casper wallet:', error);
            alert(error.message || 'Failed to connect to Casper wallet');
        }
    };

    const disconnect = () => {
        setIsConnected(false);
        setAccount(null);
        setPublicKey(null);
    };

    return (
        <CasperContext.Provider
            value={{
                isConnected,
                account,
                publicKey,
                connect,
                disconnect,
            }}
        >
            {children}
        </CasperContext.Provider>
    );
}

export function useCasper() {
    const context = useContext(CasperContext);
    if (context === undefined) {
        throw new Error('useCasper must be used within a CasperProvider');
    }
    return context;
}
