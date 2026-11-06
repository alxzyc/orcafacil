import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  loading?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[36px] px-3 text-sm',
  md: 'min-h-[44px] px-5 text-base',
  lg: 'min-h-[52px] px-6 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const base = 'rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  const variants: Record<Variant, string> = {
    primary: 'bg-[var(--accent-lime)] text-black hover:opacity-90 focus:ring-2 focus:ring-accent-lime/50',
    secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-2 focus:ring-white/20',
    ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-white/20',
    danger: 'bg-[#F43F5E] text-white hover:opacity-90 focus:ring-2 focus:ring-red-500/50',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" color={variant === 'primary' ? 'white' : 'white'} />}
      {children}
    </button>
  );
};

// Inline loading spinner for button
const LoadingSpinner: React.FC<{ size?: 'sm'; color?: 'white' }> = ({ size = 'sm', color = 'white' }) => (
  <svg
    className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill={color}
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);



