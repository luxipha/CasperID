import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ArrowRight, CheckCircle, Clock, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import RequestDetailsModal from './components/request-detail-modal';
import Logo from '../components/Logo';
import { notifyError, notifySuccess, notifyWarning } from '../utils/notify';

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

interface PaymentSettings {
    verification_fee_ngn: number;
    usd_to_ngn_rate: number;
    source?: 'admin' | 'env';
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
    const [showPassword, setShowPassword] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        verification_fee_ngn: 1500,
        usd_to_ngn_rate: 1650,
        source: 'env'
    });
    const [paymentSettingsDraft, setPaymentSettingsDraft] = useState({
        verification_fee_ngn: '1500',
        usd_to_ngn_rate: '1650'
    });
    const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(false);
    const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false);
    const [paymentSettingsMessage, setPaymentSettingsMessage] = useState('');

    const handleLogin = async () => {
        if (username && password) {
            try {
                setLoading(true);
                setError('');
                const { token } = await apiClient.loginAdmin(username, password);
                setToken(token);
                setIsAuthenticated(true);
                await fetchPaymentSettings(token);
                fetchRequests(token);
            } catch (err: any) {
                console.error('Login error:', err);
                setError(err.message || 'Login failed');
                setLoading(false);
            }
        }
    };

    const fetchPaymentSettings = async (authToken: string) => {
        try {
            setPaymentSettingsLoading(true);
            const data = await apiClient.getAdminPaymentSettings(authToken);
            const settings = data.settings || {};
            setPaymentSettings(settings);
            setPaymentSettingsDraft({
                verification_fee_ngn: String(settings.verification_fee_ngn ?? 1500),
                usd_to_ngn_rate: String(settings.usd_to_ngn_rate ?? 1650)
            });
        } catch (err: any) {
            console.error('Admin fetch payment settings error:', err);
            setPaymentSettingsMessage(err.message || 'Failed to load payment settings');
        } finally {
            setPaymentSettingsLoading(false);
        }
    };

    const fetchRequests = async (authToken: string) => {
        setLoading(true);
        setError('');

        try {
            const statusFilter = filter;
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
            notifySuccess(`Request ${approve ? 'approved' : 'rejected'} successfully!`);
            setRejectingRequest(null);
            setRejectionReason('');
            setSelectedRequest(null);
            fetchRequests(token);
        } catch (err: any) {
            notifyError(err.message || 'Failed to process request');
        }
    };

    const handleRejectConfirm = () => {
        if (!rejectingRequest || !rejectionReason.trim()) {
            notifyWarning('Please provide a reason for rejection');
            return;
        }
        handleAction(rejectingRequest, false, rejectionReason);
    };

    const handleSavePaymentSettings = async () => {
        if (!token) return;

        try {
            setPaymentSettingsSaving(true);
            setPaymentSettingsMessage('');
            const data = await apiClient.updateAdminPaymentSettings(token, {
                verification_fee_ngn: Number(paymentSettingsDraft.verification_fee_ngn),
                usd_to_ngn_rate: Number(paymentSettingsDraft.usd_to_ngn_rate)
            });
            setPaymentSettings(data.settings);
            setPaymentSettingsDraft({
                verification_fee_ngn: String(data.settings.verification_fee_ngn),
                usd_to_ngn_rate: String(data.settings.usd_to_ngn_rate)
            });
            setPaymentSettingsMessage('Payment settings updated.');
        } catch (err: any) {
            console.error('Admin save payment settings error:', err);
            setPaymentSettingsMessage(err.message || 'Failed to update payment settings');
        } finally {
            setPaymentSettingsSaving(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchRequests(token);
        }
    }, [filter]);

    if (!isAuthenticated) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-[#F8F9FF] px-5 py-10 text-text-main">
                <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(#8652E2_1.5px,transparent_1.5px)] [background-size:32px_32px]" />
                <div className="pointer-events-none absolute -left-40 top-1/4 size-[520px] rounded-full bg-primary/10 blur-[100px]" />
                <div className="pointer-events-none absolute -right-48 bottom-0 size-[520px] rounded-full bg-cyan-200/30 blur-[110px]" />

                <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
                    <div className="grid w-full overflow-hidden rounded-[40px] border border-white bg-white shadow-[0_48px_120px_-36px_rgba(76,44,135,0.28)] lg:grid-cols-[1.08fr_0.92fr]">
                        <section className="relative hidden min-h-[650px] overflow-hidden bg-[#171129] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_10%,#8652E2_0,transparent_42%),radial-gradient(circle_at_80%_85%,#6DE8EC33_0,transparent_38%)]" />
                            <div className="absolute -right-24 top-28 size-72 rounded-full border border-white/10" />
                            <div className="absolute -right-8 top-44 size-44 rounded-full border border-white/10" />

                            <div className="relative flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                                    <Logo showName={false} href={null} className="scale-125" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold tracking-tight">CasperID</p>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/40">Operations</p>
                                </div>
                            </div>

                            <div className="relative max-w-md">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                    <ShieldCheck className="size-4 text-[#6DE8EC]" />
                                    <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/60">Restricted workspace</span>
                                </div>
                                <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.05em]">
                                    Review identity with confidence.
                                </h1>
                                <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-white/50">
                                    Secure access to verification decisions, credential issuance, and identity operations.
                                </p>
                            </div>

                            <div className="relative grid grid-cols-3 gap-3">
                                {[
                                    ['Encrypted', 'Credentials'],
                                    ['8 hour', 'Sessions'],
                                    ['Monitored', 'Access'],
                                ].map(([value, label]) => (
                                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                        <p className="text-sm font-extrabold">{value}</p>
                                        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/35">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="flex min-h-[650px] items-center px-6 py-12 sm:px-12 lg:px-16">
                            <div className="mx-auto w-full max-w-md">
                                <div className="mb-10 flex items-center gap-3 lg:hidden">
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                                        <Logo showName={false} href={null} className="scale-125" />
                                    </div>
                                    <div>
                                        <p className="font-black">CasperID</p>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-text-sub/50">Operations</p>
                                    </div>
                                </div>

                                <div className="mb-9">
                                    <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <KeyRound className="size-6" />
                                    </div>
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-primary">Admin access</p>
                                    <h2 className="text-3xl font-black tracking-tight text-text-main">Welcome back</h2>
                                    <p className="mt-3 text-sm font-medium leading-6 text-text-sub">
                                        Sign in with your operations account to continue.
                                    </p>
                                </div>

                                <form
                                    className="space-y-5"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        handleLogin();
                                    }}
                                >
                                    <label className="block space-y-2">
                                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-sub/60">Username</span>
                                        <Input
                                            autoComplete="username"
                                            type="text"
                                            value={username}
                                            onChange={(event) => setUsername(event.target.value)}
                                            placeholder="admin"
                                            className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-5 font-bold text-text-main placeholder:text-text-sub/30 focus:bg-white"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-sub/60">Password</span>
                                        <div className="relative">
                                            <Input
                                                autoComplete="current-password"
                                                autoFocus
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                placeholder="Enter your admin password"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50 px-5 pr-14 font-bold text-text-main placeholder:text-text-sub/30 focus:bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((visible) => !visible)}
                                                className="absolute inset-y-0 right-4 flex items-center text-text-sub/35 transition-colors hover:text-primary"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                            </button>
                                        </div>
                                    </label>

                                    {error && (
                                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading || !username || !password}
                                        className="h-14 w-full rounded-2xl bg-primary text-base font-black text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.99]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="size-5 animate-spin" />
                                                Verifying access
                                            </>
                                        ) : (
                                            <>
                                                Enter operations
                                                <ArrowRight className="size-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-text-sub/35">
                                    <ShieldCheck className="size-4" />
                                    Protected admin session
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
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

                <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white">Monnify Payment Settings</h2>
                            <p className="text-sm text-gray-300 max-w-xl">
                                Control the Nigeria verification fee and the USD to NGN conversion rate used for Monnify .cid checkout.
                            </p>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300">
                                Source: {paymentSettings.source === 'admin' ? 'Admin override' : 'Environment fallback'}
                            </div>
                        </div>
                        <Button
                            onClick={() => fetchPaymentSettings(token)}
                            variant="outline"
                            className="bg-transparent border-white/20 text-white hover:bg-white/10"
                            disabled={paymentSettingsLoading}
                        >
                            {paymentSettingsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reload settings'}
                        </Button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-300">Verification Fee (NGN)</span>
                            <Input
                                type="number"
                                min="1"
                                value={paymentSettingsDraft.verification_fee_ngn}
                                onChange={(event) => setPaymentSettingsDraft((current) => ({
                                    ...current,
                                    verification_fee_ngn: event.target.value
                                }))}
                                className="h-12 rounded-2xl border-white/10 bg-slate-900/70 text-white"
                            />
                            <p className="text-xs text-gray-400">
                                Applied to both NIN and BVN verification checkout.
                            </p>
                        </label>

                        <label className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-300">USD to NGN Rate</span>
                            <Input
                                type="number"
                                min="1"
                                value={paymentSettingsDraft.usd_to_ngn_rate}
                                onChange={(event) => setPaymentSettingsDraft((current) => ({
                                    ...current,
                                    usd_to_ngn_rate: event.target.value
                                }))}
                                className="h-12 rounded-2xl border-white/10 bg-slate-900/70 text-white"
                            />
                            <p className="text-xs text-gray-400">
                                Used when converting USD .cid pricing into Monnify NGN checkout.
                            </p>
                        </label>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className={`text-sm font-medium ${paymentSettingsMessage.includes('updated') ? 'text-emerald-300' : 'text-gray-300'}`}>
                            {paymentSettingsMessage || 'Save only when you want to override environment defaults.'}
                        </div>
                        <Button
                            onClick={handleSavePaymentSettings}
                            disabled={paymentSettingsSaving}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {paymentSettingsSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving
                                </>
                            ) : (
                                'Save payment settings'
                            )}
                        </Button>
                    </div>
                </Card>

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
