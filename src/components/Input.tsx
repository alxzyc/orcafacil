import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    leftElement,
    rightElement,
    variant = 'default',
    className = '',
    id,
    disabled,
    required,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const inputId = id || React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    const baseClasses = `
      w-full
      bg-[var(--bg-input)]
      border border-[var(--border-default)]
      text-white
      placeholder-[var(--text-tertiary)]
      rounded-xl
      transition-all duration-150
      input-base
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? 'border-[var(--border-error)] focus:border-[var(--border-error)] focus:ring-[var(--border-error)]' : ''}
    `;

    const variantClasses = {
      default: 'px-4 py-3',
      filled: 'px-4 py-3 bg-[var(--bg-card)] border-transparent focus:border-[var(--border-focus)]',
      outlined: 'px-4 py-3 bg-transparent border-[var(--border-strong)] focus:border-[var(--border-focus)]',
    };

    const iconClasses = 'absolute top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none';
    const leftIconClasses = `${iconClasses} left-3`;
    const rightIconClasses = `${iconClasses} right-3`;

    const paddingClasses = `
      ${leftIcon || leftElement ? 'pl-10' : ''}
      ${rightIcon || rightElement ? 'pr-10' : ''}
    `;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1"
          >
            {label}
            {required && <span className="text-[var(--error)]" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {(leftIcon || leftElement) && (
            <div className={leftIconClasses} aria-hidden="true">
              {leftElement || leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses} ${className}`}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            {...props}
          />
          {(rightIcon || rightElement) && (
            <div className={rightIconClasses} aria-hidden="true">
              {rightElement || rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-[var(--error)] flex items-center gap-1" role="alert">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-[var(--text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;