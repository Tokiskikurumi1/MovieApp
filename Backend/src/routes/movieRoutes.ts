import { Router } from 'express';
import {
  getFeaturedMovies,
  getTrendingMovies,
  getNewReleases,
  getContinueWatching,
  getMovies,
  getMovieDetail,
  getCategories,
  getMovieRecommendations,
  getPersonalizedRecommendations,
} from '../controllers/movieController';
import { optionalAuthenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/featured', getFeaturedMovies);
router.get('/trending', getTrendingMovies);
router.get('/new-releases', getNewReleases);
router.get('/recommendations/personalized', optionalAuthenticate, getPersonalizedRecommendations);
router.get('/continue-watching', optionalAuthenticate, getContinueWatching);
router.get('/categories', getCategories);
router.get('/', getMovies);
router.get('/:idOrSlug/recommendations', getMovieRecommendations);
router.get('/:idOrSlug', getMovieDetail);

export default router;
