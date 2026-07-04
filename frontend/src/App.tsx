import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="text-center p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            HRMS Frontend
          </h1>
          <p className="mt-4 text-slate-400 text-sm">
            React + TypeScript + Vite + Tailwind CSS initial configuration completed.
          </p>
          <div className="mt-6 inline-block px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-950/50 rounded-full border border-indigo-900/50">
            Tech Stack Verified
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
