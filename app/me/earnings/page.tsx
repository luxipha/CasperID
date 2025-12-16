'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Mock earnings data
const MOCK_EARNINGS_DATA = {
    totalEarned: 1247,
    totalEarnedUSD: 62.35,
    monthlyEarnings: 387,
    weeklyEarnings: 95,
    averagePerQuery: 10,
    totalQueries: 124,
    recentActivity: [
        { platform: 'defi-app.com', amount: 10, time: '2 hours ago', type: 'Full KYC Check' },
        { platform: 'nft-market.io', amount: 15, time: '1 day ago', type: 'Premium Verification' },
        { platform: 'game-platform.com', amount: 5, time: '3 days ago', type: 'Basic Check' },
        { platform: 'dao-platform.xyz', amount: 10, time: '5 days ago', type: 'Full KYC Check' },
        { platform: 'defi-app.com', amount: 10, time: '1 week ago', type: 'Liveness Refresh' },
        { platform: 'marketplace.io', amount: 8, time: '1 week ago', type: 'Profile Access' },
        { platform: 'social-dapp.com', amount: 5, time: '2 weeks ago', type: 'Basic Check' },
    ],
    topPlatforms: [
        { name: 'defi-app.com', totalEarned: 340, queries: 34 },
        { name: 'nft-market.io', totalEarned: 225, queries: 15 },
        { name: 'game-platform.com', totalEarned: 180, queries: 36 },
    ]
};

export default function EarningsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/me">
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="text-white">
                    <h1 className="text-3xl font-bold mb-2">💰 Your Earnings</h1>
                    <p className="text-gray-300">Track your income from identity verification</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Earned */}
                    <Card className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-300">Total Earned</p>
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            {MOCK_EARNINGS_DATA.totalEarned.toLocaleString()} <span className="text-lg">tokens</span>
                        </p>
                        <p className="text-sm text-green-300">${MOCK_EARNINGS_DATA.totalEarnedUSD.toFixed(2)} USD</p>
                    </Card>

                    {/* This Month */}
                    <Card className="p-6 bg-white/10 border-white/20">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-300">This Month</p>
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {MOCK_EARNINGS_DATA.monthlyEarnings} <span className="text-lg text-gray-400">tokens</span>
                        </p>
                        <p className="text-sm text-purple-300">+24% from last month</p>
                    </Card>

                    {/* This Week */}
                    <Card className="p-6 bg-white/10 border-white/20">
                        <p className="text-sm text-gray-300 mb-2">This Week</p>
                        <p className="text-3xl font-bold text-white">
                            {MOCK_EARNINGS_DATA.weeklyEarnings} <span className="text-lg text-gray-400">tokens</span>
                        </p>
                        <p className="text-sm text-gray-400">From {MOCK_EARNINGS_DATA.totalQueries} queries</p>
                    </Card>

                    {/* Avg Per Query */}
                    <Card className="p-6 bg-white/10 border-white/20">
                        <p className="text-sm text-gray-300 mb-2">Avg. Per Query</p>
                        <p className="text-3xl font-bold text-white">
                            {MOCK_EARNINGS_DATA.averagePerQuery} <span className="text-lg text-gray-400">tokens</span>
                        </p>
                        <p className="text-sm text-gray-400">Industry standard</p>
                    </Card>
                </div>

                {/* Top Platforms */}
                <Card className="p-6 bg-white/10 border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">Top Earning Platforms</h2>
                    <div className="space-y-3">
                        {MOCK_EARNINGS_DATA.topPlatforms.map((platform, index) => (
                            <div
                                key={platform.name}
                                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                                    <div>
                                        <p className="text-white font-semibold">{platform.name}</p>
                                        <p className="text-sm text-gray-400">{platform.queries} queries</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-400">{platform.totalEarned}</p>
                                    <p className="text-sm text-gray-400">tokens</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 bg-white/10 border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {MOCK_EARNINGS_DATA.recentActivity.length} transactions
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        {MOCK_EARNINGS_DATA.recentActivity.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition"
                            >
                                <div className="flex-1">
                                    <p className="text-white font-semibold flex items-center gap-2">
                                        {activity.platform}
                                        <ExternalLink className="w-3 h-3 text-gray-500" />
                                    </p>
                                    <p className="text-sm text-gray-400">{activity.type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-400">+{activity.amount} tokens</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Withdraw Section */}
                <Card className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Withdraw?</h3>
                            <p className="text-gray-300">
                                Transfer your earnings directly to your Casper wallet
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={() => alert('Withdraw feature coming soon!')}
                        >
                            Withdraw {MOCK_EARNINGS_DATA.totalEarned} Tokens
                        </Button>
                    </div>
                </Card>

                {/* Info Card */}
                <Card className="p-6 bg-slate-800/50 border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                        <div>
                            <p className="font-semibold text-purple-300 mb-1">1. Get Verified</p>
                            <p>Complete your KYC and liveness checks once</p>
                        </div>
                        <div>
                            <p className="font-semibold text-purple-300 mb-1">2. Earn Automatically</p>
                            <p>Platforms pay to verify your identity - you get 50%</p>
                        </div>
                        <div>
                            <p className="font-semibold text-purple-300 mb-1">3. Withdraw Anytime</p>
                            <p>Transfer earnings to your wallet with no minimum</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
