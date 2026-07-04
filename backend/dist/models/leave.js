"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leave = void 0;
const mongoose_1 = require("mongoose");
const leaveSchema = new mongoose_1.Schema({
    employee: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Employee reference is required'],
    },
    leaveType: {
        type: String,
        required: [true, 'Leave type is required'],
        enum: {
            values: ['Paid', 'Sick', 'Unpaid'],
            message: '{VALUE} is not a valid leave type',
        },
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (value) {
                // If this.startDate is defined, validate that endDate >= startDate
                return !this.startDate || value >= this.startDate;
            },
            message: 'End date must be greater than or equal to start date',
        },
    },
    reason: {
        type: String,
        required: [true, 'Reason for leave is required'],
        trim: true,
    },
    attachment: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Approved', 'Rejected'],
            message: '{VALUE} is not a valid leave status',
        },
        default: 'Pending',
    },
    adminComment: {
        type: String,
        default: null,
        trim: true,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    approvedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
exports.Leave = (0, mongoose_1.model)('Leave', leaveSchema);
exports.default = exports.Leave;
