import React from 'react';
import AppLayout from './AppLayout';
import RoleProtectedRoute from '../routes/RoleProtectedRoute';

export const AdminLayout: React.FC = () => (
  <RoleProtectedRoute allowedRoles={['Admin', 'HR', 'HR Officer']}>
    <AppLayout />
  </RoleProtectedRoute>
);

export default AdminLayout;
