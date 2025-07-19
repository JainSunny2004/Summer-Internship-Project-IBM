const tmdbService = require('../services/tmdbService');
const { validationResult } = require('express-validator');

class MovieController {
  
  // Search movies with query and filters
  async searchMovies(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { 
        q: query, 
        page = 1, 
        year, 
        includeAdult = false,
        region 
      } = req.query;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Search query is required'
        });
      }

      const filters = {
        year: year ? parseInt(year) : undefined,
        includeAdult: includeAdult === 'true',
        region
      };

      const results = await tmdbService.searchMovies(query.trim(), parseInt(page), filters);
      
      res.status(200).json({
        status: 'success',
        data: results,
        query: query.trim(),
        filters
      });

    } catch (error) {
      console.error('Search movies error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to search movies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get popular movies
  async getPopularMovies(req, res) {
    try {
      const { page = 1 } = req.query;
      
      const results = await tmdbService.getPopularMovies(parseInt(page));
      
      res.status(200).json({
        status: 'success',
        data: results
      });

    } catch (error) {
      console.error('Get popular movies error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get popular movies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get movie details by ID
  async getMovieDetails(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid movie ID is required'
        });
      }

      const movie = await tmdbService.getMovieDetails(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        data: movie
      });

    } catch (error) {
      console.error('Get movie details error:', error);
      
      if (error.message.includes('404')) {
        return res.status(404).json({
          status: 'error',
          message: 'Movie not found'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to get movie details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get movies by genre
  async getMoviesByGenre(req, res) {
    try {
      const { genreId } = req.params;
      const { page = 1 } = req.query;

      if (!genreId || isNaN(parseInt(genreId))) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid genre ID is required'
        });
      }

      const results = await tmdbService.getMoviesByGenre(parseInt(genreId), parseInt(page));
      
      res.status(200).json({
        status: 'success',
        data: results,
        genreId: parseInt(genreId)
      });

    } catch (error) {
      console.error('Get movies by genre error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get movies by genre',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all genres
  async getGenres(req, res) {
    try {
      const genres = await tmdbService.getGenres();
      
      res.status(200).json({
        status: 'success',
        data: genres
      });

    } catch (error) {
      console.error('Get genres error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get genres',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Advanced movie discovery with filters
  async discoverMovies(req, res) {
    try {
      const {
        page = 1,
        sortBy = 'popularity.desc',
        genres,
        year,
        minRating,
        maxRating,
        minVotes = 100,
        cast,
        keywords
      } = req.query;

      const filters = {
        sortBy,
        genreIds: genres ? genres.split(',').map(id => parseInt(id)) : undefined,
        year: year ? parseInt(year) : undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        maxRating: maxRating ? parseFloat(maxRating) : undefined,
        minVotes: parseInt(minVotes),
        cast: cast ? cast.split(',').map(id => parseInt(id)) : undefined,
        keywords: keywords ? keywords.split(',').map(id => parseInt(id)) : undefined
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const results = await tmdbService.discoverMovies(filters, parseInt(page));
      
      res.status(200).json({
        status: 'success',
        data: results,
        filters
      });

    } catch (error) {
      console.error('Discover movies error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to discover movies',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get movie recommendations based on a movie ID
  async getRecommendations(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid movie ID is required'
        });
      }

      // Get movie details to extract genres and cast
      const movieDetails = await tmdbService.getMovieDetails(parseInt(id));
      
      // Use similar movies from TMDB if available
      if (movieDetails.similar && movieDetails.similar.length > 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            page: 1,
            totalPages: 1,
            totalResults: movieDetails.similar.length,
            movies: movieDetails.similar,
            basedOn: {
              movieId: parseInt(id),
              movieTitle: movieDetails.title
            }
          }
        });
      }

      // Fallback: discover movies with same genres
      const genreIds = movieDetails.genres?.map(genre => genre.id) || [];
      
      if (genreIds.length > 0) {
        const filters = {
          genreIds: genreIds.slice(0, 2), // Use first 2 genres to avoid too narrow results
          minRating: 6.0, // Only recommend decent movies
          minVotes: 100
        };

        const results = await tmdbService.discoverMovies(filters, parseInt(page));
        
        // Filter out the original movie from recommendations
        results.movies = results.movies.filter(movie => movie.id !== parseInt(id));

        res.status(200).json({
          status: 'success',
          data: {
            ...results,
            basedOn: {
              movieId: parseInt(id),
              movieTitle: movieDetails.title,
              genres: movieDetails.genres
            }
          }
        });
      } else {
        // Last fallback: popular movies
        const results = await tmdbService.getPopularMovies(parseInt(page));
        results.movies = results.movies.filter(movie => movie.id !== parseInt(id));

        res.status(200).json({
          status: 'success',
          data: {
            ...results,
            basedOn: {
              movieId: parseInt(id),
              movieTitle: movieDetails.title,
              fallback: 'popular_movies'
            }
          }
        });
      }

    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search for people (cast/crew)
  async searchPeople(req, res) {
    try {
      const { q: query, page = 1 } = req.query;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Search query is required'
        });
      }

      const results = await tmdbService.searchPeople(query.trim(), parseInt(page));
      
      res.status(200).json({
        status: 'success',
        data: results,
        query: query.trim()
      });

    } catch (error) {
      console.error('Search people error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to search people',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new MovieController();
