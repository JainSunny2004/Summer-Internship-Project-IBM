const express = require('express');
const router = express.Router();
const { searchMovie, getMovieDetails } = require('../services/tmdbService');

router.get('/search', async (req, res) => {
  const { title } = req.query;
  try {
    const movie = await searchMovie(title);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    const details = await getMovieDetails(movie.id);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
