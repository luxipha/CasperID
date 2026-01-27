import React, { useEffect, useState } from 'react';
import { useWeb3Modal, useAccount, useDisconnect, useSignMessage } from '../../contexts/WalletConnectProvider';
import { useCasper } from '../../contexts/casper-context';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface ConnectWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWalletLinked?: (address: string, chain: string) => void;
    initialWalletType?: 'evm' | 'casper';
}

// Chain ID to name mapping
const chainNames: Record<number | string, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    56: 'BSC',
    11155111: 'Sepolia',
    'casper': 'Casper',
};

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
    isOpen,
    onClose,
    onWalletLinked,
    initialWalletType
}) => {
    const { open } = useWeb3Modal();
    const { address: evmAddress, isConnected: isEvmConnected, chainId } = useAccount();
    const { disconnect: disconnectEvm } = useDisconnect();
    const { signMessageAsync } = useSignMessage();

    const { connect: connectCasper, disconnect: disconnectCasper, isConnected: isCasperConnected, publicKey: casperPublicKey, signMessage: signCasperMessage } = useCasper();
    const { refreshUser } = useAuth();

    const [isLinking, setIsLinking] = useState(false);
    const [linkStatus, setLinkStatus] = useState<'idle' | 'signing' | 'linking' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [activeWalletType, setActiveWalletType] = useState<'evm' | 'casper' | null>(null);

    const isConnected = isEvmConnected || isCasperConnected;
    const address = activeWalletType === 'casper' ? casperPublicKey : evmAddress;

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
            setLinkStatus('idle');
            setErrorMessage('');
            if (initialWalletType) {
                setActiveWalletType(initialWalletType);
                if (initialWalletType === 'evm' && !isEvmConnected) open();
                if (initialWalletType === 'casper' && !isCasperConnected) handleConnectCasper();
            }
        } else if (shouldRender) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Automatically set active wallet type when connection status changes
    useEffect(() => {
        if (isEvmConnected && !isCasperConnected) setActiveWalletType('evm');
        if (isCasperConnected && !isEvmConnected) setActiveWalletType('casper');
    }, [isEvmConnected, isCasperConnected]);

    if (!shouldRender) return null;

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400);
    };

    const handleOpenWeb3Modal = () => {
        setActiveWalletType('evm');
        open();
    };

    const handleConnectCasper = async () => {
        try {
            setActiveWalletType('casper');
            await connectCasper();
        } catch (error: any) {
            console.error('Casper connection error:', error);
            setErrorMessage(error.message || 'Failed to connect Casper Wallet');
            setLinkStatus('error');
        }
    };

    const handleLinkWallet = async () => {
        if (!address) return;

        try {
            setIsLinking(true);
            setLinkStatus('signing');

            const chainName = activeWalletType === 'casper' ? 'Casper' : (chainNames[chainId!] || 'Unknown');
            const message = `Link this wallet to CasperID\n\nWallet: ${address}\nChain: ${chainName}\nTimestamp: ${new Date().toISOString()}`;

            let signature = '';
            if (activeWalletType === 'casper') {
                signature = await signCasperMessage(message);
            } else {
                signature = await signMessageAsync({ account: address as any, message });
            }

            setLinkStatus('linking');

            if (activeWalletType === 'casper') {
                await apiService.linkCasperAccount(address, signature, message);
            } else {
                await apiService.linkMetaMaskAccount(address, signature, message, chainId);
            }

            await refreshUser();
            setLinkStatus('success');
            onWalletLinked?.(address, chainName);

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
        if (activeWalletType === 'casper') {
            disconnectCasper();
        } else {
            disconnectEvm();
        }
        setLinkStatus('idle');
        setActiveWalletType(null);
    };

    const getChainIcon = () => {
        if (activeWalletType === 'casper') return '👻';
        const icons: Record<number, string> = {
            1: '⟠',
            137: '🟣',
            42161: '🔵',
            56: '🟡',
            11155111: '🔶',
        };
        return icons[chainId!] || '🔗';
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
                        // Not connected - show connection buttons
                        <div className="space-y-3">
                            <button
                                onClick={handleOpenWeb3Modal}
                                className="w-full h-14 rounded-2xl bg-gray-50 border border-gray-100 text-text-main font-bold text-[15px] hover:bg-gray-100 transition-all flex items-center justify-between px-6 group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⟠</span>
                                    <span>MetaMask / EVM Wallets</span>
                                </div>
                                <span className="material-symbols-outlined text-[20px] opacity-20 group-hover:opacity-100 transition-opacity">chevron_right</span>
                            </button>
                            <button
                                onClick={handleConnectCasper}
                                className="w-full h-14 rounded-2xl bg-gray-50 border border-gray-100 text-text-main font-bold text-[15px] hover:bg-gray-100 transition-all flex items-center justify-between px-6 group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">👻</span>
                                    <span>Casper Wallet / Signer</span>
                                </div>
                                <span className="material-symbols-outlined text-[20px] opacity-20 group-hover:opacity-100 transition-opacity">chevron_right</span>
                            </button>
                        </div>
                    ) : linkStatus === 'success' ? (
                        // Success state
                        <div className="text-center py-6">
                            <div className="size-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[28px] text-green-600">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-main">Wallet Linked!</h3>
                            <p className="text-text-sub text-sm mt-1">
                                {address?.slice(0, 6)}...{address?.slice(-4)} linked successfully
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
                            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 relative">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl">
                                        {getChainIcon()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">
                                            {activeWalletType === 'casper' ? 'Casper' : 'EVM'} Wallet
                                        </p>
                                        <p className="text-[15px] font-bold text-text-main font-mono truncate">
                                            {address?.slice(0, 8)}...{address?.slice(-6)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDisconnect}
                                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-text-sub text-[20px]">logout</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleLinkWallet}
                                disabled={isLinking}
                                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-[15px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                            >
                                {linkStatus === 'signing' ? 'Signing...' : linkStatus === 'linking' ? 'Linking...' : 'Link to CasperID'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectWalletModal;
