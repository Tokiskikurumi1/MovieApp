import { Router } from 'express';
import {
  getFavorites,
  toggleFavorite,
  saveWatchProgress,
  getMovieComments,
  createComment,
  toggleLikeComment,
  deleteWatchHistory,
  clearAllWatchHistory,
} from '../controllers/userActionController';
import { optionalAuthenticate } from '../middlewares/authMiddleware';

const router = Router();

// Phim yêu thích
router.get('/favorites', optionalAuthenticate, getFavorites);
router.post('/favorites/toggle', optionalAuthenticate, toggleFavorite);

// Tiến độ xem phim & Lịch sử xem
router.post('/watch-progress', optionalAuthenticate, saveWatchProgress);
router.delete('/watch-history/:movieIdOrHistoryId', optionalAuthenticate, deleteWatchHistory);
router.delete('/watch-history', optionalAuthenticate, clearAllWatchHistory);

// Bình luận phim
router.get('/movies/:movieIdOrSlug/comments', optionalAuthenticate, getMovieComments);
router.post('/comments', optionalAuthenticate, createComment);
router.post('/comments/:commentId/like', optionalAuthenticate, toggleLikeComment);

export default router;
