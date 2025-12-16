'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Heart } from 'lucide-react';
import { Volunteer } from '@/lib/api-client';

interface VolunteerFormProps {
    volunteer?: Volunteer;
    onSave: (data: Partial<Volunteer>) => void;
    onClose: () => void;
}

export default function VolunteerForm({ volunteer, onSave, onClose }: VolunteerFormProps) {
    const [formData, setFormData] = useState<Partial<Volunteer>>({
        organization: volunteer?.organization || '',
        role: volunteer?.role || '',
        cause: volunteer?.cause || '',
        start_date: volunteer?.start_date || { month: undefined, year: undefined },
        end_date: volunteer?.end_date || { month: undefined, year: undefined, is_current: false },
        description: volunteer?.description || '',
    });

    const updateField = (field: keyof Volunteer, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateStartDate = (field: 'month' | 'year', value: number | undefined) => {
        setFormData({
            ...formData,
            start_date: { ...formData.start_date, [field]: value }
        });
    };

    const updateEndDate = (field: 'month' | 'year' | 'is_current', value: number | boolean | undefined) => {
        setFormData({
            ...formData,
            end_date: { ...formData.end_date, [field]: value }
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
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {volunteer ? 'Edit Volunteer Work' : 'Add Volunteer Work'}
                            </h2>
                            <p className="text-sm text-gray-400">Causes you care about</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white">Organization *</Label>
                            <Input
                                required
                                value={formData.organization}
                                onChange={(e) => updateField('organization', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Role *</Label>
                            <Input
                                required
                                value={formData.role}
                                onChange={(e) => updateField('role', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Cause</Label>
                            <Input
                                value={formData.cause}
                                onChange={(e) => updateField('cause', e.target.value)}
                                placeholder="e.g. Education, Environment"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-white">Start Date</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select
                                        value={formData.start_date?.month || ''}
                                        onChange={(e) => updateStartDate('month', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Month</option>
                                        {months.map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.start_date?.year || ''}
                                        onChange={(e) => updateStartDate('year', e.target.value ? parseInt(e.target.value) : undefined)}
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
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-white">End Date</Label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.end_date?.is_current || false}
                                            onChange={(e) => updateEndDate('is_current', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-300">I currently volunteer here</span>
                                    </label>
                                </div>
                                {!formData.end_date?.is_current && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={formData.end_date?.month || ''}
                                            onChange={(e) => updateEndDate('month', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Month</option>
                                            {months.map((month, idx) => (
                                                <option key={idx} value={idx + 1}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={formData.end_date?.year || ''}
                                            onChange={(e) => updateEndDate('year', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Year</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="bg-slate-800 border-slate-600 text-white mt-2 min-h-[100px]"
                            />
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                    <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700">
                        {volunteer ? 'Save Changes' : 'Add Volunteer'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
