const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

// Define all movie routes
router.get('/popular', movieController.getPopularMovies);
router.get('/genres', movieController.getGenres);
router.get('/search', movieController.searchMovies);
router.get('/discover', movieController.discoverMovies);
router.get('/:id', movieController.getMovieDetails);
router.get('/genre/:genreId', movieController.getMoviesByGenre);
router.get('/:id/recommendations', movieController.getRecommendations);

module.exports = router;
