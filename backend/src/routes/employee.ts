import { Router } from 'express';
import { createEmployee, searchEmployees, deleteEmployee } from '../controllers/employee.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();

// Endpoint restricted to Admin and HR users
router.get('/', authMiddleware, roleMiddleware('Admin', 'HR'), searchEmployees);

// Endpoint restricted to Admin users
router.post('/', authMiddleware, roleMiddleware('Admin'), createEmployee);

// Admin-only employee deletion route
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteEmployee);

export default router;
