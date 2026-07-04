import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.js';
import { AuthRequest } from '../types/express.js';
import EmployeeProfile from '../models/employeeProfile.js';
import { generateEmployeeId } from './employee.js';

const AUTH_COOKIE_NAME = 'hrms_auth';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const clearAuthCookie = (res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};

const generateToken = (id: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured on the server');
  }
  return jwt.sign({ id, email, role }, secret, {
    expiresIn: '24h',
  });
};

const generateTemporaryPassword = () => {
  return crypto.randomBytes(18).toString('base64url');
};

const splitEmployeeName = (employeeName: string) => {
  const parts = employeeName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || 'Employee';

  return { firstName, lastName };
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
    return 'A user account with this email already exists';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected server error occurred';
};

export const signup = async (req: Request, res: Response) => {
  const { email, password, role, companyName, employeeName, phone } = req.body;

  if (!email || !companyName || !employeeName || !phone) {
    return res.status(400).json({
      status: 'error',
      message: 'Company name, employee name, email, and phone number are required',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ status: 'error', message: 'Please provide a valid email address' });
  }

  if (password && String(password).length < 6) {
    return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters long' });
  }

  const allowedRoles = ['Admin', 'HR', 'Employee'];
  const userCount = await User.countDocuments();
  const userRole = userCount === 0 ? 'Admin' : (role || 'Employee');

  if (!allowedRoles.includes(userRole)) {
    return res.status(400).json({ status: 'error', message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}` });
  }

  if (userRole !== 'Employee' && userCount > 0) {
    return res.status(403).json({
      status: 'error',
      message: 'Only an administrator can create HR or Admin accounts',
    });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'A user with this email already exists' });
    }

    const { firstName, lastName } = splitEmployeeName(String(employeeName));
    if (!firstName) {
      return res.status(400).json({ status: 'error', message: 'Employee name is required' });
    }

    const dateOfJoining = new Date();
    const loginId = await generateEmployeeId(String(companyName), firstName, lastName, dateOfJoining);
    const accountPassword = password || generateTemporaryPassword();

    const user = new User({
      email: normalizedEmail,
      password: accountPassword,
      role: userRole,
      loginId,
    });

    await user.save();

    try {
      await EmployeeProfile.create({
        user: user._id,
        employeeId: loginId,
        firstName,
        lastName,
        gender: 'Other',
        dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
        contactNumber: String(phone).trim(),
        emergencyContact: {
          name: 'Not provided',
          relationship: 'Not provided',
          phone: String(phone).trim(),
        },
        address: 'Not provided',
        department: 'Operations',
        designation: 'Employee',
        dateOfJoining,
        salary: 0,
        status: 'Active',
      });
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    return res.status(201).json({
      status: 'success',
      message: 'Employee account created successfully',
      token,
      employeeId: loginId,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: getErrorMessage(error) });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { loginId: email.toUpperCase() }
      ]
    });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ status: 'error', message: 'Account has been deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    return res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    status: 'success',
    user: req.user,
  });
};

export const logout = async (_req: Request, res: Response) => {
  clearAuthCookie(res);

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
