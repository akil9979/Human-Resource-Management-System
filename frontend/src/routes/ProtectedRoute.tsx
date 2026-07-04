import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from '../components/LoadingSpinner';

interface ProtectedRouteProps {
  children?: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner label="Loading session..." />;

  if (!user) return <Navigate to="/login" replace />;

  return children ?? <Outlet />;
};

export default ProtectedRoute;
