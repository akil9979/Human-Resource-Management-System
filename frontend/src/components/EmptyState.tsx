import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const DefaultIcon = () => (
  <svg
    className="w-12 h-12 opacity-25"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

/**
 * Generic empty state block for tables, lists, and sections with no data.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  description = 'Nothing to display here yet.',
  icon,
  action,
}) => (
  <div
    role="status"
    className="flex flex-col items-center justify-center py-16 text-slate-500 text-center"
  >
    {icon ?? <DefaultIcon />}
    <p className="mt-4 text-sm font-bold text-slate-400">{title}</p>
    {description && (
      <p className="mt-1 text-xs text-slate-600 max-w-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
