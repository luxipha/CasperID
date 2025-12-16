'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, GraduationCap } from 'lucide-react';
import { Education } from '@/lib/api-client';

interface EducationFormProps {
    education?: Education;
    onSave: (data: Partial<Education>) => void;
    onClose: () => void;
}

export default function EducationForm({ education, onSave, onClose }: EducationFormProps) {
    const [formData, setFormData] = useState<Partial<Education>>({
        school_name: education?.school_name || '',
        degree: education?.degree || '',
        field_of_study: education?.field_of_study || '',
        start_date: education?.start_date || { month: undefined, year: undefined },
        end_date: education?.end_date || { month: undefined, year: undefined },
        grade: education?.grade || '',
        activities: education?.activities || '',
        description: education?.description || '',
    });

    const updateField = (field: keyof Education, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateStartDate = (field: 'month' | 'year', value: number | undefined) => {
        setFormData({
            ...formData,
            start_date: { ...formData.start_date, [field]: value }
        });
    };

    const updateEndDate = (field: 'month' | 'year', value: number | undefined) => {
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
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 5); // Allow some future years for expected graduation

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {education ? 'Edit Education' : 'Add Education'}
                            </h2>
                            <p className="text-sm text-gray-400">Add your educational background</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        {/* School Name */}
                        <div>
                            <Label className="text-white">School / University *</Label>
                            <Input
                                required
                                value={formData.school_name}
                                onChange={(e) => updateField('school_name', e.target.value)}
                                placeholder="e.g. Stanford University"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        {/* Degree */}
                        <div>
                            <Label className="text-white">Degree</Label>
                            <Input
                                value={formData.degree}
                                onChange={(e) => updateField('degree', e.target.value)}
                                placeholder="e.g. Bachelor of Science"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        {/* Field of Study */}
                        <div>
                            <Label className="text-white">Field of Study</Label>
                            <Input
                                value={formData.field_of_study}
                                onChange={(e) => updateField('field_of_study', e.target.value)}
                                placeholder="e.g. Computer Science"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
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

                            {/* End Date */}
                            <div>
                                <Label className="text-white">End Date (or expected)</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
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
                            </div>
                        </div>

                        {/* Grade */}
                        <div>
                            <Label className="text-white">Grade</Label>
                            <Input
                                value={formData.grade}
                                onChange={(e) => updateField('grade', e.target.value)}
                                placeholder="e.g. 3.8 GPA"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        {/* Activities */}
                        <div>
                            <Label className="text-white">Activities and Societies</Label>
                            <Textarea
                                value={formData.activities}
                                onChange={(e) => updateField('activities', e.target.value)}
                                placeholder="e.g. Computer Science Club, Debate Team, etc."
                                className="bg-slate-800 border-slate-600 text-white mt-2 min-h-[80px]"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value.slice(0, 1000))}
                                placeholder="Additional details about your education..."
                                className="bg-slate-800 border-slate-600 text-white mt-2 min-h-[100px]"
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {formData.description?.length || 0} / 1,000
                            </p>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-600 text-white hover:bg-slate-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                        {education ? 'Save Changes' : 'Add Education'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
