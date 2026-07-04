import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
      <div className="max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
        <p className="mb-6 text-slate-400">This feature will be available soon. Please contact your administrator if you require a password reset.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-500">Go Back</button>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
