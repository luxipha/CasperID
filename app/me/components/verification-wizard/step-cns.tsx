import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { VerificationRequest } from '@/lib/api-client';

interface StepCnsProps {
    data: Partial<VerificationRequest>;
    onUpdate: (data: Partial<VerificationRequest>) => void;
    onSubmit: () => void;
    onBack: () => void;
    loading: boolean;
}

export default function StepCns({ data, onUpdate, onSubmit, onBack, loading }: StepCnsProps) {
    const [query, setQuery] = useState(data.cns_name || '');
    const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    const checkAvailability = async () => {
        if (!query) return;
        setAvailability('checking');

        // Simulate API call
        setTimeout(() => {
            if (['admin', 'casper', 'test'].includes(query.toLowerCase())) {
                setAvailability('taken');
            } else {
                setAvailability('available');
                onUpdate({ cns_name: query });
            }
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">Claim Your Web3 Identity</h3>
                <p className="text-sm text-gray-400">
                    Get a unique .casper username linked to your verified identity.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                <div className="space-y-2">
                    <Label className="text-white">Choose Username</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setAvailability('idle');
                                }}
                                placeholder="username"
                                className="bg-slate-700 border-slate-600 text-white pr-20"
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400 text-sm font-mono">.cspr</span>
                        </div>
                        <Button
                            onClick={checkAvailability}
                            disabled={!query || availability === 'checking' || availability === 'available'}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {availability === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {availability === 'available' && (
                    <div className="flex items-center text-green-400 bg-green-900/20 p-3 rounded border border-green-900/50">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <div>
                            <p className="font-semibold">{query}.cspr is available!</p>
                            <p className="text-xs opacity-80">It will be assigned to you upon verification approval.</p>
                        </div>
                    </div>
                )}

                {availability === 'taken' && (
                    <div className="flex items-center text-red-400 bg-red-900/20 p-3 rounded border border-red-900/50">
                        <XCircle className="w-5 h-5 mr-2" />
                        <p className="font-semibold">Sorry, {query}.casper is already taken.</p>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onBack} disabled={loading} className="w-1/3 border-slate-600 text-white hover:bg-slate-700">
                    Back
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={availability !== 'available' || loading}
                    className="w-2/3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Full Application'
                    )}
                </Button>
            </div>
        </div>
    );
}
