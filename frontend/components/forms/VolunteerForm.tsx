import React, { useState } from 'react';
import { Volunteer } from '../../types';

interface VolunteerFormProps {
    initialData?: Volunteer;
    onSave: (data: Volunteer) => void;
    onCancel: () => void;
}

export const VolunteerForm: React.FC<VolunteerFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Volunteer>>({
        _id: initialData?._id,
        organization: initialData?.organization || '',
        role: initialData?.role || '',
        start_date: initialData?.start_date || { month: '', year: '' },
        end_date: initialData?.end_date || { month: '', year: '', is_current: false },
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

    const updateEndDate = (field: 'month' | 'year' | 'is_current', value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            end_date: { ...prev.end_date!, [field]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Volunteer);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Role *</label>
                        <input
                            required
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            placeholder="e.g. Volunteer"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Organization *</label>
                        <input
                            required
                            type="text"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            placeholder="e.g. Red Cross"
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
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-text-main">End Date</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.end_date?.is_current || false}
                                    onChange={(e) => updateEndDate('is_current', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-xs text-text-sub font-semibold">I currently volunteer here</span>
                            </label>
                        </div>
                        {!formData.end_date?.is_current && (
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
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 1000) })}
                        placeholder="Describe your volunteer work..."
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
                        Save Volunteer Work
                    </button>
                </div>
            </div>
        </form>
    );
};
