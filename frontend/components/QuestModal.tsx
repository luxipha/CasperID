
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
    eligible: boolean;
    reason?: string;
}

interface QuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartTour: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose, onStartTour }) => {
    const { user, refreshUser } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && isOpen) {
            fetchQuestStatus();
        }
    }, [user, isOpen]);

    const fetchQuestStatus = async () => {
        try {
            setError(null);
            const res = await apiService.get('/api/quest/status');
            if (res.success) {
                // Backend now returns eligibility info directly
                setQuests(res.availableQuests.map((q: any) => ({
                    id: q.id,
                    title: q.title,
                    xp: q.xp,
                    icon: q.icon,
                    completed: q.completed,
                    eligible: q.eligible,
                    reason: q.reason
                })));
            }
        } catch (err: any) {
            console.error('QuestModal: Failed to fetch status', err);
            setError('Failed to load quests');
        }
    };

    // External action quests - clicking opens link and tracks
    const EXTERNAL_QUESTS: Record<string, { url: string; action: string }> = {
        'community_join': { url: 'https://t.me/ileplatformchat', action: 'community_joined' },
        'extension_install': { url: 'https://chromewebstore.google.com/detail/oecccgmhmojgniechnclmffchodmdjmd', action: 'extension_installed' },
    };

    const handleQuestAction = async (questId: string) => {
        const external = EXTERNAL_QUESTS[questId];
        if (external) {
            // Track and open external link
            try {
                await apiService.post('/api/quest/track-action', { action: external.action });
                window.open(external.url, '_blank');
                await fetchQuestStatus();
            } catch (err) {
                console.error('Failed to track action:', err);
                window.open(external.url, '_blank');
            }
            return;
        }
    };

    const handleClaim = async (questId: string) => {
        const quest = quests.find(q => q.id === questId);

        // Double-check eligibility before claiming
        if (quest && !quest.eligible) {
            setError(quest.reason || 'Complete the task first');
            return;
        }

        try {
            setClaimingId(questId);
            setError(null);
            const res = await apiService.post('/api/quest/claim', { questId });

            if (res.success) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#8652E2', '#6D36D6', '#CCE2A3'],
                });
                await fetchQuestStatus();
                await refreshUser();
            }
        } catch (err: any) {
            console.error('QuestModal: Failed to claim', err);
            const errorMsg = err?.response?.data?.error || err?.message || 'Failed to claim quest';
            setError(errorMsg);
        } finally {
            setClaimingId(null);
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
            actionLabel={quests.length > 0 && quests[0].completed ? "Continue Exploring" : "Start Onboarding Tour"}
            actionIcon={quests.length > 0 && quests[0].completed ? "explore" : "play_arrow"}
            onAction={() => {
                if (quests.length > 0 && !quests[0].completed) {
                    onStartTour();
                    onClose();
                } else {
                    onClose();
                }
            }}
        >
            <div className="space-y-4">
                {/* Error message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </motion.div>
                )}

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
                                    {/* Show reason if not eligible and not completed */}
                                    {!quest.completed && !quest.eligible && quest.reason && (
                                        <span className="text-[10px] text-gray-400 ml-2">• {quest.reason}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!quest.completed && (
                            quest.eligible ? (
                                <button
                                    onClick={() => handleClaim(quest.id)}
                                    disabled={claimingId === quest.id}
                                    className="text-[11px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors uppercase tracking-widest disabled:opacity-50"
                                >
                                    {claimingId === quest.id ? 'Claiming...' : 'Claim'}
                                </button>
                            ) : EXTERNAL_QUESTS[quest.id] ? (
                                <button
                                    onClick={() => handleQuestAction(quest.id)}
                                    className="text-[11px] font-black text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-widest flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                    Go
                                </button>
                            ) : (
                                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                    Locked
                                </span>
                            )
                        )}
                    </motion.div>
                ))}
            </div>
        </IdentityToolModal>
    );
};
