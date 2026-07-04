"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOut = exports.checkIn = exports.getAttendanceLogs = void 0;
const attendance_js_1 = __importDefault(require("../models/attendance.js"));
const user_js_1 = __importDefault(require("../models/user.js"));
const employeeProfile_js_1 = __importDefault(require("../models/employeeProfile.js"));
const getAttendanceLogs = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const date = req.query.date;
        const status = req.query.status;
        const month = req.query.month;
        const year = req.query.year;
        const isAdminOrHR = req.user.role === 'Admin' || req.user.role === 'HR';
        const query = {};
        // Enforce role isolation
        if (!isAdminOrHR) {
            query.employee = req.user.id;
        }
        else {
            if (req.query.employeeId) {
                query.employee = req.query.employeeId;
            }
        }
        // Apply Search (Admin/HR only)
        if (search && isAdminOrHR) {
            const matchedUsers = await user_js_1.default.find({
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { loginId: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');
            const matchedUserIds = matchedUsers.map(u => u._id);
            const matchedProfiles = await employeeProfile_js_1.default.find({
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                ],
            }).select('user');
            const profileUserIds = matchedProfiles.map(p => p.user);
            const combinedUserIds = Array.from(new Set([...matchedUserIds, ...profileUserIds]));
            query.employee = { $in: combinedUserIds };
        }
        // Apply Date filters
        if (date) {
            const targetDate = new Date(date);
            targetDate.setUTCHours(0, 0, 0, 0);
            query.date = targetDate;
        }
        else if (month || year) {
            const filterYear = year ? parseInt(year) : new Date().getFullYear();
            const filterMonth = month ? parseInt(month) - 1 : new Date().getMonth();
            const startDate = new Date(Date.UTC(filterYear, filterMonth, 1));
            const endDate = new Date(Date.UTC(filterYear, filterMonth + 1, 0, 23, 59, 59, 999));
            query.date = { $gte: startDate, $lte: endDate };
        }
        // Apply Status filter
        if (status) {
            query.status = status;
        }
        // Pagination variables
        const skip = (page - 1) * limit;
        const totalDocs = await attendance_js_1.default.countDocuments(query);
        // Fetch and populate User
        const docs = await attendance_js_1.default.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('employee', 'email role loginId');
        // Batch populate profiles
        const targetUserIds = docs.map(doc => doc.employee._id);
        const profiles = await employeeProfile_js_1.default.find({ user: { $in: targetUserIds } })
            .select('user firstName lastName department designation');
        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.user.toString()] = p;
        });
        const formattedDocs = docs.map(doc => {
            const docObj = doc.toObject();
            const profile = profileMap[docObj.employee._id.toString()];
            return {
                ...docObj,
                employee: {
                    ...docObj.employee,
                    firstName: profile?.firstName || '',
                    lastName: profile?.lastName || '',
                    department: profile?.department || '',
                    designation: profile?.designation || '',
                },
            };
        });
        // Compute Monthly Summary
        const summaryYear = year ? parseInt(year) : new Date().getFullYear();
        const summaryMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const startSummaryDate = new Date(Date.UTC(summaryYear, summaryMonth, 1));
        const endSummaryDate = new Date(Date.UTC(summaryYear, summaryMonth + 1, 0, 23, 59, 59, 999));
        const summaryQuery = {
            date: { $gte: startSummaryDate, $lte: endSummaryDate },
        };
        if (!isAdminOrHR) {
            summaryQuery.employee = req.user.id;
        }
        else if (req.query.employeeId) {
            summaryQuery.employee = req.query.employeeId;
        }
        else if (query.employee) {
            summaryQuery.employee = query.employee;
        }
        const summaryLogs = await attendance_js_1.default.find(summaryQuery);
        let totalWorkHours = 0;
        let totalExtraHours = 0;
        let presentCount = 0;
        let leaveCount = 0;
        summaryLogs.forEach(log => {
            totalWorkHours += log.workHours || 0;
            totalExtraHours += log.extraHours || 0;
            if (['Present', 'Late', 'Half Day'].includes(log.status)) {
                presentCount++;
            }
            if (['On Leave', 'Leave'].includes(log.status)) {
                leaveCount++;
            }
        });
        const summary = {
            workHours: Math.round(totalWorkHours * 100) / 100,
            extraHours: Math.round(totalExtraHours * 100) / 100,
            presentCount,
            leaveCount,
        };
        return res.status(200).json({
            status: 'success',
            data: {
                docs: formattedDocs,
                totalDocs,
                totalPages: Math.ceil(totalDocs / limit),
                currentPage: page,
                summary,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getAttendanceLogs = getAttendanceLogs;
const checkIn = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
    }
    try {
        // Truncate current server time to midnight to resolve "today"
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        // Prevent duplicate check-in by querying existing entry for today
        const existingAttendance = await attendance_js_1.default.findOne({
            employee: req.user.id,
            date: today,
        });
        if (existingAttendance) {
            return res.status(400).json({
                status: 'error',
                message: 'You have already checked in for today',
            });
        }
        // Create new attendance record
        const attendance = new attendance_js_1.default({
            employee: req.user.id,
            date: today,
            checkIn: new Date(), // exact current timestamp
            status: 'Present',
            location: 'Office', // default office
        });
        await attendance.save();
        return res.status(201).json({
            status: 'success',
            message: 'Checked in successfully',
            data: attendance,
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.checkIn = checkIn;
const checkOut = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
    }
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        // Find today's attendance record for the employee
        const attendance = await attendance_js_1.default.findOne({
            employee: req.user.id,
            date: today,
        });
        // Prevent checkout before checkin
        if (!attendance) {
            return res.status(400).json({
                status: 'error',
                message: 'You have not checked in for today yet',
            });
        }
        // Prevent multiple checkouts
        if (attendance.checkOut) {
            return res.status(400).json({
                status: 'error',
                message: 'You have already checked out for today',
            });
        }
        // Capture Check-Out timestamp
        const checkOutTime = new Date();
        // Calculate Working Hours: (CheckOut - CheckIn) in hours
        const msDiff = checkOutTime.getTime() - attendance.checkIn.getTime();
        const hours = msDiff / (3600 * 1000);
        const workHours = Math.round(hours * 100) / 100; // Round to 2 decimal places
        // Calculate Extra Hours (Overtime): shift exceeds 8 hours
        const extraHours = Math.max(0, workHours - 8);
        // Save updates
        attendance.checkOut = checkOutTime;
        attendance.workHours = workHours;
        attendance.extraHours = Math.round(extraHours * 100) / 100;
        await attendance.save();
        return res.status(200).json({
            status: 'success',
            message: 'Checked out successfully',
            data: attendance,
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.checkOut = checkOut;
