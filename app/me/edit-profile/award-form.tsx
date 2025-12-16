'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Trophy } from 'lucide-react';
import { Award } from '@/lib/api-client';

interface AwardFormProps {
    award?: Award;
    onSave: (data: Partial<Award>) => void;
    onClose: () => void;
}

export default function AwardForm({ award, onSave, onClose }: AwardFormProps) {
    const [formData, setFormData] = useState<Partial<Award>>({
        title: award?.title || '',
        issuing_organization: award?.issuing_organization || '',
        issue_date: award?.issue_date || { month: undefined, year: undefined },
        description: award?.description || '',
    });

    const updateField = (field: keyof Award, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateDate = (field: 'month' | 'year', value: number | undefined) => {
        setFormData({
            ...formData,
            issue_date: { ...formData.issue_date, [field]: value }
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
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-xl shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {award ? 'Edit Award' : 'Add Award'}
                            </h2>
                            <p className="text-sm text-gray-400">Honors and recognition</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white">Title *</Label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Issuer *</Label>
                            <Input
                                required
                                value={formData.issuing_organization}
                                onChange={(e) => updateField('issuing_organization', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Date</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <select
                                    value={formData.issue_date?.month || ''}
                                    onChange={(e) => updateDate('month', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Month</option>
                                    {months.map((month, idx) => (
                                        <option key={idx} value={idx + 1}>{month}</option>
                                    ))}
                                </select>
                                <select
                                    value={formData.issue_date?.year || ''}
                                    onChange={(e) => updateDate('year', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Year</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2 min-h-[80px]"
                            />
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                    <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700">
                        {award ? 'Save Changes' : 'Add Award'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
