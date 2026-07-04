import { Router } from 'express';
import { getMyOrAllPayroll, createPayroll, updatePayroll } from '../controllers/payroll.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply authMiddleware globally to all payroll requests
router.use(authMiddleware);

router.get('/', roleMiddleware('Admin', 'Employee'), getMyOrAllPayroll);
router.post('/', roleMiddleware('Admin'), createPayroll);
router.put('/:id', roleMiddleware('Admin'), updatePayroll);

export default router;
