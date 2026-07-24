
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, Edit2, Trash2, Check, X, Bolt } from 'lucide-react';
import { notifyError, notifySuccess } from '../../utils/notify';

interface Quest {
    _id: string;
    quest_id: string;
    title: string;
    description: string;
    points: number;
    icon: string;
    active: boolean;
}

export const QuestManager: React.FC = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        quest_id: '',
        title: '',
        description: '',
        points: 100,
        icon: 'bolt',
        active: true
    });

    const fetchQuests = async () => {
        setLoading(true);
        try {
            const res = await apiService.getAdminQuests();
            if (res.success) {
                setQuests(res.quests);
            }
        } catch (err) {
            console.error('Failed to fetch quests', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuests();
    }, []);

    const handleSave = async () => {
        try {
            if (editingId) {
                await apiService.updateQuest(editingId, formData);
            } else {
                await apiService.addQuest(formData);
            }
            setIsAdding(false);
            setEditingId(null);
            setFormData({ quest_id: '', title: '', description: '', points: 100, icon: 'bolt', active: true });
            fetchQuests();
        } catch (err) {
            console.error('Failed to save quest', err);
            notifyError('Error saving quest. Ensure Quest ID is unique.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quest?')) return;
        try {
            await apiService.deleteQuest(id);
            fetchQuests();
            notifySuccess('Quest deleted successfully.');
        } catch (err) {
            console.error('Failed to delete quest', err);
            notifyError('Failed to delete quest.');
        }
    };

    const startEdit = (quest: Quest) => {
        setEditingId(quest._id);
        setFormData({
            quest_id: quest.quest_id,
            title: quest.title,
            description: quest.description || '',
            points: quest.points,
            icon: quest.icon,
            active: quest.active
        });
        setIsAdding(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Identity Quests</h2>
                {!isAdding && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Quest
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="p-6 bg-slate-800/80 border-slate-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">
                        {editingId ? 'Edit Quest' : 'Create New Quest'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-black">Quest ID (Internal Handle)</label>
                            <Input
                                value={formData.quest_id}
                                onChange={e => setFormData({ ...formData, quest_id: e.target.value })}
                                placeholder="e.g. discord_verify"
                                disabled={!!editingId}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-black">Points (XP)</label>
                            <Input
                                type="number"
                                value={formData.points}
                                onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs text-gray-400 uppercase font-black">Display Title</label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Connect your Discord Account"
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-black">Icon Name (Material Symbols)</label>
                            <Input
                                value={formData.icon}
                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="e.g. mail, link, person"
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-8">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                id="active_toggle"
                                className="size-4 rounded accent-emerald-500"
                            />
                            <label htmlFor="active_toggle" className="text-sm text-white">Active (Visible to users)</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsAdding(false);
                                setEditingId(null);
                                setFormData({ quest_id: '', title: '', description: '', points: 100, icon: 'bolt', active: true });
                            }}
                            className="text-gray-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            {editingId ? 'Update Quest' : 'Save Quest'}
                        </Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                ) : quests.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">No quests found. Start by adding one!</p>
                ) : (
                    quests.map(quest => (
                        <Card key={quest._id} className="p-4 bg-slate-800/40 border-slate-700 hover:border-slate-600 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-amber-400">
                                        <Bolt className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-white font-bold">{quest.title}</h4>
                                            {!quest.active && (
                                                <Badge className="bg-slate-700 text-gray-400 border-slate-600">Inactive</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 font-mono">{quest.quest_id} • +{quest.points} XP</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEdit(quest)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(quest._id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
