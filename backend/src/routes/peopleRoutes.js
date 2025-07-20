const express = require('express');
const movieController = require('../controllers/movieController');
const { query } = require('express-validator');

const router = express.Router();

// Validation middleware
const validatePeopleSearch = [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer')
];

// People routes
router.get('/search', validatePeopleSearch, movieController.searchPeople);

module.exports = router;
