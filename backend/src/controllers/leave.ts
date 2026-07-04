import { Response } from 'express';
import fs from 'fs';
import { AuthRequest } from '../types/express.js';
import Leave from '../models/leave.js';
import User from '../models/user.js';
import { spawnNotification } from './notification.js';

const countLeaveDays = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1);
};

export const getLeaves = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
  }

  try {
    const page = Math.max(1, parseInt(String(req.query.page || 1), 10));
    const limit = Math.max(1, parseInt(String(req.query.limit || 10), 10));
    const status = req.query.status as string | undefined;
    const isAdminOrHR = req.user.role === 'Admin' || req.user.role === 'HR';
    const query: any = {};

    if (!isAdminOrHR) {
      query.employee = req.user.id;
    } else if (req.query.employeeId) {
      query.employee = req.query.employeeId;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const totalDocs = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'email role loginId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const currentYear = new Date().getFullYear();
    const yearlyLeaves = await Leave.find({
      ...query,
      startDate: {
        $gte: new Date(Date.UTC(currentYear, 0, 1)),
        $lte: new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)),
      },
    });

    const approvedByType = yearlyLeaves
      .filter((leave) => leave.status === 'Approved')
      .reduce(
        (summary, leave) => {
          summary[leave.leaveType] += countLeaveDays(leave.startDate, leave.endDate);
          return summary;
        },
        { Paid: 0, Sick: 0, Unpaid: 0 } as Record<'Paid' | 'Sick' | 'Unpaid', number>
      );

    const summary = {
      pendingCount: await Leave.countDocuments({ ...query, status: 'Pending' }),
      approvedCount: await Leave.countDocuments({ ...query, status: 'Approved' }),
      rejectedCount: await Leave.countDocuments({ ...query, status: 'Rejected' }),
      paidTaken: approvedByType.Paid,
      sickTaken: approvedByType.Sick,
      unpaidTaken: approvedByType.Unpaid,
      paidRemaining: Math.max(0, 18 - approvedByType.Paid),
      sickRemaining: Math.max(0, 10 - approvedByType.Sick),
    };

    return res.status(200).json({
      status: 'success',
      data: {
        leaves,
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: page,
        summary,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

export const requestLeave = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
  }

  const { leaveType, startDate, endDate, reason } = req.body;

  // Cleanup helper on validation error
  const cleanupFile = async () => {
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        // ignore
      }
    }
  };

  // Required parameters verification
  if (!leaveType || !startDate || !endDate || !reason) {
    await cleanupFile();
    return res.status(400).json({
      status: 'error',
      message: 'All parameters (leaveType, startDate, endDate, reason) are required',
    });
  }

  // Validate type values
  const allowedTypes = ['Paid', 'Sick', 'Unpaid'];
  if (!allowedTypes.includes(leaveType)) {
    await cleanupFile();
    return res.status(400).json({
      status: 'error',
      message: `Invalid leaveType. Allowed values: ${allowedTypes.join(', ')}`,
    });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      await cleanupFile();
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date values provided',
      });
    }

    // Verify date range
    if (end < start) {
      await cleanupFile();
      return res.status(400).json({
        status: 'error',
        message: 'End date must be greater than or equal to start date',
      });
    }

    // Create the leave record
    const leave = new Leave({
      employee: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      attachment: req.file ? `/uploads/leaves/${req.file.filename}` : null,
      status: 'Pending',
    });

    await leave.save();

    // Notify all Admin & HR users about the new leave request
    try {
      const adminAndHRUsers = await User.find({ role: { $in: ['Admin', 'HR'] } });
      for (const recipient of adminAndHRUsers) {
        await spawnNotification(
          recipient._id,
          'New Leave Request',
          `A new ${leaveType} leave request has been submitted (${start.toDateString()} – ${end.toDateString()}).`,
          'New_Leave'
        );
      }
    } catch (notifErr) {
      console.error('Failed to spawn leave request notifications:', notifErr);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Leave request submitted successfully',
      data: leave,
    });
  } catch (error) {
    await cleanupFile();
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: User session not found' });
  }

  const { leaveId } = req.params;
  const { status, adminComment } = req.body;

  // Validation 1: ensure status is Approved or Rejected
  const allowedStatuses = ['Approved', 'Rejected'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
    });
  }

  try {
    // Validation 2: query the leave document
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ status: 'error', message: 'Leave request not found' });
    }

    // Validation 3: verify it is currently Pending
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending leave requests can be approved or rejected',
      });
    }

    // Apply updates
    leave.status = status as any;
    leave.adminComment = adminComment || null;
    leave.approvedBy = req.user.id as any;
    leave.approvedAt = new Date();

    await leave.save();

    // Audit log
    const timestamp = new Date().toISOString();
    console.log(
      `[AUDIT LOG] [${timestamp}] Leave Status Updated. Request ID: ${leave._id}, Target Employee User: ${leave.employee}, Action: ${status}, Performed By: ${req.user.id}, Comment: "${adminComment || 'None'}"`
    );

    // Notify the employee whose leave was approved or rejected
    try {
      const notifType = status === 'Approved' ? 'Leave_Approved' : 'Leave_Rejected';
      const notifTitle = status === 'Approved' ? 'Leave Request Approved' : 'Leave Request Rejected';
      const notifMessage =
        status === 'Approved'
          ? `Your ${leave.leaveType} leave request has been approved.${adminComment ? ` Note: ${adminComment}` : ''}`
          : `Your ${leave.leaveType} leave request has been rejected.${adminComment ? ` Reason: ${adminComment}` : ''}`;
      await spawnNotification(leave.employee, notifTitle, notifMessage, notifType);
    } catch (notifErr) {
      console.error('Failed to spawn leave status notification:', notifErr);
    }

    return res.status(200).json({
      status: 'success',
      message: `Leave request has been ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
