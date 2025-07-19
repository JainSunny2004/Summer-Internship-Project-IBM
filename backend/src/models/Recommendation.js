const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  basedOnMovieId: {
    type: Number,
    required: true
  },
  basedOnMovieTitle: {
    type: String,
    required: true
  },
  recommendationType: {
    type: String,
    enum: ['similar', 'genre-based', 'cast-based', 'user-preference', 'popular-fallback'],
    required: true
  },
  recommendations: [{
    id: Number,
    title: String,
    posterPath: String,
    rating: Number,
    similarity: Number, // Custom similarity score
    genres: [String],
    releaseDate: String
  }],
  filters: {
    genres: [String],
    minRating: Number,
    cast: [String]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days in seconds
  },
  userFeedback: {
    liked: [Number],
    disliked: [Number],
    clicked: [Number]
  }
}, {
  timestamps: true
});

// Index for efficient queries
recommendationSchema.index({ sessionId: 1, timestamp: -1 });
recommendationSchema.index({ basedOnMovieId: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
