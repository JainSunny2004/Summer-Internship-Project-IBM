const { body, query, param } = require('express-validator');

const movieValidators = {
  searchMovies: [
    query('q')
      .trim()
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Query must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be a number between 1 and 1000'),
    query('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
      .withMessage('Year must be valid'),
    query('includeAdult')
      .optional()
      .isBoolean()
      .withMessage('includeAdult must be a boolean')
  ],

  getMovieDetails: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Movie ID must be a positive integer')
  ],

  getMoviesByGenre: [
    param('genreId')
      .isInt({ min: 1 })
      .withMessage('Genre ID must be a positive integer'),
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be a number between 1 and 1000')
  ],

  discoverMovies: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be a number between 1 and 1000'),
    query('minRating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Minimum rating must be between 0 and 10'),
    query('maxRating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Maximum rating must be between 0 and 10'),
    query('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
      .withMessage('Year must be valid'),
    query('minVotes')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Minimum votes must be a positive number')
  ],

  searchPeople: [
    query('q')
      .trim()
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Query must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be a number between 1 and 1000')
  ]
};

module.exports = movieValidators;
