import React from 'react';

interface PageHeaderProps {
  /** Large heading — name/greeting or section title */
  title: React.ReactNode;
  /** Smaller subtitle beneath the heading */
  subtitle?: string;
  /** Optional extra content aligned to the right */
  actions?: React.ReactNode;
}

/**
 * Gradient banner hero used at the top of Admin and Employee dashboards.
 * Keeps the visual consistent without duplicating markup in every page.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
    <div
      className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"
      aria-hidden="true"
    />
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-slate-400 max-w-xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
