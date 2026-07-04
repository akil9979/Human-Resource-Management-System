import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/profile.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Apply authMiddleware globally to all profile operations
router.use(authMiddleware);

router.get('/:userId', getProfile);
router.put('/:userId', updateProfile);
router.post('/:userId/avatar', upload.single('avatar'), uploadAvatar);

export default router;
