"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = exports.spawnNotification = void 0;
const notification_js_1 = __importDefault(require("../models/notification.js"));
/**
 * Utility helper to spawn notifications in database.
 * Accessible from other controllers — always wrapped in try/catch at call site.
 */
const spawnNotification = async (recipientId, title, message, type) => {
    try {
        const notif = new notification_js_1.default({ recipient: recipientId, title, message, type });
        await notif.save();
    }
    catch (error) {
        console.error('[SPAWN NOTIFICATION ERROR]:', error);
    }
};
exports.spawnNotification = spawnNotification;
/**
 * GET /api/notifications
 * Returns the 50 most-recent notifications for the logged-in user.
 */
const getNotifications = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    try {
        const notifications = await notification_js_1.default.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        return res.status(200).json({ status: 'success', data: notifications });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getNotifications = getNotifications;
/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read (scoped to the calling user).
 */
const markAsRead = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const { id } = req.params;
    try {
        const notification = await notification_js_1.default.findOneAndUpdate({ _id: id, recipient: req.user.id }, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }
        return res.status(200).json({ status: 'success', message: 'Notification marked as read', data: notification });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.markAsRead = markAsRead;
/**
 * PATCH /api/notifications/read-all
 * Marks all unread notifications for the user as read.
 */
const markAllAsRead = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    try {
        await notification_js_1.default.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
        return res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.markAllAsRead = markAllAsRead;
