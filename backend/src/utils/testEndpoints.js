const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  try {
    console.log('🧪 Testing API endpoints...');

    // Test health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', health.data.status);

    // Test search movies
    const search = await axios.get(`${BASE_URL}/movies/search?q=avengers`);
    console.log('✅ Search movies:', search.data.data.movies.length, 'results');

    // Test popular movies
    const popular = await axios.get(`${BASE_URL}/movies/popular`);
    console.log('✅ Popular movies:', popular.data.data.movies.length, 'movies');

    // Test genres
    const genres = await axios.get(`${BASE_URL}/movies/genres`);
    console.log('✅ Genres:', genres.data.data.length, 'genres');

    // Test movie details (using first popular movie)
    const firstMovieId = popular.data.data.movies[0].id;
    const details = await axios.get(`${BASE_URL}/movies/${firstMovieId}`);
    console.log('✅ Movie details:', details.data.data.title);

    // Test recommendations
    const recommendations = await axios.get(`${BASE_URL}/movies/${firstMovieId}/recommendations`);
    console.log('✅ Recommendations:', recommendations.data.data.movies.length, 'movies');

    console.log('🎉 All endpoint tests passed!');

  } catch (error) {
    console.error('❌ Endpoint test failed:', error.response?.data || error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEndpoints();
}

module.exports = testEndpoints;
