import React, { useState } from 'react';
import { Education } from '../../types';

interface EducationFormProps {
    initialData?: Education;
    onSave: (data: Education) => void;
    onCancel: () => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Education>>({
        school_name: initialData?.school_name || initialData?.school || '',
        degree: initialData?.degree || '',
        field_of_study: initialData?.field_of_study || '',
        start_date: initialData?.start_date || { month: '', year: '' },
        end_date: initialData?.end_date || { month: '', year: '' },
        grade: initialData?.grade || '',
        description: initialData?.description || '',
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

    const updateStartDate = (field: 'month' | 'year', value: string) => {
        setFormData(prev => ({
            ...prev,
            start_date: { ...prev.start_date!, [field]: value }
        }));
    };

    const updateEndDate = (field: 'month' | 'year', value: string) => {
        setFormData(prev => ({
            ...prev,
            end_date: { ...prev.end_date!, [field]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Education);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">School / University *</label>
                    <input
                        required
                        type="text"
                        value={formData.school_name}
                        onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                        placeholder="e.g. Stanford University"
                        className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Degree *</label>
                        <input
                            required
                            type="text"
                            value={formData.degree}
                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                            placeholder="e.g. Bachelor's"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Field of Study</label>
                        <input
                            type="text"
                            value={formData.field_of_study}
                            onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                            placeholder="e.g. Computer Science"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Start Date</label>
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={formData.start_date?.month}
                                onChange={(e) => updateStartDate('month', e.target.value)}
                                className="h-12 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Month</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <select
                                value={formData.start_date?.year}
                                onChange={(e) => updateStartDate('year', e.target.value)}
                                className="h-12 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">End Date (or Expected)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={formData.end_date?.month}
                                onChange={(e) => updateEndDate('month', e.target.value)}
                                className="h-12 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Month</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <select
                                value={formData.end_date?.year}
                                onChange={(e) => updateEndDate('year', e.target.value)}
                                className="h-12 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Year</option>
                                {Array.from({ length: 60 }, (_, i) => (currentYear + 10 - i).toString()).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Grade (Optional)</label>
                    <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="e.g. 3.8 GPA"
                        className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 1000) })}
                        placeholder="Activities, societies, and achievements..."
                        className="w-full h-32 p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium resize-none"
                    />
                    <p className="text-[10px] text-text-sub font-bold text-right">
                        {formData.description?.length || 0} / 1,000
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-text-sub hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                    >
                        Save Education
                    </button>
                </div>
            </div>
        </form>
    );
};
