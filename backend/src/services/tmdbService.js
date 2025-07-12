const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const searchMovie = async (title) => {
  const res = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
    params: { api_key: TMDB_API_KEY, query: title },
  });
  return res.data.results[0]; // Return the best match
};

const getMovieDetails = async (movieId) => {
  const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
    params: {
      api_key: TMDB_API_KEY,
      append_to_response: 'credits,similar',
    },
  });
  return res.data;
};

module.exports = { searchMovie, getMovieDetails };
