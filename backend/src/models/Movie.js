const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: String,
  genres: [String],
  releaseDate: String,
  rating: Number,
  cast: [String],
  overview: String,
  posterPath: String,
  // Add more fields as needed
});

module.exports = mongoose.model('Movie', MovieSchema);
