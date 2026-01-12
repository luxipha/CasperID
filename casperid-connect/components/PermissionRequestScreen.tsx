import React from 'react';
import { ShieldCheck, UserCircle, FileEdit, X, Check, Lock, Shield } from 'lucide-react';

interface Props {
  onAllow: () => void;
  onDeny: () => void;
}

const PermissionRequestScreen: React.FC<Props> = ({ onAllow, onDeny }) => {
  const permissions = [
    {
      id: 1,
      title: 'View Layer 3 Verified Status',
      description: 'Allow app to verify your KYC level.',
      icon: ShieldCheck
    },
    {
      id: 2,
      title: 'Access public profile',
      description: 'Read your name, avatar, and headline.',
      icon: UserCircle
    },
    {
      id: 3,
      title: 'Sign transactions (Limited)',
      description: 'Request signatures for approval.',
      icon: FileEdit
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-bottom-6 duration-500">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
        <h2 className="text-[#1A1A2E] text-lg font-extrabold tracking-tight">Permission Request</h2>
        <button onClick={onDeny} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-8 pb-6 flex flex-col items-center">
          {/* App Icon & Badge */}
          <div className="relative mb-6">
            <div className="size-24 bg-[#FF007A] rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-[#FF007A]/20">
              <span className="text-[44px] font-extrabold">U</span>
            </div>
            <div className="absolute -bottom-1 -right-1 size-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <div className="size-6 bg-[#00D1FF] rounded-full flex items-center justify-center text-white">
                <Check size={12} strokeWidth={3} />
              </div>
            </div>
          </div>

          <h3 className="text-[#1A1A2E] text-xl font-extrabold mb-1">Uniswap Protocol</h3>
          <div className="flex items-center gap-1.5 text-[#626D85] text-xs font-semibold mb-8 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <Lock size={12} />
            https://app.uniswap.org
          </div>

          <p className="text-[#1A1A2E] text-center text-[13px] font-medium leading-relaxed px-4 mb-8">
            <span className="font-extrabold">Uniswap Protocol</span> is requesting to connect to your CasperID and access the following permissions:
          </p>

          {/* Permissions List */}
          <div className="w-full space-y-3 px-1">
            {permissions.map((perm) => (
              <div key={perm.id} className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8F9FF] border border-[#F0F2FF] group hover:border-primary/20 transition-all">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white mt-0.5">
                  <perm.icon size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-[13px] font-extrabold text-[#1A1A2E] mb-0.5">{perm.title}</h4>
                  <p className="text-[11px] font-medium text-[#626D85]">{perm.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="p-6 pt-2 space-y-4">
        <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#E9E5FF] flex items-start gap-3">
          <Shield className="text-primary size-5 mt-0.5" />
          <p className="text-[11px] font-medium text-[#626D85] leading-relaxed">
            You control your data. No raw private keys are ever shared. You can revoke this access anytime in Settings.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDeny}
            className="flex-1 h-12 rounded-xl border-2 border-gray-100 text-[#626D85] font-bold text-sm hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onAllow}
            className="flex-[1.5] h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Allow Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequestScreen;
