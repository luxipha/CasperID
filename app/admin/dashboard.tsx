'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import RequestDetailsModal from './components/request-detail-modal';

interface VerificationRequest {
    id: string;
    wallet: string;
    tier: string;
    email?: string;
    status: string;
    created_at: string;
    updated_at: string;
    // Extended fields
    first_name?: string;
    last_name?: string;
    name?: string;
    metadata?: any;
    cns_name?: string;
    [key: string]: any;
}

export default function AdminDashboard() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    const handleLogin = () => {
        if (password) {
            setIsAuthenticated(true);
            fetchRequests(password);
        }
    };

    const fetchRequests = async (adminPassword: string) => {
        setLoading(true);
        setError('');

        try {
            const statusFilter = filter === 'all' ? undefined : filter;
            const data = await apiClient.getVerificationRequests(adminPassword, statusFilter);
            setRequests(data.requests || []);
        } catch (err: any) {
            console.error('Admin fetch requests error:', err);
            setError(err.message);
            if (err.message.includes('credentials') || err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: string, approve: boolean) => {
        if (!password) return;

        try {
            await apiClient.issueCredential(password, requestId, approve);
            alert(`Request ${approve ? 'approved' : 'rejected'} successfully!`);
            fetchRequests(password);
        } catch (err: any) {
            alert(err.message || 'Failed to process request');
        }
    };

    useEffect(() => {
        if (isAuthenticated && password) {
            fetchRequests(password);
        }
    }, [filter]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Card className="p-8 max-w-md w-full bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                        <p className="text-gray-300">
                            Enter the admin password to access the verification console.
                        </p>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Admin password"
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
                        />
                        <Button
                            onClick={handleLogin}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            Login
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <h1 className="text-3xl font-bold mb-2">Admin Console</h1>
                        <p className="text-gray-300">Manage verification requests</p>
                    </div>
                    <Button
                        onClick={() => setIsAuthenticated(false)}
                        variant="outline"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                        Logout
                    </Button>
                </div>

                {/* Filters */}
                <Card className="p-4 bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <Button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                variant={filter === f ? 'default' : 'outline'}
                                className={
                                    filter === f
                                        ? 'bg-purple-600 hover:bg-purple-700 border-transparent text-white'
                                        : 'bg-transparent border-white/20 text-white hover:bg-white/10'
                                }
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Button>
                        ))}
                        <Button
                            onClick={() => fetchRequests(password)}
                            variant="outline"
                            className="ml-auto bg-transparent border-white/20 text-white hover:bg-white/10"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Refresh'}
                        </Button>
                    </div>
                </Card>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded text-red-300">
                        {error}
                    </div>
                )}

                {/* Requests Table */}
                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <h2 className="text-xl font-bold text-white mb-4">Verification Requests</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No requests found</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-gray-400">Wallet</p>
                                            <p className="text-white font-mono text-sm break-all">
                                                {request.wallet}
                                            </p>
                                            {request.email && (
                                                <p className="text-xs text-gray-400 mt-1">{request.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">Tier</p>
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mt-1">
                                                {request.tier}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 justify-end">
                                            <Button
                                                onClick={() => setSelectedRequest(request)}
                                                size="sm"
                                                className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30"
                                            >
                                                Details
                                            </Button>

                                            {request.status === 'pending' ? (
                                                <>
                                                    <Button
                                                        onClick={() => handleAction(request.id, true)}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleAction(request.id, false)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge
                                                    className={
                                                        request.status === 'approved'
                                                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                                                    }
                                                >
                                                    {request.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        Created: {new Date(request.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <RequestDetailsModal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    request={selectedRequest}
                    onAction={(approve) => handleAction(selectedRequest!.id, approve)}
                />
            </div>
        </div>
    );
}
