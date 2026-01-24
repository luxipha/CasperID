/**
 * Connect Wallet Modal
 * Uses Web3Modal to connect to 300+ wallets
 */

import React, { useEffect, useState } from 'react';
import { useWeb3Modal, useAccount, useDisconnect, useSignMessage } from '../../contexts/WalletConnectProvider';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface ConnectWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWalletLinked?: (address: string, chain: string) => void;
}

// Chain ID to name mapping
const chainNames: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    56: 'BSC',
    11155111: 'Sepolia',
};

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
    isOpen,
    onClose,
    onWalletLinked
}) => {
    const { open } = useWeb3Modal();
    const { address, isConnected, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();
    const { refreshUser } = useAuth(); // Get refreshUser from context

    const [isLinking, setIsLinking] = useState(false);
    const [linkStatus, setLinkStatus] = useState<'idle' | 'signing' | 'linking' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
            setLinkStatus('idle');
            setErrorMessage('');
        } else if (shouldRender) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400);
    };

    const handleOpenWeb3Modal = () => {
        open();
    };

    const handleLinkWallet = async () => {
        if (!address || !chainId) return;

        try {
            setIsLinking(true);
            setLinkStatus('signing');

            // Create verification message
            const message = `Link this wallet to CasperID\n\nWallet: ${address}\nChain: ${chainNames[chainId] || 'Unknown'}\nTimestamp: ${new Date().toISOString()}`;

            // Request signature (wagmi v2 requires account)
            const signature = await signMessageAsync({ account: address, message });

            setLinkStatus('linking');

            // Send to backend
            await apiService.linkMetaMaskAccount(address, signature, message, chainId);

            // Refresh global user state
            await refreshUser();

            setLinkStatus('success');
            onWalletLinked?.(address, chainNames[chainId] || 'ethereum');

            // Close modal after success
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            console.error('Failed to link wallet:', error);
            setLinkStatus('error');
            setErrorMessage(error.message || 'Failed to link wallet');
        } finally {
            setIsLinking(false);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setLinkStatus('idle');
    };

    const getChainIcon = (id: number) => {
        const icons: Record<number, string> = {
            1: '⟠',
            137: '🟣',
            42161: '🔵',
            56: '🟡',
            11155111: '🔶',
        };
        return icons[id] || '🔗';
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center">
            {/* Glass Backdrop */}
            <div
                className={`absolute inset-0 bg-text-main/10 backdrop-blur-md transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in'
                    }`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 ${isExiting ? 'animate-out zoom-out-95 fade-out' : 'animate-in zoom-in-95 fade-in'
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-text-sub hover:text-text-main transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                    <span className="material-symbols-outlined text-[24px]">close</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-primary">account_balance_wallet</span>
                    </div>
                    <h2 className="text-2xl font-black text-text-main tracking-tight">Connect Wallet</h2>
                    <p className="text-text-sub text-sm font-medium mt-2">
                        Link an external wallet to your CasperID
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {!isConnected ? (
                        // Not connected - show connect button
                        <button
                            onClick={handleOpenWeb3Modal}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-[15px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                        >
                            <span className="material-symbols-outlined text-[20px]">link</span>
                            Connect Wallet
                        </button>
                    ) : linkStatus === 'success' ? (
                        // Success state
                        <div className="text-center py-6">
                            <div className="size-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-main">Wallet Linked!</h3>
                            <p className="text-text-sub text-sm mt-1">
                                {address?.slice(0, 6)}...{address?.slice(-4)} on {chainNames[chainId!] || 'Unknown'}
                            </p>
                        </div>
                    ) : linkStatus === 'error' ? (
                        // Error state
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">error</span>
                                    <div>
                                        <p className="text-sm font-bold text-red-700">Failed to Link Wallet</p>
                                        <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setLinkStatus('idle')}
                                className="w-full h-12 rounded-2xl border-2 border-gray-200 text-text-main font-bold text-sm hover:bg-gray-50 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        // Connected - show wallet info and link button
                        <div className="space-y-4">
                            {/* Connected Wallet Card */}
                            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl">
                                        {getChainIcon(chainId!)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">
                                            Connected Wallet
                                        </p>
                                        <p className="text-[15px] font-bold text-text-main font-mono truncate">
                                            {address?.slice(0, 8)}...{address?.slice(-6)}
                                        </p>
                                        <p className="text-[12px] text-primary font-semibold mt-0.5">
                                            {chainNames[chainId!] || `Chain ${chainId}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDisconnect}
                                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                        title="Disconnect"
                                    >
                                        <span className="material-symbols-outlined text-text-sub text-[20px]">logout</span>
                                    </button>
                                </div>
                            </div>

                            {/* Link Button */}
                            <button
                                onClick={handleLinkWallet}
                                disabled={isLinking}
                                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-[15px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {linkStatus === 'signing' ? (
                                    <>
                                        <span className="material-symbols-outlined text-[20px] animate-pulse">edit</span>
                                        Sign Message...
                                    </>
                                ) : linkStatus === 'linking' ? (
                                    <>
                                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                                        Linking...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">verified</span>
                                        Link to CasperID
                                    </>
                                )}
                            </button>

                            {/* Info Text */}
                            <p className="text-xs text-text-sub text-center font-medium">
                                You'll sign a message to verify ownership. No gas required.
                            </p>
                        </div>
                    )}

                    {/* Supported Chains */}
                    {!isConnected && (
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60 text-center mb-3">
                                Supported Chains
                            </p>
                            <div className="flex justify-center gap-4">
                                {Object.entries(chainNames).slice(0, 4).map(([id, name]) => (
                                    <div key={id} className="flex flex-col items-center gap-1">
                                        <span className="text-xl">{getChainIcon(Number(id))}</span>
                                        <span className="text-[10px] text-text-sub font-medium">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectWalletModal;
