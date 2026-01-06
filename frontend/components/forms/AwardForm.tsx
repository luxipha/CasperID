import React, { useState } from 'react';
import { Award } from '../../types';

interface AwardFormProps {
    initialData?: Award;
    onSave: (data: Award) => void;
    onCancel: () => void;
}

export const AwardForm: React.FC<AwardFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Award>>({
        _id: initialData?._id,
        title: initialData?.title || '',
        issuing_organization: initialData?.issuing_organization || '',
        issue_date: initialData?.issue_date || { month: '', year: '' },
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
            issue_date: { ...prev.issue_date!, [field]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Award);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Title *</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Employee of the Month"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Issuing Organization</label>
                        <input
                            type="text"
                            value={formData.issuing_organization}
                            onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                            placeholder="e.g. Casper Network"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Date</label>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                        <select
                            value={formData.issue_date?.month}
                            onChange={(e) => updateStartDate('month', e.target.value)}
                            className="h-12 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Month</option>
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select
                            value={formData.issue_date?.year}
                            onChange={(e) => updateStartDate('year', e.target.value)}
                            className="h-12 px-3 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Year</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 1000) })}
                        placeholder="Describe the award..."
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
                        Save Award
                    </button>
                </div>
            </div>
        </form>
    );
};
