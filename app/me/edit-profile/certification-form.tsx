'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Award } from 'lucide-react';
import { Certification } from '@/lib/api-client';

interface CertificationFormProps {
    certification?: Certification;
    onSave: (data: Partial<Certification>) => void;
    onClose: () => void;
}

export default function CertificationForm({ certification, onSave, onClose }: CertificationFormProps) {
    const [formData, setFormData] = useState<Partial<Certification>>({
        name: certification?.name || '',
        issuing_organization: certification?.issuing_organization || '',
        issue_date: certification?.issue_date || { month: undefined, year: undefined },
        expiration_date: certification?.expiration_date || { month: undefined, year: undefined },
        credential_id: certification?.credential_id || '',
        credential_url: certification?.credential_url || '',
    });

    const updateField = (field: keyof Certification, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateDate = (type: 'issue_date' | 'expiration_date', field: 'month' | 'year', value: number | undefined) => {
        setFormData({
            ...formData,
            [type]: { ...formData[type], [field]: value }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 5);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {certification ? 'Edit Certification' : 'Add Certification'}
                            </h2>
                            <p className="text-sm text-gray-400">Add your licenses and certifications</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white">Name *</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="e.g. AWS Certified Solutions Architect"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Issuing Organization *</Label>
                            <Input
                                required
                                value={formData.issuing_organization}
                                onChange={(e) => updateField('issuing_organization', e.target.value)}
                                placeholder="e.g. Amazon Web Services"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-white">Issue Date</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select
                                        value={formData.issue_date?.month || ''}
                                        onChange={(e) => updateDate('issue_date', 'month', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Month</option>
                                        {months.map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.issue_date?.year || ''}
                                        onChange={(e) => updateDate('issue_date', 'year', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Year</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <Label className="text-white">Expiration Date</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select
                                        value={formData.expiration_date?.month || ''}
                                        onChange={(e) => updateDate('expiration_date', 'month', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Month</option>
                                        {months.map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.expiration_date?.year || ''}
                                        onChange={(e) => updateDate('expiration_date', 'year', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Year</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white">Credential ID</Label>
                            <Input
                                value={formData.credential_id}
                                onChange={(e) => updateField('credential_id', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Credential URL</Label>
                            <Input
                                value={formData.credential_url}
                                onChange={(e) => updateField('credential_url', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                    <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        {certification ? 'Save Changes' : 'Add Certification'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
