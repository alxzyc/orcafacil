import React from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type Color = 'primary' | 'white' | 'accent' | 'current';

export interface LoadingSpinnerProps {
  size?: Size;
  color?: Color;
  className?: string;
  'aria-label'?: string;
  thickness?: number;
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-4 h-4 border-[2px]',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-[4px]',
  xl: 'w-16 h-16 border-[4px]',
};

const colorClasses: Record<Color, string> = {
  primary: 'border-[var(--primary-500)] border-t-transparent',
  white: 'border-white/30 border-t-white',
  accent: 'border-[var(--accent-lime)] border-t-transparent',
  current: 'border-current/30 border-t-current',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  'aria-label': ariaLabel = 'Carregando...',
  thickness,
}) => {
  const style = thickness ? { borderWidth: `${thickness}px` } : undefined;

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label={ariaLabel}
      style={style}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export const LoadingOverlay: React.FC<{ message?: string; size?: Size }> = ({
  message = 'Carregando...',
  size = 'lg',
}) => (
  <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm flex flex-col items-center justify-center z-[var(--z-modal)] animate-in animate-fade-in">
    <LoadingSpinner size={size} color="accent" />
    <p className="mt-4 text-[var(--text-secondary)]">{message}</p>
  </div>
);

export const InlineLoading: React.FC<{ size?: Size; color?: Color; className?: string }> = ({
  size = 'sm',
  color = 'current',
  className = '',
}) => (
  <LoadingSpinner size={size} color={color} className={`mx-auto ${className}`} />
);

export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = `
    bg-gradient-to-r
    from-[var(--bg-card)]
    via-[var(--bg-card-hover)]
    to-[var(--bg-card)]
    bg-[length:200%_100%]
    rounded
    ${animation === 'pulse' ? 'animate-pulse-soft' : animation === 'wave' ? 'animate-shimmer' : ''}
    ${className}
  `;

  const variantStyles = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${variantStyles[variant]}`}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={className} aria-hidden="true">
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} variant="text" className="mb-2" width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`} aria-hidden="true">
    <Skeleton variant="rectangular" className="aspect-video" />
    <SkeletonText lines={3} />
    <div className="flex items-center gap-4 pt-4">
      <Skeleton variant="circular" width="40" height="40" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  </div>
);

export default LoadingSpinner;