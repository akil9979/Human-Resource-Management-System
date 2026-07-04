import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All notification routes require a valid JWT
router.use(authMiddleware);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
