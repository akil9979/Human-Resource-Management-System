"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient reference is required'],
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: {
            values: ['Leave_Approved', 'Leave_Rejected', 'Attendance_Missing', 'New_Leave', 'New_Employee'],
            message: '{VALUE} is not a valid notification type',
        },
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false,
});
// Index on recipient + isRead for fast unread list queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
exports.default = exports.Notification;
