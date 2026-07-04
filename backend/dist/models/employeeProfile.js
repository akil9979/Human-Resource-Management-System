"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeProfile = void 0;
const mongoose_1 = require("mongoose");
const employeeProfileSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        unique: true,
    },
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true,
        match: [/^(EMP-\d{4}-\d{4}|[A-Z]{6}\d{8})$/, 'Employee ID must be in the format EMP-YYYY-XXXX or standard generated Login ID (e.g., OIJODO20250001)'],
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: '{VALUE} is not a valid gender option',
        },
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (value) {
                return value < new Date();
            },
            message: 'Date of birth must be in the past',
        },
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        trim: true,
    },
    emergencyContact: {
        name: {
            type: String,
            required: [true, 'Emergency contact name is required'],
            trim: true,
        },
        relationship: {
            type: String,
            required: [true, 'Relationship is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Emergency contact phone is required'],
            trim: true,
        },
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: {
            values: ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Operations'],
            message: '{VALUE} is not a valid department',
        },
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true,
    },
    dateOfJoining: {
        type: Date,
        required: [true, 'Date of joining is required'],
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required'],
        min: [0, 'Salary cannot be negative'],
    },
    manager: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'On Leave', 'Terminated', 'Resigned'],
            message: '{VALUE} is not a valid status',
        },
        default: 'Active',
    },
    profilePicture: {
        type: String,
        default: '',
    },
    about: {
        type: String,
        default: '',
    },
    skills: {
        type: [String],
        default: [],
    },
    certificates: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
exports.EmployeeProfile = (0, mongoose_1.model)('EmployeeProfile', employeeProfileSchema);
exports.default = exports.EmployeeProfile;
