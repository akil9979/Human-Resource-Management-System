import { Request, Response } from 'express';
import User from '../models/user.js';
import EmployeeProfile from '../models/employeeProfile.js';

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

export const createEmployee = async (req: Request, res: Response) => {
  const {
    email,
    password,
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
    !password ||
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

  try {
    // Check if email already taken
    const existingUser = await User.findOne({ email });
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
      email,
      password,
      role: 'Employee',
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
