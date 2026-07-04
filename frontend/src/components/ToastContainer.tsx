import React from 'react';
import { useToast, Toast, ToastVariant } from '../context/ToastContext.js';

// ─── Variant config ───────────────────────────────────────────────────────────

const variantStyles: Record<ToastVariant, { bar: string; icon: string; bg: string; border: string }> = {
  success: {
    bar: 'bg-emerald-500',
    icon: '✓',
    bg: 'bg-slate-900',
    border: 'border-emerald-500/30',
  },
  error: {
    bar: 'bg-rose-500',
    icon: '✕',
    bg: 'bg-slate-900',
    border: 'border-rose-500/30',
  },
  warning: {
    bar: 'bg-amber-500',
    icon: '⚠',
    bg: 'bg-slate-900',
    border: 'border-amber-500/30',
  },
  info: {
    bar: 'bg-indigo-500',
    icon: 'ℹ',
    bg: 'bg-slate-900',
    border: 'border-indigo-500/30',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const styles = variantStyles[toast.variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`relative flex items-start gap-3 w-80 max-w-full ${styles.bg} border ${styles.border} rounded-2xl px-4 py-3.5 shadow-2xl overflow-hidden animate-[slideIn_0.25s_ease_forwards]`}
    >
      {/* Left colour bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar} rounded-l-2xl`} aria-hidden="true" />

      {/* Icon */}
      <div className={`ml-2 mt-0.5 w-6 h-6 rounded-lg ${styles.bar}/20 flex items-center justify-center text-xs font-black shrink-0`}
        style={{ color: styles.bar.replace('bg-', '').replace('/20', '') }}
        aria-hidden="true"
      >
        {styles.icon}
      </div>

      {/* Message */}
      <p className="flex-1 text-xs font-semibold text-slate-200 leading-snug pt-0.5">
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-slate-500 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg p-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ─── Container ────────────────────────────────────────────────────────────────

/**
 * Fixed-position toast stack — place once near the root of your app.
 * Reads from ToastContext automatically.
 */
export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
