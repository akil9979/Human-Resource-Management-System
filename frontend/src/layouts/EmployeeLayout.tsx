import React from 'react';
import AppLayout from './AppLayout';
import RoleProtectedRoute from '../routes/RoleProtectedRoute';

export const EmployeeLayout: React.FC = () => (
  <RoleProtectedRoute allowedRoles={['Employee']}>
    <AppLayout />
  </RoleProtectedRoute>
);

export default EmployeeLayout;
