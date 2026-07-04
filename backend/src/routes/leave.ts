import { Router } from 'express';
import { getLeaves, requestLeave, updateLeaveStatus } from '../controllers/leave.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { leaveUpload } from '../middleware/leaveUpload.js';

const router = Router();

// Apply authMiddleware globally to leave requests
router.use(authMiddleware);

router.get('/', getLeaves);
router.post('/', leaveUpload.single('attachment'), requestLeave);
router.patch('/:leaveId/status', roleMiddleware('Admin', 'HR'), updateLeaveStatus);

export default router;
