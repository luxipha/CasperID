import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Quest {
    id: string;
    title: string;
    xp: number;
    icon: string;
    completed: boolean;
}

export const QuestCard: React.FC<{ onStartTour: () => void }> = ({ onStartTour }) => {
    const { user } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([
        { id: 'tour_complete', title: 'Complete Onboarding Tour', xp: 100, icon: 'map', completed: false },
        { id: 'layer_2_verify', title: 'Complete Liveness Check', xp: 500, icon: 'face', completed: false },
        { id: 'cid_register', title: 'Register .cid Name', xp: 300, icon: 'badge', completed: false },
        { id: 'persona_create', title: 'Create your first Persona', xp: 200, icon: 'person_add', completed: false }
    ]);
    const [totalXP, setTotalXP] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (user) {
            fetchQuestStatus();
        }
    }, [user]);

    const fetchQuestStatus = async () => {
        try {
            const res = await apiService.get(`/api/quest/status?userId=${user?.user_id}`);
            if (res.success) {
                setTotalXP(res.points);
                setQuests(prev => prev.map(q => ({
                    ...q,
                    completed: res.completedQuests.includes(q.id)
                })));
            }
        } catch (err) {
            console.error('QuestCard: Failed to fetch status', err);
        }
    };

    const handleClaim = async (questId: string) => {
        // This would typically be triggered by some event, but for the tour it's manual for now
        // or triggered by the Tour finish event in the parent
        try {
            const res = await apiService.post('/api/quest/claim', { questId, userId: user?.user_id });
            if (res.success) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#8652E2', '#6D36D6', '#CCE2A3'],
                });
                fetchQuestStatus();
            }
        } catch (err) {
            console.error('QuestCard: Failed to claim', err);
        }
    };

    const completedCount = quests.filter(q => q.completed).length;
    const progress = (completedCount / quests.length) * 100;

    if (!isVisible || completedCount === quests.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden mb-8"
        >
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Left: Progress Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 text-primary p-2 rounded-xl">
                            <span className="material-symbols-outlined icon-filled">workspace_premium</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-main">Starter Quest</h3>
                            <p className="text-sm text-text-sub font-medium">Complete these goals to master your identity.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {quests.map((quest) => (
                            <div key={quest.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${quest.completed ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                        <span className={`material-symbols-outlined text-[20px] ${quest.completed ? 'icon-filled' : ''}`}>
                                            {quest.completed ? 'check_circle' : quest.icon}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-bold ${quest.completed ? 'text-gray-400 line-through' : 'text-text-main'}`}>
                                        {quest.title}
                                    </span>
                                </div>
                                <span className="text-[11px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                    +{quest.xp} XP
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Action Area */}
                <div className="w-full md:w-[280px] bg-gray-50 rounded-2xl p-6 flex flex-col justify-between border border-gray-100/50">
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-sm font-bold text-text-sub">YOUR PROGRESS</span>
                            <span className="text-xl font-black text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <p className="mt-4 text-[13px] text-text-sub font-semibold leading-relaxed">
                            Complete the tour to get your first <span className="text-primary font-black">100 XP</span>!
                        </p>
                    </div>

                    <div className="space-y-3 mt-6">
                        <button
                            onClick={onStartTour}
                            className="w-full py-3.5 bg-black text-white font-bold text-sm rounded-2xl hover:bg-black/90 transition-all active:scale-[0.98]"
                        >
                            Show me around
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="w-full py-2 text-text-sub font-bold text-[12px] hover:text-text-main transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
