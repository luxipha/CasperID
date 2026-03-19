import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import RequestDetailsModal from './components/request-detail-modal';

interface VerificationRequest {
    id: string;
    request_id?: string; // V2 requests have this
    source?: 'v1' | 'v2'; // To identify request type
    wallet: string | null;
    user_id?: string;
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
    // V2 specific fields (directly on request, not in metadata)
    document_type?: string;
    document_number?: string;
    liveness_verified?: boolean;
    upload_id?: string;
    front_image_url?: string;
    back_image_url?: string;
    [key: string]: any;
}

export default function AdminDashboard() {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [rejectingRequest, setRejectingRequest] = useState<VerificationRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleLogin = async () => {
        if (username && password) {
            try {
                setLoading(true);
                const { token } = await apiClient.loginAdmin(username, password);
                setToken(token);
                setIsAuthenticated(true);
                fetchRequests(token);
            } catch (err: any) {
                console.error('Login error:', err);
                setError(err.message || 'Login failed');
                setLoading(false);
            }
        }
    };

    const fetchRequests = async (authToken: string) => {
        setLoading(true);
        setError('');

        try {
            const statusFilter = filter === 'all' ? undefined : filter;
            const data = await apiClient.getVerificationRequests(authToken, statusFilter);
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

    const handleAction = async (request: VerificationRequest, approve: boolean, reason?: string) => {
        if (!token) return;

        // If rejecting without reason, show the rejection modal
        if (!approve && !reason) {
            setRejectingRequest(request);
            return;
        }

        try {
            // Use request_id for V2, id for V1
            const requestId = request.source === 'v2' ? (request.request_id || request.id) : request.id;
            await apiClient.issueCredential(token, requestId, approve, request.source, reason);
            alert(`Request ${approve ? 'approved' : 'rejected'} successfully!`);
            setRejectingRequest(null);
            setRejectionReason('');
            setSelectedRequest(null);
            fetchRequests(token);
        } catch (err: any) {
            alert(err.message || 'Failed to process request');
        }
    };

    const handleRejectConfirm = () => {
        if (!rejectingRequest || !rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        handleAction(rejectingRequest, false, rejectionReason);
    };

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchRequests(token);
        }
    }, [filter]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Card className="p-8 max-w-md w-full bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                        <p className="text-gray-300">
                            Enter admin credentials to access the verification console.
                        </p>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 mb-3"
                        />
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
                            onClick={() => fetchRequests(token)}
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

                                            {(request.status === 'pending' || request.status === 'in_progress') ? (
                                                <>
                                                    <Button
                                                        onClick={() => handleAction(request, true)}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleAction(request, false)}
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

                {selectedRequest && (
                    <RequestDetailsModal
                        isOpen={!!selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                        request={selectedRequest}
                        onAction={(approve) => handleAction(selectedRequest, approve)}
                    />
                )}

                {/* Rejection Reason Modal */}
                {rejectingRequest && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="p-6 max-w-md w-full bg-slate-800 border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4">Reject Verification</h3>
                            <p className="text-gray-300 mb-4">
                                Please provide a reason for rejecting this verification request.
                                This will be sent to the user.
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Document image is blurry and unreadable..."
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-gray-500 min-h-[100px] mb-4"
                            />
                            <div className="flex gap-3 justify-end">
                                <Button
                                    onClick={() => {
                                        setRejectingRequest(null);
                                        setRejectionReason('');
                                    }}
                                    variant="outline"
                                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRejectConfirm}
                                    disabled={!rejectionReason.trim()}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                >
                                    Confirm Rejection
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
