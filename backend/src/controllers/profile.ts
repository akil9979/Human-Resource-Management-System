import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../types/express.js';
import EmployeeProfile from '../models/employeeProfile.js';

export const getProfile = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'User ID parameter is required' });
  }

  try {
    const profile = await EmployeeProfile.findOne({ user: userId }).populate('user', 'email role loginId');
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Employee profile not found' });
    }
    return res.status(200).json({ status: 'success', data: profile });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'User ID parameter is required' });
  }

  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
  }

  // Permission checks: Non-Admin can only update their own profile
  const isSelf = req.user.id === userId;
  const isAdmin = req.user.role === 'Admin';

  if (!isAdmin && !isSelf) {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: You do not have permission to modify other employee files',
    });
  }

  try {
    let updateData: any = {};

    if (isAdmin) {
      // Admin can update all fields
      updateData = { ...req.body };
      // Prevent modification of read-only system linkages
      delete updateData.user;
      delete updateData.employeeId;
    } else {
      // Employee can update only: Phone, Address, Profile Picture, About, Skills, Certificates
      const allowedEmployeeFields = [
        'contactNumber',
        'address',
        'profilePicture',
        'about',
        'skills',
        'certificates',
        'emergencyContact',
      ];

      for (const field of allowedEmployeeFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
    }

    const updatedProfile = await EmployeeProfile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('user', 'email role loginId');

    if (!updatedProfile) {
      return res.status(404).json({ status: 'error', message: 'Employee profile not found' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'User ID parameter is required' });
  }

  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
  }

  // Permission check: Admins or the user themselves
  const isSelf = req.user.id === userId;
  const isAdmin = req.user.role === 'Admin';

  if (!isAdmin && !isSelf) {
    // If a file was uploaded by multer, clean it up immediately
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        // ignore
      }
    }
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: You do not have permission to change other employee photos',
    });
  }

  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded or file validation failed' });
  }

  try {
    const profile = await EmployeeProfile.findOne({ user: userId });
    if (!profile) {
      // Clean up uploaded file
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        // ignore
      }
      return res.status(404).json({ status: 'error', message: 'Employee profile not found' });
    }

    // Replace old image: Delete old local file if present
    if (profile.profilePicture && profile.profilePicture.startsWith('/uploads/')) {
      const oldFileName = profile.profilePicture.replace('/uploads/', '');
      const oldFilePath = path.join(path.resolve('uploads'), oldFileName);
      
      try {
        if (fs.existsSync(oldFilePath)) {
          await fs.promises.unlink(oldFilePath);
        }
      } catch (unlinkError) {
        console.error('Error removing old profile image:', unlinkError);
        // Do not fail the request if unlinking fails
      }
    }

    // Set new profile image path
    profile.profilePicture = `/uploads/${req.file.filename}`;
    await profile.save();

    return res.status(200).json({
      status: 'success',
      message: 'Profile picture uploaded successfully',
      profilePicture: profile.profilePicture,
    });
  } catch (error) {
    // Clean up uploaded file on DB save failure
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        // ignore
      }
    }
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
