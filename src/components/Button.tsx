import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    icon,
    children,
    className = '',
    style,
    ...props
}) => {
    // Determine base classes based on variant
    let btnClass = 'btn';
    if (variant === 'secondary') {
        btnClass += ' btn-secondary';
    }

    // Handle specific danger styling (from the Clear button)
    const dangerStyle = variant === 'danger' ? {
        background: '#ef4444',
        color: 'white',
        borderColor: 'var(--panel-border)',
    } : {};

    return (
        <button
            className={`${btnClass} ${className}`.trim()}
            style={{ ...dangerStyle, ...style }}
            {...props}
        >
            {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
            {children}
        </button>
    );
};
