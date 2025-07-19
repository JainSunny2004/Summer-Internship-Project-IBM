const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
    this.imageBaseURL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      params: {
        api_key: this.apiKey
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('TMDB API Error:', error.response?.data || error.message);
        throw new Error(`TMDB API Error: ${error.response?.data?.status_message || error.message}`);
      }
    );
  }

  // Helper method to construct full image URLs
  getImageURL(imagePath, size = 'w500') {
    if (!imagePath) return null;
    return `https://image.tmdb.org/t/p/${size}${imagePath}`;
  }

  // Helper method to format movie data
  formatMovie(movie) {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      posterPath: this.getImageURL(movie.poster_path),
      backdropPath: this.getImageURL(movie.backdrop_path, 'w1280'),
      genreIds: movie.genre_ids || [],
      adult: movie.adult,
      originalLanguage: movie.original_language,
      originalTitle: movie.original_title
    };
  }

  // Search movies by query
  async searchMovies(query, page = 1, filters = {}) {
    try {
      const params = {
        query: query,
        page: page,
        include_adult: filters.includeAdult || false
      };

      // Add optional filters
      if (filters.year) params.year = filters.year;
      if (filters.region) params.region = filters.region;

      const response = await this.api.get('/search/movie', { params });
      
      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to search movies: ${error.message}`);
    }
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/popular', {
        params: { page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get popular movies: ${error.message}`);
    }
  }

  // Get movie details by ID
  async getMovieDetails(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,similar,reviews'
        }
      });

      const movie = response.data;
      
      return {
        ...this.formatMovie(movie),
        genres: movie.genres,
        runtime: movie.runtime,
        budget: movie.budget,
        revenue: movie.revenue,
        tagline: movie.tagline,
        homepage: movie.homepage,
        status: movie.status,
        credits: {
          cast: movie.credits?.cast?.slice(0, 10).map(person => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profilePath: this.getImageURL(person.profile_path)
          })) || [],
          director: movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown'
        },
        similar: movie.similar?.results?.slice(0, 12).map(m => this.formatMovie(m)) || [],
        videos: movie.videos?.results?.filter(video => video.site === 'YouTube').slice(0, 3) || []
      };
    } catch (error) {
      throw new Error(`Failed to get movie details: ${error.message}`);
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId, page = 1) {
    try {
      const response = await this.api.get('/discover/movie', {
        params: {
          with_genres: genreId,
          page: page,
          sort_by: 'popularity.desc'
        }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get movies by genre: ${error.message}`);
    }
  }

  // Get all genres
  async getGenres() {
    try {
      const response = await this.api.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      throw new Error(`Failed to get genres: ${error.message}`);
    }
  }

  // Discover movies with advanced filters
  async discoverMovies(filters = {}, page = 1) {
    try {
      const params = {
        page: page,
        sort_by: filters.sortBy || 'popularity.desc'
      };

      // Add various filters
      if (filters.genreIds) params.with_genres = filters.genreIds.join(',');
      if (filters.year) params.year = filters.year;
      if (filters.minRating) params['vote_average.gte'] = filters.minRating;
      if (filters.maxRating) params['vote_average.lte'] = filters.maxRating;
      if (filters.minVotes) params['vote_count.gte'] = filters.minVotes;
      if (filters.cast) params.with_cast = filters.cast;
      if (filters.keywords) params.with_keywords = filters.keywords;

      const response = await this.api.get('/discover/movie', { params });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to discover movies: ${error.message}`);
    }
  }

  // Search for people (actors, directors, etc.)
  async searchPeople(query, page = 1) {
    try {
      const response = await this.api.get('/search/person', {
        params: { query, page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        people: response.data.results.map(person => ({
          id: person.id,
          name: person.name,
          popularity: person.popularity,
          profilePath: this.getImageURL(person.profile_path),
          knownFor: person.known_for?.map(item => ({
            id: item.id,
            title: item.title || item.name,
            mediaType: item.media_type
          })) || []
        }))
      };
    } catch (error) {
      throw new Error(`Failed to search people: ${error.message}`);
    }
  }
}

module.exports = new TMDBService();
