import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  size = 'md',
  className = '',
  htmlFor,
  ...props
}) => (
  <label
    htmlFor={htmlFor}
    className={`
      block font-medium text-[var(--text-secondary)]
      ${sizeClasses[size]}
      ${className}
    `}
    {...props}
  >
    <span className="flex items-center gap-1">
      {children}
      {required && <span className="text-[var(--error)]" aria-hidden="true">*</span>}
    </span>
  </label>
);

export default Label;