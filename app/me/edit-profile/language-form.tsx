'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Languages as LangIcon } from 'lucide-react';
import { Language } from '@/lib/api-client';

interface LanguageFormProps {
    language?: Language;
    onSave: (data: Partial<Language>) => void;
    onClose: () => void;
}

export default function LanguageForm({ language, onSave, onClose }: LanguageFormProps) {
    const [formData, setFormData] = useState<Partial<Language>>({
        language_name: language?.language_name || '',
        proficiency: language?.proficiency || 'elementary',
    });

    const updateField = (field: keyof Language, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const commonLanguages = [
        'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
        'Korean', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Hindi'
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                            <LangIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {language ? 'Edit Language' : 'Add Language'}
                            </h2>
                            <p className="text-sm text-gray-400">Communication skills</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white">Language *</Label>
                            <div className="mt-2">
                                <input
                                    list="languages"
                                    required
                                    value={formData.language_name}
                                    onChange={(e) => updateField('language_name', e.target.value)}
                                    placeholder="e.g. English"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <datalist id="languages">
                                    {commonLanguages.map(lang => <option key={lang} value={lang} />)}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white">Proficiency</Label>
                            <select
                                value={formData.proficiency}
                                onChange={(e) => updateField('proficiency', e.target.value)}
                                className="w-full mt-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="elementary">Elementary proficiency</option>
                                <option value="limited-working">Limited working proficiency</option>
                                <option value="professional-working">Professional working proficiency</option>
                                <option value="full-professional">Full professional proficiency</option>
                                <option value="native">Native or bilingual proficiency</option>
                            </select>
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                    <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                        {language ? 'Save Changes' : 'Add Language'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
