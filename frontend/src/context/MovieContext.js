import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { movieAPI, peopleAPI, apiUtils } from '../services/api';

// Initial state
const initialState = {
  // Movies data
  movies: [],
  popularMovies: [],
  searchResults: [],
  currentMovie: null,
  recommendations: [],
  genres: [],
  
  // Search and filters
  searchQuery: '',
  currentFilters: {
    genres: [],
    year: '',
    minRating: '',
    maxRating: '',
    sortBy: 'popularity.desc'
  },
  
  // UI state
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  totalPages: 1,
  
  // Session data
  sessionId: apiUtils.getSessionId(),
  searchHistory: []
};

// Action types
const ACTIONS = {
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Movies
  SET_MOVIES: 'SET_MOVIES',
  APPEND_MOVIES: 'APPEND_MOVIES',
  SET_POPULAR_MOVIES: 'SET_POPULAR_MOVIES',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_CURRENT_MOVIE: 'SET_CURRENT_MOVIE',
  SET_RECOMMENDATIONS: 'SET_RECOMMENDATIONS',
  SET_GENRES: 'SET_GENRES',
  
  // Search and filters
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  UPDATE_FILTER: 'UPDATE_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // Pagination
  SET_PAGINATION: 'SET_PAGINATION',
  INCREMENT_PAGE: 'INCREMENT_PAGE',
  RESET_PAGINATION: 'RESET_PAGINATION',
  
  // History
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY'
};

// Reducer
function movieReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
      
    case ACTIONS.SET_MOVIES:
      return { 
        ...state, 
        movies: action.payload, 
        loading: false, 
        error: null 
      };
      
    case ACTIONS.APPEND_MOVIES:
      return { 
        ...state, 
        movies: [...state.movies, ...action.payload], 
        loading: false 
      };
      
    case ACTIONS.SET_POPULAR_MOVIES:
      return { 
        ...state, 
        popularMovies: action.payload, 
        loading: false, 
        error: null 
      };
      
    case ACTIONS.SET_SEARCH_RESULTS:
      return { 
        ...state, 
        searchResults: action.payload, 
        loading: false, 
        error: null 
      };
      
    case ACTIONS.SET_CURRENT_MOVIE:
      return { 
        ...state, 
        currentMovie: action.payload, 
        loading: false, 
        error: null 
      };
      
    case ACTIONS.SET_RECOMMENDATIONS:
      return { 
        ...state, 
        recommendations: action.payload, 
        loading: false, 
        error: null 
      };
      
    case ACTIONS.SET_GENRES:
      return { 
        ...state, 
        genres: action.payload, 
        loading: false, 
        error: null 
      };
      
    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
      
    case ACTIONS.SET_FILTERS:
      return { ...state, currentFilters: action.payload };
      
    case ACTIONS.UPDATE_FILTER:
      return { 
        ...state, 
        currentFilters: { 
          ...state.currentFilters, 
          [action.payload.key]: action.payload.value 
        } 
      };
      
    case ACTIONS.CLEAR_FILTERS:
      return { 
        ...state, 
        currentFilters: initialState.currentFilters,
        searchQuery: ''
      };
      
    case ACTIONS.SET_PAGINATION:
      return { 
        ...state, 
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        hasMore: action.payload.page < action.payload.totalPages
      };
      
    case ACTIONS.INCREMENT_PAGE:
      return { 
        ...state, 
        currentPage: state.currentPage + 1,
        hasMore: (state.currentPage + 1) < state.totalPages
      };
      
    case ACTIONS.RESET_PAGINATION:
      return { 
        ...state, 
        currentPage: 1,
        hasMore: true
      };
      
    case ACTIONS.ADD_TO_HISTORY:
      const newHistory = [action.payload, ...state.searchHistory.slice(0, 9)]; // Keep last 10
      return { ...state, searchHistory: newHistory };
      
    case ACTIONS.CLEAR_HISTORY:
      return { ...state, searchHistory: [] };
      
    default:
      return state;
  }
}

// Create context
const MovieContext = createContext();

// Provider component
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Helper function to handle API calls
  const handleApiCall = useCallback(async (apiCall, onSuccess, onError) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.CLEAR_ERROR });
    
    try {
      const result = await apiCall();
      onSuccess(result);
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
      if (onError) onError(error);
    }
  }, []);

  // Action creators
  const actions = {
    // Search movies
    searchMovies: useCallback(async (query, page = 1, appendResults = false) => {
      if (!query.trim()) return;
      
      await handleApiCall(
        () => movieAPI.searchMovies(query, page, state.currentFilters),
        (response) => {
          const movies = response.data.movies;
          
          if (appendResults && page > 1) {
            dispatch({ type: ACTIONS.APPEND_MOVIES, payload: movies });
          } else {
            dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: movies });
          }
          
          dispatch({ 
            type: ACTIONS.SET_PAGINATION, 
            payload: { 
              page: response.data.page, 
              totalPages: response.data.totalPages 
            } 
          });
          
          // Add to search history
          dispatch({ 
            type: ACTIONS.ADD_TO_HISTORY, 
            payload: { 
              query, 
              filters: state.currentFilters, 
              timestamp: Date.now() 
            } 
          });
        }
      );
    }, [state.currentFilters, handleApiCall]),

    // Get popular movies
    getPopularMovies: useCallback(async (page = 1, appendResults = false) => {
      await handleApiCall(
        () => movieAPI.getPopularMovies(page),
        (response) => {
          const movies = response.data.movies;
          
          if (appendResults && page > 1) {
            dispatch({ type: ACTIONS.APPEND_MOVIES, payload: movies });
          } else {
            dispatch({ type: ACTIONS.SET_POPULAR_MOVIES, payload: movies });
          }
          
          dispatch({ 
            type: ACTIONS.SET_PAGINATION, 
            payload: { 
              page: response.data.page, 
              totalPages: response.data.totalPages 
            } 
          });
        }
      );
    }, [handleApiCall]),

    // Get movie details
    getMovieDetails: useCallback(async (movieId) => {
      await handleApiCall(
        () => movieAPI.getMovieDetails(movieId),
        (response) => {
          dispatch({ type: ACTIONS.SET_CURRENT_MOVIE, payload: response.data });
        }
      );
    }, [handleApiCall]),

    // Get recommendations
    getRecommendations: useCallback(async (movieId) => {
      await handleApiCall(
        () => movieAPI.getRecommendations(movieId),
        (response) => {
          dispatch({ type: ACTIONS.SET_RECOMMENDATIONS, payload: response.data.movies });
        }
      );
    }, [handleApiCall]),

    // Get genres
    getGenres: useCallback(async () => {
      await handleApiCall(
        () => movieAPI.getGenres(),
        (response) => {
          dispatch({ type: ACTIONS.SET_GENRES, payload: response.data });
        }
      );
    }, [handleApiCall]),

    // Discover movies
    discoverMovies: useCallback(async (filters = {}, page = 1, appendResults = false) => {
      const mergedFilters = { ...state.currentFilters, ...filters };
      
      await handleApiCall(
        () => movieAPI.discoverMovies(mergedFilters, page),
        (response) => {
          const movies = response.data.movies;
          
          if (appendResults && page > 1) {
            dispatch({ type: ACTIONS.APPEND_MOVIES, payload: movies });
          } else {
            dispatch({ type: ACTIONS.SET_MOVIES, payload: movies });
          }
          
          dispatch({ 
            type: ACTIONS.SET_PAGINATION, 
            payload: { 
              page: response.data.page, 
              totalPages: response.data.totalPages 
            } 
          });
        }
      );
    }, [state.currentFilters, handleApiCall]),

    // Filter and search management
    setSearchQuery: useCallback((query) => {
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
    }, []),

    updateFilter: useCallback((key, value) => {
      dispatch({ type: ACTIONS.UPDATE_FILTER, payload: { key, value } });
    }, []),

    setFilters: useCallback((filters) => {
      dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
    }, []),

    clearFilters: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_FILTERS });
      dispatch({ type: ACTIONS.RESET_PAGINATION });
    }, []),

    // Pagination
    loadMoreMovies: useCallback(async () => {
      if (!state.hasMore || state.loading) return;
      
      const nextPage = state.currentPage + 1;
      dispatch({ type: ACTIONS.INCREMENT_PAGE });
      
      if (state.searchQuery) {
        await actions.searchMovies(state.searchQuery, nextPage, true);
      } else {
        await actions.getPopularMovies(nextPage, true);
      }
    }, [state.hasMore, state.loading, state.currentPage, state.searchQuery]),

    // Utility actions
    clearError: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []),

    resetPagination: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_PAGINATION });
    }, []),

    clearHistory: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_HISTORY });
    }, [])
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed values
    hasResults: state.searchResults.length > 0 || state.movies.length > 0,
    isSearching: !!state.searchQuery,
    totalResults: state.searchResults.length || state.movies.length
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

// Custom hook to use the context
export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

export default MovieContext;
