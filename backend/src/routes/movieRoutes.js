const express = require('express');
const movieController = require('../controllers/movieController');
const { query, param } = require('express-validator');

const router = express.Router();

// Validation middleware
const validateSearch = [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer')
];

const validateMovieId = [
  param('id').isInt({ min: 1 }).withMessage('Movie ID must be positive integer')
];

const validateGenreId = [
  param('genreId').isInt({ min: 1 }).withMessage('Genre ID must be positive integer')
];

// Movie routes
router.get('/search', validateSearch, movieController.searchMovies);
router.get('/popular', movieController.getPopularMovies);
router.get('/genres', movieController.getGenres);
router.get('/discover', movieController.discoverMovies);
router.get('/genre/:genreId', validateGenreId, movieController.getMoviesByGenre);
router.get('/:id/recommendations', validateMovieId, movieController.getRecommendations);
router.get('/:id', validateMovieId, movieController.getMovieDetails);

module.exports = router;
