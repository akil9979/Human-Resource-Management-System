"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payroll = void 0;
const mongoose_1 = require("mongoose");
const payrollSchema = new mongoose_1.Schema({
    employee: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Employee reference is required'],
    },
    month: {
        type: Number,
        required: [true, 'Payroll month is required'],
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
    },
    year: {
        type: Number,
        required: [true, 'Payroll year is required'],
        min: [2000, 'Year must be greater than or equal to 2000'],
    },
    basic: {
        type: Number,
        required: [true, 'Basic wage value is required'],
        min: [0, 'Basic value cannot be negative'],
    },
    hra: {
        type: Number,
        default: 0,
        min: [0, 'HRA cannot be negative'],
    },
    allowance: {
        type: Number,
        default: 0,
        min: [0, 'Allowance cannot be negative'],
    },
    bonus: {
        type: Number,
        default: 0,
        min: [0, 'Bonus cannot be negative'],
    },
    pf: {
        type: Number,
        default: 0,
        min: [0, 'PF cannot be negative'],
    },
    professionalTax: {
        type: Number,
        default: 0,
        min: [0, 'Professional tax cannot be negative'],
    },
    workingDays: {
        type: Number,
        required: [true, 'Working days is required'],
        min: [0, 'Working days cannot be negative'],
    },
    wageType: {
        type: String,
        required: [true, 'Wage type is required'],
        enum: {
            values: ['Monthly', 'Hourly', 'Daily'],
            message: '{VALUE} is not a valid wage type',
        },
        default: 'Monthly',
    },
    monthlySalary: {
        type: Number,
        required: [true, 'Monthly salary is required'],
        min: [0, 'Monthly salary cannot be negative'],
    },
    yearlySalary: {
        type: Number,
        required: [true, 'Yearly salary is required'],
        min: [0, 'Yearly salary cannot be negative'],
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Processed', 'Paid'],
            message: '{VALUE} is not a valid payroll status',
        },
        default: 'Pending',
    },
    paymentDate: {
        type: Date,
        default: null,
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['Bank Transfer', 'Cheque', 'Cash'],
            message: '{VALUE} is not a valid payment method',
        },
        default: 'Bank Transfer',
    },
}, {
    timestamps: true,
});
// Pre-validate hook to calculate monthlySalary and yearlySalary automatically
payrollSchema.pre('validate', function (next) {
    const basic = this.basic || 0;
    const hra = this.hra || 0;
    const allowance = this.allowance || 0;
    const bonus = this.bonus || 0;
    const pf = this.pf || 0;
    const professionalTax = this.professionalTax || 0;
    const totalEarnings = basic + hra + allowance + bonus;
    const totalDeductions = pf + professionalTax;
    this.monthlySalary = Math.max(0, totalEarnings - totalDeductions);
    this.yearlySalary = this.monthlySalary * 12;
    next();
});
// Ensure a single payroll run per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
exports.Payroll = (0, mongoose_1.model)('Payroll', payrollSchema);
exports.default = exports.Payroll;
