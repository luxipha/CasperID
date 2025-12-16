'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Briefcase } from 'lucide-react';
import { Experience } from '@/lib/api-client';

interface ExperienceFormProps {
    experience?: Experience;
    onSave: (data: Partial<Experience>) => void;
    onClose: () => void;
}

export default function ExperienceForm({ experience, onSave, onClose }: ExperienceFormProps) {
    const [formData, setFormData] = useState<Partial<Experience>>({
        company_name: experience?.company_name || '',
        job_title: experience?.job_title || '',
        employment_type: experience?.employment_type || 'full-time',
        location: experience?.location || '',
        location_type: experience?.location_type || 'on-site',
        start_date: experience?.start_date || { month: undefined, year: undefined },
        end_date: experience?.end_date || { month: undefined, year: undefined, is_current: false },
        description: experience?.description || '',
    });

    const updateField = (field: keyof Experience, value: any) => {
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
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {experience ? 'Edit Experience' : 'Add Experience'}
                            </h2>
                            <p className="text-sm text-gray-400">Share your professional journey</p>
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
                        {/* Job Title */}
                        <div>
                            <Label className="text-white">Job Title *</Label>
                            <Input
                                required
                                value={formData.job_title}
                                onChange={(e) => updateField('job_title', e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <Label className="text-white">Company Name *</Label>
                            <Input
                                required
                                value={formData.company_name}
                                onChange={(e) => updateField('company_name', e.target.value)}
                                placeholder="e.g. Google"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        {/* Employment Type */}
                        <div>
                            <Label className="text-white">Employment Type *</Label>
                            <select
                                required
                                value={formData.employment_type}
                                onChange={(e) => updateField('employment_type', e.target.value)}
                                className="w-full mt-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="self-employed">Self-employed</option>
                                <option value="freelance">Freelance</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="seasonal">Seasonal</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-white">Location</Label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => updateField('location', e.target.value)}
                                    placeholder="e.g. San Francisco, CA"
                                    className="bg-slate-800 border-slate-600 text-white mt-2"
                                />
                            </div>
                            <div>
                                <Label className="text-white">Location Type</Label>
                                <select
                                    value={formData.location_type}
                                    onChange={(e) => updateField('location_type', e.target.value)}
                                    className="w-full mt-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="on-site">On-site</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <Label className="text-white">Start Date</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <select
                                    value={formData.start_date?.month || ''}
                                    onChange={(e) => updateStartDate('month', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Month</option>
                                    {months.map((month, idx) => (
                                        <option key={idx} value={idx + 1}>{month}</option>
                                    ))}
                                </select>
                                <select
                                    value={formData.start_date?.year || ''}
                                    onChange={(e) => updateStartDate('year', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-white">End Date</Label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.end_date?.is_current || false}
                                        onChange={(e) => updateEndDate('is_current', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-300">I currently work here</span>
                                </label>
                            </div>
                            {!formData.end_date?.is_current && (
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={formData.end_date?.month || ''}
                                        onChange={(e) => updateEndDate('month', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Month</option>
                                        {months.map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.end_date?.year || ''}
                                        onChange={(e) => updateEndDate('year', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Year</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <Label className="text-white">Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value.slice(0, 2000))}
                                placeholder="Describe your responsibilities, achievements, and impact..."
                                className="bg-slate-800 border-slate-600 text-white mt-2 min-h-[120px]"
                                maxLength={2000}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {formData.description?.length || 0} / 2,000
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
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {experience ? 'Save Changes' : 'Add Experience'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
