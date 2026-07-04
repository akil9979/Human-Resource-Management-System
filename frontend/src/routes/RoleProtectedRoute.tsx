import React from 'react';
import { Outlet } from 'react-router-dom';
import ForbiddenPage from '../pages/ForbiddenPage';
import { useAuth, UserPayload } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

interface RoleProtectedRouteProps {
  allowedRoles: UserPayload['role'][];
  children?: React.ReactElement;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user && allowedRoles.includes(user.role) ? children ?? <Outlet /> : <ForbiddenPage />}
    </ProtectedRoute>
  );
};

export default RoleProtectedRoute;
