import React from 'react';

interface GlassContainerProps {
    children: React.ReactNode;
    className?: string;
    theme?: string; // Added theme prop
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '', theme = '' }) => ( // Destructure theme and provide default
    <div
        className={`glass-container relative w-full h-full rounded-[var(--casperid-radius,1.5rem)] overflow-hidden flex flex-col shadow-2xl border dark:border-white/10 border-white/40 ${className} ${theme}`} // Added theme to className
    >
        {children}
    </div>
);

export default GlassContainer;
