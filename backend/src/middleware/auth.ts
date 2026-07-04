import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthRole } from '../types/express.js';

const VALID_ROLES: AuthRole[] = ['Admin', 'HR', 'Manager', 'Employee'];

interface JwtUserPayload {
  id?: string;
  email?: string;
  role?: AuthRole;
}

const getCookieValue = (cookieHeader: string | undefined, name: string): string | undefined => {
  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  const cookieToken = getCookieValue(req.headers.cookie, 'hrms_auth');
  const token = bearerToken || cookieToken;
  const secret = process.env.JWT_SECRET;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied: No token provided' });
  }

  if (!secret) {
    return res.status(500).json({ status: 'error', message: 'Authentication is not configured on the server' });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtUserPayload;

    if (!decoded.id || !decoded.email || !decoded.role || !VALID_ROLES.includes(decoded.role)) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token payload' });
    }
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid or expired token' });
  }
};

export const roleMiddleware = (...allowedRoles: AuthRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Access credentials missing' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
