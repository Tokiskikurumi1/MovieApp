import { Router } from 'express';
import {
  getFeaturedMovies,
  getTrendingMovies,
  getNewReleases,
  getContinueWatching,
  getMovies,
  getMovieDetail,
  getCategories,
} from '../controllers/movieController';
import { optionalAuthenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/featured', getFeaturedMovies);
router.get('/trending', getTrendingMovies);
router.get('/new-releases', getNewReleases);
router.get('/continue-watching', optionalAuthenticate, getContinueWatching);
router.get('/categories', getCategories);
router.get('/', getMovies);
router.get('/:idOrSlug', getMovieDetail);

export default router;
