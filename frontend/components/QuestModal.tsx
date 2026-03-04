
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { IdentityToolModal } from './ui/IdentityToolModal';

interface Quest {
    id: string;
    title: string;
    xp: number;
    icon: string;
    completed: boolean;
}

interface QuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartTour: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose, onStartTour }) => {
    const { user, refreshUser } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            fetchQuestStatus();
        }
    }, [user, isOpen]);

    const fetchQuestStatus = async () => {
        try {
            const res = await apiService.get(`/api/quest/status?userId=${user?.user_id}`);
            if (res.success) {
                // Merge completed status with available quests from backend
                setQuests(res.availableQuests.map((q: any) => ({
                    ...q,
                    completed: res.completedQuests.includes(q.id)
                })));
            }
        } catch (err) {
            console.error('QuestModal: Failed to fetch status', err);
        }
    };

    const handleClaim = async (questId: string) => {
        try {
            setIsLoading(true);
            const res = await apiService.post('/api/quest/claim', { questId, userId: user?.user_id });
            if (res.success) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#8652E2', '#6D36D6', '#CCE2A3'],
                });
                await fetchQuestStatus();
                // Refresh user for Header XP update
                await refreshUser();
            }
        } catch (err) {
            console.error('QuestModal: Failed to claim', err);
        } finally {
            setIsLoading(false);
        }
    };

    const completedCount = quests.filter(q => q.completed).length;
    const pendingCount = quests.length - completedCount;

    return (
        <IdentityToolModal
            isOpen={isOpen}
            onClose={onClose}
            title="Identity Quests"
            subtitle={`${pendingCount} Quests Available`}
            icon="bolt"
            iconBg="bg-amber-500 text-white"
            description="Complete these identity milestones to level up your trust score and earn exclusive CasperID XP."
            actionLabel={quests[0].completed ? "Continue Exploring" : "Start Onboarding Tour"}
            actionIcon={quests[0].completed ? "explore" : "play_arrow"}
            onAction={() => {
                if (!quests[0].completed) {
                    onStartTour();
                    onClose();
                } else {
                    onClose();
                }
            }}
        >
            <div className="space-y-4">
                {quests.map((quest) => (
                    <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${quest.completed
                            ? 'bg-gray-50/50 border-gray-100 opacity-60'
                            : 'bg-white border-gray-100 hover:border-primary/20 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${quest.completed ? 'bg-green-100 text-green-600' : 'bg-primary/5 text-primary'
                                }`}>
                                <span className={`material-symbols-outlined text-[20px] ${quest.completed ? 'icon-filled' : ''}`}>
                                    {quest.completed ? 'check_circle' : quest.icon}
                                </span>
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold ${quest.completed ? 'text-gray-400 line-through' : 'text-text-main'}`}>
                                    {quest.title}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">+{quest.xp} XP</span>
                                </div>
                            </div>
                        </div>

                        {!quest.completed && (
                            <button
                                onClick={() => handleClaim(quest.id)}
                                disabled={isLoading}
                                className="text-[11px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors uppercase tracking-widest"
                            >
                                Claim
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </IdentityToolModal>
    );
};
