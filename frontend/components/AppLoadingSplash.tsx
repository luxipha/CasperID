import React from 'react';
import Logo from './Logo';

export const AppLoadingSplash: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-[#F8F9FF] flex flex-col items-center justify-center z-[9999]">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Animated Logo Container */}
                <div className="relative">
                    {/* Pulsing Outer Rings */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping -z-10 scale-150 opacity-20"></div>
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse -z-10 scale-125"></div>

                    {/* Main Logo */}
                    <div className="size-24 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative z-10 transition-transform duration-500 hover:scale-105">
                        <Logo
                            showName={false}
                            className="scale-[2] animate-pulse"
                            variant="svg"
                            href={null as any}
                        />
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-black text-primary tracking-tight animate-pulse">
                        Casper<span className="text-[#9333EA]">ID</span>
                    </h2>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-1.5 w-48 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-purple-600 w-1/2 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
                        </div>
                        <p className="text-text-sub text-sm font-bold uppercase tracking-[0.2em] opacity-50">
                            Synchronizing Identity
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(200%); width: 30%; }
        }
      `}} />
        </div>
    );
};

export default AppLoadingSplash;
