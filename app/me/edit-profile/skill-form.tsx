'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Code, Star } from 'lucide-react';
import { Skill } from '@/lib/api-client';

interface SkillFormProps {
    skill?: Skill;
    onSave: (data: Partial<Skill>) => void;
    onClose: () => void;
}

export default function SkillForm({ skill, onSave, onClose }: SkillFormProps) {
    const [formData, setFormData] = useState<Partial<Skill>>({
        skill_name: skill?.skill_name || '',
        is_top_skill: skill?.is_top_skill || false,
    });

    const updateField = (field: keyof Skill, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {skill ? 'Edit Skill' : 'Add Skill'}
                            </h2>
                            <p className="text-sm text-gray-400">Showcase your expertise</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white">Skill Name *</Label>
                            <Input
                                required
                                value={formData.skill_name}
                                onChange={(e) => updateField('skill_name', e.target.value)}
                                placeholder="e.g. React, Python, Project Management"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.is_top_skill ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-700 text-gray-400'}`}>
                                    <Star className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-white">Top Skill</div>
                                    <div className="text-xs text-gray-400">Feature this skill at the top of your profile</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.is_top_skill || false}
                                    onChange={(e) => updateField('is_top_skill', e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                            </label>
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                    <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                        {skill ? 'Save Changes' : 'Add Skill'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
