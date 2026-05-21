import React, { useState } from 'react';
import { Skill } from '../../types';

interface SkillFormProps {
    initialData?: Skill;
    onSave: (data: Skill) => void;
    onCancel: () => void;
}

export const SkillForm: React.FC<SkillFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Skill>>({
        _id: initialData?._id,
        skill_name: initialData?.skill_name || initialData?.name || '',
        proficiency: initialData?.proficiency || 'Intermediate',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            console.log('🎯 SkillForm handleSubmit called with formData:', formData);
            console.log('🎯 Calling onSave with data:', formData as Skill);
            onSave(formData as Skill);
            console.log('🎯 onSave called successfully');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Skill Name *</label>
                        <input
                            required
                            type="text"
                            value={formData.skill_name}
                            onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                            placeholder="e.g. React"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Proficiency</label>
                        <select
                            value={formData.proficiency}
                            onChange={(e) => setFormData({ ...formData, proficiency: e.target.value as any })}
                            className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold max-w-full"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-text-sub hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Skill'}
                    </button>
                </div>
            </div>
        </form>
    );
};
