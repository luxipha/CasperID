
import React from 'react';

interface QuestTourCardProps {
    onAction: () => void;
    onClose: () => void;
}

export const QuestTourCard: React.FC<QuestTourCardProps> = ({ onAction, onClose }) => {
    return (
        <div className="md:animate-in md:fade-in md:slide-in-from-bottom-8">
            <div className="bg-[#8652E2] rounded-3xl p-6 relative overflow-hidden shadow-xl md:border md:border-white/5 group">
                <div className="relative z-10 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-sm icon-filled text-white">bolt</span>
                        <h4 className="font-bold text-sm">Join the Quest</h4>
                    </div>
                    <p className="text-white/80 text-xs mb-4 leading-relaxed font-medium">
                        Master your identity and earn your first <span className="text-white font-black">100 XP</span> by taking the tour.
                    </p>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onAction}
                            className="bg-white text-[#8652E2] px-4 py-2 rounded-xl text-xs font-black hover:bg-white/90 transition-all active:scale-95"
                        >
                            Open Quests
                        </button>
                        {/* Desktop Close Button */}
                        <button
                            onClick={onClose}
                            className="hidden md:block text-white/40 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>

                {/* Decorations */}
                <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full border-4 border-white/10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-5xl text-white">workspace_premium</span>
                </div>
            </div>
        </div>
    );
};
