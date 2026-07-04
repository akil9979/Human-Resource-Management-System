import type { UserPayload } from '../context/AuthContext';

export const isAdminOrHr = (role: UserPayload['role'] | undefined): boolean => {
  return role === 'Admin' || role === 'HR';
};

export const getRoleRedirectPath = (role: UserPayload['role'] | undefined): string => {
  return isAdminOrHr(role) ? '/admin/dashboard' : '/dashboard';
};
