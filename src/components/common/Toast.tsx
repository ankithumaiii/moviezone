import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-height) + 16px)',
        right: '16px',
        zIndex: 110,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        width: 'calc(100% - 32px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={18} color="var(--status-ok)" />,
    error: <AlertCircle size={18} color="var(--status-danger)" />,
    info: <Info size={18} color="var(--accent-primary)" />,
  };

  return (
    <div
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: 'var(--shadow-md)',
        animation: 'fadeIn 160ms ease-out',
      }}
    >
      {icons[toast.type]}
      <span
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </span>
      <button
        type="button"
        className="btn-icon"
        style={{ width: 28, height: 28 }}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
};
