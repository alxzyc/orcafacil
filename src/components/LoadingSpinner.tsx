import React from 'react';

type Size = 'sm' | 'md' | 'lg';
type Color = 'primary' | 'white' | 'accent';

interface LoadingSpinnerProps {
  size?: Size;
  color?: Color;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const colorClasses: Record<Color, string> = {
  primary: 'border-primary-500 border-t-transparent',
  white: 'border-white/30 border-t-white',
  accent: 'border-accent-lime border-t-transparent',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  'aria-label': ariaLabel = 'Carregando...',
}) => {
  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

// Full screen loading overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="fixed inset-0 bg-[#0F0E17]/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <LoadingSpinner size="lg" color="accent" />
    <p className="mt-4 text-white/70">{message}</p>
  </div>
);

// Inline loading for buttons and small spaces
export const InlineLoading: React.FC<{ size?: Size; color?: Color }> = ({ size = 'sm', color = 'white' }) => (
  <LoadingSpinner size={size} color={color} className="mx-auto" />
);



