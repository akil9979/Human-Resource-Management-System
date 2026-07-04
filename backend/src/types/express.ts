import { Request } from 'express';

export type AuthRole = 'Admin' | 'HR' | 'Manager' | 'Employee';

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
