'use client';

import { useEffect, useState } from 'react';
import { useCasper } from '@/lib/casper-context';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Eye, Users, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Link from 'next/link';

interface ViewEvent {
    _id: string;
    viewerWallet?: string;
    ownerWallet: string;
    endpoint: string;
    accessedFields: string[];
    ip: string;
    userAgent: string;
    timestamp: string;
}

interface AnalyticsData {
    totalViews: number;
    viewsThisWeek: number;
    viewsTrend: number;
    verifiedViews: number;
    anonymousViews: number;
    dailyViews: { date: string; verified: number; anonymous: number }[];
    topViewers: { viewer: string; count: number }[];
    recentViews: ViewEvent[];
}

export default function AnalyticsPage() {
    const { isConnected, account } = useCasper();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isConnected && account) {
            fetchAnalytics();
        }
    }, [isConnected, account]);

    const fetchAnalytics = async () => {
        try {
            const data = await apiClient.getAccessLogs();
            processAnalyticsData(data.logs || []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const processAnalyticsData = (logs: ViewEvent[]) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Filter views
        const thisWeekViews = logs.filter(log => new Date(log.timestamp) >= weekAgo);
        const lastWeekViews = logs.filter(log => 
            new Date(log.timestamp) >= twoWeeksAgo && new Date(log.timestamp) < weekAgo
        );

        // Calculate trend
        const viewsTrend = lastWeekViews.length > 0 
            ? ((thisWeekViews.length - lastWeekViews.length) / lastWeekViews.length) * 100 
            : 0;

        // Verified vs Anonymous
        const verifiedViews = thisWeekViews.filter(log => log.viewerWallet && log.viewerWallet !== 'anonymous').length;
        const anonymousViews = thisWeekViews.filter(log => !log.viewerWallet || log.viewerWallet === 'anonymous').length;

        // Daily views (last 7 days) - with stacked data
        const dailyViews = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const dayLogs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= dayStart && logDate <= dayEnd;
            });

            const dayVerified = dayLogs.filter(log => log.viewerWallet && log.viewerWallet !== 'anonymous').length;
            const dayAnonymous = dayLogs.filter(log => !log.viewerWallet || log.viewerWallet === 'anonymous').length;

            dailyViews.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                verified: dayVerified,
                anonymous: dayAnonymous
            });
        }

        // Top viewers
        const viewerCounts: { [key: string]: number } = {};
        thisWeekViews.forEach(log => {
            const viewer = log.viewerWallet && log.viewerWallet !== 'anonymous' 
                ? `${log.viewerWallet.substring(0, 6)}...`
                : 'Anonymous';
            viewerCounts[viewer] = (viewerCounts[viewer] || 0) + 1;
        });

        const topViewers = Object.entries(viewerCounts)
            .map(([viewer, count]) => ({ viewer, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        setAnalytics({
            totalViews: logs.length,
            viewsThisWeek: thisWeekViews.length,
            viewsTrend,
            verifiedViews,
            anonymousViews,
            dailyViews,
            topViewers,
            recentViews: logs.slice(0, 10)
        });
    };

    // Chart colors using your color scheme
    const COLORS = {
        primary: '#6366f1',
        secondary: '#1e1b4b', 
        accent: '#06b6d4',
        success: '#10b981',
        warning: '#f97316',
        verified: '#10b981', // green for verified
        anonymous: '#f97316', // orange for anonymous
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
                <Card className="p-8 max-w-md w-full bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
                        <p className="text-gray-300">Connect to view your profile analytics</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Prepare donut chart data
    const donutData = [
        { name: 'Verified', value: analytics?.verifiedViews || 0, color: COLORS.verified },
        { name: 'Anonymous', value: analytics?.anonymousViews || 0, color: COLORS.anonymous }
    ];

    // Empty state data for charts
    const emptyDonutData = [
        { name: 'Verified', value: 1, color: '#374151' },
        { name: 'Anonymous', value: 1, color: '#4b5563' }
    ];

    const emptyDailyData = [
        { date: 'Mon', verified: 0, anonymous: 0 },
        { date: 'Tue', verified: 0, anonymous: 0 },
        { date: 'Wed', verified: 0, anonymous: 0 },
        { date: 'Thu', verified: 0, anonymous: 0 },
        { date: 'Fri', verified: 0, anonymous: 0 },
        { date: 'Sat', verified: 0, anonymous: 0 },
        { date: 'Sun', verified: 0, anonymous: 0 },
    ];


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
            <div className="w-full px-6 py-8">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Profile Analytics</h1>
                            <p className="text-gray-300 text-lg">Track who's viewing your digital identity</p>
                        </div>
                        <Link href="/me">
                            <Button variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10">
                                <ArrowDown className="w-4 h-4 mr-2 rotate-90" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {/* Profile Views - Large Card */}
                            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 xl:col-span-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-gray-400 text-lg font-medium">Profile Views</h3>
                                    <div className={`flex items-center gap-2 text-lg ${(analytics?.viewsTrend || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {(analytics?.viewsTrend || 0) >= 0 ? 
                                            <ArrowUp className="w-5 h-5" /> : 
                                            <ArrowDown className="w-5 h-5" />
                                        }
                                        {Math.abs(analytics?.viewsTrend || 0).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="text-5xl font-bold text-white mb-2">
                                    {analytics?.viewsThisWeek || 0}
                                </div>
                                <p className="text-gray-400 text-lg">
                                    This week • {analytics?.totalViews || 0} total views
                                </p>
                            </Card>

                            {/* Viewer Types - Donut Chart */}
                            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 xl:col-span-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <Users className="w-6 h-6 text-gray-400" />
                                    <h3 className="text-gray-400 text-lg font-medium">Viewer Types</h3>
                                </div>
                                
                                <div className="relative h-48 mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics && (analytics.verifiedViews > 0 || analytics.anonymousViews > 0) ? donutData : emptyDonutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {(analytics && (analytics.verifiedViews > 0 || analytics.anonymousViews > 0) ? donutData : emptyDonutData).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    
                                    {/* Center Labels */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <div className="text-white text-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                <span>Verified {analytics?.verifiedViews || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                                <span>Anonymous {analytics?.anonymousViews || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Daily Views - Stacked Bar Chart */}
                            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 xl:col-span-1 lg:col-span-2 xl:col-span-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="w-6 h-6 text-gray-400" />
                                    <h3 className="text-gray-400 text-lg font-medium">7-Day Views</h3>
                                    <div className="ml-auto flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            <span className="text-gray-300">Verified</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                            <span className="text-gray-300">Anonymous</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={analytics?.dailyViews && analytics.dailyViews.some(d => d.verified > 0 || d.anonymous > 0) ? analytics.dailyViews : emptyDailyData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            />
                                            <Bar 
                                                dataKey="verified" 
                                                stackId="a" 
                                                fill={analytics && analytics.dailyViews.some(d => d.verified > 0 || d.anonymous > 0) ? COLORS.verified : '#4b5563'}
                                                radius={[0, 0, 2, 2]}
                                            />
                                            <Bar 
                                                dataKey="anonymous" 
                                                stackId="a" 
                                                fill={analytics && analytics.dailyViews.some(d => d.verified > 0 || d.anonymous > 0) ? COLORS.anonymous : '#374151'}
                                                radius={[2, 2, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Top Viewers */}
                            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 lg:col-span-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <Eye className="w-6 h-6 text-gray-400" />
                                    <h3 className="text-gray-400 text-lg font-medium">Most Active Viewers</h3>
                                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 ml-auto">
                                        {analytics?.topViewers.length || 0} unique viewers
                                    </Badge>
                                </div>
                                
                                <div className="space-y-4">
                                    {analytics?.topViewers && analytics.topViewers.length > 0 ? 
                                        analytics.topViewers.map((viewer, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-indigo-400 text-lg font-mono font-bold">#{index + 1}</span>
                                                    <span className="text-white text-lg font-mono">{viewer.viewer}</span>
                                                </div>
                                                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-sm px-3 py-1">
                                                    {viewer.count} views
                                                </Badge>
                                            </div>
                                        )) : (
                                        <div className="text-center py-12">
                                            <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400 text-lg mb-2">No viewers yet</p>
                                            <p className="text-gray-500">Share your profile to start tracking visitors</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20 lg:col-span-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <Clock className="w-6 h-6 text-gray-400" />
                                    <h3 className="text-gray-400 text-lg font-medium">Recent Activity</h3>
                                </div>
                                
                                <div className="space-y-4 max-h-80 overflow-y-auto">
                                    {analytics?.recentViews && analytics.recentViews.length > 0 ? 
                                        analytics.recentViews.map((view) => (
                                            <div key={view._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <div>
                                                    <p className="text-white font-mono text-sm">
                                                        {view.viewerWallet && view.viewerWallet !== 'anonymous' 
                                                            ? `${view.viewerWallet.substring(0, 6)}...`
                                                            : 'Anonymous'
                                                        }
                                                    </p>
                                                    <p className="text-gray-400 text-xs mt-1">
                                                        {new Date(view.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )) : (
                                        <div className="text-center py-12">
                                            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400 mb-2">No activity yet</p>
                                            <p className="text-gray-500 text-sm">Recent views will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}