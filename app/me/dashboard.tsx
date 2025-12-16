'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCasper } from '@/lib/casper-context';
import { apiClient, type IdentityStatus } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import RequestVerificationModal from './request-verification-modal';
import WizardModal from './components/verification-wizard/wizard-modal';

export default function UserDashboard() {
    const { isConnected, account, publicKey, connect } = useCasper();
    const [status, setStatus] = useState<IdentityStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // For basic
    const [showWizard, setShowWizard] = useState(false); // For full KYC
    const [wizardInitialData, setWizardInitialData] = useState<any>({});
    const [wizardInitialStep, setWizardInitialStep] = useState(1);

    useEffect(() => {
        if (isConnected && account) {
            fetchStatus();
        }
    }, [isConnected, account]);

    const fetchStatus = async () => {
        if (!account) return;

        setLoading(true);
        try {
            const data = await apiClient.getIdentityStatus(account);
            setStatus(data);
        } catch (error: any) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };

    // State to track if extension sync was already done
    const [extensionSynced, setExtensionSynced] = useState(false);

    // Only sync once when status is first loaded, then remove after delay
    useEffect(() => {
        if (status && !extensionSynced) {
            setExtensionSynced(true);
            
            // Remove extension sync elements after 3 seconds to prevent loops
            setTimeout(() => {
                const syncElement = document.getElementById('casperid-extension-sync');
                const dataElement = document.getElementById('casperid-extension-full-data');
                
                if (syncElement) syncElement.remove();
                if (dataElement) dataElement.remove();
                
                console.log('[Dashboard] Extension sync elements removed to prevent loops');
            }, 3000);
        }
    }, [status, extensionSynced]);

    const formatTimestamp = (timestamp: number | null) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Card className="p-8 max-w-md w-full bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
                        <p className="text-gray-300">
                            Connect your Casper wallet to view your verification status and manage your digital identity.
                        </p>
                        <Button
                            onClick={connect}
                            size="lg"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            Connect Casper Wallet
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between text-white">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Your Identity Dashboard</h1>
                        <p className="text-gray-300">Manage your decentralized identity verification</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={status?.human_id ? `/profile/${status.human_id}` : `/profile/${account}`}>
                            <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 bg-transparent">
                                View Public Profile
                            </Button>
                        </Link>
                        <Link href="/me/edit-profile">
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Wallet Info Card */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="space-y-2">
                        {status?.human_id ? (
                            <>
                                <p className="text-sm text-gray-400">ID</p>
                                <p className="text-white font-semibold text-lg">{status.human_id}</p>
                                <p className="text-sm text-gray-400 mt-3">CNS Domain</p>
                                <p className="text-white font-mono text-sm">{status.human_id.replace(/-/g, '')}.cid</p>
                                <p className="text-sm text-gray-400 mt-3">Wallet Address</p>
                                <p className="text-gray-300 font-mono text-xs break-all">{account}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-400">Wallet Address</p>
                                <p className="text-white font-mono text-sm break-all">{account}</p>
                                <p className="text-sm text-gray-400 mt-3">DID (Decentralized Identity)</p>
                                <p className="text-white font-mono text-sm">did:casper:{publicKey?.slice(0, 16)}...</p>
                            </>
                        )}
                    </div>
                </Card>

                {/* Verification Status Card */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">Verification Status</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                        </div>
                    ) : status ? (
                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className="flex items-center gap-3">
                                {status.verified ? (
                                    <>
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                        <div>
                                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                                ✓ Verified
                                            </Badge>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-8 h-8 text-gray-400" />
                                        <div>
                                            <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                                                Not Verified
                                            </Badge>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Verification Details */}
                            {status.verified && (
                                <div className="space-y-4 mt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-400">Tier</p>
                                            <p className="text-white font-semibold capitalize">{status.tier}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-400">Issuer</p>
                                            <p className="text-white font-semibold">{status.issuer}</p>
                                        </div>
                                    </div>

                                    {/* KYC Status with Warning */}
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-gray-400">KYC Verification</p>
                                            {status.last_kyc_at && (() => {
                                                const daysSince = Math.floor((Date.now() / 1000 - status.last_kyc_at) / 86400);
                                                return daysSince > 90 ? (
                                                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                                        ⚠️ Outdated
                                                    </Badge>
                                                ) : daysSince > 60 ? (
                                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                                        ⚠️ Expiring Soon
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                                        ✓ Fresh
                                                    </Badge>
                                                );
                                            })()}
                                        </div>
                                        <p className="text-white font-semibold">{formatTimestamp(status.last_kyc_at)}</p>
                                        {status.last_kyc_at && (() => {
                                            const daysSince = Math.floor((Date.now() / 1000 - status.last_kyc_at) / 86400);
                                            return <p className="text-xs text-gray-400 mt-1">{daysSince} days ago</p>;
                                        })()}
                                    </div>

                                    {/* Liveness Status with Warning */}
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-gray-400">Liveness Check</p>
                                            {status.last_liveness_at ? (() => {
                                                const daysSince = Math.floor((Date.now() / 1000 - status.last_liveness_at) / 86400);
                                                return daysSince > 30 ? (
                                                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                                                        ⚠️ Expired
                                                    </Badge>
                                                ) : daysSince > 21 ? (
                                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                                        ⚠️ Expiring Soon
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                                        ✓ Fresh
                                                    </Badge>
                                                );
                                            })() : (
                                                <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                                                    Not Performed
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-white font-semibold">{status.last_liveness_at ? formatTimestamp(status.last_liveness_at) : 'No liveness check performed'}</p>
                                        {status.last_liveness_at ? (() => {
                                            const daysSince = Math.floor((Date.now() / 1000 - status.last_liveness_at) / 86400);
                                            return <p className="text-xs text-gray-400 mt-1">{daysSince} days ago</p>;
                                        })() : (
                                            <p className="text-xs text-gray-400 mt-1">Request full KYC to enable liveness verification</p>
                                        )}
                                        {status.last_liveness_at && Math.floor((Date.now() / 1000 - status.last_liveness_at) / 86400) > 21 && (
                                            <Button
                                                size="sm"
                                                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-sm"
                                                onClick={() => alert('Refresh liveness feature coming soon!')}
                                            >
                                                🔄 Refresh Liveness Check
                                            </Button>
                                        )}
                                        {!status.last_liveness_at && status.tier === 'basic' && (
                                            <Button
                                                size="sm"
                                                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-sm"
                                                onClick={() => setShowWizard(true)}
                                            >
                                                🔒 Upgrade to Full KYC
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            {!status.verified && !status.pending_request && (
                                <Button
                                    onClick={() => setShowModal(true)}
                                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                    Request Verification
                                </Button>
                            )}

                            {/* Pending Request Notice */}
                            {!status.verified && status.pending_request && (
                                <div className="w-full mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-300">
                                        <Clock className="w-5 h-5" />
                                        <span className="font-semibold">Verification Pending</span>
                                    </div>
                                    <p className="text-sm text-yellow-200 mt-1">
                                        Your verification request is being reviewed. We'll update your status once it's processed.
                                    </p>
                                </div>
                            )}

                            {status.verified && (
                                <Button
                                    onClick={fetchStatus}
                                    variant="outline"
                                    className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
                                >
                                    Refresh Status
                                </Button>
                            )}
                        </div>
                    ) : null}
                </Card>

                {/* Pending Request Notice */}
                {/* This would show if user has pending request - we'll add this logic later */}

                {/* [EXTENSION SYNC DATA] Hidden element for content.js to scrape - only render once */}
                {status && extensionSynced && (
                    <>
                        <div
                            id="casperid-extension-sync"
                            data-wallet={account}
                            data-cns={status.human_id}
                            data-verified={status.verified}
                            data-tier={status.tier}
                            data-kyc-date={status.last_kyc_at}
                            data-liveness-date={status.last_liveness_at}
                            key={`sync-${account}-${status.verified}`} // Stable key
                            style={{ display: 'none' }}
                        ></div>

                        {/* Full Profile JSON for Extension */}
                        {status.extended_profile && (
                            <div
                                id="casperid-extension-full-data"
                                data-json={JSON.stringify(status.extended_profile)}
                                key={`profile-${account}`} // Stable key
                                style={{ display: 'none' }}
                            ></div>
                        )}
                    </>
                )}
            </div>

            {/* Verification Request Modal (Basic/Full KYC Selection) */}
            {showModal && (
                <RequestVerificationModal
                    wallet={account!}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchStatus();
                    }}
                    onFullKycSelected={(data) => {
                        setShowModal(false);
                        setWizardInitialData(data);
                        setWizardInitialStep(2); // Skip step 1 (Personal Info)
                        setShowWizard(true);
                    }}
                    isUpgrade={false}
                    currentTier={status?.tier || 'basic'}
                />
            )}

            {/* Full KYC Wizard (Upgrade/Full) */}
            {showWizard && (
                <WizardModal
                    wallet={account!}
                    existingData={{ ...status?.profile, ...wizardInitialData }}
                    initialStep={wizardInitialStep}
                    onClose={() => {
                        setShowWizard(false);
                        setWizardInitialData({});
                        setWizardInitialStep(1);
                    }}
                    onSuccess={() => {
                        setShowWizard(false);
                        setWizardInitialData({});
                        setWizardInitialStep(1);
                        fetchStatus();
                    }}
                />
            )}
        </div>
    );
}
