import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    error,
    helperText,
    variant = 'default',
    showCharCount = false,
    maxLength,
    className = '',
    id,
    disabled,
    required,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const textareaId = id || React.useId();
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const charCountId = showCharCount ? `${textareaId}-charcount` : undefined;
    const describedBy = [errorId, helperId, charCountId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

    const baseClasses = `
      w-full
      bg-[var(--bg-input)]
      border border-[var(--border-default)]
      text-white
      placeholder-[var(--text-tertiary)]
      rounded-xl
      resize-none
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

    const value = props.value;
    const charCount = maxLength && typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1"
          >
            {label}
            {required && <span className="text-[var(--error)]" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            {...props}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          {error && (
            <p id={errorId} className="text-sm text-[var(--error)] flex items-center gap-1" role="alert">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p id={helperId} className="text-sm text-[var(--text-tertiary)]">
              {helperText}
            </p>
          )}
          {showCharCount && maxLength && (
            <p id={charCountId} className={`text-xs font-mono tabular-nums ${charCount > maxLength * 0.9 ? 'text-[var(--warning)]' : 'text-[var(--text-tertiary)]'}`} aria-live="polite">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;