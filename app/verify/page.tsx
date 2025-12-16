'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar/navbar';
import { apiClient, type IdentityStatus } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';

export default function VerifyPage() {
    const [wallet, setWallet] = useState('');
    const [status, setStatus] = useState<IdentityStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleCheck = async () => {
        if (!wallet) return;

        setLoading(true);
        setSearched(false);

        try {
            const data = await apiClient.getIdentityStatus(wallet);
            setStatus(data);
            setSearched(true);
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: number | null) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />

            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="text-center text-white space-y-2 pt-12">
                    <h1 className="text-4xl font-bold">Verify Identity</h1>
                    <p className="text-gray-300 text-lg">
                        Check verification status for any Casper wallet address
                    </p>
                </div>

                {/* Search Card */}
                <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="space-y-4">
                        <label className="text-white font-semibold">Wallet Address</label>
                        <div className="flex gap-3">
                            <Input
                                value={wallet}
                                onChange={(e) => setWallet(e.target.value)}
                                placeholder="account-hash-xxxx... or paste wallet address"
                                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 font-mono"
                            />
                            <Button
                                onClick={handleCheck}
                                disabled={loading || !wallet}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 mr-2" />
                                        Check
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Results */}
                {searched && status && (
                    <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
                        <div className="space-y-6">
                            {/* Status Header */}
                            <div className="flex items-center gap-4">
                                {status.verified ? (
                                    <>
                                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                                        <div>
                                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-1">
                                                ✓ Verified
                                            </Badge>
                                            <p className="text-gray-300 text-sm mt-1">
                                                This wallet has been verified by a trusted issuer
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-12 h-12 text-gray-400" />
                                        <div>
                                            <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-lg px-4 py-1">
                                                Not Verified
                                            </Badge>
                                            <p className="text-gray-400 text-sm mt-1">
                                                No verification record found for this wallet
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Verification Details */}
                            {status.verified && (
                                <div className="border-t border-white/10 pt-6 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Verification Tier</p>
                                        <p className="text-white text-lg font-semibold capitalize">
                                            {status.tier}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Issuer</p>
                                        <p className="text-white text-lg font-semibold">{status.issuer}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Last KYC Verification</p>
                                        <p className="text-white text-lg">
                                            {formatTimestamp(status.last_kyc_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Last Liveness Check</p>
                                        <p className="text-white text-lg">
                                            {formatTimestamp(status.last_liveness_at)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* API Documentation */}
                <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-4">For Developers</h2>
                    <p className="text-gray-300 mb-4">
                        Integrate CasperID verification into your dApp with our simple API
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">GET /api/identity-status</p>
                            <pre className="bg-slate-800 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                                {`curl http://localhost:3001/api/identity-status?wallet=account-hash-xxx`}
                            </pre>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 mb-2">Response:</p>
                            <pre className="bg-slate-800 p-4 rounded text-sm text-gray-300 overflow-x-auto">
                                {`{
  "wallet": "account-hash-xxx",
  "verified": true,
  "tier": "basic",
  "last_kyc_at": 1732442400,
  "last_liveness_at": 1732442400,
  "issuer": "CasperID Demo"
}`}
                            </pre>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
