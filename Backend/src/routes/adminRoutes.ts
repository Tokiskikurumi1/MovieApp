import { Router } from 'express';
import {
  getDashboardStats,
  getAdminMovies,
  deleteMovie,
  getAdminUsers,
  toggleUserBan,
  updateUserVip,
  getAdminComments,
  updateCommentStatus,
  triggerCrawler,
} from '../controllers/adminController';

const router = Router();

// Thống kê Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Quản lý phim
router.get('/movies', getAdminMovies);
router.delete('/movies/:id', deleteMovie);

// Quản lý người dùng
router.get('/users', getAdminUsers);
router.put('/users/:id/ban', toggleUserBan);
router.put('/users/:id/vip', updateUserVip);

// Quản lý bình luận
router.get('/comments', getAdminComments);
router.put('/comments/:id/status', updateCommentStatus);

// Kích hoạt cào KKPhim
router.post('/crawler/run', triggerCrawler);

export default router;
