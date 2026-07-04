import { Router } from 'express';
import { checkIn, checkOut, getAttendanceLogs } from '../controllers/attendance.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply authMiddleware globally to attendance records
router.use(authMiddleware);

router.get('/', getAttendanceLogs);
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);

export default router;
