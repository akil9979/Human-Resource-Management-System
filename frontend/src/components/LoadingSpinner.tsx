import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

/**
 * Accessible spinning loader with optional label text.
 * Uses role="status" and aria-label so screen readers announce it correctly.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => (
  <div
    role="status"
    aria-label={label}
    className={`flex flex-col items-center justify-center gap-3 ${className}`}
  >
    <svg
      className={`animate-spin text-indigo-500 ${sizeMap[size]}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    {label && (
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    )}
  </div>
);

/**
 * Full-screen loading overlay — used while auth session is resolving.
 */
export const FullPageSpinner: React.FC<{ label?: string }> = ({
  label = 'Loading session...',
}) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950">
    <LoadingSpinner size="lg" label={label} />
  </div>
);

export default LoadingSpinner;
