
import React from 'react';

interface HumanFirstIdentityProps {
  onNavigate?: (view: string) => void;
  onClose?: () => void;
}

export const HumanFirstIdentity: React.FC<HumanFirstIdentityProps> = ({ onNavigate, onClose }) => {
  return (
    <div className="md:animate-in md:fade-in md:slide-in-from-bottom-8">
      <div className="bg-[#1A1A2E] rounded-3xl p-6 relative overflow-hidden shadow-xl md:border md:border-white/5 group">
        <div className="relative z-10">
          <h4 className="text-white font-bold mb-1 text-sm">Human-First Identity</h4>
          <p className="text-gray-400 text-xs mb-4 leading-relaxed font-medium">
            CasperID puts you in control. Revoke access to any app at any time.
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('integrations')}
              className="text-secondary text-xs font-bold flex items-center gap-1 hover:brightness-110 transition-all group/link"
            >
              Review Permissions
              <span className="material-icons-outlined text-xs group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden md:block text-white/20 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Decorations */}
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full border-4 border-white/5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
          <span className="material-symbols-outlined text-5xl text-white">manage_accounts</span>
        </div>
      </div>
    </div>
  );
};
