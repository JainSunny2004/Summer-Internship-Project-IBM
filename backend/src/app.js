require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('../config/database');


// Import routes
const movieRoutes = require('./routes/movieRoutes');
const peopleRoutes = require('./routes/peopleRoutes');

const app = express();

// Connect to MongoDB (optional - comment out if not using)
if (process.env.MONGODB_URI) {
  connectDatabase();
} else {
  console.log('⚠️  MongoDB URI not provided. Running without database features.');
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Movie Recommender API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.MONGODB_URI ? 'connected' : 'not configured',
    endpoints: {
      health: '/api/health',
      movies: {
        popular: '/api/movies/popular',
        search: '/api/movies/search?q=query',
        genres: '/api/movies/genres',
        discover: '/api/movies/discover',
        details: '/api/movies/:id',
        byGenre: '/api/movies/genre/:genreId',
        recommendations: '/api/movies/:id/recommendations'
      },
      people: {
        search: '/api/people/search?q=query'
      }
    }
  });
});

// API Routes - CRITICAL: These lines connect your route handlers
app.use('/api/movies', movieRoutes);
app.use('/api/people', peopleRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      health: '/api/health',
      movies: '/api/movies',
      people: '/api/people'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🎬 MOVIE RECOMMENDER API                   ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Server Status: RUNNING                                   ║
║  🌍 Environment:   ${(process.env.NODE_ENV || 'development').padEnd(43)}║
║  📡 Port:          ${PORT.toString().padEnd(43)}║
║  💾 Database:      ${(process.env.MONGODB_URI ? 'Connected' : 'Not Configured').padEnd(43)}║
╠══════════════════════════════════════════════════════════════╣
║  📚 Available Endpoints:                                     ║
║                                                              ║
║  🔍 Health Check:                                            ║
║     GET  http://localhost:${PORT}/api/health                    ║
║                                                              ║
║  🎭 Movie Endpoints:                                         ║
║     GET  http://localhost:${PORT}/api/movies/popular            ║
║     GET  http://localhost:${PORT}/api/movies/genres             ║
║     GET  http://localhost:${PORT}/api/movies/search?q=query     ║
║     GET  http://localhost:${PORT}/api/movies/discover           ║
║     GET  http://localhost:${PORT}/api/movies/:id                ║
║     GET  http://localhost:${PORT}/api/movies/genre/:genreId     ║
║     GET  http://localhost:${PORT}/api/movies/:id/recommendations║
║                                                              ║
║  👥 People Endpoints:                                        ║
║     GET  http://localhost:${PORT}/api/people/search?q=query     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Test TMDB connection on startup
  if (process.env.TMDB_API_KEY) {
    console.log('✅ TMDB API Key found - Testing connection...');
    testTMDBConnection();
  } else {
    console.log('❌ TMDB_API_KEY not found in environment variables!');
    console.log('   Please add your TMDB API key to the .env file');
  }
});

// Test TMDB connection function
async function testTMDBConnection() {
  try {
    const tmdbService = require('./services/tmdbService');
    const testResult = await tmdbService.getPopularMovies(1);
    console.log(`✅ TMDB Connection successful! Found ${testResult.movies.length} popular movies`);
  } catch (error) {
    console.log(`❌ TMDB Connection failed: ${error.message}`);
    console.log('   Please verify your TMDB API key in the .env file');
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
