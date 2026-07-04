"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.updateProfile = exports.getProfile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const employeeProfile_js_1 = __importDefault(require("../models/employeeProfile.js"));
const getProfile = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID parameter is required' });
    }
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
    }
    const isSelf = req.user.id === userId;
    const canManageProfiles = req.user.role === 'Admin' || req.user.role === 'HR';
    if (!canManageProfiles && !isSelf) {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: You do not have permission to view other employee profiles',
        });
    }
    try {
        const profile = await employeeProfile_js_1.default.findOne({ user: userId }).populate('user', 'email role loginId');
        if (!profile) {
            return res.status(404).json({ status: 'error', message: 'Employee profile not found' });
        }
        return res.status(200).json({ status: 'success', data: profile });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID parameter is required' });
    }
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
    }
    // Permission checks: Employee can only update their own profile; Admin/HR can manage employee profiles
    const isSelf = req.user.id === userId;
    const canManageProfiles = req.user.role === 'Admin' || req.user.role === 'HR';
    if (!canManageProfiles && !isSelf) {
        return res.status(403).json({
            status: 'error',
            message: 'Forbidden: You do not have permission to modify other employee files',
        });
    }
    try {
        let updateData = {};
        if (canManageProfiles) {
            // Admin/HR can update all profile fields
            updateData = { ...req.body };
            // Prevent modification of read-only system linkages
            delete updateData.user;
            delete updateData.employeeId;
        }
        else {
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
        const updatedProfile = await employeeProfile_js_1.default.findOneAndUpdate({ user: userId }, { $set: updateData }, { new: true, runValidators: true }).populate('user', 'email role loginId');
        if (!updatedProfile) {
            return res.status(404).json({ status: 'error', message: 'Employee profile not found' });
        }
        return res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: updatedProfile,
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.updateProfile = updateProfile;
const uploadAvatar = async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID parameter is required' });
    }
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
    }
    // Permission check: Admin/HR or the user themselves
    const isSelf = req.user.id === userId;
    const canManageProfiles = req.user.role === 'Admin' || req.user.role === 'HR';
    if (!canManageProfiles && !isSelf) {
        // If a file was uploaded by multer, clean it up immediately
        if (req.file) {
            try {
                await fs_1.default.promises.unlink(req.file.path);
            }
            catch (err) {
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
        const profile = await employeeProfile_js_1.default.findOne({ user: userId });
        if (!profile) {
            // Clean up uploaded file
            try {
                await fs_1.default.promises.unlink(req.file.path);
            }
            catch (err) {
                // ignore
            }
            return res.status(404).json({ status: 'error', message: 'Employee profile not found' });
        }
        // Replace old image: Delete old local file if present
        if (profile.profilePicture && profile.profilePicture.startsWith('/uploads/')) {
            const oldFileName = profile.profilePicture.replace('/uploads/', '');
            const oldFilePath = path_1.default.join(path_1.default.resolve('uploads'), oldFileName);
            try {
                if (fs_1.default.existsSync(oldFilePath)) {
                    await fs_1.default.promises.unlink(oldFilePath);
                }
            }
            catch (unlinkError) {
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
    }
    catch (error) {
        // Clean up uploaded file on DB save failure
        if (req.file) {
            try {
                await fs_1.default.promises.unlink(req.file.path);
            }
            catch (err) {
                // ignore
            }
        }
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.uploadAvatar = uploadAvatar;
