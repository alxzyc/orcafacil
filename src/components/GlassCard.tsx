import React from 'react';

type GlassCardVariant = 'default' | 'elevated' | 'bordered' | 'gradient';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: GlassCardVariant;
  className?: string;
}

const variantClasses: Record<GlassCardVariant, string> = {
  default: 'bg-white/5 backdrop-blur-xl border border-white/10',
  elevated: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20',
  bordered: 'bg-transparent backdrop-blur-xl border border-white/20',
  gradient: 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`${variantClasses[variant]} rounded-[20px] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};



