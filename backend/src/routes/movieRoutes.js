const express = require('express');
const movieController = require('../controllers/movieController');
const validators = require('../utils/validators');

const router = express.Router();

// Search movies
router.get('/search', validators.searchMovies, movieController.searchMovies);

// Get popular movies
router.get('/popular', movieController.getPopularMovies);

// Get all genres
router.get('/genres', movieController.getGenres);

// Discover movies with advanced filters
router.get('/discover', validators.discoverMovies, movieController.discoverMovies);

// Get movie details by ID
router.get('/:id', validators.getMovieDetails, movieController.getMovieDetails);

// Get movies by genre
router.get('/genre/:genreId', validators.getMoviesByGenre, movieController.getMoviesByGenre);

// Get recommendations based on a movie
router.get('/:id/recommendations', validators.getMovieDetails, movieController.getRecommendations);

module.exports = router;
