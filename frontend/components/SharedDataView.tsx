import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Loader2, ShieldCheck, ShieldAlert, User, MapPin, Mail, Phone, Calendar, Globe, Share2 } from 'lucide-react';

interface SharedDataViewProps {
    shareId?: string; // Can be passed from router
}

export const SharedDataView: React.FC<SharedDataViewProps> = ({ shareId: propShareId }) => {
    const [loading, setLoading] = useState(true);
    const [shareData, setShareData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSharedData = async () => {
            try {
                const isLocalhost = typeof window !== 'undefined' &&
                    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001' : '');

                // Check for share ID in URL path (e.g., /share-view/abc-123) or from props
                const pathMatch = window.location.pathname.match(/\/share-view\/([^/?]+)/);
                const shareId = propShareId || (pathMatch ? pathMatch[1] : null);

                if (shareId) {
                    // New flow: fetch stored share package by ID
                    const response = await fetch(`${apiUrl}/api/v2/verification/share/${shareId}`);
                    const data = await response.json();

                    if (data.success) {
                        // The package_data contains the actual shared data
                        setShareData(data.package_data?.data || data.verification?.data);
                    } else {
                        setError(data.error || 'This shared link has expired or is no longer available');
                    }
                    setLoading(false);
                    return;
                }

                // Legacy flow: get data from URL query parameter
                const params = new URLSearchParams(window.location.search);
                const rawData = params.get('data');

                if (!rawData) {
                    setError('No shared information found in this link');
                    setLoading(false);
                    return;
                }

                let sharePackage;
                try {
                    sharePackage = JSON.parse(decodeURIComponent(rawData));
                } catch (e) {
                    setError('The link contains malformed data');
                    setLoading(false);
                    return;
                }

                // We still verify the signature behind the scenes to ensure the data is authentic
                const response = await apiService.verifyShareData(sharePackage);

                if (response.success && response.valid) {
                    setShareData(response.data);
                } else {
                    setError(response.error || 'This shared data could not be validated');
                }
            } catch (err: any) {
                console.error('Error loading shared data:', err);
                setError(err.message || 'Failed to load shared information');
            } finally {
                setLoading(false);
            }
        };

        loadSharedData();
    }, [propShareId]);

    const getFieldIcon = (field: string) => {
        switch (field) {
            case 'name':
            case 'first_name':
            case 'last_name': return <User className="w-5 h-5" />;
            case 'email': return <Mail className="w-5 h-5" />;
            case 'phone_number': return <Phone className="w-5 h-5" />;
            case 'city':
            case 'country':
            case 'nationality':
            case 'address': return <MapPin className="w-5 h-5" />;
            case 'date_of_birth':
            case 'age': return <Calendar className="w-5 h-5" />;
            default: return <Globe className="w-5 h-5" />;
        }
    };

    const getFieldLabel = (field: string) => {
        return field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading shared information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl border border-red-100 p-10 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Unavailable Content</h1>
                    <p className="text-gray-500 mb-8">{error}</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                        Back to CasperID
                    </button>
                </div>
            </div>
        );
    }

    const fieldMetadata = shareData?.field_metadata || {};

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Header Badge */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 border border-blue-100 rounded-full text-primary shadow-sm">
                        <Share2 className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6D36D6]">Shared via CasperID</span>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-primary to-[#6D36D6] p-10 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Shared Information</h1>
                        <p className="text-white/80 font-medium uppercase tracking-widest text-[10px]">Authentic identity details from {shareData?.verification?.human_id || 'CasperID User'}</p>
                    </div>

                    {/* Data Fields */}
                    <div className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(shareData || {})
                                .filter(([key]) => key !== 'verification' && key !== 'field_metadata')
                                .map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 rounded-2xl p-5 border border-gray-100/50">
                                        <div className="flex items-center gap-3 mb-2 text-primary/60">
                                            {getFieldIcon(key)}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{getFieldLabel(key)}</span>
                                        </div>
                                        <div className="text-lg font-bold text-gray-900 truncate">
                                            {typeof value === 'string' || typeof value === 'number'
                                                ? value
                                                : typeof value === 'boolean'
                                                    ? (value ? 'Yes' : 'No')
                                                    : value?.overall_match === true
                                                        ? 'Matched'
                                                        : JSON.stringify(value)}
                                        </div>
                                        {fieldMetadata[key] && (
                                            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
                                                <span className={`rounded-full px-2.5 py-1 ${fieldMetadata[key].verified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                                    {fieldMetadata[key].verified ? 'Verified' : 'Declared'}
                                                </span>
                                                {fieldMetadata[key].source && (
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
                                                        {fieldMetadata[key].source}
                                                    </span>
                                                )}
                                                {fieldMetadata[key].sensitive && (
                                                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">
                                                        Sensitive
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            }
                        </div>

                        {/* User Identity Context */}
                        <div className="pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shared By</p>
                                        <p className="font-bold text-gray-900">
                                            @{shareData?.verification?.human_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Verified Status</p>
                                    <div className="flex items-center gap-1 justify-end text-green-600 font-bold text-sm">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 font-medium">
                            Digitally signed on {new Date(shareData?.verification?.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Secure Footer */}
                <div className="mt-10 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-50 anonymous-footer transition-all hover:shadow-md">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Powered by CasperID Identity Privacy</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
