import { Router } from 'express';
import { checkIn, checkOut, getAttendanceLogs, flagMissingAttendance } from '../controllers/attendance.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply authMiddleware globally to attendance records
router.use(authMiddleware);

router.get('/', getAttendanceLogs);
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.post('/flag-missing', roleMiddleware('Admin', 'HR'), flagMissingAttendance);

export default router;
