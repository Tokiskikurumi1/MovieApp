import { Router } from 'express';
import {
  getDashboardStats,
  getAdminMovies,
  createOrUpdateMovie,
  deleteMovie,
  getAdminUsers,
  toggleUserBan,
  updateUserVip,
  getAdminTransactions,
  getAdminComments,
  updateCommentStatus,
  deleteComment,
  dismissCommentReports,
  triggerCrawler,
} from '../controllers/adminController';
import {
  getAdminNotifications,
  createAdminNotification,
  deleteAdminNotification,
} from '../controllers/notificationController';

const router = Router();

// Thống kê Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Quản lý phim
router.get('/movies', getAdminMovies);
router.post('/movies', createOrUpdateMovie);
router.put('/movies/:id', createOrUpdateMovie);
router.delete('/movies/:id', deleteMovie);

// Quản lý người dùng & VIP
router.get('/users', getAdminUsers);
router.put('/users/:id/ban', toggleUserBan);
router.put('/users/:id/vip', updateUserVip);

// Quản lý giao dịch & Lịch sử thanh toán
router.get('/transactions', getAdminTransactions);

// Quản lý bình luận
router.get('/comments', getAdminComments);
router.put('/comments/:id/status', updateCommentStatus);
router.delete('/comments/:id', deleteComment);
router.post('/comments/:id/dismiss-reports', dismissCommentReports);

// Kích hoạt cào KKPhim
router.post('/crawler/run', triggerCrawler);

// Quản lý thông báo đẩy
router.get('/notifications', getAdminNotifications);
router.post('/notifications', createAdminNotification);
router.delete('/notifications/:id', deleteAdminNotification);

export default router;
