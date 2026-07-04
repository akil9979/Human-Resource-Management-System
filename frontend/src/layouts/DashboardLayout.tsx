import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.js';
import Navbar from '../components/Navbar.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 flex z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 transform transition-transform duration-300">
            {/* Close button for drawer */}
            <div className="absolute top-4 right-4 z-50">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation menu"
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-850 hover:bg-slate-850/80 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <Navbar onMenuToggle={() => setSidebarOpen(true)} title={title} />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
