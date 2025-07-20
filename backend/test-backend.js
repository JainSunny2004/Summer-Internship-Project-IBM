const axios = require('axios');

async function testBackendHealth() {
  const baseURL = 'http://localhost:5000';
  const tests = [
    { name: 'Health Check', endpoint: '/api/health' },
    { name: 'Popular Movies', endpoint: '/api/movies/popular' },
    { name: 'Movie Genres', endpoint: '/api/movies/genres' },
    { name: 'Movie Search', endpoint: '/api/movies/search?q=test' },
    { name: 'Movie Discovery', endpoint: '/api/movies/discover' }
  ];

  console.log('🧪 Testing Backend Endpoints...\n');

  for (const test of tests) {
    try {
      const response = await axios.get(`${baseURL}${test.endpoint}`, { timeout: 10000 });
      console.log(`✅ ${test.name}: ${response.status} - Working`);
      
      if (test.name === 'Popular Movies' && response.data.data?.movies) {
        console.log(`   Found ${response.data.data.movies.length} movies`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Failed`);
      console.log(`   Error: ${error.response?.status || error.code} - ${error.message}`);
    }
  }
}

testBackendHealth();
