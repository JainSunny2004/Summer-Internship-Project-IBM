const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.get('/search', movieController.searchPeople);

module.exports = router;
