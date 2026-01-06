import React, { useState } from 'react';
import { Language } from '../../types';

interface LanguageFormProps {
    initialData?: Language;
    onSave: (data: Language) => void;
    onCancel: () => void;
}

export const LanguageForm: React.FC<LanguageFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Language>>({
        language_name: initialData?.language_name || '',
        proficiency: initialData?.proficiency || 'elementary',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Language);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Language *</label>
                        <input
                            required
                            type="text"
                            value={formData.language_name}
                            onChange={(e) => setFormData({ ...formData, language_name: e.target.value })}
                            placeholder="e.g. French"
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
                            <option value="elementary">Elementary</option>
                            <option value="limited-working">Limited Working</option>
                            <option value="professional-working">Professional Working</option>
                            <option value="full-professional">Full Professional</option>
                            <option value="native">Native or Bilingual</option>
                        </select>
                    </div>
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
                        Save Language
                    </button>
                </div>
            </div>
        </form>
    );
};
