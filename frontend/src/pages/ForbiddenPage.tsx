import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

/**
 * 403 Forbidden page — shown when a user navigates to a route their role
 * does not have access to (e.g. an Employee hitting an Admin-only path).
 */
const ForbiddenPage: React.FC = () => {
  usePageTitle('403 — Access Denied');
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans"
      aria-labelledby="forbidden-heading"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Large numeral */}
        <div aria-hidden="true" className="select-none">
          <span className="text-[10rem] leading-none font-black bg-gradient-to-b from-rose-900/60 to-slate-900 bg-clip-text text-transparent">
            403
          </span>
        </div>

        {/* Lock icon */}
        <div className="flex justify-center" aria-hidden="true">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1 id="forbidden-heading" className="text-2xl font-extrabold text-slate-100">
            Access Denied
          </h1>
          <p className="text-sm text-slate-500">
            You don't have permission to view this page. Contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
};

export default ForbiddenPage;
