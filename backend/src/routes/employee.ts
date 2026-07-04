import { Router } from 'express';
import { createEmployee } from '../controllers/employee.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();

// Endpoint restricted to Admin and HR users
router.post('/', authMiddleware, roleMiddleware('Admin', 'HR'), createEmployee);

export default router;
