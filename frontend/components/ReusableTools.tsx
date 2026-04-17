
import React, { useState } from 'react';
import { SelectiveDisclosureModal } from './SelectiveDisclosureModal';
import { ZKClaimsModal } from './ZKClaimsModal';
import { useAuth } from '../contexts/AuthContext';

export const ReusableTools: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isZKClaimsModalOpen, setIsZKClaimsModalOpen] = useState(false);
  const [initialFields, setInitialFields] = useState<string[] | undefined>(undefined);
  const { user } = useAuth();

  // Determine liveness status from real user data
  const livenessCompleted = user?.liveness_completed_at || (user?.tier === 'layer_2' || user?.tier === 'layer_3');

  const tools = [
    {
      id: 'liveness',
      title: 'Liveness Check',
      description: livenessCompleted ? 'Completed & Verified' : 'Not Completed',
      icon: 'face_retouching_natural',
      color: livenessCompleted ? 'bg-[#EEF4FF] text-[#4C82FB]' : 'bg-gray-100 text-gray-400',
      verified: livenessCompleted
    },
    {
      id: 'share',
      title: 'Share KYC Data',
      description: 'Selectively reveal info',
      icon: 'share',
      color: 'bg-[#F5EEFF] text-[#8652E2]',
      verified: false
    },
    {
      id: 'zk-claims',
      title: 'ZK Proof Claims',
      description: 'Prove claims without revealing data',
      icon: 'shield_lock',
      color: 'bg-[#F0E6FF] text-[#8652E2]',
      verified: false
    },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'share') {
      setInitialFields(['first_name', 'last_name']);
      setIsShareModalOpen(true);
    } else if (toolId === 'zk-claims') {
      setIsZKClaimsModalOpen(true);
    }
  };

  return (
    <section className="w-full">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-lg text-text-main">Reusable Tools</h3>
        <a className="text-primary text-xs font-bold hover:underline" href="#">View All</a>
      </div>

      {/* 
        Tailwind Scroll Logic:
        - Mobile: flex-row, overflow-x-auto (horizontal)
        - Desktop: md:flex-col (vertical stack)
      */}
      <div className="flex flex-row md:flex-col gap-4 overflow-x-auto no-scrollbar md:overflow-visible pb-4 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0 snap-x">
        {tools.map((tool, idx) => (
          <div
            key={idx}
            onClick={() => handleToolClick(tool.id)}
            className="flex-shrink-0 w-[85%] md:w-full bg-white p-5 rounded-[24px] shadow-soft flex items-center gap-4 border border-gray-100/50 hover:border-primary/20 transition-all group cursor-pointer snap-center"
          >
            {/* Icon Circle */}
            <div className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${tool.color}`}>
              <span className="material-icons-outlined text-2xl">{tool.icon}</span>
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-[16px] text-text-main leading-tight tracking-tight">{tool.title}</p>
                {tool.verified && (
                  <span className="material-icons-outlined text-green-500 text-[20px]">
                    check_circle
                  </span>
                )}
              </div>
              <p className="text-[13px] text-text-sub mt-1 font-medium leading-tight">{tool.description}</p>
            </div>
          </div>
        ))}
      </div>

      <SelectiveDisclosureModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialSelectedFields={initialFields}
      />

      <ZKClaimsModal
        isOpen={isZKClaimsModalOpen}
        onClose={() => setIsZKClaimsModalOpen(false)}
      />
    </section>
  );
};
