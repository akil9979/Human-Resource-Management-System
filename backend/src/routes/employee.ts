import { Router } from 'express';
import { createEmployee, searchEmployees } from '../controllers/employee.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();

// Endpoint to search and list employees (accessible by authenticated users)
router.get('/', authMiddleware, searchEmployees);

// Endpoint restricted to Admin and HR users
router.post('/', authMiddleware, roleMiddleware('Admin', 'HR'), createEmployee);

export default router;
