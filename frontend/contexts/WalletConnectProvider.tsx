import React, { ReactNode } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, arbitrum, bsc, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Extend Web3Modal config type to include features property (available at runtime but not in types)
type Web3ModalConfig = Parameters<typeof createWeb3Modal>[0] & {
    features?: {
        email?: boolean;
        socials?: boolean;
        onramp?: boolean;
        swaps?: boolean;
        history?: boolean;
    };
};

// WalletConnect Cloud Project ID - Get yours at https://cloud.walletconnect.com
// For development, you can use a placeholder or set in .env
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// App metadata for WalletConnect
const metadata = {
    name: 'CasperID',
    description: 'Decentralized Identity Verification on Casper',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://CasperID.com',
    icons: ['https://CasperID.com/logo.png']
};

// Supported chains
const chains = [mainnet, polygon, arbitrum, bsc, sepolia] as const;

// Create wagmi config
export const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    enableWalletConnect: true,
    enableInjected: true, // MetaMask, etc.
    enableEIP6963: true,  // Wallet detection standard
    enableCoinbase: true,
});

// Create query client for React Query (required by wagmi v2)
const queryClient = new QueryClient();

// Track initialization state
let isInitialized = false;

export interface WalletConnectProviderProps {
    children: ReactNode;
}

/**
 * WalletConnect Provider Component
 * Wrap your app with this to enable wallet connections
 */
export function WalletConnectProvider({ children }: WalletConnectProviderProps) {
    React.useEffect(() => {
        if (!isInitialized && typeof window !== 'undefined') {
            // Initialize Web3Modal only when the provider is mounted
            const modalConfig: Web3ModalConfig = {
                wagmiConfig,
                projectId,
                enableAnalytics: false,
                themeMode: 'light',
                themeVariables: {
                    '--w3m-font-family': 'Inter, sans-serif',
                    '--w3m-accent': '#7C3AED', // Primary purple from CasperID
                    '--w3m-border-radius-master': '16px',
                },
                // Customize to show only wallets
                features: {
                    email: false,
                    socials: false,
                    onramp: false,
                    swaps: false,
                    history: false,
                }
            };
            createWeb3Modal(modalConfig as Web3ModalConfig);
            isInitialized = true;
        }
    }, []);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export { useWeb3Modal } from '@web3modal/wagmi/react';
export { useAccount, useDisconnect, useSignMessage, useBalance, useChainId } from 'wagmi';
