import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import Notification from '../models/notification.js';

/**
 * Utility helper to spawn notifications in database.
 * Accessible from other controllers — always wrapped in try/catch at call site.
 */
export const spawnNotification = async (
  recipientId: string | object,
  title: string,
  message: string,
  type: 'Leave_Approved' | 'Leave_Rejected' | 'Attendance_Missing' | 'New_Leave' | 'New_Employee'
) => {
  try {
    const notif = new Notification({ recipient: recipientId, title, message, type });
    await notif.save();
  } catch (error) {
    console.error('[SPAWN NOTIFICATION ERROR]:', error);
  }
};

/**
 * GET /api/notifications
 * Returns the 50 most-recent notifications for the logged-in user.
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read (scoped to the calling user).
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  const { id } = req.params;
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }
    return res.status(200).json({ status: 'success', message: 'Notification marked as read', data: notification });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all unread notifications for the user as read.
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    return res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
