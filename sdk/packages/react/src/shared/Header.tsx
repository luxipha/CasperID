import React from 'react';
import { Shield, X, Sun, Moon } from 'lucide-react';

interface HeaderProps {
    onClose?: () => void;
    title?: string;
    subtitle?: string;
    showClose?: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({
    onClose,
    title = 'CasperID',
    subtitle = 'SECURE SDK',
    showClose = true,
    theme,
    toggleTheme,
    logoUrl,
}) => (
    <header className="flex items-center justify-between px-6 pt-8 pb-4 relative z-20">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand rounded-xl flex items-center justify-center shadow-brand">
                {logoUrl ? (
                    <img src={logoUrl} alt={title} className="w-5 h-5 object-contain" />
                ) : (
                    <Shield className="text-white w-5 h-5" />
                )}
            </div>
            <div>
                <h2 className="text-lg font-bold tracking-tight text-main">{title}</h2>
                {subtitle && (
                    <p className="text-[10px] uppercase tracking-widest text-brand font-bold">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={toggleTheme}
                className="p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-xl transition-colors text-muted"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {showClose && (
                <button
                    onClick={onClose}
                    className="p-2 dark:hover:bg-white/10 hover:bg-slate-200/50 rounded-full transition-colors text-muted"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    </header>
);

export default Header;
