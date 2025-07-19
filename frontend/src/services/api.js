import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging and session management
api.interceptors.request.use(
  (config) => {
    // Add session ID to requests if available
    const sessionId = localStorage.getItem('movieSessionId');
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.params);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    
    // Handle specific error codes
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(message);
  }
);

// Movie API methods
export const movieAPI = {
  // Search movies
  searchMovies: async (query, page = 1, filters = {}) => {
    const params = { q: query, page, ...filters };
    const response = await api.get('/movies/search', { params });
    return response.data;
  },

  // Get popular movies
  getPopularMovies: async (page = 1) => {
    const response = await api.get('/movies/popular', { params: { page } });
    return response.data;
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId, page = 1) => {
    const response = await api.get(`/movies/genre/${genreId}`, { params: { page } });
    return response.data;
  },

  // Get all genres
  getGenres: async () => {
    const response = await api.get('/movies/genres');
    return response.data;
  },

  // Discover movies with filters
  discoverMovies: async (filters = {}, page = 1) => {
    const params = { page, ...filters };
    const response = await api.get('/movies/discover', { params });
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (movieId, page = 1) => {
    const response = await api.get(`/movies/${movieId}/recommendations`, { params: { page } });
    return response.data;
  }
};

// People API methods
export const peopleAPI = {
  // Search people
  searchPeople: async (query, page = 1) => {
    const params = { q: query, page };
    const response = await api.get('/people/search', { params });
    return response.data;
  }
};

// Utility methods
export const apiUtils = {
  // Generate or get session ID
  getSessionId: () => {
    let sessionId = localStorage.getItem('movieSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('movieSessionId', sessionId);
    }
    return sessionId;
  },

  // Clear session
  clearSession: () => {
    localStorage.removeItem('movieSessionId');
  },

  // Handle API errors
  handleError: (error, fallbackMessage = 'Something went wrong') => {
    console.error('API Error:', error);
    return error.message || fallbackMessage;
  },

  // Create query string from filters
  createQueryString: (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return params.toString();
  }
};

// Initialize session on app start
apiUtils.getSessionId();

export default api;
