import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { AuthRequest } from '../types/express.js';

const generateToken = (id: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured on the server');
  }
  return jwt.sign({ id, email, role }, secret, {
    expiresIn: '24h',
  });
};

export const signup = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });
  }

  // Validate role selection
  const allowedRoles = ['Admin', 'HR', 'Employee'];
  const userRole = role || 'Employee';
  if (!allowedRoles.includes(userRole)) {
    return res.status(400).json({ status: 'error', message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}` });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'A user with this email already exists' });
    }

    const user = new User({
      email,
      password,
      role: userRole,
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.email, user.role);

    return res.status(201).json({
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

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
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
