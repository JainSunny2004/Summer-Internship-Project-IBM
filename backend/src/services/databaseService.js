const SearchHistory = require('../models/SearchHistory');
const Recommendation = require('../models/Recommendation');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  
  // Generate or retrieve session ID
  generateSessionId() {
    return uuidv4();
  }

  // Save search query and results to history
  async saveSearchHistory(sessionId, searchQuery, filters, results, userInteraction = {}) {
    try {
      const searchHistory = new SearchHistory({
        sessionId,
        searchQuery,
        filters: this.sanitizeFilters(filters),
        results: {
          totalResults: results.totalResults,
          movies: results.movies.slice(0, 20).map(movie => ({
            id: movie.id,
            title: movie.title,
            posterPath: movie.posterPath,
            rating: movie.rating,
            releaseDate: movie.releaseDate
          }))
        },
        userInteraction: userInteraction || {}
      });

      await searchHistory.save();
      return searchHistory;
    } catch (error) {
      console.error('Error saving search history:', error);
      throw new Error('Failed to save search history');
    }
  }

  // Get user search history
  async getSearchHistory(sessionId, limit = 10) {
    try {
      return await SearchHistory.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('-results.movies -userInteraction')
        .lean();
    } catch (error) {
      console.error('Error getting search history:', error);
      throw new Error('Failed to get search history');
    }
  }

  // Get user preferences based on search history
  async getUserPreferences(sessionId) {
    try {
      const preferences = await SearchHistory.getUserPreferences(sessionId);
      
      if (!preferences) {
        return null;
      }

      // Process the aggregated data
      const genreFrequency = {};
      preferences.favoriteGenres.flat().forEach(genreArray => {
        if (genreArray && Array.isArray(genreArray)) {
          genreArray.forEach(genre => {
            if (genre && genre.name) {
              genreFrequency[genre.name] = (genreFrequency[genre.name] || 0) + 1;
            }
          });
        }
      });

      // Get top 5 genres
      const topGenres = Object.entries(genreFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Process common keywords
      const keywordFrequency = {};
      preferences.commonKeywords.forEach(query => {
        if (query) {
          const words = query.toLowerCase().split(' ').filter(word => word.length > 2);
          words.forEach(word => {
            keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
          });
        }
      });

      const topKeywords = Object.entries(keywordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

      return {
        totalSearches: preferences.totalSearches,
        topGenres,
        topKeywords,
        averageRating: preferences.averageRating || 6.0,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // Save recommendation results
  async saveRecommendation(sessionId, basedOnMovieId, basedOnMovieTitle, recommendationType, recommendations, filters = {}) {
    try {
      const recommendation = new Recommendation({
        sessionId,
        basedOnMovieId,
        basedOnMovieTitle,
        recommendationType,
        recommendations: recommendations.slice(0, 20).map(movie => ({
          id: movie.id,
          title: movie.title,
          posterPath: movie.posterPath,
          rating: movie.rating,
          genres: movie.genres || [],
          releaseDate: movie.releaseDate,
          similarity: this.calculateSimilarity(movie, filters) // Custom similarity calculation
        })),
        filters: this.sanitizeFilters(filters)
      });

      await recommendation.save();
      return recommendation;
    } catch (error) {
      console.error('Error saving recommendation:', error);
      throw new Error('Failed to save recommendation');
    }
  }

  // Get recommendation history
  async getRecommendationHistory(sessionId, limit = 10) {
    try {
      return await Recommendation.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('-recommendations -userFeedback')
        .lean();
    } catch (error) {
      console.error('Error getting recommendation history:', error);
      throw new Error('Failed to get recommendation history');
    }
  }

  // Update user interaction with search results
  async updateSearchInteraction(sessionId, searchQuery, interactionType, movieId) {
    try {
      const searchHistory = await SearchHistory.findOne({
        sessionId,
        searchQuery,
        timestamp: { $gte: new Date(Date.now() - 3600000) } // Within last hour
      }).sort({ timestamp: -1 });

      if (searchHistory) {
        await searchHistory.addInteraction(interactionType, movieId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating search interaction:', error);
      return false;
    }
  }

  // Update user feedback on recommendations
  async updateRecommendationFeedback(sessionId, basedOnMovieId, feedbackType, movieId) {
    try {
      const recommendation = await Recommendation.findOne({
        sessionId,
        basedOnMovieId,
        timestamp: { $gte: new Date(Date.now() - 86400000) } // Within last day
      }).sort({ timestamp: -1 });

      if (recommendation) {
        if (!recommendation.userFeedback[feedbackType]) {
          recommendation.userFeedback[feedbackType] = [];
        }
        
        if (!recommendation.userFeedback[feedbackType].includes(movieId)) {
          recommendation.userFeedback[feedbackType].push(movieId);
          await recommendation.save();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      return false;
    }
  }

  // Enhanced recommendations based on user history
  async getPersonalizedRecommendations(sessionId, movieId) {
    try {
      const preferences = await this.getUserPreferences(sessionId);
      
      if (!preferences || preferences.totalSearches < 3) {
        return null; // Not enough data for personalization
      }

      // Get recent interactions
      const recentSearches = await SearchHistory.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();

      const interactedMovies = new Set();
      recentSearches.forEach(search => {
        if (search.userInteraction) {
          ['clickedMovies', 'viewedDetails'].forEach(type => {
            if (search.userInteraction[type]) {
              search.userInteraction[type].forEach(id => interactedMovies.add(id));
            }
          });
        }
      });

      return {
        preferences,
        interactedMovies: Array.from(interactedMovies),
        recommendationStrategy: 'personalized'
      };

    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return null;
    }
  }

  // Helper method to sanitize filters
  sanitizeFilters(filters) {
    const sanitized = {};
    
    if (filters.genres && Array.isArray(filters.genres)) {
      sanitized.genres = filters.genres;
    }
    if (filters.year) sanitized.year = parseInt(filters.year);
    if (filters.minRating) sanitized.minRating = parseFloat(filters.minRating);
    if (filters.maxRating) sanitized.maxRating = parseFloat(filters.maxRating);
    if (filters.cast && Array.isArray(filters.cast)) {
      sanitized.cast = filters.cast;
    }
    if (filters.sortBy) sanitized.sortBy = filters.sortBy;

    return sanitized;
  }

  // Helper method to calculate similarity score
  calculateSimilarity(movie, filters) {
    let score = 0;
    
    // Base score from movie popularity and rating
    if (movie.popularity) score += Math.min(movie.popularity / 100, 1) * 0.3;
    if (movie.rating) score += (movie.rating / 10) * 0.4;
    
    // Bonus for matching filters
    if (filters.genres && movie.genres) {
      const matchingGenres = filters.genres.filter(genre => 
        movie.genres.some(movieGenre => movieGenre.name === genre)
      );
      score += (matchingGenres.length / Math.max(filters.genres.length, 1)) * 0.3;
    }

    return Math.min(score, 1); // Normalize to 0-1
  }

  // Clean up old records (can be called periodically)
  async cleanupOldRecords() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      await SearchHistory.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
      await Recommendation.deleteMany({ timestamp: { $lt: sevenDaysAgo } });

      console.log('✅ Old records cleaned up successfully');
    } catch (error) {
      console.error('❌ Error cleaning up old records:', error);
    }
  }
}

module.exports = new DatabaseService();
