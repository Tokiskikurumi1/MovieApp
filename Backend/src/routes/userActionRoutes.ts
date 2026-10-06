import { Router } from 'express';
import {
  getFavorites,
  toggleFavorite,
  saveWatchProgress,
  getWatchProgress,
  getMovieComments,
  createComment,
  toggleLikeComment,
  deleteWatchHistory,
  clearAllWatchHistory,
  getTransactions,
  upgradeSubscription,
  generateVietQr,
  reportComment,
} from '../controllers/userActionController';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController';
import { optionalAuthenticate } from '../middlewares/authMiddleware';

const router = Router();

// Phim yêu thích
router.get('/favorites', optionalAuthenticate, getFavorites);
router.post('/favorites/toggle', optionalAuthenticate, toggleFavorite);

// Tiến độ xem phim & Lịch sử xem
router.post('/watch-progress', optionalAuthenticate, saveWatchProgress);
router.get('/watch-progress/:movieIdOrSlug', optionalAuthenticate, getWatchProgress);
router.delete('/watch-history/:movieIdOrHistoryId', optionalAuthenticate, deleteWatchHistory);
router.delete('/watch-history', optionalAuthenticate, clearAllWatchHistory);

// Bình luận phim
router.get('/movies/:movieIdOrSlug/comments', optionalAuthenticate, getMovieComments);
router.post('/comments', optionalAuthenticate, createComment);
router.post('/comments/:commentId/like', optionalAuthenticate, toggleLikeComment);
router.post('/comments/:commentId/report', optionalAuthenticate, reportComment);

// Gói cước VIP & Lịch sử giao dịch & Thanh toán VietQR
router.get('/transactions', optionalAuthenticate, getTransactions);
router.post('/subscription/upgrade', optionalAuthenticate, upgradeSubscription);
router.post('/payments/vietqr', generateVietQr);

// Thông báo người dùng
router.get('/notifications', optionalAuthenticate, getUserNotifications);
router.post('/notifications/:id/read', optionalAuthenticate, markNotificationAsRead);
router.post('/notifications/read-all', optionalAuthenticate, markAllNotificationsAsRead);

export default router;
