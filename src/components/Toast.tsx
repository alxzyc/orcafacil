import React, { useEffect, useId } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onClose: (id: string) => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-[var(--success-text)]" aria-hidden="true" />,
  error: <AlertCircle className="w-5 h-5 text-[var(--error-text)]" aria-hidden="true" />,
  warning: <AlertTriangle className="w-5 h-5 text-[var(--warning-text)]" aria-hidden="true" />,
  info: <Info className="w-5 h-5 text-[var(--info-text)]" aria-hidden="true" />,
  default: <Info className="w-5 h-5 text-[var(--text-link)]" aria-hidden="true" />,
};

const borderColorMap: Record<ToastType, string> = {
  success: 'border-[var(--success-border)]',
  error: 'border-[var(--error-border)]',
  warning: 'border-[var(--warning-border)]',
  info: 'border-[var(--info-border)]',
  default: 'border-[var(--border-default)]',
};

const bgColorMap: Record<ToastType, string> = {
  success: 'bg-[var(--success-bg)]',
  error: 'bg-[var(--error-bg)]',
  warning: 'bg-[var(--warning-bg)]',
  info: 'bg-[var(--info-bg)]',
  default: 'bg-[var(--bg-card)]',
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  onClose,
  duration = 5000,
  action,
}) => {
  const progressId = useId();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        glass-elevated ${borderColorMap[type]} ${bgColorMap[type]}
        p-4 flex items-start gap-3 min-w-[320px] max-w-md
        animate-in animate-slide-up
        relative overflow-hidden
      `}
    >
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
        {iconMap[type]}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)]">{title}</p>
        {message && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-[var(--text-link)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] rounded"
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-input)] transition-colors flex-shrink-0"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>

      <div
        id={progressId}
        className="absolute bottom-0 left-0 h-1 bg-current/30"
        style={{ animation: `progress ${duration}ms linear forwards`, transformOrigin: 'left' }}
        role="progressbar"
        aria-valuenow={100}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tempo restante"
      />
    </div>
  );
};

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionClasses: Record<NonNullable<ToastContainerProps['position']>, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'bottom-right',
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={`
        fixed z-[var(--z-toast)] flex flex-col gap-2 items-end
        ${positionClasses[position]}
        pointer-events-none
      `}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-md">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;