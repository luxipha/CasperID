'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X, Sparkles } from 'lucide-react';

interface CNSClaimProps {
    wallet: string;
    profileData?: {
        name?: string;
        email?: string;
    };
}

export default function CNSClaim({ wallet, profileData }: CNSClaimProps) {
    const [loading, setLoading] = useState(true);
    const [cnsInfo, setCnsInfo] = useState<any>(null);
    const [customName, setCustomName] = useState('');
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availability, setAvailability] = useState<any>(null);
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCNSInfo();
    }, [wallet]);

    const loadCNSInfo = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                wallet,
                ...(profileData?.name && { name: profileData.name }),
                ...(profileData?.email && { email: profileData.email })
            });

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cns/info?${params}`
            );

            if (!response.ok) throw new Error('Failed to load CNS info');

            const data = await response.json();
            setCnsInfo(data);

            if (data.suggestedName) {
                // Extract name without .cspr suffix for input
                setCustomName(data.suggestedName.replace('.cspr', ''));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load CNS information');
        } finally {
            setLoading(false);
        }
    };

    const checkAvailability = async () => {
        if (!customName || customName.length < 3) {
            setError('Name must be at least 3 characters');
            return;
        }

        try {
            setCheckingAvailability(true);
            setError('');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cns/check-availability?name=${encodeURIComponent(customName)}`
            );

            if (!response.ok) throw new Error('Failed to check availability');

            const data = await response.json();
            setAvailability(data);
        } catch (err: any) {
            setError(err.message || 'Failed to check availability');
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleClaim = async () => {
        if (!availability?.available) {
            setError('Please check availability first');
            return;
        }

        try {
            setClaiming(true);
            setError('');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/cns/claim`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wallet, name: customName })
                }
            );

            if (!response.ok) throw new Error('Failed to claim name');

            const data = await response.json();

            alert(`Success! Your name ${data.name} is being registered. Transaction: ${data.txHash}`);

            // Reload CNS info
            await loadCNSInfo();
            setAvailability(null);
            setCustomName('');
        } catch (err: any) {
            setError(err.message || 'Failed to claim name');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin mr-3" />
                    <span className="text-gray-300">Loading CNS information...</span>
                </div>
            </Card>
        );
    }

    if (cnsInfo?.hasName) {
        return (
            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Check className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            You have a Casper Name!
                        </h3>
                        <p className="text-2xl font-bold text-purple-300 mb-2">
                            {cnsInfo.currentName}
                        </p>
                        <p className="text-sm text-gray-400">
                            This name is linked to your wallet and can be used across the Casper ecosystem.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">
                        Claim Your Casper Name
                    </h3>
                </div>
                <p className="text-gray-400">
                    Get a human-readable name for your wallet address
                </p>
            </div>

            {cnsInfo?.suggestedName && (
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded">
                    <p className="text-sm text-gray-300">
                        <strong className="text-blue-300">Suggested:</strong>{' '}
                        {cnsInfo.suggestedName}
                    </p>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <Label htmlFor="cns-name" className="text-white mb-2 block">
                        Choose Your Name
                    </Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="cns-name"
                                value={customName}
                                onChange={(e) => {
                                    setCustomName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                                    setAvailability(null);
                                }}
                                placeholder="yourname"
                                className="bg-slate-700 border-slate-600 text-white pr-16"
                                maxLength={30}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                                .cspr
                            </span>
                        </div>
                        <Button
                            onClick={checkAvailability}
                            disabled={checkingAvailability || !customName || customName.length < 3}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {checkingAvailability ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Check'
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        3-30 characters, lowercase letters, numbers, and hyphens only
                    </p>
                </div>

                {availability && (
                    <div className={`p-4 rounded-lg border ${availability.available
                            ? 'bg-green-500/20 border-green-500/30'
                            : 'bg-red-500/20 border-red-500/30'
                        }`}>
                        <div className="flex items-start gap-3">
                            {availability.available ? (
                                <Check className="w-5 h-5 text-green-400 mt-0.5" />
                            ) : (
                                <X className="w-5 h-5 text-red-400 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={`font-semibold ${availability.available ? 'text-green-300' : 'text-red-300'}`}>
                                    {availability.available ? 'Available!' : 'Not Available'}
                                </p>
                                {availability.available && availability.cost && (
                                    <div className="mt-2 text-sm text-gray-300">
                                        <p>
                                            <strong>Cost:</strong> {availability.cost.baseCost} CSPR
                                        </p>
                                        <p>
                                            <strong>Gas Fee:</strong> ~{availability.cost.gasFee} CSPR
                                        </p>
                                        <p className="mt-1 font-semibold text-white">
                                            Total: {availability.cost.total} CSPR
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {availability?.available && (
                    <Button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {claiming ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Claiming...
                            </>
                        ) : (
                            `Claim ${customName}.cspr`
                        )}
                    </Button>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-gray-400">
                    <strong>What's a Casper Name?</strong> It's a human-readable alias for your wallet address,
                    making it easier to share and remember. Once claimed, it's permanently linked to your wallet.
                </p>
            </div>
        </Card>
    );
}
