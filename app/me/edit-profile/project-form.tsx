'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Trophy } from 'lucide-react';
import { Project } from '@/lib/api-client';

interface ProjectFormProps {
    project?: Project;
    onSave: (data: Partial<Project>) => void;
    onClose: () => void;
}

export default function ProjectForm({ project, onSave, onClose }: ProjectFormProps) {
    const [formData, setFormData] = useState<Partial<Project>>({
        project_name: project?.project_name || '',
        description: project?.description || '',
        project_url: project?.project_url || '',
        start_date: project?.start_date || { month: undefined, year: undefined },
        end_date: project?.end_date || { month: undefined, year: undefined },
    });

    const updateField = (field: keyof Project, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateDate = (type: 'start_date' | 'end_date', field: 'month' | 'year', value: number | undefined) => {
        setFormData({
            ...formData,
            [type]: { ...formData[type], [field]: value }
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
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {project ? 'Edit Project' : 'Add Project'}
                            </h2>
                            <p className="text-sm text-gray-400">Showcase your work</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white">Project Name *</Label>
                            <Input
                                required
                                value={formData.project_name}
                                onChange={(e) => updateField('project_name', e.target.value)}
                                placeholder="e.g. My Awesome App"
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-white">Start Date</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select
                                        value={formData.start_date?.month || ''}
                                        onChange={(e) => updateDate('start_date', 'month', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Month</option>
                                        {months.map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.start_date?.year || ''}
                                        onChange={(e) => updateDate('start_date', 'year', e.target.value ? parseInt(e.target.value) : undefined)}
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
                                <Label className="text-white">End Date</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <select
                                        value={formData.end_date?.month || ''}
                                        onChange={(e) => updateDate('end_date', 'month', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="px-2 py-2 bg-slate-800 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Month</option>
                                        {months.map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={formData.end_date?.year || ''}
                                        onChange={(e) => updateDate('end_date', 'year', e.target.value ? parseInt(e.target.value) : undefined)}
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

                        <div>
                            <Label className="text-white">Project URL</Label>
                            <Input
                                value={formData.project_url}
                                onChange={(e) => updateField('project_url', e.target.value)}
                                placeholder="https://..."
                                className="bg-slate-800 border-slate-600 text-white mt-2"
                            />
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
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                        {project ? 'Save Changes' : 'Add Project'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
