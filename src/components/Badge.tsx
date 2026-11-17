import React from 'react';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white',
  accent: 'bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-lime-500)] text-black',
  success: 'bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]',
  error: 'bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)]',
  info: 'bg-[var(--info-bg)] text-[var(--info-text)] border border-[var(--info-border)]',
  neutral: 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-default)]',
  outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1 text-sm gap-2',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  icon,
  dot = false,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center
    font-medium
    rounded-full
    border
    transition-colors duration-150
    ${sizeClasses[size]}
    ${variantClasses[variant]}
  `;

  return (
    <span className={`${baseClasses} ${className}`} {...props}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            variant === 'success' ? 'bg-[var(--success-text)]' :
            variant === 'warning' ? 'bg-[var(--warning-text)]' :
            variant === 'error' ? 'bg-[var(--error-text)]' :
            variant === 'info' ? 'bg-[var(--info-text)]' :
            variant === 'accent' ? 'bg-black' :
            'bg-current'
          }`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;