import React from 'react';

// ─── Base Skeleton ──────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

/**
 * Base animated shimmer block. Compose into more complex skeletons.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-lg',
}) => (
  <div
    aria-hidden="true"
    className={`animate-pulse bg-slate-800/60 ${width} ${height} ${rounded} ${className}`}
  />
);

// ─── Stat Card Skeleton ──────────────────────────────────────────────────────

export const CardSkeleton: React.FC = () => (
  <div
    aria-hidden="true"
    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4"
  >
    <div className="flex items-center justify-between">
      <Skeleton width="w-24" height="h-3" />
      <Skeleton width="w-10" height="h-10" rounded="rounded-xl" />
    </div>
    <Skeleton width="w-16" height="h-8" />
    <Skeleton width="w-32" height="h-3" />
  </div>
);

// ─── Table Row Skeleton ──────────────────────────────────────────────────────

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr aria-hidden="true" className="border-b border-slate-800/40">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height="h-3" width={i === 0 ? 'w-28' : 'w-full'} />
      </td>
    ))}
  </tr>
);

// ─── Full Page Skeleton (Suspense fallback) ───────────────────────────────────

export const PageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading page..."
    className="min-h-screen bg-slate-950 flex"
  >
    {/* Sidebar placeholder */}
    <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 gap-4 shrink-0">
      <Skeleton width="w-32" height="h-6" className="mt-2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height="h-8" rounded="rounded-xl" />
      ))}
    </div>

    {/* Main area */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Navbar placeholder */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <Skeleton width="w-36" height="h-6" />
        <div className="flex gap-3">
          <Skeleton width="w-8" height="h-8" rounded="rounded-xl" />
          <Skeleton width="w-24" height="h-8" rounded="rounded-xl" />
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 p-8 space-y-6">
        <Skeleton width="w-64" height="h-10" rounded="rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 h-64 animate-pulse" />
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 h-64 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
