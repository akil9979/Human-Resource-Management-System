import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

/**
 * 404 Not Found page — shown for any route that doesn't match.
 */
const NotFoundPage: React.FC = () => {
  usePageTitle('404 — Page Not Found');
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans"
      aria-labelledby="error-heading"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Large numeral */}
        <div aria-hidden="true" className="select-none">
          <span className="text-[10rem] leading-none font-black bg-gradient-to-b from-slate-700 to-slate-900 bg-clip-text text-transparent">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 id="error-heading" className="text-2xl font-extrabold text-slate-100">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500">
            The page you're looking for doesn't exist or has been moved.
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
            className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
