import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  checkExists,
  checkEmail,
  resetPassword,
} from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/check-exists', checkExists);
router.post('/check-email', checkEmail);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
