import React from 'react';

export const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
            {...props}
        />
    );
});

Card.displayName = 'Card';
