import React from 'react';

export const Badge = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}
            {...props}
        />
    );
});

Badge.displayName = 'Badge';
