import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  checkExists,
  checkEmail,
  forgotPassword,
  verifyOtp,
  resetPassword,
  uploadAvatar,
  deleteAccount,
} from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/check-exists', checkExists);
router.post('/check-email', checkEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/upload-avatar', authenticate, uploadAvatar);
router.post('/change-password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);

export default router;
