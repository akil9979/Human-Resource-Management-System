import React from 'react';

export interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  iconBg: string;
  icon: React.ReactNode;
}

/**
 * Reusable stat summary card used across Admin and Employee dashboards.
 */
export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, iconBg, icon }) => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700 transition-all duration-200 group">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-400">{title}</span>
      <div
        className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform duration-200`}
        aria-hidden="true"
      >
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <span className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</span>
      <p className="mt-1 text-xs text-slate-500 font-medium">{subtext}</p>
    </div>
  </div>
);

export default StatCard;
