const express = require('express');
const movieController = require('../controllers/movieController');
const validators = require('../utils/validators');

const router = express.Router();

// Search people (actors, directors, etc.)
router.get('/search', validators.searchPeople, movieController.searchPeople);

module.exports = router;
