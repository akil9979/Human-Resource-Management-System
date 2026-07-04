"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployee = exports.generateEmployeeId = void 0;
const user_js_1 = __importDefault(require("../models/user.js"));
const employeeProfile_js_1 = __importDefault(require("../models/employeeProfile.js"));
// Sequential Employee Login ID Generator
const generateEmployeeId = async (companyName, firstName, lastName, joiningDate) => {
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
    const lastProfile = await employeeProfile_js_1.default.findOne({
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
exports.generateEmployeeId = generateEmployeeId;
const createEmployee = async (req, res) => {
    const { email, password, companyName, firstName, lastName, gender, dateOfBirth, contactNumber, emergencyContact, address, department, designation, dateOfJoining, salary, manager, } = req.body;
    // Basic required fields validation
    if (!email ||
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
        salary === undefined) {
        return res.status(400).json({ status: 'error', message: 'All required employee fields must be provided' });
    }
    try {
        // Check if email already taken
        const existingUser = await user_js_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'A user account with this email already exists' });
        }
        // 1. Generate unique sequential login ID
        const loginId = await (0, exports.generateEmployeeId)(companyName, firstName, lastName, new Date(dateOfJoining));
        // 2. Create the User account
        const user = new user_js_1.default({
            email,
            password,
            role: 'Employee',
            loginId,
        });
        await user.save();
        // 3. Create the Employee Profile
        const profile = new employeeProfile_js_1.default({
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
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createEmployee = createEmployee;
