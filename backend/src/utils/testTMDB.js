const tmdbService = require('../services/tmdbService');

async function testTMDBConnection() {
  try {
    console.log('🔍 Testing TMDB API connection...');
    
    // Test search
    const searchResults = await tmdbService.searchMovies('avengers', 1);
    console.log(`✅ Search test passed: Found ${searchResults.totalResults} movies`);
    
    // Test popular movies
    const popularMovies = await tmdbService.getPopularMovies();
    console.log(`✅ Popular movies test passed: Got ${popularMovies.movies.length} movies`);
    
    // Test genres
    const genres = await tmdbService.getGenres();
    console.log(`✅ Genres test passed: Got ${genres.length} genres`);
    
    console.log('🎉 All TMDB tests passed!');
  } catch (error) {
    console.error('❌ TMDB test failed:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testTMDBConnection();
}

module.exports = testTMDBConnection;
