const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  searchQuery: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  filters: {
    genres: [{
      id: Number,
      name: String
    }],
    year: Number,
    minRating: Number,
    maxRating: Number,
    cast: [{
      id: Number,
      name: String
    }],
    sortBy: String
  },
  results: {
    totalResults: Number,
    movies: [{
      id: Number,
      title: String,
      posterPath: String,
      rating: Number,
      releaseDate: String
    }]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days in seconds
  },
  userInteraction: {
    clickedMovies: [Number],
    viewedDetails: [Number],
    requestedRecommendations: [Number]
  }
}, {
  timestamps: true
});

// Index for efficient queries
searchHistorySchema.index({ sessionId: 1, timestamp: -1 });
searchHistorySchema.index({ 'results.movies.id': 1 });

// Static method to get user preferences based on search history
searchHistorySchema.statics.getUserPreferences = async function(sessionId) {
  const pipeline = [
    { $match: { sessionId: sessionId } },
    { $sort: { timestamp: -1 } },
    { $limit: 20 }, // Last 20 searches
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        favoriteGenres: { $push: '$filters.genres' },
        averageRating: { $avg: '$filters.minRating' },
        commonKeywords: { $push: '$searchQuery' },
        interactedMovies: { $push: '$userInteraction.clickedMovies' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || null;
};

// Instance method to add user interaction
searchHistorySchema.methods.addInteraction = function(type, movieId) {
  if (!this.userInteraction[type]) {
    this.userInteraction[type] = [];
  }
  
  if (!this.userInteraction[type].includes(movieId)) {
    this.userInteraction[type].push(movieId);
  }
  
  return this.save();
};

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
