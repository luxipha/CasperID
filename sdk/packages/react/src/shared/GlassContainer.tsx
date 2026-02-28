import React from 'react';

interface GlassContainerProps {
    children: React.ReactNode;
    className?: string;
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '' }) => (
    <div
        className={`glass-container relative w-full max-w-[400px] h-[750px] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border dark:border-white/10 border-white/40 ${className}`}
    >
        {children}
    </div>
);

export default GlassContainer;
