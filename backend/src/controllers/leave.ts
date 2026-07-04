import { Response } from 'express';
import fs from 'fs';
import { AuthRequest } from '../types/express.js';
import Leave from '../models/leave.js';

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

    // Emits Audit Log to standard server logs
    const timestamp = new Date().toISOString();
    console.log(
      `[AUDIT LOG] [${timestamp}] Leave Status Updated. Request ID: ${leave._id}, Target Employee User: ${leave.employee}, Action: ${status}, Performed By: ${req.user.id}, Comment: "${adminComment || 'None'}"`
    );

    return res.status(200).json({
      status: 'success',
      message: `Leave request has been ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
