import { Router } from 'express';
import { signup, signin, getMe, logout } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
