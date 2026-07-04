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
    basicSalary: {
        type: Number,
        required: [true, 'Basic salary is required'],
        min: [0, 'Basic salary cannot be negative'],
    },
    allowances: {
        type: Number,
        default: 0,
        min: [0, 'Allowances cannot be negative'],
    },
    deductions: {
        type: Number,
        default: 0,
        min: [0, 'Deductions cannot be negative'],
    },
    netSalary: {
        type: Number,
        required: [true, 'Net salary is required'],
        min: [0, 'Net salary cannot be negative'],
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
// Pre-validate to automatically compute netSalary if not explicitly provided
payrollSchema.pre('validate', function (next) {
    const basic = this.basicSalary || 0;
    const allow = this.allowances || 0;
    const deduct = this.deductions || 0;
    this.netSalary = Math.max(0, basic + allow - deduct);
    next();
});
// Ensure a single payroll run per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
exports.Payroll = (0, mongoose_1.model)('Payroll', payrollSchema);
exports.default = exports.Payroll;
