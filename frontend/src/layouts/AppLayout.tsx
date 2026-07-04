import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Employee Portal',
  '/profile': 'My Profile',
  '/attendance': 'Attendance Ledger',
  '/leave': 'Leaves Management',
  '/payroll': 'Payroll System',
  '/admin/dashboard': 'Admin Overview',
  '/admin/employees': 'Employee Registry',
  '/admin/attendance': 'Attendance Ledger',
  '/admin/leaves': 'Leaves Management',
  '/admin/payroll': 'Payroll System',
};

export const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  const title = routeTitles[pathname] || (pathname.startsWith('/profile/') ? 'Profile file' : 'Dashboard');

  return (
    <DashboardLayout title={title}>
      <Outlet />
    </DashboardLayout>
  );
};

export default AppLayout;
