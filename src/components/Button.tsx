import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[36px] px-3 text-sm gap-1.5',
  md: 'min-h-[44px] px-5 text-base gap-2',
  lg: 'min-h-[52px] px-6 text-lg gap-2',
  xl: 'min-h-[56px] px-8 text-lg gap-2.5',
};

const variantClasses: Record<Variant, string> = {
  primary: `
    bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-lime-500)]
    text-black
    hover:opacity-90
    active:opacity-80
    focus:ring-2 focus:ring-[var(--accent-lime)] focus:ring-opacity-50
    shadow-sm shadow-[var(--accent-lime)]/20
    hover:shadow-[var(--accent-lime)]/30
    transition-all duration-150
  `,
  secondary: `
    bg-[var(--bg-card)]
    text-white
    border border-[var(--border-default)]
    hover:bg-[var(--bg-card-hover)]
    hover:border-[var(--border-strong)]
    active:bg-[var(--bg-input)]
    focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-opacity-50
    transition-all duration-150
  `,
  ghost: `
    bg-transparent
    text-[var(--text-secondary)]
    hover:text-white
    hover:bg-[var(--bg-input)]
    active:bg-[var(--bg-card)]
    focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-opacity-50
    transition-all duration-150
  `,
  danger: `
    bg-gradient-to-r from-[var(--error)] to-[var(--error)]
    text-white
    hover:opacity-90
    active:opacity-80
    focus:ring-2 focus:ring-[var(--error)] focus:ring-opacity-50
    shadow-sm shadow-[var(--error)]/20
    hover:shadow-[var(--error)]/30
    transition-all duration-150
  `,
  success: `
    bg-gradient-to-r from-[var(--success)] to-[var(--success)]
    text-white
    hover:opacity-90
    active:opacity-80
    focus:ring-2 focus:ring-[var(--success)] focus:ring-opacity-50
    shadow-sm shadow-[var(--success)]/20
    hover:shadow-[var(--success)]/30
    transition-all duration-150
  `,
  outline: `
    bg-transparent
    text-white
    border border-[var(--border-default)]
    hover:bg-[var(--bg-input)]
    hover:border-[var(--border-strong)]
    active:bg-[var(--bg-card)]
    focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-opacity-50
    transition-all duration-150
  `,
  link: `
    bg-transparent
    text-[var(--text-link)]
    hover:text-[var(--text-link-hover)]
    hover:underline
    active:text-[var(--accent-lime-600)]
    p-0
    min-h-auto
    shadow-none
    focus:ring-0
    transition-colors duration-150
  `,
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    fullWidth = false,
    ...props
  }, ref) => {
    const base = `
      inline-flex items-center justify-center
      font-medium
      rounded-full
      transition-all duration-150
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]
      press-scale
    `;

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={size === 'sm' || size === 'md' ? 'sm' : 'md'} color="white" aria-hidden="true" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading spinner for button
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md'; color?: 'white' }> = ({
  size = 'sm',
  color = 'white',
}) => (
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

export default Button;