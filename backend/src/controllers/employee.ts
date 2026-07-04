import { Request, Response } from 'express';
import User from '../models/user.js';
import EmployeeProfile from '../models/employeeProfile.js';
import { spawnNotification } from './notification.js';
import { AuthRequest } from '../types/express.js';
import crypto from 'crypto';

// Sequential Employee Login ID Generator
export const generateEmployeeId = async (
  companyName: string,
  firstName: string,
  lastName: string,
  joiningDate: Date
): Promise<string> => {
  // Normalize strings and grab initials
  const comp = companyName.replace(/[^a-zA-Z]/g, '').padEnd(2, 'X');
  const first = firstName.replace(/[^a-zA-Z]/g, '').padEnd(2, 'X');
  const last = lastName.replace(/[^a-zA-Z]/g, '').padEnd(2, 'X');

  const companyPrefix = comp.substring(0, 2).toUpperCase();
  const firstPrefix = first.substring(0, 2).toUpperCase();
  const lastPrefix = last.substring(0, 2).toUpperCase();
  const year = new Date(joiningDate).getFullYear().toString();

  const prefix = `${companyPrefix}${firstPrefix}${lastPrefix}${year}`;

  // Find the highest existing serial number with this exact prefix
  const lastProfile = await EmployeeProfile.findOne({
    employeeId: new RegExp(`^${prefix}`),
  })
    .sort({ employeeId: -1 })
    .select('employeeId');

  let nextSerial = 1;
  if (lastProfile) {
    // Extract the serial number portion (last 4 characters)
    const lastSerialStr = lastProfile.employeeId.replace(prefix, '');
    const lastSerial = parseInt(lastSerialStr, 10);
    if (!isNaN(lastSerial)) {
      nextSerial = lastSerial + 1;
    }
  }

  // Format serial number with 4 digits (e.g., 0001, 0002)
  const serialStr = nextSerial.toString().padStart(4, '0');
  return `${prefix}${serialStr}`;
};

const generateTemporaryPassword = () => {
  return crypto.randomBytes(18).toString('base64url');
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  const {
    email,
    password,
    role,
    companyName,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    contactNumber,
    emergencyContact,
    address,
    department,
    designation,
    dateOfJoining,
    salary,
    manager,
  } = req.body;

  // Basic required fields validation
  if (
    !email ||
    !companyName ||
    !firstName ||
    !lastName ||
    !gender ||
    !dateOfBirth ||
    !contactNumber ||
    !emergencyContact ||
    !address ||
    !department ||
    !designation ||
    !dateOfJoining ||
    salary === undefined
  ) {
    return res.status(400).json({ status: 'error', message: 'All required employee fields must be provided' });
  }

  const allowedRoles = ['Admin', 'HR', 'Employee'];
  const requestedRole = role || 'Employee';
  if (!allowedRoles.includes(requestedRole)) {
    return res.status(400).json({ status: 'error', message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}` });
  }

  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ status: 'error', message: 'Only administrators are authorized to create accounts' });
  }

  try {
    // Check if email already taken
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'A user account with this email already exists' });
    }

    // 1. Generate unique sequential login ID
    const loginId = await generateEmployeeId(
      companyName,
      firstName,
      lastName,
      new Date(dateOfJoining)
    );

    // 2. Create the User account
    const user = new User({
      email: normalizedEmail,
      password: password || generateTemporaryPassword(),
      role: requestedRole,
      loginId,
    });
    await user.save();

    // 3. Create the Employee Profile
    const profile = new EmployeeProfile({
      user: user._id,
      employeeId: loginId,
      firstName,
      lastName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      contactNumber,
      emergencyContact,
      address,
      department,
      designation,
      dateOfJoining: new Date(dateOfJoining),
      salary,
      manager: manager || null,
      status: 'Active',
    });
    await profile.save();

    // Notify all Admin & HR users about the new employee
    try {
      const adminAndHRUsers = await User.find({ role: { $in: ['Admin', 'HR'] } });
      for (const recipient of adminAndHRUsers) {
        await spawnNotification(
          recipient._id,
          'New Employee Registered',
          `A new employee profile has been created for ${firstName} ${lastName} (Login ID: ${loginId}).`,
          'New_Employee'
        );
      }
    } catch (notifErr) {
      console.error('Failed to spawn new employee notifications:', notifErr);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      loginId,
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

export const searchEmployees = async (req: Request, res: Response) => {
  const { name, employeeId, department, designation, page, limit, sortBy, sortOrder } = req.query;

  // Build filters
  const filter: any = {};

  if (name) {
    filter.$or = [
      { firstName: new RegExp(String(name), 'i') },
      { lastName: new RegExp(String(name), 'i') },
    ];
  }
  if (employeeId) {
    filter.employeeId = new RegExp(String(employeeId), 'i');
  }
  if (department) {
    filter.department = new RegExp(String(department), 'i');
  }
  if (designation) {
    filter.designation = new RegExp(String(designation), 'i');
  }

  // Pagination parameters
  const pageNum = Math.max(1, parseInt(String(page || 1), 10));
  const limitNum = Math.max(1, parseInt(String(limit || 10), 10));
  const skip = (pageNum - 1) * limitNum;

  // Sorting parameters
  const sort: any = {};
  const allowedSortFields = ['firstName', 'lastName', 'employeeId', 'department', 'designation', 'dateOfJoining'];
  const sortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : 'employeeId';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  sort[sortField] = sortDirection;

  try {
    const total = await EmployeeProfile.countDocuments(filter);
    const profiles = await EmployeeProfile.find(filter)
      .populate('user', 'email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      status: 'success',
      data: {
        employees: profiles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

/**
 * DELETE /api/employees/:id
 * Admin-only endpoint to delete an employee profile and user account.
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const profile = await EmployeeProfile.findOne({ user: id });
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Employee profile not found' });
    }

    await EmployeeProfile.deleteOne({ user: id });
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
