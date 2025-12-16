import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VerificationRequest } from '@/lib/api-client';

interface StepProfileProps {
    data: Partial<VerificationRequest>;
    onUpdate: (data: Partial<VerificationRequest>) => void;
    onNext: () => void;
}

export default function StepProfile({ data, onUpdate, onNext }: StepProfileProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!data.first_name) newErrors.first_name = 'First name is required';
        if (!data.last_name) newErrors.last_name = 'Last name is required';
        if (!data.email) newErrors.email = 'Email is required';
        if (!data.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext();
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-white">First Name *</Label>
                        <Input
                            value={data.first_name || ''}
                            onChange={e => onUpdate({ first_name: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                        {errors.first_name && <p className="text-red-400 text-xs">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Last Name *</Label>
                        <Input
                            value={data.last_name || ''}
                            onChange={e => onUpdate({ last_name: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                        {errors.last_name && <p className="text-red-400 text-xs">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-white">Date of Birth *</Label>
                        <Input
                            type="date"
                            value={data.date_of_birth || ''}
                            onChange={e => onUpdate({ date_of_birth: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                        {errors.date_of_birth && <p className="text-red-400 text-xs">{errors.date_of_birth}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Phone Number</Label>
                        <Input
                            type="tel"
                            value={data.phone_number || ''}
                            onChange={e => onUpdate({ phone_number: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Email Address *</Label>
                    <Input
                        type="email"
                        value={data.email || ''}
                        onChange={e => onUpdate({ email: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                    />
                    {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Home Address</Label>
                    <Input
                        value={data.home_address || ''}
                        onChange={e => onUpdate({ home_address: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Professional Details</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-white">Job Title</Label>
                        <Input
                            value={data.job_title || ''}
                            onChange={e => onUpdate({ job_title: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Education</Label>
                        <Input
                            placeholder="Highest Degree / University"
                            value={data.education || ''}
                            onChange={e => onUpdate({ education: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Skills (Comma separated)</Label>
                    <Input
                        placeholder="e.g. React, Rust, Design"
                        value={data.skills?.join(', ') || ''}
                        onChange={e => onUpdate({ skills: e.target.value.split(',').map(s => s.trim()) })}
                        className="bg-slate-700 border-slate-600 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Bio / About</Label>
                    <Textarea
                        value={data.info || ''}
                        onChange={e => onUpdate({ info: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white h-24"
                    />
                </div>
            </div>

            <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
                Next Step: Identity Verification
            </Button>
        </div>
    );
}
