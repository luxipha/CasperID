import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Check } from 'lucide-react';
import { VerificationRequest, apiClient } from '@/lib/api-client';

import StepPersonalInfo from './step-personal-info';
import StepIdUpload from './step-id-upload';
import StepLiveness from './step-liveness';
import StepCns from './step-cns';

interface WizardModalProps {
    wallet: string;
    existingData?: Partial<VerificationRequest>;
    initialStep?: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function WizardModal({ wallet, existingData, initialStep = 1, onClose, onSuccess }: WizardModalProps) {
    const [step, setStep] = useState(initialStep);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<VerificationRequest>>({
        wallet,
        tier: 'full_kyc',
        ...existingData, // Pre-fill with existing data
        socials: existingData?.socials || {}
    });

    const updateData = (newData: Partial<VerificationRequest>) => {
        setData(prev => ({ ...prev, ...newData }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await apiClient.requestVerification(data as VerificationRequest);
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepPersonalInfo data={data} onUpdate={updateData} onNext={() => setStep(2)} onBack={onClose} />;
            case 2:
                return <StepIdUpload data={data} onUpdate={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />;
            case 3:
                return <StepLiveness data={data} onUpdate={updateData} onNext={() => setStep(4)} onBack={() => setStep(2)} />;
            case 4:
                return <StepCns data={data} onUpdate={updateData} onSubmit={handleSubmit} onBack={() => setStep(3)} loading={loading} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <Card className="max-w-2xl w-full bg-slate-800 border-slate-700 p-0 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">Full KYC Verification</h2>
                        <p className="text-sm text-gray-400">Step {step} of 4</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-slate-700">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {renderStep()}
                </div>
            </Card>
        </div>
    );
}
