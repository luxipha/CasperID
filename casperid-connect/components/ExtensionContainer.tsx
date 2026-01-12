
import React from 'react';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  headerTitle?: string;
  headerSub?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const ExtensionContainer: React.FC<Props> = ({
  children,
  headerTitle = "CasperID Connect",
  headerSub = "Your verified identity on the blockchain",
  showBack = false,
  onBack
}) => {
  return (
    <div className="relative w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
      <header className="pt-6 pb-4 px-6 flex items-center justify-between bg-white border-b border-gray-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            {showBack && (
              <button onClick={onBack} className="mr-1 text-text-sub hover:text-primary transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="size-8 flex items-center justify-center">
              <img src="./logo.png" alt="CasperID Logo" className="size-full object-contain" />
            </div>
            <h1 className="text-[#1A1A2E] text-base font-extrabold tracking-tight">{headerTitle}</h1>
          </div>
          <p className="text-[#626D85] text-[11px] font-medium pl-10">{headerSub}</p>
        </div>

        <button className="size-9 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#8652E2] hover:bg-[#E9D5FF] transition-colors border border-purple-100">
          <User size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto bg-[#F8F9FF]/50">
        {children}
      </main>
    </div>
  );
};

export default ExtensionContainer;
