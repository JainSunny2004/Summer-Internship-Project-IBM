const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/';
    this.imageBaseURL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/original';
    
    // Verify API key exists
    if (!this.apiKey) {
      console.error('❌ TMDB_API_KEY is missing from environment variables');
      console.error('   Please ensure your .env file contains TMDB_API_KEY=your_api_key_here');
      throw new Error('TMDB_API_KEY is required but not found in environment variables');
    }
    
    console.log('🔧 Initializing TMDB Service...');
    console.log('   Base URL:', this.baseURL);
    console.log('   Image URL:', this.imageBaseURL);
    console.log('   API Key:', this.apiKey ? 'Present ✅' : 'Missing ❌');
    
    // Create axios instance with enhanced configuration
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased to 30 seconds for network issues
      params: {
        api_key: this.apiKey
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'MovieRecommenderApp/1.0'
      }
    });

    // Add request interceptor for debugging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🔄 TMDB API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ TMDB Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add enhanced response interceptor with retry logic
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ TMDB API Success: ${response.config.url} (${response.status})`);
        return response;
      },
      async (error) => {
        console.error(`❌ TMDB API Error: ${error.config?.url || 'Unknown URL'}`);
        
        // Handle specific error types
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - TMDB API is taking too long to respond. Try again later.');
        }
        
        if (error.code === 'ECONNRESET') {
          console.log('🔄 Connection reset detected. This may be an ISP or network issue.');
          
          // Implement retry logic for connection resets
          if (this.shouldRetry(error) && !error.config.__isRetryRequest) {
            error.config.__isRetryRequest = true;
            error.config.__retryCount = (error.config.__retryCount || 0) + 1;
            
            if (error.config.__retryCount <= 3) {
              console.log(`🔄 Retrying TMDB request (${error.config.__retryCount}/3) after connection reset`);
              await new Promise(resolve => setTimeout(resolve, 2000 * error.config.__retryCount));
              return this.api.request(error.config);
            }
          }
          
          throw new Error('Connection reset by TMDB servers. This may be due to ISP blocking or network issues. Try changing your DNS to 8.8.8.8 or using a VPN.');
        }
        
        if (error.response?.status === 401) {
          throw new Error('Invalid TMDB API key - Please check your API key in .env file');
        }
        
        if (error.response?.status === 404) {
          throw new Error('TMDB resource not found');
        }
        
        if (error.response?.status === 429) {
          throw new Error('TMDB API rate limit exceeded. Please wait before making more requests.');
        }
        
        if (error.response?.status >= 500) {
          throw new Error('TMDB server error. Please try again later.');
        }
        
        console.error('TMDB API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          code: error.code,
          message: error.message
        });
        
        throw new Error(`TMDB API Error: ${error.response?.data?.status_message || error.message}`);
      }
    );
  }

  // Helper method to determine if we should retry the request
  shouldRetry(error) {
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNABORTED',
      'ENOTFOUND',
      'ECONNREFUSED'
    ];
    
    return retryableErrors.includes(error.code) || 
           (error.response && error.response.status >= 500);
  }

  // Helper method to construct full image URLs
  getImageURL(imagePath, size = 'w500') {
    if (!imagePath) return null;
    return `https://image.tmdb.org/t/p/${size}${imagePath}`;
  }

  // Helper method to format movie data consistently
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
      console.log(`🔍 Searching movies: "${query}" (page ${page})`);
      
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
      console.log(`📈 Getting popular movies (page ${page})`);
      
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
      console.log(`🎬 Getting movie details for ID: ${movieId}`);
      
      const response = await this.api.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,similar,reviews,keywords'
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
        imdbId: movie.imdb_id,
        credits: {
          cast: movie.credits?.cast?.slice(0, 10).map(person => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profilePath: this.getImageURL(person.profile_path)
          })) || [],
          crew: movie.credits?.crew?.slice(0, 5).map(person => ({
            id: person.id,
            name: person.name,
            job: person.job,
            department: person.department,
            profilePath: this.getImageURL(person.profile_path)
          })) || [],
          director: movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown'
        },
        similar: movie.similar?.results?.slice(0, 12).map(m => this.formatMovie(m)) || [],
        videos: movie.videos?.results?.filter(video => video.site === 'YouTube').slice(0, 3) || [],
        keywords: movie.keywords?.keywords || []
      };
    } catch (error) {
      throw new Error(`Failed to get movie details: ${error.message}`);
    }
  }

  // Get movies by genre
  async getMoviesByGenre(genreId, page = 1) {
    try {
      console.log(`🎭 Getting movies by genre: ${genreId} (page ${page})`);
      
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
      console.log('🏷️ Getting movie genres');
      
      const response = await this.api.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      throw new Error(`Failed to get genres: ${error.message}`);
    }
  }

  // Discover movies with advanced filters
  async discoverMovies(filters = {}, page = 1) {
    try {
      console.log(`🔍 Discovering movies with filters (page ${page}):`, filters);
      
      const params = {
        page: page,
        sort_by: filters.sortBy || 'popularity.desc'
      };

      // Add various filters
      if (filters.genreIds && filters.genreIds.length > 0) {
        params.with_genres = filters.genreIds.join(',');
      }
      if (filters.year) params.year = filters.year;
      if (filters.minRating) params['vote_average.gte'] = filters.minRating;
      if (filters.maxRating) params['vote_average.lte'] = filters.maxRating;
      if (filters.minVotes) params['vote_count.gte'] = filters.minVotes || 100;
      if (filters.cast) params.with_cast = filters.cast;
      if (filters.keywords) params.with_keywords = filters.keywords;
      if (filters.language) params.with_original_language = filters.language;
      if (filters.releaseDateFrom) params['release_date.gte'] = filters.releaseDateFrom;
      if (filters.releaseDateTo) params['release_date.lte'] = filters.releaseDateTo;

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

  // Get movie recommendations based on a movie ID
  async getMovieRecommendations(movieId, page = 1) {
    try {
      console.log(`💡 Getting recommendations for movie ID: ${movieId}`);
      
      const response = await this.api.get(`/movie/${movieId}/recommendations`, {
        params: { page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get movie recommendations: ${error.message}`);
    }
  }

  // Get similar movies
  async getSimilarMovies(movieId, page = 1) {
    try {
      console.log(`🔗 Getting similar movies for ID: ${movieId}`);
      
      const response = await this.api.get(`/movie/${movieId}/similar`, {
        params: { page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get similar movies: ${error.message}`);
    }
  }

  // Search for people (actors, directors, etc.)
  async searchPeople(query, page = 1) {
    try {
      console.log(`👥 Searching people: "${query}" (page ${page})`);
      
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
          knownForDepartment: person.known_for_department,
          knownFor: person.known_for?.map(item => ({
            id: item.id,
            title: item.title || item.name,
            mediaType: item.media_type,
            posterPath: this.getImageURL(item.poster_path),
            releaseDate: item.release_date || item.first_air_date
          })) || []
        }))
      };
    } catch (error) {
      throw new Error(`Failed to search people: ${error.message}`);
    }
  }

  // Get person details
  async getPersonDetails(personId) {
    try {
      console.log(`👤 Getting person details for ID: ${personId}`);
      
      const response = await this.api.get(`/person/${personId}`, {
        params: {
          append_to_response: 'movie_credits,tv_credits'
        }
      });

      const person = response.data;

      return {
        id: person.id,
        name: person.name,
        biography: person.biography,
        birthday: person.birthday,
        deathday: person.deathday,
        placeOfBirth: person.place_of_birth,
        popularity: person.popularity,
        profilePath: this.getImageURL(person.profile_path),
        knownForDepartment: person.known_for_department,
        movieCredits: {
          cast: person.movie_credits?.cast?.map(movie => this.formatMovie(movie)) || [],
          crew: person.movie_credits?.crew?.map(movie => ({
            ...this.formatMovie(movie),
            job: movie.job,
            department: movie.department
          })) || []
        }
      };
    } catch (error) {
      throw new Error(`Failed to get person details: ${error.message}`);
    }
  }

  // Get trending movies
  async getTrendingMovies(timeWindow = 'day', page = 1) {
    try {
      console.log(`🔥 Getting trending movies (${timeWindow}) (page ${page})`);
      
      const response = await this.api.get(`/trending/movie/${timeWindow}`, {
        params: { page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get trending movies: ${error.message}`);
    }
  }

  // Get now playing movies
  async getNowPlayingMovies(page = 1) {
    try {
      console.log(`🎪 Getting now playing movies (page ${page})`);
      
      const response = await this.api.get('/movie/now_playing', {
        params: { page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get now playing movies: ${error.message}`);
    }
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1) {
    try {
      console.log(`🚀 Getting upcoming movies (page ${page})`);
      
      const response = await this.api.get('/movie/upcoming', {
        params: { page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get upcoming movies: ${error.message}`);
    }
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1) {
    try {
      console.log(`⭐ Getting top rated movies (page ${page})`);
      
      const response = await this.api.get('/movie/top_rated', {
        params: { page }
      });

      return {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
        movies: response.data.results.map(movie => this.formatMovie(movie))
      };
    } catch (error) {
      throw new Error(`Failed to get top rated movies: ${error.message}`);
    }
  }

  // Test connection method
  async testConnection() {
    try {
      console.log('🧪 Testing TMDB API connection...');
      
      const response = await this.api.get('/configuration');
      console.log('✅ TMDB API connection test successful');
      
      return {
        success: true,
        message: 'TMDB API connection working',
        config: response.data
      };
    } catch (error) {
      console.error('❌ TMDB API connection test failed:', error.message);
      
      return {
        success: false,
        message: error.message,
        suggestions: [
          'Check your internet connection',
          'Verify TMDB API key is correct',
          'Try changing DNS servers to 8.8.8.8',
          'Check if ISP is blocking TMDB API',
          'Try using a VPN if the issue persists'
        ]
      };
    }
  }
}

module.exports = new TMDBService();
