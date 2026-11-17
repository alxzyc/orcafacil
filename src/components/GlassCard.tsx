import React, { forwardRef } from 'react';

type GlassCardVariant = 'default' | 'elevated' | 'bordered' | 'gradient' | 'accent' | 'interactive';
type GlassCardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  padding?: GlassCardPadding;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<GlassCardVariant, string> = {
  default: 'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)]',
  elevated: 'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] shadow-xl shadow-black/20',
  bordered: 'bg-transparent backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border-strong)]',
  gradient: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)]',
  accent: 'bg-gradient-to-br from-[var(--accent-lime)]/10 to-[var(--accent-lime)]/5 backdrop-blur-[var(--glass-blur)] border border-[var(--accent-lime)]/20',
  interactive: 'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] card-interactive',
};

const paddingClasses: Record<GlassCardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    children,
    ...props
  }, ref) => {
    const isInteractive = variant === 'interactive' || hover;

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} rounded-[var(--radius-card)] ${paddingClasses[padding]} ${isInteractive ? 'card-interactive' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;